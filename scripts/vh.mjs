#!/usr/bin/env node
/**
 * vibe-harness installer.
 *
 * Copies the kit's skills and governance templates into a target repository and records the
 * upstream hash of every managed file in `.agents/vibe-harness.lock.json`. On upgrade, files
 * whose content still equals the recorded upstream hash are replaced; locally modified files are
 * three-way merged with `git merge-file`, using the previous kit commit as the base. Seed files
 * (the project profile) are created once and never overwritten. CLAUDE.md is a symlink to AGENTS.md.
 * Block templates own only the text between their markers. Requires Node 20+ and git.
 *
 * Exit codes: 0 success, 1 usage or fatal error, 2 conflicts that need a human or agent decision.
 */
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LOCK_FILE = '.agents/vibe-harness.lock.json'
const PROFILE_FILE = '.agents/project-profile.md'
const SKILLS_DIR = '.agents/skills'
const CLAUDE_SKILLS_DIR = '.claude/skills'
/** Git symlink blob for `.claude/skills`. No trailing newline. */
const CLAUDE_LINK_TEXT = '../.agents/skills'
const CLAUDE_MD = 'CLAUDE.md'
/** Git symlink blob for `CLAUDE.md`. No trailing newline. */
const CLAUDE_MD_LINK = 'AGENTS.md'
const LEGACY_CLAUDE_MD = new Set(['@AGENTS.md', '@AGENTS.md\n'])
const SYMLINK_UNAVAILABLE = new Set(['EPERM', 'EACCES', 'ENOTSUP'])
const LOCK_VERSION = 1
const EXIT_CONFLICT = 2
const CLAUDE_MODES = ['auto', 'symlink', 'mirror', 'none']

const HELP = `Usage: node scripts/vh.mjs <command> [options]

Commands:
  install     Install skills and governance templates into the target repository.
  upgrade     Upgrade an existing installation to this kit checkout.
  status      Report managed files that are modified, missing, or stale.
  uninstall   Remove unmodified managed files, managed blocks, and mirrors.

Options:
  --target <dir>        Target repository root (default: current directory).
  --optional <a,b>      install: optional skills to include.
  --add <a,b>           upgrade: optional skills to add.
  --remove <a,b>        upgrade: optional skills to remove.
  --claude <mode>       auto | symlink | mirror | none. auto (the install default) is one symlink to ../.agents/skills; upgrade keeps the recorded mode.
  --var NAME=value      Template variable, for example --var PROJECT_NAME=acme.
  --dry-run             Report planned actions without writing.
  --skip-conflicts      install: write everything except conflicting paths.
`

class UsageError extends Error {}

function fail(message) {
  throw new UsageError(message)
}

const normalize = (text) => text.replace(/\r\n/g, '\n')
const sha256 = (text) => createHash('sha256').update(normalize(text)).digest('hex')

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv[0]?.startsWith('-') ? ['help', ...argv] : argv
  const opts = { command, target: process.cwd(), optional: [], add: [], remove: [], vars: {}, claude: undefined, dryRun: false, skipConflicts: false }
  const list = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)
  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index]
    const value = () => {
      const next = rest[++index]
      if (next === undefined) fail(`${arg} requires a value`)
      return next
    }
    switch (arg) {
      case '--target': opts.target = path.resolve(value()); break
      case '--optional': opts.optional = list(value()); break
      case '--add': opts.add = list(value()); break
      case '--remove': opts.remove = list(value()); break
      case '--claude':
        opts.claude = value()
        if (!CLAUDE_MODES.includes(opts.claude)) fail(`--claude must be one of ${CLAUDE_MODES.join(', ')}`)
        break
      case '--var': {
        const pair = value()
        const eq = pair.indexOf('=')
        if (eq <= 0) fail(`--var expects NAME=value, got ${pair}`)
        opts.vars[pair.slice(0, eq)] = pair.slice(eq + 1)
        break
      }
      case '--dry-run': opts.dryRun = true; break
      case '--skip-conflicts': opts.skipConflicts = true; break
      case '-h':
      case '--help': opts.command = 'help'; break
      default: fail(`unknown option ${arg}`)
    }
  }
  return opts
}

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  return result.status === 0 ? result.stdout : null
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(KIT_ROOT, 'manifest.json'), 'utf8'))
}

function kitInfo(manifest) {
  const isKitRepo = git(['rev-parse', '--show-prefix'], KIT_ROOT)?.trim() === ''
  const commit = isKitRepo ? git(['rev-parse', 'HEAD'], KIT_ROOT)?.trim() ?? null : null
  const tag = isKitRepo ? git(['describe', '--tags', '--exact-match', 'HEAD'], KIT_ROOT)?.trim() ?? null : null
  return { repository: manifest.repository, version: manifest.version, ref: tag ?? commit ?? 'unversioned', commit }
}

