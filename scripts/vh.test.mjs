import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GIT_IDENTITY = ['-c', 'user.name=vibe-harness-test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false']

let kit
let repo
const temps = []

function tempDir(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  temps.push(dir)
  return dir
}

function git(cwd, ...args) {
  const result = spawnSync('git', [...GIT_IDENTITY, ...args], { cwd, encoding: 'utf8' })
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`)
  return result.stdout.trim()
}

function makeKit({ versioned = true } = {}) {
  const dir = tempDir('vibe-harness-kit-')
  for (const entry of ['skills', 'templates', 'manifest.json']) fs.cpSync(path.join(KIT_ROOT, entry), path.join(dir, entry), { recursive: true })
  fs.mkdirSync(path.join(dir, 'scripts'))
  fs.copyFileSync(path.join(KIT_ROOT, 'scripts', 'vh.mjs'), path.join(dir, 'scripts', 'vh.mjs'))
  if (versioned) {
    git(dir, 'init', '-q')
    commitKit(dir, 'v1')
  }
  return dir
}

function commitKit(dir, message) {
  git(dir, 'add', '-A')
  git(dir, 'commit', '-q', '-m', message)
}

function vh(...args) {
  const result = spawnSync(process.execPath, [path.join(kit, 'scripts', 'vh.mjs'), ...args, '--target', repo], { encoding: 'utf8' })
  return { status: result.status, out: `${result.stdout}${result.stderr}` }
}

const kitFile = (rel) => path.join(kit, rel)
const repoFile = (rel) => path.join(repo, rel)
const readRepo = (rel) => fs.readFileSync(repoFile(rel), 'utf8')
const readLock = () => JSON.parse(readRepo('.agents/vibe-harness.lock.json'))
const append = (file, text) => fs.appendFileSync(file, text)
const replaceIn = (file, from, to) => {
  const text = fs.readFileSync(file, 'utf8')
  assert.ok(text.includes(from), `${file} does not contain ${JSON.stringify(from)}`)
  fs.writeFileSync(file, text.replace(from, to))
}
const writeRepo = (rel, text) => {
  fs.mkdirSync(path.dirname(repoFile(rel)), { recursive: true })
  fs.writeFileSync(repoFile(rel), text)
}

beforeEach(() => {
  kit = makeKit()
  repo = tempDir('vibe-harness-repo-')
  git(repo, 'init', '-q')
})

afterEach(() => {
  for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('install', () => {
  test('writes managed files, seeds, blocks, and the lock', () => {
    const result = vh('install', '--claude', 'none', '--var', 'PROJECT_NAME=acme')
    assert.equal(result.status, 0, result.out)
    assert.equal(readRepo('.agents/skills/error-handling/SKILL.md'), fs.readFileSync(kitFile('skills/error-handling/SKILL.md'), 'utf8'))
    assert.match(readRepo('.agents/project-profile.md'), /^project: acme$/m)
    assert.match(readRepo('AGENTS.md'), /<!-- vibe-harness:begin -->\n## Working agreement/)
    assert.match(readRepo('.gitignore'), /# vibe-harness:begin\n\.agent-scratch\/\n# vibe-harness:end/)
    const claudeMd = repoFile('CLAUDE.md')
    const claudeStat = fs.lstatSync(claudeMd)
    if (claudeStat.isSymbolicLink()) {
      assert.equal(fs.readlinkSync(claudeMd).replaceAll('\\', '/'), 'AGENTS.md')
    } else {
      assert.equal(fs.readFileSync(claudeMd, 'utf8'), 'AGENTS.md')
      assert.match(git(repo, 'ls-files', '-s', '--', 'CLAUDE.md'), /^120000 47dc3e3d863cfb5727b87d785d09abf9743c0a72 /)
    }
    assert.equal(readLock().seeds['CLAUDE.md'], 'created')
    const lock = readLock()
    assert.equal(lock.kit.commit, git(kit, 'rev-parse', 'HEAD'))
    assert.ok(lock.skills.includes('error-handling'))
    assert.ok(!lock.skills.includes('stacked-prs'))
    assert.ok(lock.files['.agents/skills/error-handling/SKILL.md'])
    assert.equal(lock.seeds['.agents/project-profile.md'], 'created')
    assert.doesNotMatch(vh('status').out, /modified|missing/)
  })

  test('installs requested optional skills', () => {
    assert.equal(vh('install', '--claude', 'none', '--optional', 'stacked-prs').status, 0)
    assert.ok(fs.existsSync(repoFile('.agents/skills/stacked-prs/SKILL.md')))
    assert.ok(!fs.existsSync(repoFile('.agents/skills/ui-ux-review')))
  })

  test('appends the managed block and keeps existing instructions', () => {
    writeRepo('AGENTS.md', '# Acme\n\nUse tabs.\n')
    writeRepo('CLAUDE.md', 'Claude rules.\n')
    assert.equal(vh('install', '--claude', 'none').status, 0)
    assert.match(readRepo('AGENTS.md'), /^# Acme\n\nUse tabs\.\n\n<!-- vibe-harness:begin -->/)
    assert.equal(readRepo('CLAUDE.md'), 'Claude rules.\n')
    assert.equal(readLock().seeds['CLAUDE.md'], 'kept')
  })

  test('aborts without writing when a managed path holds different content', () => {
    writeRepo('docs/AGENTS.md', 'Our own documentation rules.\n')
    const result = vh('install', '--claude', 'none')
    assert.equal(result.status, 2, result.out)
    assert.match(result.out, /CONFLICT\s+docs\/AGENTS\.md/)
    assert.deepEqual(fs.readdirSync(repo).sort(), ['.git', 'docs'])
  })

  test('--skip-conflicts installs everything else and leaves the conflict unmanaged', () => {
    writeRepo('docs/AGENTS.md', 'Our own documentation rules.\n')
    const result = vh('install', '--claude', 'none', '--skip-conflicts')
    assert.equal(result.status, 0, result.out)
    assert.equal(readRepo('docs/AGENTS.md'), 'Our own documentation rules.\n')
    assert.equal(readLock().files['docs/AGENTS.md'], undefined)
    assert.ok(fs.existsSync(repoFile('.agents/skills/code-review/SKILL.md')))
  })

  test('adopts a managed path that already holds identical content', () => {
    writeRepo('docs/AGENTS.md', fs.readFileSync(kitFile('templates/docs-AGENTS.md'), 'utf8'))
    const result = vh('install', '--claude', 'none')
    assert.equal(result.status, 0, result.out)
    assert.match(result.out, /adopt\s+docs\/AGENTS\.md/)
    assert.ok(readLock().files['docs/AGENTS.md'])
  })

  test('--dry-run writes nothing', () => {
    const result = vh('install', '--dry-run')
    assert.equal(result.status, 0, result.out)
    assert.match(result.out, /Dry run: would install/)
    assert.deepEqual(fs.readdirSync(repo), ['.git'])
  })

  test('refuses to install over an existing installation', () => {
    assert.equal(vh('install', '--claude', 'none').status, 0)
    const result = vh('install', '--claude', 'none')
    assert.equal(result.status, 1)
    assert.match(result.out, /already exists; use upgrade/)
  })

  test('aborts on an existing Claude Code skill directory it does not own', () => {
    writeRepo('.claude/skills/error-handling/SKILL.md', 'mine\n')
    const result = vh('install', '--claude', 'mirror')
    assert.equal(result.status, 2, result.out)
    assert.match(result.out, /CONFLICT\s+\.claude\/skills\/error-handling/)
    assert.ok(!fs.existsSync(repoFile('.agents')))
  })
})

describe('upgrade', () => {
  test('updates pristine files, merges local edits, and marks overlapping conflicts', () => {
    assert.equal(vh('install', '--claude', 'none').status, 0)
    replaceIn(repoFile('.agents/skills/prose-standard/SKILL.md'), '# ', '# Local heading note\n\n# ')
    replaceIn(repoFile('.agents/skills/code-review/SKILL.md'), '# ', '# Local title ')
    replaceIn(repoFile('.agents/project-profile.md'), 'install: TODO(profile)', 'install: npm ci')
    writeRepo('AGENTS.md', `# Acme\n\nUse tabs.\n\n${readRepo('AGENTS.md').replace(/^# AGENTS\.md\n\n/, '')}`)

    append(kitFile('skills/error-handling/SKILL.md'), '\nUpstream addition.\n')
    append(kitFile('skills/prose-standard/SKILL.md'), '\nUpstream tail.\n')
    replaceIn(kitFile('skills/code-review/SKILL.md'), '# ', '# Upstream title ')
    append(kitFile('templates/AGENTS.md.tmpl'), '\nUpstream rule.\n')
    replaceIn(kitFile('templates/project-profile.md.tmpl'), '  bench: TODO(profile)\n', '  bench: TODO(profile)\n  smoke: TODO(profile)\n')
    fs.rmSync(kitFile('skills/trim-cot-leakage/references/examples.md'))
    fs.mkdirSync(kitFile('skills/error-handling/references'), { recursive: true })
    fs.writeFileSync(kitFile('skills/error-handling/references/new.md'), '# New\n')
    commitKit(kit, 'v2')

    const result = vh('upgrade')
    assert.equal(result.status, 2, result.out)
    assert.match(readRepo('.agents/skills/error-handling/SKILL.md'), /Upstream addition\.\n$/)
    const prose = readRepo('.agents/skills/prose-standard/SKILL.md')
    assert.match(prose, /Local heading note/)
    assert.match(prose, /Upstream tail\.\n$/)
    assert.match(result.out, /merge\s+\.agents\/skills\/prose-standard\/SKILL\.md/)
    assert.match(readRepo('.agents/skills/code-review/SKILL.md'), /<<<<<<< local[\s\S]*Local title[\s\S]*=======[\s\S]*Upstream title[\s\S]*>>>>>>> upstream/)
    assert.match(result.out, /CONFLICT\s+\.agents\/skills\/code-review\/SKILL\.md/)
    assert.match(readRepo('AGENTS.md'), /^# Acme\n\nUse tabs\.\n\n<!-- vibe-harness:begin -->[\s\S]*Upstream rule\.\n<!-- vibe-harness:end -->\n$/)
    assert.match(readRepo('.agents/project-profile.md'), /install: npm ci/)
    assert.match(result.out, /new keys to add: commands\.smoke/)
    assert.ok(!fs.existsSync(repoFile('.agents/skills/trim-cot-leakage/references/examples.md')))
    assert.equal(readRepo('.agents/skills/error-handling/references/new.md'), '# New\n')
    assert.equal(readLock().kit.commit, git(kit, 'rev-parse', 'HEAD'))
  })

  test('replaces a CLAUDE.md seed of @AGENTS.md with a symlink to AGENTS.md', () => {
    assert.equal(vh('install', '--claude', 'none').status, 0)
    const claudeMd = repoFile('CLAUDE.md')
    fs.unlinkSync(claudeMd)
    fs.writeFileSync(claudeMd, '@AGENTS.md\n')
    const result = vh('upgrade')
    assert.equal(result.status, 0, result.out)
    assert.match(result.out, /link\s+CLAUDE\.md/)
    const stat = fs.lstatSync(claudeMd)
    if (stat.isSymbolicLink()) assert.equal(fs.readlinkSync(claudeMd).replaceAll('\\', '/'), 'AGENTS.md')
    else assert.equal(fs.readFileSync(claudeMd, 'utf8'), 'AGENTS.md')
    assert.equal(readLock().seeds['CLAUDE.md'], 'created')
    assert.doesNotMatch(vh('status').out, /missing\s+CLAUDE\.md/)
  })

  test('merges a locally edited managed block with an upstream block change', () => {
    assert.equal(vh('install', '--claude', 'none').status, 0)
    replaceIn(repoFile('AGENTS.md'), '### Evidence\n', '### Evidence\n\n- Local evidence rule.\n')
    append(kitFile('templates/AGENTS.md.tmpl'), '\nUpstream rule.\n')
    commitKit(kit, 'v2')
    const result = vh('upgrade')
    assert.equal(result.status, 0, result.out)
    const agents = readRepo('AGENTS.md')
    assert.match(agents, /Local evidence rule\./)
    assert.match(agents, /Upstream rule\.\n<!-- vibe-harness:end -->/)
  })

  test('reports a conflict and keeps the file when the merge base is unavailable', () => {
    kit = makeKit({ versioned: false })
    assert.equal(vh('install', '--claude', 'none').status, 0)
    assert.equal(readLock().kit.commit, null)
    append(repoFile('.agents/skills/error-handling/SKILL.md'), '\nLocal.\n')
    append(kitFile('skills/error-handling/SKILL.md'), '\nUpstream.\n')
    const local = readRepo('.agents/skills/error-handling/SKILL.md')
    const result = vh('upgrade')
    assert.equal(result.status, 2, result.out)
    assert.match(result.out, /base from kit commit unknown is unavailable/)
    assert.equal(readRepo('.agents/skills/error-handling/SKILL.md'), local)
  })

  test('adds and removes optional skills and refuses to remove core skills', () => {
    assert.equal(vh('install', '--claude', 'none').status, 0)
    assert.equal(vh('upgrade', '--add', 'stacked-prs,responsive-ui').status, 0)
    assert.ok(fs.existsSync(repoFile('.agents/skills/stacked-prs/SKILL.md')))
    append(repoFile('.agents/skills/responsive-ui/SKILL.md'), '\nLocal.\n')
    const result = vh('upgrade', '--remove', 'stacked-prs,responsive-ui')
    assert.equal(result.status, 0, result.out)
    assert.ok(!fs.existsSync(repoFile('.agents/skills/stacked-prs')))
    assert.match(result.out, /orphan\s+\.agents\/skills\/responsive-ui\/SKILL\.md/)
    assert.ok(fs.existsSync(repoFile('.agents/skills/responsive-ui/SKILL.md')))
    const refused = vh('upgrade', '--remove', 'error-handling')
    assert.equal(refused.status, 1)
    assert.match(refused.out, /error-handling is a core skill/)
  })

  test('--dry-run writes nothing', () => {
    assert.equal(vh('install', '--claude', 'none').status, 0)
    append(kitFile('skills/error-handling/SKILL.md'), '\nUpstream.\n')
    commitKit(kit, 'v2')
    const before = readRepo('.agents/vibe-harness.lock.json')
    const result = vh('upgrade', '--dry-run')
    assert.equal(result.status, 0, result.out)
    assert.match(result.out, /update\s+\.agents\/skills\/error-handling\/SKILL\.md/)
    assert.doesNotMatch(readRepo('.agents/skills/error-handling/SKILL.md'), /Upstream\./)
    assert.equal(readRepo('.agents/vibe-harness.lock.json'), before)
  })
})

