# Changelog

Each release lists changes that affect installed repositories. Upgrade agents read the entries newer than the `kit.ref` in `.agents/vibe-harness.lock.json`; entries name seed-template changes explicitly because upgrades never rewrite seeds.

## 0.1.5

- Skill text updates distilled from the source project, restoring rules lost in earlier distillation and fixing references that pointed at missing rules. Locally edited copies are three-way merged on upgrade.
  - `pre-push-checks`: `commands.change-scope` lists committed paths; add `git status --short` for worktree paths. Read the profile's "Hooks and CI" before choosing checks, rebuild stale generated declarations before type evidence, scope coverage with discovery plus inspection and a recovery rule, take the full-rehearsal inventory from CI definitions, and list conflicting paths with `git merge-tree` when a pull request has no workflow runs.
  - `code-review`: manual checks for test reliability, expected-output diffs as behavior changes, performance evidence, and not trusting an agent's report; routes to `trim-cot-leakage`, `perf-evidence`, `agent-experience`, and `agent-notes`; replies stay in the review thread.
  - `perf-evidence`: budgets are source constants, no benchmark-flattering caches, local timing does not prove runner stability, functional expectations stay out of benchmark internals, plus browser-measurement, cold and warm sampling, and review-response rules.
  - `lifecycle-review`: a composed provider orders provider withdrawal but not enclosing-owner shutdown, which must retain and await consumer disposal tasks; consumer-owned completion listeners; resource, service, then admission-gate order; structured output schemas.
  - `agent-notes`: evidence to gather before classifying, rejected-note deletion criteria, more calibration cases, no formatting fixes before archiving, and link checks that skip archived notes' outbound links.
  - `find-simplifications`: folding simplifications from another branch, per-item rejection reasons, freeze and identity evidence limits, and testing the project's own glue rather than a dependency's specification.
  - `docs-standard`: the fact-check procedure is mandatory, moves go one coherent topic at a time and preserve published routes, and a module README skeleton in `references/page-structure.md`.
  - `prose-standard`, `trim-cot-leakage`, `upgrade-guide`: interactive calibration rules; issue references are never moved into Agent Notes; mark hypotheticals explicitly; the guide directory uses the manifest's exact version string.
  - `stacked-prs` (optional): responding to review across a stack (fix the introducing layer, distinct review-fix commits, verify delegated fixes, check every layer), merge-queue behavior, and the base-chain check after a partial landing.
  - `record-browser-gif` (optional): publish only with `gh --attach` (gh v2.99.0 or later); a GIF over 5 MiB is split into numbered parts; the assets-branch fallback is removed.
- Managed templates, rewritten on upgrade:
  - `AGENTS.md` block: a History section (merge-forward or rebase, exact `--force-with-lease`, fix the introducing change), narrow exceptions instead of global rule disabling, sandbox escalation, no committed credentials, and docs updated in the same change as code.
  - `docs/defensive-patterns/general.md`: the extension-point paragraph that `code-review` and `find-simplifications` link to, "a CI benchmark is an alert, not a pass", production performance code is not instrumentation, and carrier-only migrations. `docs/defensive-patterns/README.md` states that exceptions default to the domain owner.
  - `docs/AGENTS.md`: scope does not widen with document type, tutorial difficulty levels, and docs change with the code.
  - `.agents/notes/README.md`: consolidation guardrails, the feature-addition-into-removal rule, exclusive section names, and the marker for pre-format notes without recorded alternatives.
- Seed template: `.agents/project-profile.md` changes only the description of `commands.change-scope`; existing installations need no edit. No profile key is added.

## 0.1.4

- `ui-ux-review` (optional): on complex pages and containers, set shared horizontal and vertical alignment axes before adjusting local spacing, checked across hover, selected, and expanded or collapsed states, with references for stacked navigation lists, content list pages, and adjacent panel headers. Locally edited copies are three-way merged on upgrade.
- No profile key is added. The project profile and notes seeds are unchanged.

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