function resolveInside(root, rel) {
  const abs = path.resolve(root, rel)
  if (abs !== root && !abs.startsWith(root + path.sep)) fail(`path escapes the target repository: ${rel}`)
  return abs
}

function readIfExists(root, rel) {
  const abs = resolveInside(root, rel)
  return fs.existsSync(abs) && fs.statSync(abs).isFile() ? normalize(fs.readFileSync(abs, 'utf8')) : null
}

function writeFile(root, rel, content) {
  const abs = resolveInside(root, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
}

/** Rewrites a project-owned file that holds a managed block, keeping its CRLF line endings if it has them. */
function writeBlockFile(root, rel, content) {
  const abs = resolveInside(root, rel)
  const crlf = fs.existsSync(abs) && fs.readFileSync(abs, 'utf8').includes('\r\n')
  writeFile(root, rel, crlf ? content.replace(/\n/g, '\r\n') : content)
}

function lstatOrNull(abs) {
  try {
    return fs.lstatSync(abs)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

function removePath(abs) {
  const stat = lstatOrNull(abs)
  if (stat === null) return
  if (stat.isSymbolicLink()) fs.unlinkSync(abs)
  else fs.rmSync(abs, { recursive: true, force: true })
}

function pruneEmptyDirs(root, rel) {
  let dir = path.dirname(resolveInside(root, rel))
  while (dir !== root && dir.startsWith(root + path.sep) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir)
    dir = path.dirname(dir)
  }
}

function listFiles(root, rel = '') {
  const out = []
  for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...listFiles(root, child))
    else if (entry.isFile()) out.push(child)
  }
  return out.sort()
}

const readKit = (source) => normalize(fs.readFileSync(path.join(KIT_ROOT, source), 'utf8'))

function render(text, vars, source) {
  return normalize(text).replace(/\{\{([A-Z_]+)\}\}/g, (_, name) => {
    if (!(name in vars)) fail(`${source} uses undefined template variable ${name}`)
    return vars[name]
  })
}

const isTemplate = (source) => source.startsWith('templates/')

function selectSkills(manifest, current, add, remove) {
  const known = manifest.skills
  for (const name of [...add, ...remove]) if (!known[name]) fail(`unknown skill ${name}`)
  for (const name of remove) if (known[name].tier === 'core') fail(`${name} is a core skill and cannot be removed`)
  const selected = new Set(Object.keys(known).filter((name) => known[name].tier === 'core'))
  for (const name of current) if (known[name]) selected.add(name)
  for (const name of add) selected.add(name)
  for (const name of remove) selected.delete(name)
  return [...selected].sort()
}

function buildPlan(manifest, skills, vars) {
  const entries = []
  for (const name of skills) {
    if (!fs.existsSync(path.join(KIT_ROOT, 'skills', name, 'SKILL.md'))) fail(`manifest.json lists skill ${name}, but skills/${name}/SKILL.md is missing`)
    for (const file of listFiles(path.join(KIT_ROOT, 'skills', name))) {
      const source = `skills/${name}/${file}`
      entries.push({ source, target: `${SKILLS_DIR}/${name}/${file}`, mode: 'managed', content: readKit(source) })
    }
  }
  for (const template of manifest.templates) {
    const content = render(readKit(template.source), vars, template.source)
    entries.push({ source: template.source, target: template.target, mode: template.mode, content })
  }
  return entries
}

function markers(target) {
  return target.endsWith('.md')
    ? ['<!-- vibe-harness:begin -->', '<!-- vibe-harness:end -->']
    : ['# vibe-harness:begin', '# vibe-harness:end']
}

const blockBody = (content) => normalize(content).replace(/\n+$/, '')

function extractBlock(text, target) {
  const [begin, end] = markers(target)
  const start = text.indexOf(begin)
  const stop = text.indexOf(end)
  if (start === -1 || stop < start) return null
  return text.slice(start + begin.length, stop).replace(/^\n/, '').replace(/\n$/, '')
}

function writeBlock(existing, target, body) {
  const [begin, end] = markers(target)
  const block = `${begin}\n${body}\n${end}`
  if (existing === null) return target === 'AGENTS.md' ? `# AGENTS.md\n\n${block}\n` : `${block}\n`
  const start = existing.indexOf(begin)
  const stop = existing.indexOf(end)
  if (start !== -1 && stop > start) return existing.slice(0, start) + block + existing.slice(stop + end.length)
  const head = existing.replace(/\s+$/, '')
  return head ? `${head}\n\n${block}\n` : `${block}\n`
}