describe('Claude Code skills', () => {
  test('auto records one symlink when core.symlinks is false and never copies skills', () => {
    git(repo, 'config', 'core.symlinks', 'false')
    const planned = vh('install', '--dry-run')
    assert.equal(planned.status, 0, planned.out)
    assert.match(planned.out, /link\s+\.claude\/skills/)
    assert.doesNotMatch(planned.out, /mirror/)

    const result = vh('install')
    assert.equal(result.status, 0, result.out)
    assert.equal(readLock().claude, 'symlink')
    assert.deepEqual(readLock().mirrors, [])
    const stat = fs.lstatSync(repoFile('.claude/skills'))
    assert.equal(stat.isDirectory(), false)
    if (stat.isSymbolicLink()) {
      assert.equal(fs.readlinkSync(repoFile('.claude/skills')).replaceAll('\\', '/'), '../.agents/skills')
    } else {
      assert.equal(fs.readFileSync(repoFile('.claude/skills'), 'utf8'), '../.agents/skills')
      const recorded = git(repo, 'ls-files', '-s', '--', '.claude/skills')
      assert.match(recorded, /^120000 2b7a412b8fa0fb7e985b0793321bd4e698f2b6cd /)
      git(repo, 'add', '-A')
      assert.equal(git(repo, 'ls-files', '-s', '--', '.claude/skills'), recorded)
    }
    assert.doesNotMatch(vh('status').out, /missing\s+\.claude\/skills/)

    writeRepo('.agents/skills/own/SKILL.md', 'Project skill.\n')
    assert.equal(vh('uninstall').status, 0)
    assert.equal(fs.existsSync(repoFile('.claude/skills')), false)
    assert.equal(git(repo, 'ls-files', '--', '.claude/skills'), '')
    assert.equal(readRepo('.agents/skills/own/SKILL.md'), 'Project skill.\n')
  })

  test('symlink mode refuses a skill directory it does not own', () => {
    writeRepo('.claude/skills/error-handling/SKILL.md', 'mine\n')
    const result = vh('install', '--claude', 'symlink')
    assert.equal(result.status, 2, result.out)
    assert.match(result.out, /CONFLICT\s+\.claude\/skills\b/)
    assert.equal(fs.existsSync(repoFile('.agents')), false)
  })

  test('upgrade --claude symlink replaces mirrors with one link', () => {
    assert.equal(vh('install', '--claude', 'mirror').status, 0)
    const result = vh('upgrade', '--claude', 'symlink')
    assert.equal(result.status, 0, result.out)
    assert.equal(readLock().claude, 'symlink')
    assert.deepEqual(readLock().mirrors, [])
    assert.equal(fs.lstatSync(repoFile('.claude/skills')).isDirectory(), false)
    assert.equal(fs.existsSync(repoFile('.agents/skills/error-handling/SKILL.md')), true)
    assert.doesNotMatch(vh('status').out, /missing\s+\.claude\/skills/)
  })

  test('mirror mode copies skills, reports stale mirrors, and refreshes them on upgrade', () => {
    assert.equal(vh('install', '--claude', 'mirror').status, 0)
    assert.equal(readRepo('.claude/skills/error-handling/SKILL.md'), readRepo('.agents/skills/error-handling/SKILL.md'))
    assert.equal(readLock().claude, 'mirror')
    append(repoFile('.agents/skills/error-handling/SKILL.md'), '\nLocal.\n')
    assert.match(vh('status').out, /stale\s+\.claude\/skills\/error-handling/)
    assert.equal(vh('upgrade').status, 0)
    assert.match(readRepo('.claude/skills/error-handling/SKILL.md'), /Local\.\n$/)
    assert.doesNotMatch(vh('status').out, /stale/)
  })

  test('symlink mode links the directory and uninstall never deletes through the link', { skip: process.platform === 'win32' && 'directory symlinks need extra privileges on Windows' }, () => {
    assert.equal(vh('install', '--claude', 'symlink').status, 0)
    assert.ok(fs.lstatSync(repoFile('.claude/skills')).isSymbolicLink())
    writeRepo('.agents/skills/own/SKILL.md', 'Project skill.\n')
    assert.equal(vh('uninstall').status, 0)
    assert.ok(!fs.existsSync(repoFile('.claude/skills')))
    assert.equal(readRepo('.agents/skills/own/SKILL.md'), 'Project skill.\n')
  })
})

