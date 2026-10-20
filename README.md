# vibe-harness

> **Agents:** to install, upgrade, or remove vibe-harness in a repository, read [BOOTSTRAP.md](BOOTSTRAP.md) and follow it.

[English](README.md) | [简体中文](README.zh.md)

vibe-harness gives AI-coded projects engineering discipline. It is a kit of agent skills and governance templates: evidence before claims, explicit contracts, owned lifecycles, durable decision records, and documentation without reasoning residue. Your coding agent installs it into a repository, adapts it to the project's commands, and upgrades it later without losing local edits.

## Quick start

Tell the coding agent working in your repository:

```text
Bootstrap this repository from https://github.com/zehuichan/vibe-harness following its BOOTSTRAP.md.
```

The agent clones the kit, inspects the repository, asks which optional skills to include, runs the installer, and fills `.agents/project-profile.md` with commands it verified. To upgrade later, say `Upgrade vibe-harness.`

## What gets installed

Core skills are always installed:

| Skill | Use |
|---|---|
| `vibe-harness-bootstrap` | Install, upgrade, and remove the kit |
| `error-handling` | Typed failures, ownership, containment, and actionable reports |
| `prose-standard` | Where comments and docs are required, and what they must state |
| `trim-cot-leakage` | Remove reasoning-transcript residue from comments and docs |
| `test-reliability` | Design and diagnose tests that can fail nondeterministically |
| `find-simplifications` | Find and propose evidence-backed deletions |
| `code-review` | Review a change against the project's standards |
| `pre-push-checks` | Select the smallest checks that cover an outgoing diff |
| `perf-evidence` | Measure performance claims with realistic workloads |
| `agent-experience` | Design tools, skills, and context for agents |
| `lifecycle-review` | Audit singleton state, unreversed side effects, and teardown order |
| `agent-notes` | Record and maintain durable design decisions |
| `docs-standard` | Structure, review, and fact-check documentation |
| `upgrade-guide` | Document externally perceptible breaking changes |

Optional skills are proposed from evidence in the repository:

| Skill | Proposed when |
|---|---|
| `ui-ux-review` | The project ships a GUI that product users see |
| `responsive-ui` | The project ships a GUI that product users see |
| `record-browser-gif` | The project has a web UI and its pull requests benefit from recordings |
| `stacked-prs` | The host is GitHub and the team lands dependent pull requests as stacks |

Governance files:

| Path | Purpose |
|---|---|
| `AGENTS.md` (managed block) | Standing orders for every agent session; project rules go outside the block |
| `CLAUDE.md` | Symlink to `AGENTS.md`, so Claude Code reads the same instructions |
| `.agents/project-profile.md` | Project facts the skills read: commands, version-control host, enabled surfaces |
| `.agents/notes/` | Agent Notes: decision records by lifecycle and class |
| `docs/defensive-patterns/` | Review rules that prevent recurring defects |
| `docs/AGENTS.md` | Documentation standard |

## How it works

- **Skills stay generic; the profile adapts them.** Skills refer to profile keys such as `commands.focused-test` or `surfaces.ui` instead of naming a toolchain, so one skill text serves a Node.js, Python, or Go repository.
- **The repository owns its copy.** Files are copied, not referenced, so the project can edit any of them. `.agents/vibe-harness.lock.json` records the kit version and the upstream hash of every managed file.
- **Upgrades keep local edits.** An unmodified file is replaced. An edited file is three-way merged with `git merge-file`, using the previously installed kit version as the base; overlapping edits are left as conflict markers for the agent to resolve. Seed files such as the profile are never overwritten, and `AGENTS.md` is rewritten only between its `vibe-harness` markers.
- **Every agent finds the skills.** Cursor and Codex read `.agents/skills/`. Claude Code reads `.claude/skills/`, one symlink to `../.agents/skills` (git mode 120000). The installer does not copy skills there. When the OS cannot create the directory link, the working tree file contains the link text and the git index records the symlink; a checkout with `core.symlinks=false` is that same text file. `--claude mirror` copies each skill only when that mode is requested.

## Other ways to install

- `npx skills add zehuichan/vibe-harness` installs skills only. It skips the governance files and the project profile, so profile references in the skills stay unresolved until you add them.
- Without Node.js, follow the manual procedure in [BOOTSTRAP.md](BOOTSTRAP.md#without-nodejs).

The installer requires git and Node.js 20 or later.

## Developing the kit

```sh
npm run check   # manifest, skill frontmatter, links at installed paths, placeholders, profile keys, text hygiene
npm test        # check rules (with a rejected case for each) and installer behavior
```

Keep skills project-neutral: name project facts through profile keys, and never link an optional skill from a core skill or a template, because it may not be installed. To bring an update across from the source project, have an agent follow [DISTILL.md](DISTILL.md). To release, bump `version` in `manifest.json` and `package.json`, add a [CHANGELOG](CHANGELOG.md) entry that names any seed-template change, and push a `vX.Y.Z` tag.

## License

[MIT](LICENSE). vibe-harness is distilled from the agent workflows of DeepSeek Harness; see [NOTICE](NOTICE).