function removeBlock(text, target) {
  const [begin, end] = markers(target)
  const start = text.indexOf(begin)
  const stop = text.indexOf(end)
  const before = text.slice(0, start).replace(/\s+$/, '')
  const after = text.slice(stop + end.length).trim()
  const joined = [before, after].filter(Boolean).join('\n\n')
  return joined ? `${joined}\n` : ''
}

function mergeThreeWay(current, base, upstream) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-harness-merge-'))
  try {
    const files = ['local', 'base', 'upstream'].map((name) => path.join(dir, name))
    fs.writeFileSync(files[0], current)
    fs.writeFileSync(files[1], base)
    fs.writeFileSync(files[2], upstream)
    const result = spawnSync('git', ['merge-file', '-p', '-L', 'local', '-L', 'base', '-L', 'upstream', ...files], { encoding: 'utf8' })
    if (result.error || result.status === null || result.status > 127) fail(`git merge-file failed: ${result.error?.message ?? result.stderr}`)
    return { text: normalize(result.stdout), conflicts: result.status }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

/** Returns a reader for kit files at `commit`, rendered with `vars`; null when the blob is unavailable. */
function makeOldReader(commit, vars) {
  let fetched = false
  return (source) => {
    if (!commit) return null
    const show = () => git(['show', `${commit}:${source}`], KIT_ROOT)
    let text = show()
    if (text === null && !fetched) {
      fetched = true
      git(['fetch', '--quiet', 'origin', commit], KIT_ROOT)
      text = show()
    }
    if (text === null) return null
    return isTemplate(source) ? render(text, vars, source) : normalize(text)
  }
}

/** Compares paths after resolving symlinks and Windows 8.3 short names when both paths exist. */
function samePath(a, b) {
  const canonical = (p) => {
    try {
      return fs.realpathSync.native(p)
    } catch (error) {
      if (error.code === 'ENOENT') return path.resolve(p)
      throw error
    }
  }
  const [left, right] = [canonical(a), canonical(b)]
  return process.platform === 'win32' ? left.toLowerCase() === right.toLowerCase() : left === right
}

function claudeSkillsPath(target) {
  return path.join(target, CLAUDE_SKILLS_DIR)
}

/** `symlink` is an OS link. `git-symlink` is the same link checked out as its text. */
function readRepoLink(target, rel, linkText) {
  const abs = resolveInside(target, rel)
  const stat = lstatOrNull(abs)
  if (!stat) return { kind: 'absent' }
  if (stat.isSymbolicLink()) {
    const own = samePath(path.resolve(path.dirname(abs), fs.readlinkSync(abs)), path.resolve(path.dirname(abs), linkText))
    return { kind: own ? 'symlink' : 'foreign-link' }
  }
  if (stat.isFile() && fs.readFileSync(abs).equals(Buffer.from(linkText))) return { kind: 'git-symlink' }
  if (stat.isDirectory()) return { kind: 'directory' }
  return { kind: 'other' }
}

function readClaudeLink(target) {
  return readRepoLink(target, CLAUDE_SKILLS_DIR, CLAUDE_LINK_TEXT)
}

function indexMode(target, rel) {
  const line = git(['ls-files', '-s', '--', rel], target)?.split('\n').find((row) => row.trim())
  return line ? line.split(/\s+/)[0] : null
}

/**
 * Stages `rel` as git mode 120000 with blob `linkText`.
 * `git add` of the link-text file would record a regular file when `core.symlinks` is false,
 * so a later checkout would not be a symlink.
 */
function stageGitLink(target, rel, linkText) {
  const hashed = spawnSync('git', ['hash-object', '-w', '--stdin'], { cwd: target, input: linkText, encoding: 'utf8' })
  if (hashed.status !== 0) fail(`git hash-object failed: ${hashed.stderr?.trim()}`)
  const updated = spawnSync('git', ['update-index', '--add', '--cacheinfo', `120000,${hashed.stdout.trim()},${rel}`], { cwd: target, encoding: 'utf8' })
  if (updated.status !== 0) fail(`git update-index failed: ${updated.stderr?.trim()}`)
}

function unstageClaudeLink(target) {
  spawnSync('git', ['update-index', '--force-remove', '--', CLAUDE_SKILLS_DIR], { cwd: target, encoding: 'utf8' })
}

function removeClaudeLink(target) {
  const abs = claudeSkillsPath(target)
  if (lstatOrNull(abs)) fs.unlinkSync(abs)
  unstageClaudeLink(target)
  pruneEmptyDirs(target, CLAUDE_SKILLS_DIR)
}

function createRepoLink(target, rel, linkText, ctx, symlinkType) {
  if (ctx.dryRun) {
    ctx.log('link', rel, `-> ${linkText}`)
    return
  }
  const abs = resolveInside(target, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  try {
    fs.symlinkSync(linkText, abs, symlinkType)
    ctx.log('link', rel, `-> ${linkText}`)
  } catch (error) {
    if (!SYMLINK_UNAVAILABLE.has(error.code)) throw error
    fs.writeFileSync(abs, linkText)
    try {
      stageGitLink(target, rel, linkText)
    } catch (stageError) {
      fs.unlinkSync(abs)
      throw stageError
    }
    const kind = symlinkType === 'dir' ? 'directory' : 'file'
    ctx.log('link', rel, `-> ${linkText} (git symlink; ${kind} link failed with ${error.code})`)
  }
}

function createClaudeLink(target, ctx) {
  createRepoLink(target, CLAUDE_SKILLS_DIR, CLAUDE_LINK_TEXT, ctx, 'dir')
}

/**
 * Points `CLAUDE.md` at `AGENTS.md`. A file whose whole content is `@AGENTS.md` is the previous
 * seed and is replaced. Any other existing content is kept.
 */
function syncClaudeMd(target, seeds, ctx) {
  const prior = seeds[CLAUDE_MD]
  const found = readRepoLink(target, CLAUDE_MD, CLAUDE_MD_LINK)
  if (found.kind === 'symlink' || found.kind === 'git-symlink') {
    if (found.kind === 'git-symlink' && prior !== 'kept' && !ctx.dryRun && indexMode(target, CLAUDE_MD) !== '120000') {
      stageGitLink(target, CLAUDE_MD, CLAUDE_MD_LINK)
    }
    return prior === 'kept' ? 'kept' : 'created'
  }
  if (found.kind === 'absent') {
    if (prior) return prior
    createRepoLink(target, CLAUDE_MD, CLAUDE_MD_LINK, ctx, 'file')
    return 'created'
  }
  const abs = resolveInside(target, CLAUDE_MD)
  const stat = lstatOrNull(abs)
  const text = stat?.isFile() && !stat.isSymbolicLink() ? fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n') : null
  if (text !== null && LEGACY_CLAUDE_MD.has(text) && prior !== 'kept') {
    if (!ctx.dryRun) fs.unlinkSync(abs)
    createRepoLink(target, CLAUDE_MD, CLAUDE_MD_LINK, ctx, 'file')
    return 'created'
  }
  ctx.log('keep', CLAUDE_MD, 'existing file kept')
  return 'kept'
}

function reportRepoLink(ctx, target, rel, linkText) {
  const found = readRepoLink(target, rel, linkText)
  if (found.kind === 'git-symlink' && indexMode(target, rel) !== '120000') {
    ctx.log('missing', rel, 'link text is present but the git index does not record a symlink')
  } else if (found.kind !== 'symlink' && found.kind !== 'git-symlink') {
    ctx.log('missing', rel, 'symlink expected')
  }
}

function keptClaude(previous) {
  return { claude: previous.claude ?? 'none', mirrors: [...(previous.mirrors ?? [])] }
}

/**
 * Exposes installed skills at `.claude/skills` as one symlink to `../.agents/skills`.
 * `mirror` copies each skill and is used only when requested. Never deletes through a symlink,
 * and never replaces a `.claude/skills` link that points elsewhere.
 */
function syncClaude(target, requested, skills, previous, ctx) {
  const previousMirrors = new Set(previous.mirrors ?? [])
  const dropPreviousMirrors = (keep) => {
    for (const rel of previousMirrors) {
      if (keep.includes(rel)) continue
      if (!ctx.dryRun) {
        removePath(path.join(target, rel))
        pruneEmptyDirs(target, rel)
      }
      ctx.log('remove', rel, 'mirror no longer selected')
    }
  }
  const link = readClaudeLink(target)
  if (link.kind === 'foreign-link') {
    if (requested !== 'none') ctx.conflict(CLAUDE_SKILLS_DIR, 'is a symlink to another directory; Claude Code skills not configured')
    return { claude: 'none', mirrors: [] }
  }
  const mode = requested === 'auto' ? 'symlink' : requested
  if (mode === 'none') {
    if ((link.kind === 'symlink' || link.kind === 'git-symlink') && previous.claude === 'symlink') {
      if (!ctx.dryRun) removeClaudeLink(target)
      ctx.log('remove', CLAUDE_SKILLS_DIR, 'symlink')
    } else if (link.kind !== 'symlink') {
      dropPreviousMirrors([])
    }
    return { claude: 'none', mirrors: [] }
  }
  if (mode === 'symlink') {
    if (link.kind === 'symlink') return { claude: 'symlink', mirrors: [] }
    if (link.kind === 'git-symlink') {
      if (!ctx.dryRun && indexMode(target, CLAUDE_SKILLS_DIR) !== '120000') stageGitLink(target, CLAUDE_SKILLS_DIR, CLAUDE_LINK_TEXT)
      return { claude: 'symlink', mirrors: [] }
    }
    if (link.kind === 'directory') {
      const names = fs.readdirSync(claudeSkillsPath(target))
      if (!names.every((name) => previousMirrors.has(`${CLAUDE_SKILLS_DIR}/${name}`))) {
        ctx.conflict(CLAUDE_SKILLS_DIR, 'exists as a directory and is not a vibe-harness mirror; remove it or pass --claude none')
        return keptClaude(previous)
      }
      dropPreviousMirrors([])
      if (!ctx.dryRun) {
        const abs = claudeSkillsPath(target)
        if (lstatOrNull(abs)?.isDirectory()) fs.rmdirSync(abs)
      }
    } else if (link.kind === 'other') {
      ctx.conflict(CLAUDE_SKILLS_DIR, 'exists and is not a symlink to .agents/skills')
      return keptClaude(previous)
    }
    createClaudeLink(target, ctx)
    return { claude: 'symlink', mirrors: [] }
  }
  if (link.kind === 'symlink' || link.kind === 'git-symlink') {
    if (!ctx.dryRun) removeClaudeLink(target)
    ctx.log('remove', CLAUDE_SKILLS_DIR, 'symlink replaced by mirrors')
  } else if (link.kind === 'other') {
    ctx.conflict(CLAUDE_SKILLS_DIR, 'exists and is not a directory of skill copies')
    return keptClaude(previous)
  }
  const mirrors = []
  for (const name of skills) {
    const rel = `${CLAUDE_SKILLS_DIR}/${name}`
    const abs = path.join(target, rel)
    if (link.kind !== 'symlink' && link.kind !== 'git-symlink' && lstatOrNull(abs) && !previousMirrors.has(rel)) {
      ctx.conflict(rel, 'exists and is not a vibe-harness mirror; not mirrored')
      continue
    }
    if (!ctx.dryRun) {
      removePath(abs)
      fs.cpSync(path.join(target, SKILLS_DIR, name), abs, { recursive: true })
    }
    mirrors.push(rel)
  }
  dropPreviousMirrors(mirrors)
  ctx.log('mirror', CLAUDE_SKILLS_DIR, `${mirrors.length} skills copied from ${SKILLS_DIR}`)
  return { claude: 'mirror', mirrors }
}

function frontmatterKeys(text) {
  const match = /^---\n([\s\S]*?)\n---/.exec(normalize(text))
  if (!match) return []
  const keys = []
  const stack = []
  for (const line of match[1].split('\n')) {
    const key = /^( *)([A-Za-z0-9_.-]+):/.exec(line)
    if (!key) continue
    const depth = Math.floor(key[1].length / 2)
    stack.length = depth
    stack[depth] = key[2]
    keys.push(stack.slice(0, depth + 1).join('.'))
  }
  return keys
}

function readLock(target) {
  const text = readIfExists(target, LOCK_FILE)
  if (text === null) fail(`no ${LOCK_FILE} in ${target}; run install first`)
  const lock = JSON.parse(text)
  if (lock.lockVersion !== LOCK_VERSION) fail(`${LOCK_FILE} has lockVersion ${lock.lockVersion}; this installer reads ${LOCK_VERSION}`)
  return lock
}

function sortObject(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))
}

