---
name: vibe-harness-bootstrap
description: Use when asked to install, bootstrap, upgrade, add or remove skills from, check, or uninstall vibe-harness (for example "bootstrap from https://github.com/zehuichan/vibe-harness", "upgrade vibe-harness", "升级 vibe-harness"), or when `.agents/vibe-harness.lock.json` exists and the user asks to refresh the agent skills or governance files.
---

# Bootstrap and upgrade vibe-harness

vibe-harness is a kit of agent skills and governance templates. A repository adopts it by copying the kit's files in with its installer, which records every managed file in `.agents/vibe-harness.lock.json`. This skill fetches the kit and hands control to the kit's own `BOOTSTRAP.md`, which owns the full procedure for the version you fetched.

## Fetch the kit

1. Find the kit repository: `kit.repository` in `.agents/vibe-harness.lock.json` when it exists, otherwise the URL the user gave, otherwise `https://github.com/zehuichan/vibe-harness`.
2. Clone it into a temporary directory outside the target repository; a partial clone keeps it small and still lets the installer fetch older files for three-way merges:

   ```sh
   git clone --filter=blob:none <kit-repository> <kit-dir>
   git -C <kit-dir> tag --sort=-v:refname
   git -C <kit-dir> checkout <newest tag, or the ref the user named>
   ```

   Reuse an existing clone only after `git -C <kit-dir> fetch --tags origin`. Use the default branch only when the kit has no tags or the user asks for it.
3. Read `<kit-dir>/BOOTSTRAP.md` and follow it from the section that matches the request: install, upgrade, changing the skill selection, status, or uninstall.

## Rules that hold for every operation

- Run the installer with `--dry-run` first and show the user its plan before writing.
- Never edit files inside the kit clone; it is the upstream base for future merges.
- Exit code `2` means conflicts that need a decision. Report every one; never hide a conflict by deleting the lock file, overwriting a local edit, or passing `--skip-conflicts` without the user's agreement.
- Fill `.agents/project-profile.md` only with commands you ran successfully in this repository or facts you confirmed from its files.
- Do not commit, push, or open a pull request unless the user asks.
