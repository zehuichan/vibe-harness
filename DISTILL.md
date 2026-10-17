# Distill a skill into vibe-harness

Maintainer procedure. An agent follows this file when asked to bring an update from the source project into this kit. Installed repositories do not receive this file.

## Prompt

Paste one of these to the agent working in the vibe-harness checkout. Name every skill to sync; do not ask it to sync the whole tree unless that is intended.

```text
Follow DISTILL.md in this repository. Sync these skills from the source checkout at <path>: <skill names>. Do not modify the source checkout. Do not commit unless I ask.
```

```text
按本仓库的 DISTILL.md，把源仓库 <路径> 里的这些 skill 同步过来：<技能名>。不要改源仓库。我没说提交就不要提交。
```

`<skill names>` may be kit names (`pre-push-checks`) or source directory names (`dsh-pre-push-checks`).

## Scope

Edit only the vibe-harness checkout. Read the source checkout and leave it unchanged.

Sync only the skills named in the request, plus a governance template when the request names that template. A change that only makes sense together with another skill or template is reported, not silently expanded.

## Source map

| Source `.agents/skills/` | Kit `skills/` | Tier |
|---|---|---|
| `dsh-error-handling` | `error-handling` | core |
| `dsh-prose-standard` | `prose-standard` | core |
| `dsh-trim-cot-leakage` | `trim-cot-leakage` | core |
| `dsh-ci-test-reliability` | `test-reliability` | core |
| `dsh-find-simplifications` | `find-simplifications` | core |
| `dsh-code-review` | `code-review` | core |
| `dsh-pre-push-checks` | `pre-push-checks` | core |
| `dsh-speed-up-perf` | `perf-evidence` | core |
| `agent-experience` | `agent-experience` | core |
| `cordis-styling-nitpicking` | `lifecycle-review` | core |
| `dsh-archive-agent-notes` | `agent-notes` | core |
| `dsh-doc` | `docs-standard` | core |
| `dsh-create-upgrade-guide` | `upgrade-guide` | core |
| `dsh-client-ui-ux` | `ui-ux-review` | optional, `surfaces.ui` |
| `dsh-responsive-ui` | `responsive-ui` | optional, `surfaces.ui` |
| `record-browser-gif` | `record-browser-gif` | optional, `surfaces.ui` |
| `dsh-merging-stacked-prs` | `stacked-prs` | optional, `vcs.host == github` |

`dsh-official-plugin-artwork` and `dsh-translate-docs` stay out. They encode that project's plugin art and documentation-translation gate. Add either only when the request says so, and then as a new optional skill with its own `when`.

Governance templates, when the request names them:

| Source | Kit |
|---|---|
| `.agents/notes/README.md` and the `AGENTS.md` files under it | `templates/agent-notes/` |
| `docs/defensive-patterns/README.md`, `docs/defensive-patterns/general.md` | `templates/defensive-patterns/` |
| `docs/AGENTS.md` | `templates/docs-AGENTS.md` |
| The standing working agreement in the source `AGENTS.md` | `templates/AGENTS.md.tmpl` |

`vibe-harness-bootstrap` has no source skill. Leave it unless the request is about the installer or `BOOTSTRAP.md`.

## What to carry over

Read the source skill and the kit skill in full, including `references/` and `scripts/`. Treat the kit file as the current text. Port a source change only when the rule still holds for a repository that is not the source project.

For each source hunk, do one of these:

- **Port.** The rule is about agent behavior, review, tests, prose, failures, or lifecycle, and it does not name the source project's packages, commands, or services. Rewrite it in the kit's words.
- **Generalize.** The rule is real, but its command, path, host, or product surface is specific. Point it at a profile key or a canonical path from the tables below.
- **Drop.** The rule exists only because of that repository: a package name, a script name, a plugin API, a reviewer roster, a snapshot tree, or a release ritual. Say what was dropped and why.

When the kit and the source both changed the same passage, keep the kit's generalization and add only the new source rule.

## Replacements

Commands become profile keys defined in `templates/project-profile.md.tmpl`. Write "the profile's `commands.focused-test`", not a package-manager script. The keys are `commands.install`, `commands.focused-test`, `commands.full-test`, `commands.coverage`, `commands.typecheck`, `commands.lint`, `commands.format`, `commands.build`, `commands.docs-check`, `commands.e2e`, `commands.bench`, `commands.change-scope`, `vcs.host`, `vcs.default-branch`, `vcs.pr-cli`, `surfaces.ui`, `surfaces.localized-ui`, `surfaces.bilingual-docs`, and `surfaces.public-api`.

Use an existing key when it covers the fact. Add a key only when no existing key can say it. A new key goes in the profile template with `TODO(profile)` or a documented default, in the template's Keys section, and in the report. Upgrades never rewrite `.agents/project-profile.md`, so the report must tell the user that existing installations add the key by hand.

Paths that stay fixed: `.agents/skills/`, `.agents/notes/`, `.agents/project-profile.md`, `docs/defensive-patterns/`, `docs/AGENTS.md`, `docs/upgrade-guide/`, `.agent-scratch/`. Scratch files, recordings, and other agent debris go under `.agent-scratch/`.

Skill bodies stay English. A source example that only works in one natural language can stay when the skill is about that language's wording.

## Kit constraints

`npm run check` enforces these. Write the skill so the check passes:

- `skills/<name>/SKILL.md` frontmatter `name` equals `<name>`. `name` is at most 64 characters of lowercase letters, digits, and single hyphens. `description` is at most 1024 characters and says when to use the skill.
- Skills and templates contain none of these names: `dsh`, `deepseek`, `cordis`, `SessionEventMap`.
- Skills contain no `{{PLACEHOLDER}}`. Templates use only `{{PROJECT_NAME}}` unless `manifest.json` `variables` lists more.
- A relative Markdown link resolves from the installed path. A kit file `skills/code-review/SKILL.md` is installed at `.agents/skills/code-review/SKILL.md`, so a link to a sibling skill is `../<skill>/SKILL.md`.
- A core skill and any template name an optional skill in backticks. They do not link to it. Optional skills may link to each other. `stacked-prs` may link `pre-push-checks` because that skill is core.
- A profile key written as `commands.<key>`, `vcs.<key>`, or `surfaces.<key>` exists in the profile template.
- Text files use LF, end with exactly one newline, and have no trailing whitespace.
- A new skill is a directory listed in `manifest.json`. An optional skill has a `when` condition whose first key exists in the profile template. Add a row to the skill tables in `README.md` and `README.zh.md`.
- A new template is a `templates` entry in `manifest.json` with mode `managed`, `seed`, or `block`, and `scripts/vh.mjs` already implements that mode. Extending the installer is a separate change; stop and report it.
- Generic helper scripts, such as `record-browser-gif/scripts/encode_gif.py` and its test, are copied when their behavior is still generic. Point the test at the script beside it.

## Verify and report

Run `npm run check` and `npm test` in the vibe-harness checkout. Fix failures that the edit caused.

Do not commit, push, tag, or bump `version` unless the request says so. A release, when requested, follows the Developing section of `README.md`: bump `version` in `manifest.json` and `package.json` together, add a `CHANGELOG.md` heading for that version, name any seed-template change in that entry, and push a `vX.Y.Z` tag only after the user asks to publish.

Report, for each skill:

- source path and kit path;
- rules ported, rules generalized (with the profile key or path used), and rules dropped;
- profile keys added, and that existing installations must add them by hand;
- commands run and their results.