function writeLock(target, lock) {
  const ordered = { ...lock, files: sortObject(lock.files), blocks: sortObject(lock.blocks), seeds: sortObject(lock.seeds), mirrors: [...lock.mirrors].sort() }
  writeFile(target, LOCK_FILE, `${JSON.stringify(ordered, null, 2)}\n`)
}

function createContext(dryRun) {
  const events = []
  const conflicts = []
  return {
    dryRun,
    events,
    conflicts,
    log: (action, rel, detail) => events.push({ action, rel, detail }),
    conflict: (rel, detail) => {
      if (conflicts.some((conflict) => conflict.rel === rel)) return
      conflicts.push({ rel, detail })
      events.push({ action: 'CONFLICT', rel, detail })
    },
  }
}

function printEvents(ctx, heading) {
  console.log(heading)
  for (const { action, rel, detail } of ctx.events) console.log(`  ${action.padEnd(10)} ${rel}${detail ? `  (${detail})` : ''}`)
}

function profileReport(target) {
  const profile = readIfExists(target, PROFILE_FILE)
  if (profile === null) return `${PROFILE_FILE} is missing`
  const todos = (profile.match(/TODO\(profile\)/g) ?? []).length
  return todos === 0 ? `${PROFILE_FILE}: no TODO(profile) markers left` : `${PROFILE_FILE}: ${todos} TODO(profile) markers to fill`
}

