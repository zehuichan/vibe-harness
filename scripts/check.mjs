#!/usr/bin/env node
/**
 * Kit consistency gate.
 *
 * `checkKit(root)` returns one message per violation:
 * - manifest entries and skill directories match, and template sources exist;
 * - every SKILL.md has `name` equal to its directory and a description of at most 1024 characters;
 * - relative Markdown links resolve, with skills and templates resolved at their installed paths;
 * - core skills and templates never link to optional skills, which may be absent after install;
 * - templates use only declared `{{VARIABLE}}` placeholders, and skills use none;
 * - profile keys named in skills and templates exist in the profile template;
 * - text files use LF, end with exactly one newline, and have no trailing whitespace;
 * - skills and templates carry no names from the project they were distilled from;
 * - CHANGELOG.md has a heading for the manifest version.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/
const BINARY = /\.(png|gif|jpe?g|webp|ico)$/i
const SKIP_DIRS = new Set(['.git', 'node_modules', '.agent-scratch'])
const ROOT_DOCS = ['README.md', 'README.zh.md', 'BOOTSTRAP.md', 'CHANGELOG.md']
const TIERS = ['core', 'optional']
const MODES = ['managed', 'seed', 'block']
const PROFILE_TEMPLATE = 'templates/project-profile.md.tmpl'
const LEAKED_NAMES = [/\bdsh\b/i, /deepseek/i, /\bcordis\b/i, /SessionEventMap/]

function walk(root, rel = '') {
  const out = []
  for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const child = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...walk(root, child))
    else if (entry.isFile()) out.push(child)
  }
  return out.sort()
}

const read = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8')

function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text)
  if (!match) return null
  const fields = {}
  for (const line of match[1].split('\n')) {
    const field = /^([a-z-]+):\s*(.*)$/.exec(line)
    if (field) fields[field[1]] = field[2].trim()
  }
  return fields
}

function profileKeys(text) {
  const match = /^---\n([\s\S]*?)\n---/.exec(text)
  const keys = new Set()
  if (!match) return keys
  const stack = []
  for (const line of match[1].split('\n')) {
    const key = /^( *)([A-Za-z0-9_.-]+):/.exec(line)
    if (!key) continue
    const depth = Math.floor(key[1].length / 2)
    stack.length = depth
    stack[depth] = key[2]
    keys.add(stack.slice(0, depth + 1).join('.'))
  }
  return keys
}

/** Removes fenced code blocks and inline code spans so their contents are not read as links. */
function stripCode(text) {
  return text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '')
}

function relativeLinks(text) {
  const links = []
  for (const match of stripCode(text).matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1]
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue
    links.push(decodeURIComponent(target.split('#')[0]))
  }
  return links
}