describe('uninstall', () => {
  test('removes unmodified managed content and keeps local edits and seeds', () => {
    writeRepo('AGENTS.md', '# Acme\n\nUse tabs.\n')
    assert.equal(vh('install', '--claude', 'mirror').status, 0)
    append(repoFile('.agents/skills/code-review/SKILL.md'), '\nLocal.\n')
    const result = vh('uninstall')
    assert.equal(result.status, 0, result.out)
    assert.equal(readRepo('AGENTS.md'), '# Acme\n\nUse tabs.\n')
    assert.ok(!fs.existsSync(repoFile('.agents/skills/error-handling')))
    assert.match(readRepo('.agents/skills/code-review/SKILL.md'), /Local\.\n$/)
    assert.ok(fs.existsSync(repoFile('.agents/project-profile.md')))
    assert.ok(!fs.existsSync(repoFile('.agents/vibe-harness.lock.json')))
    assert.ok(!fs.existsSync(repoFile('.claude')))
    assert.ok(!fs.existsSync(repoFile('docs/defensive-patterns')))
    assert.ok(!fs.existsSync(repoFile('.gitignore')))
  })

  test('keeps CRLF line endings in project files that hold a managed block', () => {
    writeRepo('.gitignore', 'dist/\r\n')
    assert.equal(vh('install', '--claude', 'none').status, 0)
    assert.match(readRepo('.gitignore'), /^dist\/\r\n\r\n# vibe-harness:begin\r\n\.agent-scratch\/\r\n# vibe-harness:end\r\n$/)
    assert.doesNotMatch(vh('status').out, /modified/)
    assert.equal(vh('uninstall').status, 0)
    assert.equal(readRepo('.gitignore'), 'dist/\r\n')
  })

  test('keeps a block file that gained project content outside the block', () => {
    assert.equal(vh('install', '--claude', 'none').status, 0)
    append(repoFile('AGENTS.md'), '\n## Project rules\n\nUse tabs.\n')
    assert.equal(vh('uninstall').status, 0)
    assert.equal(readRepo('AGENTS.md'), '# AGENTS.md\n\n## Project rules\n\nUse tabs.\n')
  })
})