function cmdInstall(opts) {
  const target = opts.target
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) fail(`target is not a directory: ${target}`)
  if (readIfExists(target, LOCK_FILE) !== null) fail(`${LOCK_FILE} already exists; use upgrade (with --add/--remove to change skills)`)
  const manifest = loadManifest()
  const kit = kitInfo(manifest)
  const skills = selectSkills(manifest, [], opts.optional, [])
  const vars = { PROJECT_NAME: path.basename(target), ...opts.vars }
  const plan = buildPlan(manifest, skills, vars)
  const ctx = createContext(opts.dryRun)
  const lock = { lockVersion: LOCK_VERSION, kit, variables: vars, skills, claude: 'none', files: {}, blocks: {}, seeds: {}, mirrors: [] }
  const writes = []

  for (const entry of plan) {
    const current = readIfExists(target, entry.target)
    if (entry.mode === 'managed') {
      if (current === null) {
        writes.push(entry)
        ctx.log('create', entry.target)
      } else if (sha256(current) === sha256(entry.content)) {
        ctx.log('adopt', entry.target, 'identical content already present')
      } else {
        ctx.conflict(entry.target, 'exists with different content')
        continue
      }
      lock.files[entry.target] = { source: entry.source, upstream: sha256(entry.content) }
    } else if (entry.mode === 'seed') {
      if (current === null) {
        writes.push(entry)
        lock.seeds[entry.target] = 'created'
        ctx.log('seed', entry.target)
      } else {
        lock.seeds[entry.target] = 'kept'
        ctx.log('keep', entry.target, 'existing file kept')
      }
    } else if (entry.mode === 'block') {
      const body = blockBody(entry.content)
      writes.push({ ...entry, content: writeBlock(current, entry.target, body) })
      lock.blocks[entry.target] = { source: entry.source, upstream: sha256(body) }
      ctx.log(current === null ? 'create' : extractBlock(current, entry.target) === null ? 'append' : 'replace', entry.target, 'managed block')
    } else {
      fail(`unknown template mode ${entry.mode} for ${entry.source}`)
    }
  }

  const noClaude = { claude: 'none', mirrors: [] }
  const preflight = createContext(true)
  syncClaude(target, opts.claude ?? 'auto', skills, noClaude, preflight)
  for (const { rel, detail } of preflight.conflicts) ctx.conflict(rel, detail)
  if (ctx.conflicts.length > 0 && !opts.skipConflicts) {
    printEvents(ctx, 'Install aborted before writing anything; resolve these conflicts or pass --skip-conflicts:')
    return EXIT_CONFLICT
  }
  if (!opts.dryRun) for (const entry of writes) (entry.mode === 'block' ? writeBlockFile : writeFile)(target, entry.target, entry.content)

  const claude = syncClaude(target, opts.claude ?? 'auto', skills, noClaude, ctx)
  lock.claude = claude.claude
  lock.mirrors = claude.mirrors
  lock.seeds[CLAUDE_MD] = syncClaudeMd(target, {}, ctx)
  if (!opts.dryRun) writeLock(target, lock)

  printEvents(ctx, `${opts.dryRun ? 'Dry run: would install' : 'Installed'} vibe-harness ${kit.ref} (${skills.length} skills) into ${target}:`)
  if (!opts.dryRun) console.log(`\n${profileReport(target)}`)
  return ctx.conflicts.length > 0 && !opts.skipConflicts ? EXIT_CONFLICT : 0
}

