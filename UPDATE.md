# Apply a vibe-harness update

Procedure for an agent that brings a repository with vibe-harness already installed up to the latest kit. [DISTILL.md](DISTILL.md) carries updates from the source project into the kit; this file carries a released kit out to installed repositories. The installer commands and conflict handling are in [BOOTSTRAP.md](BOOTSTRAP.md#upgrade). This file adds the preconditions, how to choose the version, the parts the installer leaves to you, and what to report. Installed repositories do not receive this file.

## Prompt

Paste one of these to the agent. `<kit path>` is a checkout of this repository; `<repo path>` is the repository to update.

```text
Follow UPDATE.md in the vibe-harness checkout at <kit path>. Update the vibe-harness installed in <repo path> to the latest version. Do not commit unless I ask.
```

```text
按 UPDATE.md，把 <仓库路径> 里安装的 vibe-harness 更新到最新版，套件检出在 <套件路径>。我没说提交就不要提交。
```

## Scope

Edit only `<repo path>`. Never edit the kit checkout: the installer reads it as the upstream text and as the base for later merges. Update the installed kit only. Do not change the skill selection unless the user asks; that is a separate operation in [BOOTSTRAP.md](BOOTSTRAP.md#change-the-skill-selection).

## Preconditions

1. **`<repo path>` has `.agents/vibe-harness.lock.json`.** Without it, this is an install: follow [BOOTSTRAP.md](BOOTSTRAP.md#install).
2. **The kit checkout is clean and released.** Run `git status --short` in `<kit path>`. The installer copies working-tree text but records the commit at `HEAD`. Uncommitted kit edits, such as a finished DISTILL.md run, are installed under a commit that does not contain them, so the next upgrade cannot rebuild the merge base and reports "base unavailable" for every file that is both edited locally and changed upstream. If the checkout has changes, stop and report them. Releasing is the user's decision: follow the Developing section of [README.md](README.md) only when the user asks.
3. **`<repo path>` starts with a reviewable `git status`.** Record any unrelated uncommitted changes and tell the user, so the upgrade diff stays separable from them.

## Choose the version

1. Read `kit.repository`, `kit.version`, `kit.ref`, and `kit.commit` from the lock file.
2. Run `git -C <kit path> fetch --tags origin` and `git -C <kit path> tag --sort=-v:refname`. Check out the newest tag unless the user named another ref. Use an untagged `HEAD` only when the user asks: its `kit.ref` is a bare commit, which the CHANGELOG cannot name.
3. Read the [CHANGELOG](CHANGELOG.md) headings newer than `kit.version`. List what they change for an installed repository: seed templates, new profile keys, added or removed skills, and the Claude Code skill mode.
4. List the full set of changed kit files, because skill text updates arrive through the managed-file merge whether or not an entry names them: `git -C <kit path> diff --stat <kit.commit> HEAD -- skills templates`.

## Apply

Follow Upgrade in [BOOTSTRAP.md](BOOTSTRAP.md#upgrade) from the dry run. Read the plan by verb before writing:

| Verb | Meaning | Action |
|---|---|---|
| `update`, `create`, `append`, `adopt`, `remove` | Unmodified file or block replaced, added, adopted because it already matches, or dropped | None |
| `merge` | Local edits and the upstream change were combined | Read the merged text and confirm it still says what both sides meant |
| `keep` | Local edits kept; upstream unchanged | None |
| `skip`, `orphan` | Deleted locally, or no longer managed and kept because it has local edits | Report to the user |
| `profile` | The profile template gained keys | Add them in the next section |
| `CONFLICT` | Needs a decision | Resolve as BOOTSTRAP.md describes |

When the dry run prints `(nothing to change)`, the repository is current. Run `status`, report, and stop.

New core skills install on their own. A new optional skill never installs on upgrade: propose it from the evidence in [BOOTSTRAP.md](BOOTSTRAP.md#install) step 2 and add it only with the user's agreement.

## Finish what the installer leaves

- **Profile keys.** For each `profile` line, add the key to `.agents/project-profile.md`. Run the command before recording it, and write `none` when the project has no such command. The installer never rewrites the profile.
- **Seed template changes.** For each CHANGELOG entry that names one, apply it to the repository's copy by hand.
- **Conflict markers.** A file with `<<<<<<< local` regions keeps the project's intent and the upstream change together. Remove every marker, then check with `git grep -n -e '<<<<<<< local' -e '>>>>>>> upstream'`.

## Verify and report

Run `node <kit path>/scripts/vh.mjs status --target <repo path>`: nothing should be missing or modified except files the project edited on purpose, and the profile should have no `TODO(profile)` markers. Run the profile's `commands.docs-check` when it names one.

Do not commit, push, or open a pull request unless the request says so. When asked, commit the changed files and `.agents/vibe-harness.lock.json` together.

Report:

- the kit version and ref before and after;
- the CHANGELOG entries that applied;
- the plan's counts by verb, and each `merge`, `orphan`, and `skip` by path;
- each conflict and how you resolved it;
- the profile keys added and the commands that verified them;
- seed changes applied by hand, and optional skills proposed but not added;
- the commands run and their results.
