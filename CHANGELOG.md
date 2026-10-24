# Changelog

Each release lists changes that affect installed repositories. Upgrade agents read the entries newer than the `kit.ref` in `.agents/vibe-harness.lock.json`; entries name seed-template changes explicitly because upgrades never rewrite seeds.

## 0.1.3

- Skill text updates distilled from the source project. Locally edited copies are three-way merged on upgrade.
  - `code-review` and `find-simplifications`: a requirement, check, or Agent Note introduced by a change is a design choice to assess, not evidence of necessity; prefer an existing extension point near the producer or consumer; trace authoritative reads before accepting a configuration pass-through.
  - `prose-standard`: English UI copy uses sentence case unless the project's design rules say otherwise.
  - `responsive-ui` and `ui-ux-review` (optional): hover follows the primary pointer, actions stay reachable without hover, and a new section covers pointer media features and the 16px text-field floor.
  - `pre-push-checks`: validate after a rewrite that publishes in one step, and run a typecheck that covers test and script files.
- No profile key is added. The project profile and notes seeds are unchanged.

## 0.1.2

- `CLAUDE.md` is a symlink to `AGENTS.md` (git mode 120000). A seed whose content is `@AGENTS.md` is replaced on upgrade. A `CLAUDE.md` with any other content is kept. The project profile and notes seeds are unchanged.

## 0.1.1

- `.claude/skills` is one symlink to `../.agents/skills`. Install no longer copies skills there when `core.symlinks` is off or the OS refuses the directory link. The committed object is git mode 120000. An existing `claude: mirror` install stays a mirror until `upgrade --claude symlink`.

## 0.1.0

- Initial release: 14 core skills, 4 optional skills (`ui-ux-review`, `responsive-ui`, `record-browser-gif`, `stacked-prs`), governance templates (managed `AGENTS.md` block, project profile, Agent Notes tree, defensive patterns, documentation standard), and the `scripts/vh.mjs` installer with install, upgrade, status, and uninstall.