function cmdUpgrade(opts) {
  const target = opts.target
  const lock = readLock(target)
  const manifest = loadManifest()
  const kit = kitInfo(manifest)
  const skills = selectSkills(manifest, lock.skills, opts.add, opts.remove)
  const vars = { ...lock.variables, ...opts.vars }
  const plan = buildPlan(manifest, skills, vars)
  const readOld = makeOldReader(lock.kit.commit, lock.variables)
  const ctx = createContext(opts.dryRun)
  const next = { ...lock, kit, variables: vars, skills, files: {}, blocks: {}, seeds: { ...lock.seeds } }
  const write = (rel, content) => { if (!opts.dryRun) writeFile(target, rel, content) }
  const writeWithBlock = (rel, content) => { if (!opts.dryRun) writeBlockFile(target, rel, content) }

  for (const entry of plan) {
    const current = readIfExists(target, entry.target)
    const upstream = sha256(entry.content)
    if (entry.mode === 'managed') {
      const previous = lock.files[entry.target]
      if (!previous) {
        if (current === null) {
          write(entry.target, entry.content)
          ctx.log('create', entry.target)
        } else if (sha256(current) !== upstream) {
          ctx.conflict(entry.target, 'exists with different content and is not managed')
          continue
        } else {
          ctx.log('adopt', entry.target)
        }
      } else if (current === null) {
        ctx.log('skip', entry.target, 'deleted locally; no longer managed')
        continue
      } else {
        const local = sha256(current)
        if (local === previous.upstream) {
          if (upstream !== previous.upstream) {
            write(entry.target, entry.content)
            ctx.log('update', entry.target)
          }
        } else if (upstream === previous.upstream || local === upstream) {
          ctx.log('keep', entry.target, 'local edits kept; upstream unchanged')
        } else {
          const base = readOld(previous.source)
          if (base === null || sha256(base) !== previous.upstream) {
            ctx.conflict(entry.target, `locally modified and the base from kit commit ${lock.kit.commit ?? 'unknown'} is unavailable; merge by hand`)
            next.files[entry.target] = previous
            continue
          }
          const merged = mergeThreeWay(current, base, entry.content)
          write(entry.target, merged.text)
          if (merged.conflicts === 0) ctx.log('merge', entry.target, 'local edits merged with upstream')
          else ctx.conflict(entry.target, `${merged.conflicts} conflict region(s) marked in the file`)
        }
      }
      next.files[entry.target] = { source: entry.source, upstream }
    } else if (entry.mode === 'seed') {
      if (!(entry.target in lock.seeds)) {
        if (current === null) write(entry.target, entry.content)
        next.seeds[entry.target] = current === null ? 'created' : 'kept'
        ctx.log(current === null ? 'seed' : 'keep', entry.target, current === null ? undefined : 'existing file kept')
      }
      if (entry.target === PROFILE_FILE && current !== null) {
        const have = new Set(frontmatterKeys(current))
        const missing = frontmatterKeys(entry.content).filter((key) => !have.has(key))
        if (missing.length > 0) ctx.log('profile', PROFILE_FILE, `new keys to add: ${missing.join(', ')}`)
      }
    } else if (entry.mode === 'block') {
      const body = blockBody(entry.content)
      const bodyHash = sha256(body)
      const previous = lock.blocks[entry.target]
      const existing = current === null ? null : extractBlock(current, entry.target)
      if (existing === null) {
        writeWithBlock(entry.target, writeBlock(current, entry.target, body))
        ctx.log(current === null ? 'create' : 'append', entry.target, 'managed block')
      } else if (!previous || sha256(existing) === previous.upstream) {
        if (sha256(existing) !== bodyHash) {
          writeWithBlock(entry.target, writeBlock(current, entry.target, body))
          ctx.log('update', entry.target, 'managed block')
        }
      } else if (bodyHash === previous.upstream || sha256(existing) === bodyHash) {
        ctx.log('keep', entry.target, 'local edits inside the managed block kept; upstream unchanged')
      } else {
        const base = readOld(previous.source)
        const baseBody = base === null ? null : blockBody(base)
        if (baseBody === null || sha256(baseBody) !== previous.upstream) {
          ctx.conflict(entry.target, 'managed block edited locally and its base is unavailable; merge by hand')
          next.blocks[entry.target] = previous
          continue
        }
        const merged = mergeThreeWay(`${existing}\n`, `${baseBody}\n`, `${body}\n`)
        writeWithBlock(entry.target, writeBlock(current, entry.target, blockBody(merged.text)))
        if (merged.conflicts === 0) ctx.log('merge', entry.target, 'managed block merged')
        else ctx.conflict(entry.target, `${merged.conflicts} conflict region(s) marked inside the managed block`)
      }
      next.blocks[entry.target] = { source: entry.source, upstream: bodyHash }
    }
  }

  for (const [rel, previous] of Object.entries(lock.files)) {
    if (next.files[rel] || plan.some((entry) => entry.target === rel)) continue
    const current = readIfExists(target, rel)
    if (current === null) continue
    if (sha256(current) === previous.upstream) {
      if (!opts.dryRun) {
        fs.unlinkSync(resolveInside(target, rel))
        pruneEmptyDirs(target, rel)
      }
      ctx.log('remove', rel, 'no longer part of the selected kit')
    } else {
      ctx.log('orphan', rel, 'no longer managed; kept because it has local edits')
    }
  }

  const claude = syncClaude(target, opts.claude ?? lock.claude, skills, lock, ctx)
  next.claude = claude.claude
  next.mirrors = claude.mirrors
  next.seeds[CLAUDE_MD] = syncClaudeMd(target, lock.seeds, ctx)
  if (!opts.dryRun) writeLock(target, next)

  printEvents(ctx, `${opts.dryRun ? 'Dry run: would upgrade' : 'Upgraded'} vibe-harness ${lock.kit.ref} -> ${kit.ref} in ${target}:`)
  if (ctx.events.length === 0) console.log('  (nothing to change)')
  if (ctx.conflicts.length > 0) console.log('\nResolve each CONFLICT, then run status to confirm.')
  return ctx.conflicts.length > 0 ? EXIT_CONFLICT : 0
}

