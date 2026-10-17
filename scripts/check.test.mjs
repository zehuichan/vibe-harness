import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { checkKit } from './check.mjs'

const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKIPPED = new Set(['.git', 'node_modules', '.agent-scratch'])

let root

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-harness-check-'))
  fs.cpSync(KIT_ROOT, root, { recursive: true, filter: (source) => !SKIPPED.has(path.basename(source)) })
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

const file = (rel) => path.join(root, rel)
const edit = (rel, change) => fs.writeFileSync(file(rel), change(fs.readFileSync(file(rel), 'utf8')))
const editManifest = (change) => edit('manifest.json', (text) => `${JSON.stringify(change(JSON.parse(text)), null, 2)}\n`)

function assertRejects(pattern) {
  const errors = checkKit(root)
  assert.ok(errors.some((error) => pattern.test(error)), `expected an error matching ${pattern}, got:\n${errors.join('\n') || '(none)'}`)
}

describe('checkKit', () => {
  test('accepts the kit as shipped', () => {
    assert.deepEqual(checkKit(root), [])
  })

  test('rejects a skill directory missing from the manifest', () => {
    fs.mkdirSync(file('skills/extra'))
    fs.writeFileSync(file('skills/extra/SKILL.md'), '---\nname: extra\ndescription: Extra.\n---\n\n# Extra\n')
    assertRejects(/skills\/extra: directory is not listed in manifest\.json/)
  })

  test('rejects a manifest skill without a directory', () => {
    editManifest((manifest) => ({ ...manifest, skills: { ...manifest.skills, ghost: { tier: 'core' } } }))
    assertRejects(/skill ghost has no skills\/ghost\/ directory/)
  })

  test('rejects an optional skill gated on an unknown profile key', () => {
    editManifest((manifest) => ({ ...manifest, skills: { ...manifest.skills, 'stacked-prs': { tier: 'optional', when: 'surfaces.nothing' } } }))
    assertRejects(/depends on unknown profile key surfaces\.nothing/)
  })

  test('rejects a missing template source', () => {
    editManifest((manifest) => ({ ...manifest, templates: [...manifest.templates, { source: 'templates/none.md', target: 'none.md', mode: 'managed' }] }))
    assertRejects(/template source templates\/none\.md does not exist/)
  })

  test('rejects a frontmatter name that differs from the directory', () => {
    edit('skills/error-handling/SKILL.md', (text) => text.replace('name: error-handling', 'name: errors'))
    assertRejects(/frontmatter name "errors" must equal the directory name "error-handling"/)
  })

  test('rejects a description longer than 1024 characters', () => {
    edit('skills/error-handling/SKILL.md', (text) => text.replace(/^description: .*$/m, `description: ${'x'.repeat(1025)}`))
    assertRejects(/description has 1025 characters/)
  })

  test('rejects a broken relative link at the installed path', () => {
    edit('skills/error-handling/SKILL.md', (text) => `${text}\nSee [missing](../nowhere/SKILL.md).\n`)
    assertRejects(/link \.\.\/nowhere\/SKILL\.md resolves to \.agents\/skills\/nowhere\/SKILL\.md/)
  })

  test('ignores links inside code', () => {
    edit('skills/error-handling/SKILL.md', (text) => `${text}\n\`[missing](../nowhere.md)\`\n\n\`\`\`md\n[missing](../nowhere.md)\n\`\`\`\n`)
    assert.deepEqual(checkKit(root), [])
  })

  test('rejects a core skill linking an optional skill', () => {
    edit('skills/code-review/SKILL.md', (text) => `${text}\nSee [stacks](../stacked-prs/SKILL.md).\n`)
    assertRejects(/skills\/code-review\/SKILL\.md: links optional skill stacked-prs/)
  })

  test('rejects a template linking an optional skill', () => {
    edit('templates/agent-notes/README.md', (text) => `${text}\nSee [ui](../skills/ui-ux-review/SKILL.md).\n`)
    assertRejects(/templates\/agent-notes\/README\.md: links optional skill ui-ux-review/)
  })

  test('rejects an undeclared template placeholder', () => {
    edit('templates/project-profile.md.tmpl', (text) => `${text}\n{{OWNER}}\n`)
    assertRejects(/placeholder \{\{OWNER\}\} is not declared/)
  })

  test('rejects a placeholder in a skill', () => {
    edit('skills/error-handling/SKILL.md', (text) => `${text}\n{{PROJECT_NAME}}\n`)
    assertRejects(/skills are copied verbatim, so placeholder \{\{PROJECT_NAME\}\}/)
  })

  test('rejects an unknown profile key reference', () => {
    edit('skills/pre-push-checks/SKILL.md', (text) => `${text}\nRun the profile's \`commands.smoke-test\`.\n`)
    assertRejects(/refers to profile key commands\.smoke-test/)
  })

  test('rejects names from the source project', () => {
    edit('skills/error-handling/SKILL.md', (text) => `${text}\nRegister it as a Cordis service.\n`)
    assertRejects(/contains "Cordis"/)
  })

  test('rejects CR line endings, missing final newlines, and trailing whitespace', () => {
    edit('skills/error-handling/SKILL.md', (text) => text.replace(/\n/g, '\r\n'))
    edit('skills/prose-standard/SKILL.md', (text) => text.trimEnd())
    edit('skills/agent-notes/SKILL.md', (text) => text.replace('\n', '  \n'))
    assertRejects(/error-handling\/SKILL\.md: uses CR line endings/)
    assertRejects(/prose-standard\/SKILL\.md: must end with exactly one newline/)
    assertRejects(/agent-notes\/SKILL\.md: line 1 has trailing whitespace/)
  })

  test('rejects a CHANGELOG without the manifest version', () => {
    editManifest((manifest) => ({ ...manifest, version: '9.9.9' }))
    assertRejects(/CHANGELOG\.md: has no "## 9\.9\.9" heading/)
  })

  test('rejects a broken link in a root document', () => {
    edit('BOOTSTRAP.md', (text) => `${text}\nSee [gone](docs/gone.md).\n`)
    assertRejects(/BOOTSTRAP\.md: link docs\/gone\.md does not resolve/)
  })
})
