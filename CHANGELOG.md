# Changelog

Each release lists changes that affect installed repositories. Upgrade agents read the entries newer than the `kit.ref` in `.agents/vibe-harness.lock.json`; entries name seed-template changes explicitly because upgrades never rewrite seeds.

## 0.1.0

- Initial release: 14 core skills, 4 optional skills (`ui-ux-review`, `responsive-ui`, `record-browser-gif`, `stacked-prs`), governance templates (managed `AGENTS.md` block, project profile, Agent Notes tree, defensive patterns, documentation standard), and the `scripts/vh.mjs` installer with install, upgrade, status, and uninstall.