function cmdStatus(opts) {
  const target = opts.target
  const lock = readLock(target)
  const kit = kitInfo(loadManifest())
  const ctx = createContext(true)
  let clean = 0
  for (const [rel, entry] of Object.entries(lock.files)) {
    const current = readIfExists(target, rel)
    if (current === null) ctx.log('missing', rel)
    else if (sha256(current) !== entry.upstream) ctx.log('modified', rel)
    else clean++
  }
  for (const [rel, entry] of Object.entries(lock.blocks)) {
    const current = readIfExists(target, rel)
    const body = current === null ? null : extractBlock(current, rel)
    if (body === null) ctx.log('missing', rel, 'managed block')
    else if (sha256(body) !== entry.upstream) ctx.log('modified', rel, 'managed block')
    else clean++
  }
  if (lock.claude === 'symlink') reportRepoLink(ctx, target, CLAUDE_SKILLS_DIR, CLAUDE_LINK_TEXT)
  if (lock.seeds[CLAUDE_MD] === 'created') reportRepoLink(ctx, target, CLAUDE_MD, CLAUDE_MD_LINK)
  for (const rel of lock.mirrors ?? []) {
    const mirror = path.join(target, rel)
    const source = path.join(target, SKILLS_DIR, path.basename(rel))
    if (!fs.existsSync(mirror)) {
      ctx.log('missing', rel, 'mirror')
      continue
    }
    const files = (root) => listFiles(root).map((file) => `${file}:${sha256(fs.readFileSync(path.join(root, file), 'utf8'))}`).join('\n')
    if (!fs.existsSync(source) || files(mirror) !== files(source)) ctx.log('stale', rel, `mirror differs from ${SKILLS_DIR}; run upgrade to refresh`)
  }
  printEvents(ctx, `vibe-harness ${lock.kit.ref} in ${target} (kit checkout: ${kit.ref})`)
  console.log(`  ${clean} managed files and blocks unchanged; skills: ${lock.skills.join(', ')}`)
  console.log(`  ${profileReport(target)}`)
  return 0
}