/** Maps kit sources to the paths they occupy in an installed repository. */
function installedLayout(manifest, skillFiles) {
  const layout = new Map()
  for (const file of skillFiles) layout.set(file, file.replace(/^skills\//, '.agents/skills/'))
  for (const template of manifest.templates ?? []) layout.set(template.source, template.target)
  return layout
}

export function checkKit(root) {
  const errors = []
  const report = (file, message) => errors.push(`${file}: ${message}`)
  const files = walk(root)
  const manifest = JSON.parse(read(root, 'manifest.json'))
  const skills = manifest.skills ?? {}
  const variables = new Set(manifest.variables ?? [])
  const skillFiles = files.filter((file) => file.startsWith('skills/'))
  const skillDirs = new Set(skillFiles.map((file) => file.split('/')[1]))
  const optional = new Set(Object.keys(skills).filter((name) => skills[name].tier === 'optional'))
  const keys = fs.existsSync(path.join(root, PROFILE_TEMPLATE)) ? profileKeys(read(root, PROFILE_TEMPLATE)) : new Set()

  for (const [name, entry] of Object.entries(skills)) {
    if (!skillDirs.has(name)) report('manifest.json', `skill ${name} has no skills/${name}/ directory`)
    if (!TIERS.includes(entry.tier)) report('manifest.json', `skill ${name} has tier ${entry.tier}; expected ${TIERS.join(' or ')}`)
    if (entry.tier === 'optional') {
      const key = /^([a-z.-]+)/.exec(entry.when ?? '')?.[1]
      if (!key) report('manifest.json', `optional skill ${name} needs a "when" condition`)
      else if (!keys.has(key)) report('manifest.json', `optional skill ${name} depends on unknown profile key ${key}`)
    }
  }
  for (const name of skillDirs) if (!skills[name]) report(`skills/${name}`, 'directory is not listed in manifest.json')

  const targets = new Set()
  for (const template of manifest.templates ?? []) {
    if (!files.includes(template.source)) report('manifest.json', `template source ${template.source} does not exist`)
    if (!MODES.includes(template.mode)) report('manifest.json', `template ${template.source} has mode ${template.mode}`)
    if (path.isAbsolute(template.target) || template.target.split('/').includes('..')) report('manifest.json', `template target ${template.target} must stay inside the repository`)
    if (targets.has(template.target)) report('manifest.json', `template target ${template.target} is listed twice`)
    targets.add(template.target)
  }

  for (const name of skillDirs) {
    const rel = `skills/${name}/SKILL.md`
    if (!files.includes(rel)) {
      report(`skills/${name}`, 'has no SKILL.md')
      continue
    }
    const fields = frontmatter(read(root, rel))
    if (!fields) {
      report(rel, 'has no YAML frontmatter')
      continue
    }
    if (fields.name !== name) report(rel, `frontmatter name "${fields.name}" must equal the directory name "${name}"`)
    if (!SKILL_NAME.test(name) || name.length > 64) report(rel, 'skill names use at most 64 lowercase letters, digits, and single hyphens')
    if (!fields.description) report(rel, 'frontmatter needs a description')
    else if (fields.description.length > 1024) report(rel, `description has ${fields.description.length} characters; the limit is 1024`)
  }

  const layout = installedLayout(manifest, skillFiles)
  const installed = new Set(layout.values())
  const existsInstalled = (target) => installed.has(target) || [...installed].some((file) => file.startsWith(`${target.replace(/\/$/, '')}/`))
  const isCore = (source) => source.startsWith('templates/') || (source.startsWith('skills/') && skills[source.split('/')[1]]?.tier === 'core')

  for (const [source, target] of layout) {
    if (!source.endsWith('.md') && !source.endsWith('.md.tmpl')) continue
    if (!files.includes(source)) continue
    for (const link of relativeLinks(read(root, source))) {
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(target), link))
      if (resolved.startsWith('..')) {
        report(source, `link ${link} leaves the installed repository`)
        continue
      }
      if (!existsInstalled(resolved)) {
        report(source, `link ${link} resolves to ${resolved}, which the kit does not install`)
        continue
      }
      const linkedSkill = /^\.agents\/skills\/([^/]+)/.exec(resolved)?.[1]
      if (isCore(source) && linkedSkill && optional.has(linkedSkill)) {
        report(source, `links optional skill ${linkedSkill}; name it in backticks instead because it may not be installed`)
      }
    }
  }

  for (const doc of ROOT_DOCS) {
    if (!files.includes(doc)) continue
    for (const link of relativeLinks(read(root, doc))) {
      const resolved = path.posix.normalize(link)
      if (!fs.existsSync(path.join(root, resolved))) report(doc, `link ${link} does not resolve`)
    }
  }

  for (const file of files.filter((rel) => rel.startsWith('skills/') || rel.startsWith('templates/'))) {
    if (BINARY.test(file)) continue
    const text = read(root, file)
    for (const match of text.matchAll(/\{\{([A-Za-z_]+)\}\}/g)) {
      if (file.startsWith('skills/')) report(file, `skills are copied verbatim, so placeholder {{${match[1]}}} would never be replaced`)
      else if (!variables.has(match[1])) report(file, `placeholder {{${match[1]}}} is not declared in manifest.json variables`)
    }
    for (const match of text.matchAll(/\b(commands|vcs|surfaces)\.([a-z][a-z-]*[a-z])\b/g)) {
      const key = `${match[1]}.${match[2]}`
      if (!keys.has(key)) report(file, `refers to profile key ${key}, which ${PROFILE_TEMPLATE} does not define`)
    }
    for (const pattern of LEAKED_NAMES) {
      const hit = pattern.exec(text)
      if (hit) report(file, `contains "${hit[0]}", a name from the source project; generalize it`)
    }
  }

  for (const file of files) {
    if (BINARY.test(file)) continue
    const text = read(root, file)
    if (text.length === 0) continue
    if (text.includes('\r')) report(file, 'uses CR line endings; use LF')
    if (!text.endsWith('\n') || text.endsWith('\n\n')) report(file, 'must end with exactly one newline')
    const trailing = text.split('\n').findIndex((line) => /[ \t]+$/.test(line))
    if (trailing !== -1) report(file, `line ${trailing + 1} has trailing whitespace`)
  }

  if (files.includes('CHANGELOG.md') && !new RegExp(`^## ${manifest.version.replace(/\./g, '\\.')}\\b`, 'm').test(read(root, 'CHANGELOG.md'))) {
    report('CHANGELOG.md', `has no "## ${manifest.version}" heading for the manifest version`)
  }
  return errors
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const errors = checkKit(root)
  for (const error of errors) console.error(error)
  console.log(errors.length === 0 ? 'check: ok' : `check: ${errors.length} problem(s)`)
  process.exitCode = errors.length === 0 ? 0 : 1
}
