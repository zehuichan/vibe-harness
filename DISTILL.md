# Distill a skill into vibe-harness

Maintainer procedure. An agent follows this file when asked to bring an update from the source project into this kit, or to audit how faithfully the kit reflects the source. Installed repositories do not receive this file.

## Prompts

Paste one of these to the agent working in the vibe-harness checkout. None needs editing: the source checkout comes from [`.distill-source`](#source-checkout), the scope from the [sync record](#sync-record), and the version from the [release rule](#release). Pull the source checkout first; the agent syncs against it as it stands.

Auto sync, after the source changed:

```text
Follow DISTILL.md in this repository and run an auto sync. Do not commit.
```

```text
按本仓库的 DISTILL.md 做一次自动同步。不要提交。
```

Full audit, when the question is whether earlier distillation lost something:

```text
Follow DISTILL.md in this repository and run a full audit. Report before editing.
```

```text
按本仓库的 DISTILL.md 做一次全文审计，先报告再改。
```

Release, when the synced content is ready to publish (the procedure makes the content commits itself):

```text
Follow the Release section of DISTILL.md in this repository and release.
```

```text
按本仓库 DISTILL.md 的 Release 一节发版。
```

A request may narrow or override these: "sync `pre-push-checks` and `stacked-prs`" limits the scope to the named skills, which may be kit names or source directory names (`dsh-pre-push-checks`); "from the source checkout at `<path>`" replaces `.distill-source` for that run; "release 0.2.0" replaces the version rule. A sync request that names no skills is an auto sync.

## Source checkout

The source checkout path is machine-specific, so it lives in `.distill-source` at the kit root: one line, the absolute path, gitignored. When the file is missing and the request names no path, ask for the path once and write the file with LF and one trailing newline, because `npm run check` applies its text-hygiene rules to every file in the checkout, ignored or not. Before using the path, confirm it is the source: `.agents/skills/dsh-prose-standard/SKILL.md` must exist under it; otherwise stop and report the path.

The sync compares against the checkout as it stands and never moves it: no fetch, pull, or checkout. `git -C <source> fetch --dry-run` shows whether the checkout is behind its remote without changing it; when it prints updates, or when `git -C <source> status --short` shows local edits, say so in the report with the `HEAD` you compared so the user can update the checkout and rerun. A stray untracked directory such as an index cache is not a modification, but say so.

## Scope

Edit only the vibe-harness checkout. Record `git -C <source> rev-parse --short HEAD` as the compared commit.

An auto sync covers every mapped skill, delegated document, and governance template whose source changed since the [sync record](#sync-record), as listed by the [scope command](#scope-command). A named sync covers the named skills, plus a governance template when the request names that template or when a synced skill cites a rule that only the template can carry (see [Cross-reference integrity](#cross-reference-integrity)); a change that only makes sense together with another skill or template is reported, not silently expanded.

An auto sync asks nothing. Every decision below has a default, and anything that still needs a human goes in the report instead of a question:

- A restructured pair ([source map](#source-map)) is read in full instead of diffed.
- A new source skill that no table maps is reported as a candidate with a one-line verdict and is not added.
- A source `AGENTS.md` hunk that is project-specific is dropped without being listed; the report names only the hunks ported or generalized from that file.
- A rule that needs a profile key the template lacks gets the key, as [Replacements](#replacements) describes, and the report says existing installations add it by hand.
- A change that needs the installer extended is left out and reported ([Kit constraints](#kit-constraints)).
- An empty scope means nothing to sync: make no edit except moving the sync record to the compared `HEAD`, and report that.

## Two modes

**Incremental sync** (auto or named). Diff each source skill in scope from the commit in the [sync record](#sync-record) to the source `HEAD` as one range (`git -C <source> diff <recorded>..HEAD -- .agents/skills/<dir>`), not commit by commit, so a change that a later commit reverted nets out. Also diff the skill's [delegated documents](#delegated-documents). Read the kit file in full regardless of how small the source diff is, because the diff tells you where the source moved, not whether the kit already carries the rule.

**Full audit.** Read every file of every mapped pair in full, including `references/`, `templates/`, and `scripts/`, and classify each source rule as present, missing, generalizable, correctly dropped, or drifted (see [Audit procedure](#audit-procedure)). Run a full audit when the request asks whether the kit distilled well, when several incremental syncs have passed since the last one, or when the source restructured a skill (split into references, merged with another, or moved rules to a cookbook). Incremental syncs cannot find rules that the first distillation never carried.

Either mode ends by updating the [sync record](#sync-record) for the compared skills.

## Procedure

An incremental sync runs in this order. A full audit replaces step 2 with a full read of every pair, classifies with the [audit procedure](#audit-procedure), and stops after step 3 to present the findings; editing resumes at step 4 with the scope the user chose.

1. Fix the scope. Record the source `HEAD` and the commit in the [sync record](#sync-record) that you diff from. For an auto sync, run the [scope command](#scope-command) and map every listed path to its kit pair; for a named sync, take the named skills, their source directories from the [source map](#source-map), and their [delegated documents](#delegated-documents).
2. Diff the source. Run `git -C <source> log --oneline <recorded>..HEAD -- <paths>` for orientation, then the range diff of the skill directories and delegated documents. Select by commit range, never by date: a branch merged after the recorded commit carries older author dates. An `A`, `D`, or `R` status inside a skill directory is a restructure; read that pair in full.
3. Read the kit skill in full, then classify every source hunk with [What to carry over](#what-to-carry-over).
4. Edit the kit skill and any template the hunks require, following [Replacements](#replacements) and [Kit constraints](#kit-constraints).
5. Run the [cross-reference checks](#cross-reference-integrity) on every touched file.
6. [Verify and report](#verify-and-report), then update the [sync record](#sync-record).

### Scope command

Every source path the kit mirrors, in one command. Its output is the auto-sync scope; each path maps to a kit pair through the [source map](#source-map), the [delegated documents](#delegated-documents), or the governance templates table, and a path under an unmapped source skill is a candidate for the report. When a table gains a row, add its source path here.

```sh
git -C <source> diff --name-status <recorded>..HEAD -- \
  .agents/skills \
  packages/preset/agent-preset/skills/dsh-doc/references/tool-design.md \
  AGENTS.md docs/AGENTS.md \
  .agents/notes/README.md .agents/notes/AGENTS.md .agents/notes/implemented/AGENTS.md .agents/notes/archived/AGENTS.md \
  docs/defensive-patterns/README.md docs/defensive-patterns/general.md \
  docs/testing.md benchmarks/AGENTS.md \
  docs/cookbook/responding-to-pr-review-on-a-stack.md \
  docs/cookbook/reviewing-ui-design.md docs/ui-design-review-cases.md
```

When the sync record has more than one row, run the command once per distinct recorded commit and keep, for each pair, only the output from its own row's commit.

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
| `dsh-doc-writing` | `docs-standard` | core |
| `dsh-create-upgrade-guide` | `upgrade-guide` | core |
| `dsh-client-ui-ux` | `ui-ux-review` | optional, `surfaces.ui` |
| `dsh-responsive-ui` | `responsive-ui` | optional, `surfaces.ui` |
| `record-browser-gif` | `record-browser-gif` | optional, `surfaces.ui` |
| `dsh-merging-stacked-prs` | `stacked-prs` | optional, `vcs.host == github` |

A source skill's `references/`, `templates/`, and `scripts/` directories are part of the pair. A new source reference file is a candidate kit reference file under the same skill; a source reference that was folded back into `SKILL.md` or split out of it is a restructure, which calls for a full read of the pair rather than a diff. A source `templates/` file the kit keeps goes under the kit skill's `references/` (`upgrade-guide/references/template.md` is the precedent), because a directory named `templates/` inside a skill is still copied verbatim and is not a kit template.

`agent-experience/SKILL.md` keeps only frontmatter and one link to `packages/preset/agent-preset/skills/dsh-doc/references/tool-design.md`, which holds its rules; compare the kit skill against that file. The rest of that shipped `dsh-doc` skill documents the source product and stays out. A source skill that is a git symlink shows mode `120000` in `git -C <source> ls-files -s .agents/skills`; compare against its target.

These source skills stay out, because they encode that project's product or process rather than a reusable workflow: `dsh-official-plugin-artwork` (plugin art), `dsh-translate-docs` (translation gate), `dsh-session-projection` (one subsystem's state model), `dsh-cua-macos-signing` (one product's signing setup), `dsh-pr-description` (one project's description format and AI-usage grading). A source skill that appears after this list was written is reported as a candidate with a one-line verdict; add one only when the request says so, and then as a new optional skill with its own `when`.

## Delegated documents

A source skill often hands a procedure to a document outside `.agents/skills/` with one link. The kit cannot link there, so the procedure is part of the skill for distillation purposes: read it, and port its generic steps into the kit skill body or a `references/` file.

List the candidates mechanically: `git -C <source> grep -ohE '\]\((\.\./)+[^)# ]+' -- .agents/skills/<dir>` prints every relative link; those that leave `.agents/skills/` are candidates. A link is a delegation when the skill tells the reader to follow, apply, or defer to the target, or names it as the home of a rule the skill applies. A link that supplies rationale (an Agent Note, a design record) or a project-specific example (a package README, a vendor source file) is a citation: drop the link, and keep its one-sentence reason inline when the rule needs one.

| Source skill | Delegates to | Kit home |
|---|---|---|
| `dsh-merging-stacked-prs` | `docs/cookbook/responding-to-pr-review-on-a-stack.md` | `stacked-prs`, "Respond to review across the stack" |
| `dsh-client-ui-ux`, `dsh-responsive-ui` | `docs/cookbook/reviewing-ui-design.md`, `docs/ui-design-review-cases.md` | `ui-ux-review`, `references/review-workflow.md` and `references/review-cases.md` |
| `dsh-pre-push-checks`, `dsh-code-review` | the root `AGENTS.md` sections they link | `pre-push-checks`, `code-review`, and `templates/AGENTS.md.tmpl` |
| `dsh-code-review`, `dsh-find-simplifications`, `dsh-ci-test-reliability`, `dsh-speed-up-perf` | `docs/defensive-patterns/README.md`, `docs/defensive-patterns/general.md` | `templates/defensive-patterns/`; the source's surface-specific pattern files stay out unless the request names them |
| `dsh-archive-agent-notes` | `.agents/notes/README.md` and the `AGENTS.md` files under it | `agent-notes` and `templates/agent-notes/` |
| `dsh-doc-writing` | `docs/AGENTS.md` | `docs-standard` and `templates/docs-AGENTS.md` |
| `agent-experience` | `packages/preset/agent-preset/skills/dsh-doc/references/tool-design.md` | `agent-experience` |
| `dsh-code-review`, `dsh-ci-test-reliability`, `dsh-find-simplifications`, `dsh-speed-up-perf` | `docs/testing.md` | `code-review` ("Mocks and coverage", test strength) and `test-reliability`; its project-specific suites, launchers, and key policy stay out |
| `dsh-speed-up-perf` | `benchmarks/AGENTS.md` | `perf-evidence`, lane rules |

Add a row when a synced skill gains a new delegation. Diff these documents in an incremental sync together with the skill.

Governance templates, when the request names them or a synced skill depends on them:

| Source | Kit |
|---|---|
| `.agents/notes/README.md` and the `AGENTS.md` files under it | `templates/agent-notes/` |
| `docs/defensive-patterns/README.md`, `docs/defensive-patterns/general.md` | `templates/defensive-patterns/` |
| `docs/AGENTS.md` | `templates/docs-AGENTS.md` |
| The standing working agreement in the source `AGENTS.md` | `templates/AGENTS.md.tmpl` |

`vibe-harness-bootstrap` has no source skill. Leave it unless the request is about the installer or `BOOTSTRAP.md`.

## What to carry over

Read the source skill and the kit skill in full, including `references/`, `templates/`, and `scripts/`. Treat the kit file as the current text. Port a source change only when the rule still holds for a repository that is not the source project.

For each source hunk, do one of these:

- **Port.** The rule is about agent behavior, review, tests, prose, failures, or lifecycle, and it does not name the source project's packages, commands, or services. Rewrite it in the kit's words.
- **Generalize.** The rule is real, but its command, path, host, or product surface is specific. Point it at a profile key or a canonical path from the tables below.
- **Drop.** The rule exists only because of that repository: a package name, a script name, a plugin API, a reviewer roster, a snapshot tree, or a release ritual. Say what was dropped and why.

When the kit and the source both changed the same passage, keep the kit's generalization and add only the new source rule.

### What survives condensing

The first distillation lost rules by compressing paragraphs into one sentence each. When you shorten a source passage, keep:

- the rule, the condition a reviewer judges it by, its boundary or exception, and the failure it prevents;
- the one-sentence reason after an example when that sentence states the criterion (for example "deleting the future marker alone turns an illustration into a claim that the class ships");
- numbers, flags, step order, and the recovery step for when a check fails;
- the stricter of two formulations (a mandatory procedure does not become "guidance").

What is safe to drop: project nouns, a second example of the same rule, a synonym, and links to source-only documents. A kit file shorter than its source by much more than the project-specific material is a prompt to re-read the pair, not evidence of loss by itself.

A source rule that the kit generalizes into "the project's rules decide" must have somewhere to be decided: either `templates/AGENTS.md.tmpl` or `templates/project-profile.md.tmpl` carries a default, or the skill states the default itself.

## Replacements

Commands become profile keys defined in `templates/project-profile.md.tmpl`. Write "the profile's `commands.focused-test`", not a package-manager script. The keys are `commands.install`, `commands.focused-test`, `commands.full-test`, `commands.coverage`, `commands.typecheck`, `commands.lint`, `commands.format`, `commands.build`, `commands.docs-check`, `commands.e2e`, `commands.bench`, `commands.change-scope`, `vcs.host`, `vcs.default-branch`, `vcs.pr-cli`, `surfaces.ui`, `surfaces.localized-ui`, `surfaces.bilingual-docs`, and `surfaces.public-api`.

Use an existing key when it covers the fact, and check the key's default and description in the template before leaning on it: `commands.change-scope` lists committed paths only, so a skill that needs worktree paths says how to add them. Add a key only when no existing key can say it. A new key goes in the profile template with `TODO(profile)` or a documented default, in the template's Keys section, and in the report. Upgrades never rewrite `.agents/project-profile.md`, so the report must tell the user that existing installations add the key by hand.

Paths that stay fixed: `.agents/skills/`, `.agents/notes/`, `.agents/project-profile.md`, `docs/defensive-patterns/`, `docs/AGENTS.md`, `docs/upgrade-guide/`, `.agent-scratch/`. Scratch files, recordings, and other agent debris go under `.agent-scratch/`.

Skill bodies stay English. A source example that only works in one natural language can stay when the skill is about that language's wording.

## Cross-reference integrity

`npm run check` verifies that links resolve, not that they land on the rule they cite. After editing, check by hand, for every file you touched:

- A sentence about a profile key agrees with that key's default and description in `templates/project-profile.md.tmpl`.
- A link to a template section lands on text that states the cited rule. If the rule is missing there, the template change is in scope for this sync; say so in the report.
- A skill's `description` promises only workflows its body contains.
- "The project's `AGENTS.md` owns X" is backed by `templates/AGENTS.md.tmpl` stating a default for X, or the skill says "when the project rules permit".
- Two rules in one skill, or in a skill and the template it cites, do not contradict (for example "never verify links out of an archived note" against "confirm every changed link resolves").
- A core skill that routes to other skills (`code-review`, `pre-push-checks`) routes to every kit skill the source routes to through its own skill names.

## Audit procedure

For a full audit, compare each pair file by file and classify every source rule, section, and example:

- **Present**: the kit carries it, possibly reworded. Count these; do not list them.
- **Missing, portable**: a generic rule absent from the kit.
- **Missing, generalizable**: a real rule with a project-specific command or path; name the profile key or fixed path that replaces it.
- **Correctly dropped**: meaningful only in the source project; list with a one-line reason.
- **Kit drift**: kit text that contradicts or misstates the source rule, or a kit cross-reference that fails [the integrity checks](#cross-reference-integrity).

Pairs may be delegated to read-only subagents, one group of pairs each, with this classification and the instruction to quote the source line range for every finding. Verify every high-confidence finding yourself against both files before editing; a subagent's report is a lead, not evidence.

Present the result in three tiers and let the user choose the scope before editing:

1. Broken references and contradictions inside the kit.
2. Lost rules that carry a decision criterion, a measurement rule, a recovery step, or a whole delegated procedure.
3. Wording: dropped half-sentences of rationale and weakened modals.

## Kit constraints

`npm run check` enforces these. Write the skill so the check passes:

- `skills/<name>/SKILL.md` frontmatter `name` equals `<name>`. `name` is at most 64 characters of lowercase letters, digits, and single hyphens. `description` is at most 1024 characters and says when to use the skill.
- Skills and templates contain none of these names: `dsh`, `deepseek`, `cordis`, `SessionEventMap`. After editing, grep the diff for them and for the source project's package-manager and test-runner names.
- Skills contain no `{{PLACEHOLDER}}`. Templates use only `{{PROJECT_NAME}}` unless `manifest.json` `variables` lists more.
- A relative Markdown link resolves from the installed path. A kit file `skills/code-review/SKILL.md` is installed at `.agents/skills/code-review/SKILL.md`, so a link to a sibling skill is `../<skill>/SKILL.md`.
- A core skill and any template name an optional skill in backticks. They do not link to it. Optional skills may link to each other. `stacked-prs` may link `pre-push-checks` because that skill is core.
- A profile key written as `commands.<key>`, `vcs.<key>`, or `surfaces.<key>` exists in the profile template.
- Text files use LF, end with exactly one newline, and have no trailing whitespace.
- A new skill is a directory listed in `manifest.json`. An optional skill has a `when` condition whose first key exists in the profile template. Add a row to the skill tables in `README.md` and `README.zh.md`.
- A new template is a `templates` entry in `manifest.json` with mode `managed`, `seed`, or `block`, and `scripts/vh.mjs` already implements that mode. Extending the installer is a separate change; stop and report it.
- Generic helper scripts, such as `record-browser-gif/scripts/encode_gif.py` and its test, are copied when their behavior is still generic. Point the test at the script beside it. Compare scripts with `git diff --no-index`.

`npm run check` resolves links in `README.md`, `README.zh.md`, `BOOTSTRAP.md`, and `CHANGELOG.md` only; links in `DISTILL.md` and `UPDATE.md` are checked by hand. The text-hygiene rules apply to every file, including this one.

## Verify and report

Run `npm run check`, `npm test`, and `git diff --check` in the vibe-harness checkout. Fix failures that the edit caused. One skipped test (directory symlinks) is expected on Windows. When a sync changes a helper script or its test, also run that test the way `.github/workflows/check.yml` does; for the GIF encoder that is `python3 -m unittest discover -s skills/record-browser-gif/scripts -p 'test_*.py'`, which needs `ffmpeg` on `PATH`.

Do not commit, push, tag, or bump `version` unless the request says so.

Report, for each skill:

- source path and kit path, and the source commit compared;
- rules ported, rules generalized (with the profile key or path used), and rules dropped;
- delegated documents read, and source skills or reference files that are new since the sync record and not yet mapped;
- profile keys added, and that existing installations must add them by hand;
- template changes the sync required, with the template's mode (`managed` templates are rewritten on upgrade; `seed` templates are not, so installations apply those by hand);
- commands run and their results.

Then update the [sync record](#sync-record).

## Release

Only when the request says to release. Installed repositories can receive only committed, tagged kit text: the installer records the kit's `HEAD` as the merge base for the next upgrade, so uncommitted or untagged kit edits break later merges (the precondition in [UPDATE.md](UPDATE.md#preconditions)). Before the first commit, run `git fetch origin --tags` and confirm `git status --short --branch` shows `main` level with `origin/main` and no unrelated changes. Follow this order:

1. Content commits first, one per distilled topic, in the imperative mood naming the rule ("Publish browser GIFs only with gh --attach and split oversized ones"), with a body that names the source and what was dropped. The sync-record update rides in the content commit.
2. The release commit, "Release vibe-harness X.Y.Z", contains only `CHANGELOG.md`, `manifest.json`, and `package.json`. Bump `version` in both JSON files together. Unless the request names the version, bump the patch number for skill and template text changes, and the minor number when a skill is added or removed, a profile key is added, or `scripts/vh.mjs` changes behavior.
3. The `CHANGELOG.md` entry has four parts: skills, one line each, with optional skills marked `(optional)`; managed templates, which upgrades rewrite; seed templates, stating what changed or that nothing did and whether installations must edit by hand; and profile keys added. `npm run check` fails without a `## X.Y.Z` heading for the manifest version.
4. Run `npm run check`, `npm test`, and `git diff --check` after the version bump, before committing.
5. Tag with an annotated tag, `git tag -a vX.Y.Z -m "vibe-harness X.Y.Z"`, push `main`, then push the tag.
6. Watch the push's CI runs to completion (`gh run list`, `gh run watch <id> --exit-status`) and report their conclusion. The release is not done while a run is in progress.

## Sync record

The source commit up to which each kit file is reconciled: every source change up to that commit has been ported, generalized, or deliberately dropped. A sync diffs from this commit and moves the row to the source `HEAD` it compared. An auto sync and a full audit cover every pair, so each ends with one row at that `HEAD`; a named sync gives the synced skills their own rows and leaves the others where they were. The diff starts from the commit, never from the date, because a later merge can carry older commits; the Date column is for orientation.

| Kit path | Source commit | Date | Mode |
|---|---|---|---|
| all mapped skills and templates | `e8f7b93a34` | 2026-11-13 | auto sync |