function cmdUninstall(opts) {
  const target = opts.target
  const lock = readLock(target)
  const ctx = createContext(opts.dryRun)
  for (const [rel, entry] of Object.entries(lock.files)) {
    const current = readIfExists(target, rel)
    if (current === null) continue
    if (sha256(current) === entry.upstream) {
      if (!opts.dryRun) {
        fs.unlinkSync(resolveInside(target, rel))
        pruneEmptyDirs(target, rel)
      }
      ctx.log('remove', rel)
    } else {
      ctx.log('keep', rel, 'locally modified')
    }
  }
  for (const [rel, entry] of Object.entries(lock.blocks)) {
    const current = readIfExists(target, rel)
    const body = current === null ? null : extractBlock(current, rel)
    if (body === null) continue
    if (sha256(body) !== entry.upstream) {
      ctx.log('keep', rel, 'managed block modified locally')
      continue
    }
    const remaining = removeBlock(current, rel)
    const createdByInstall = remaining === removeBlock(writeBlock(null, rel, ''), rel)
    if (!opts.dryRun) {
      if (createdByInstall) fs.unlinkSync(resolveInside(target, rel))
      else writeBlockFile(target, rel, remaining)
    }
    ctx.log(createdByInstall ? 'remove' : 'unblock', rel, 'managed block removed')
  }
  syncClaude(target, 'none', [], lock, ctx)
  for (const [rel, origin] of Object.entries(lock.seeds)) {
    if (origin === 'created' && readIfExists(target, rel) !== null) ctx.log('keep', rel, 'seed created by vibe-harness; delete it if unwanted')
  }
  if (!opts.dryRun) {
    fs.unlinkSync(resolveInside(target, LOCK_FILE))
    pruneEmptyDirs(target, LOCK_FILE)
  }
  printEvents(ctx, `${opts.dryRun ? 'Dry run: would uninstall' : 'Uninstalled'} vibe-harness from ${target}:`)
  return 0
}

function main(argv) {
  const opts = parseArgs(argv)
  switch (opts.command) {
    case 'install': return cmdInstall(opts)
    case 'upgrade': return cmdUpgrade(opts)
    case 'status': return cmdStatus(opts)
    case 'uninstall': return cmdUninstall(opts)
    case 'help': console.log(HELP); return 0
    default: fail(`unknown command ${opts.command}`)
  }
}

try {
  process.exitCode = main(process.argv.slice(2))
} catch (error) {
  if (!(error instanceof UsageError)) throw error
  console.error(`error: ${error.message}`)
  process.exitCode = 1
}
