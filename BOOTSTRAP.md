# BOOTSTRAP.md

Agent procedure for installing, upgrading, and removing vibe-harness in a target repository. Read it from a local clone of the kit; the [`vibe-harness-bootstrap`](skills/vibe-harness-bootstrap/SKILL.md) skill describes how to get one. Throughout, `<kit>` is that clone and `<repo>` is the root of the repository you are working in.

## Contents

- [What gets installed](#what-gets-installed)
- [Install](#install)
- [Upgrade](#upgrade)
- [Change the skill selection](#change-the-skill-selection)
- [Status and uninstall](#status-and-uninstall)
- [Without Node.js](#without-nodejs)

## What gets installed

The installer requires git and Node.js 20 or later. It writes three kinds of files, listed in [manifest.json](manifest.json):

| Kind | Files | Upgrade behavior |
|---|---|---|
| Managed | `.agents/skills/<skill>/**`, `.agents/notes/README.md` and its `AGENTS.md` files, `docs/defensive-patterns/*.md`, `docs/AGENTS.md` | Replaced when unmodified; three-way merged when edited locally |
| Block | The text between `vibe-harness:begin` and `vibe-harness:end` markers in `AGENTS.md` and `.gitignore` | Same as managed, limited to the block; text outside the markers is never touched |
| Seed | `.agents/project-profile.md`, empty `.agents/notes/proposed/` and `rejected/` | Created when absent, never overwritten |
| Link | `CLAUDE.md` → `AGENTS.md` | Created when absent. A file whose content is `@AGENTS.md` is replaced. Any other existing content is kept |

`.agents/vibe-harness.lock.json` records the kit version, the selected skills, and the upstream hash of every managed file and block. Commit it with the installed files.

Cursor and Codex read skills from `.agents/skills/`. Claude Code reads `.claude/skills/`, so the installer exposes the skills there as one symlink to `../.agents/skills` (`--claude`). `auto` (the install default) and `symlink` create that directory link. When the OS refuses it, the working tree file contains the link text `../.agents/skills` with no trailing newline, and the installer stages git mode 120000 so a later `git add` still records a symlink. A checkout with `core.symlinks=false` is that text file. `mirror` copies each skill and is used only when requested; upgrade keeps the mode recorded in the lock unless `--claude` is passed. `none` does not expose the skills to Claude Code.

## Install

1. **Inspect `<repo>`.** Determine its languages, package manager, test runner, linters, build, documentation tooling, CI workflows, git hooks, and version-control host (`git remote -v`). Note any existing agent instructions: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`, `.agents/skills/`, `.claude/skills/`, and any existing `docs/AGENTS.md`.

2. **Choose optional skills and confirm them with the user.** Core skills are always installed. Propose optional skills from evidence:

   | Optional skill | Propose when |
   |---|---|
   | `ui-ux-review`, `responsive-ui` | The project ships a GUI that product users see (web, desktop, or mobile) |
   | `record-browser-gif` | The project has a web UI and its pull requests benefit from interaction recordings |
   | `stacked-prs` | The host is GitHub and the team lands dependent pull requests as stacks |

3. **Dry run.** `PROJECT_NAME` defaults to the directory name of `<repo>`; pass `--var PROJECT_NAME=<name>` when the project has a different name.

   ```sh
   node <kit>/scripts/vh.mjs install --target <repo> --optional <a,b> --dry-run
   ```

   Exit code `2` lists conflicts: a managed file such as `docs/AGENTS.md` already exists with different content, or `.claude/skills/<skill>` already exists. Nothing is written. For each conflict, agree with the user on one action: move or merge the existing file and rerun, or keep it and pass `--skip-conflicts`, which leaves that path unmanaged.

4. **Install.** Run the same command without `--dry-run`.

5. **Fill the project profile.** Open `.agents/project-profile.md` and replace every `TODO(profile)`:
   - Run each candidate command from `<repo>` and record it only if it succeeded; write `none` when the project has no such command. Use the placeholders the profile documents (`<target>`, `<base>`, `<file>`).
   - Set `vcs.*` from the remote and default branch, and set each `surfaces.*` flag from evidence.
   - Complete the "Evidence by surface" table, "Hooks and CI", and "Project-specific rules" from what you found in step 1.

6. **Integrate existing instructions.** Project-specific rules belong in `AGENTS.md` outside the managed block. If `CLAUDE.md` already existed with its own content, propose moving that content into `AGENTS.md` and leaving `CLAUDE.md` as a symlink to `AGENTS.md`; do the same for other instruction files only with the user's agreement. Do not edit inside the managed block to add project rules.

7. **Verify.** Run `node <kit>/scripts/vh.mjs status --target <repo>`: it should list nothing as missing or modified, and the profile should have no `TODO(profile)` markers left. Run the project's documentation check if the profile names one.

8. **Report.** List the installed skills, the Claude Code mode, any skipped conflicts, the profile commands you verified, and anything left for the user to decide. Do not commit unless asked; when asked, commit the installed files and the lock file together.

## Upgrade

1. Read `kit.ref` and `kit.repository` from `<repo>/.agents/vibe-harness.lock.json`. Fetch the kit, check out the target ref, and read the [CHANGELOG](CHANGELOG.md) entries newer than `kit.ref`.
2. Dry run, then upgrade:

   ```sh
   node <kit>/scripts/vh.mjs upgrade --target <repo> --dry-run
   node <kit>/scripts/vh.mjs upgrade --target <repo>
   ```

3. Resolve every `CONFLICT` line:
   - **Conflict regions in a file or managed block.** The file contains `<<<<<<< local`, `=======`, and `>>>>>>> upstream` markers. Keep the project's intent and the upstream change together, then remove the markers.
   - **Base unavailable.** The installer could not read the previous kit version (for example, the lock records no commit). Compare the local file with the new kit file and merge by hand; the next upgrade retries the merge.
   - **Exists with different content and is not managed.** A newly added kit file collides with a project file. Handle it as in install step 3.
4. Apply `profile` lines: add each new profile key the upgrade reports, verified as in install step 5.
5. Run `status` and report what changed, which conflicts you resolved and how, and which profile keys you added.

Seeds are never rewritten. When the CHANGELOG describes a change to a seed template, apply it to `<repo>`'s copy by hand.

## Change the skill selection

```sh
node <kit>/scripts/vh.mjs upgrade --target <repo> --add <skill,...> --remove <skill,...>
```

Core skills cannot be removed. Removed skills are deleted only where their files are unmodified; edited files are kept and reported as orphans. Use the same kit ref as the lock file unless the user also wants an upgrade.

## Status and uninstall

`node <kit>/scripts/vh.mjs status --target <repo>` reports managed files and blocks that are modified or missing, stale Claude Code mirrors, and remaining `TODO(profile)` markers.

`node <kit>/scripts/vh.mjs uninstall --target <repo> --dry-run`, then without `--dry-run`, removes unmodified managed files, unmodified managed blocks, Claude Code mirrors or the symlink, and the lock file. It keeps modified files and seed files and lists them, so the user decides about each.

## Without Node.js

Copy `skills/<skill>/` to `<repo>/.agents/skills/<skill>/` for each selected skill and copy each template in [manifest.json](manifest.json) to its `target`, replacing `{{PROJECT_NAME}}`. For `block` templates, wrap the content in the markers (`<!-- vibe-harness:begin -->` and `<!-- vibe-harness:end -->` in Markdown, `# vibe-harness:begin` and `# vibe-harness:end` elsewhere) and append it to the existing file. Create `<repo>/.claude/skills` as a symlink to `../.agents/skills`, and `<repo>/CLAUDE.md` as a symlink to `AGENTS.md`. When the OS cannot create a link, write a file whose contents are exactly the link text with no trailing newline (`../.agents/skills` or `AGENTS.md`) and stage it with `git update-index --add --cacheinfo 120000,<blob>,<path>`, where `<blob>` is `git hash-object -w` of that text. Do not copy skills into `.claude/skills/`, and do not write `@AGENTS.md`. Skip the lock file. When Node.js becomes available, running `install` adopts every file that still matches the kit and reports the rest as conflicts.
