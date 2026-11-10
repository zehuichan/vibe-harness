---
name: pre-push-checks
description: Use before pushing, force-pushing, marking a pull request ready for review, or claiming checks pass, and immediately after a tool that rewrites and publishes in one step (such as a stacked-pull-request sync) has pushed rewritten branches, to select the smallest tests and checks that cover the outgoing diff without reflexively running the full repository suite, and to push history rewrites safely.
---

# Pre-push checks

Run relevant local evidence once before a push. The sole ordering exception is a tool that rewrites and publishes in one step, such as a native stacked-pull-request sync: validate immediately afterward (see "Validate after a combined rewrite and publish") and do not merge until the evidence passes. CI owns exhaustive coverage and the platform matrix; local work owns the narrow evidence that would fail for this change's regression. Commands come from the project profile (`.agents/project-profile.md`); the profile's "Evidence by surface" table maps change types to evidence. Selecting checks takes judgment; the merge bar, the exact lease, and stopping on a failed check do not.

## Inspect the outgoing change

1. Confirm the checkout and branch: `git status --short --branch` and `git rev-parse --show-toplevel`.
2. Verify the live pull-request base (or stack parent), fetch that ref, and list the committed scope against it with the profile's `commands.change-scope`. Never guess a base. Unless that command already reports the worktree, add `git status --short` for staged, unstaged, and untracked paths. To inspect a commit other than `HEAD`, use `git diff --name-status <base>...<head>`.
3. After merging a changed base, rerun the scope listing, reassess which behavior the combined scope can affect, and rerun only the checks the merge invalidated.

## Select relevant evidence

There is no universal local baseline beyond the project's git hooks; read the profile's "Hooks and CI" section to learn what they already run. Every behavior change needs the narrowest available test or purpose-built check that would fail for its regression; add broader checks only for surfaces the diff actually reaches.

When the change adds or alters a resource-owning or asynchronous test, fixture, helper, or CI execution path, use [test-reliability](../test-reliability/SKILL.md) first to decide whether restoration, negative-control, quiescent-teardown, or concurrent-process evidence applies. This skill still selects the commands and avoids repeating evidence that already passed.

- **Source behavior:** run `commands.focused-test` on the owning test file or test name. Add adjacent tests when a shared contract changes; leave repository-wide coverage to CI unless the change is genuinely cross-cutting or the user asks.
- **Types and public exports:** run `commands.typecheck`, and confirm it covers test and script files as well as shipped sources: a check scoped to package sources alone does not prove their types. If it does not, run the project's check that does before claiming completion. When the check reads generated or prebuilt declarations, rebuild missing, stale, or partial output first; a check run against stale output is not evidence. Loose typing in a test double is not type evidence; keep that loosening in the test helper, never in production types or global compiler flags. For manifests, exports, build configuration, or entry points, also run `commands.build` and a smoke run of the built artifact.
- **Documentation, Agent Notes, catalogs, or doc-linked comments:** run `commands.docs-check` and `git diff --check`; also run `commands.lint` when the documentation workflow requires it.
- **User-visible UI:** when the profile enables `surfaces.ui`, use the `ui-ux-review` skill's UI change workflow and its minimum checks to verify required inspection and new cumulative effects. Disclose missing checks; optional paperwork is not a substitute for inspecting the result. Reuse valid evidence; ordinary changes need no separate full-audit report at push time. Keep the project's test, GIF evidence, and design or product review requirements. Tests alone do not establish visual acceptance.
- **Model-, user-, CLI-, or terminal-visible output:** run the focused snapshot or end-to-end scenario that owns the output, as named in the profile.
- **Real provider or external-service behavior:** run `commands.e2e` for the relevant target when credentials are available; never print secrets.

Do not repeat a passing check merely because a commit or push follows, and do not duplicate what a git hook already runs.

When filtering tests, check the reported selected-test count before treating a filtered run as focused evidence: argument forwarding through package-manager scripts differs between tools, and a filter that silently matches nothing proves nothing.

### Focus coverage on the affected source

Test selection and coverage selection are separate. When coverage is relevant, name both the owning tests and the source files whose coverage they must prove, using the runner's coverage-include option. Include an exact source file when the behavior is confined to one module, and pass every owning test needed to exercise the included scope; the configured thresholds still apply inside it.

When the owning tests are unclear, use the runner's dependency-graph discovery (for example a "related tests" mode) to find candidates, then inspect the selection before treating the run as evidence. Discovery cannot find behavior reached only through configuration, dynamic loading, subprocesses, workers, built artifacts, or external providers; select those tests explicitly.

Do not pass "no tests is a pass" flags, lower thresholds, or narrow the coverage scope merely to hide an uncovered affected file. If an included scope fails because one focused test does not cover it, add its other owning tests, or narrow the scope only when the excluded modules cannot be affected by the change.

## Full local rehearsal

Run the complete local approximation of CI only when the user explicitly asks, while diagnosing a CI failure, or when the change spans the repository so broadly that no narrower set is credible. Take its inventory from the current CI workflow definitions (see the profile's "Hooks and CI"), usually `commands.full-test`, `commands.coverage`, `commands.lint`, and `commands.build`, not from a remembered or aggregate command.

## Protect history-rewriting pushes

Rebasing a branch, including after review, is allowed when the project rules permit it. Before a history rewrite, fetch the remote branch and record its exact commit; publish with `git push --force-with-lease=<branch>:<observed-commit>` so a concurrent update aborts the push. Raw `--force` is never allowed.

After any rewritten push, fetch the live heads again and re-audit unresolved review threads, approvals, mergeability, and checks. Commit hashes and inline-comment anchors from before the rewrite are not current evidence. For native stacked pull requests, use the `stacked-prs` skill when it is installed.

### Validate after a combined rewrite and publish

A native stacked-pull-request sync fetches, cascade-rebases, and pushes as one operation, so local validation cannot sit between the rewrite and its publication. A stack tool that supplies its own lease protection satisfies the lease rule above for the branches it manages. Before running one, require a clean worktree and record the stack order and the exact remote heads. After it returns:

1. Re-query every branch head and the live stack order.
2. Inspect the changed scope of every rewritten branch against its live pull-request base.
3. Run the relevant evidence selected by this skill for each affected branch.
4. Keep every pull request unmerged and report validation as pending until all selected checks pass.

If post-sync evidence fails, leave the lease-protected published heads in place, repair the failure, validate the repair, and publish the correction. Do not claim the sync made the stack ready merely because the command succeeded.

## Handle failures

If a relevant check fails, stop and fix or explain the blocker. Do not push and hope CI differs. After a combined rewrite and publish, block the merge and follow the repair procedure above instead. If a failure looks environment-specific, prove it: record the exact command, failing test, and platform-specific mismatch; confirm the relevant non-platform evidence; prefer fixing cross-platform nondeterminism. Bypass a local hook only when the user explicitly agrees, and report exactly what failed and why CI is expected to differ.

## Push procedure

1. Run the selected relevant checks once.
2. Commit normally and inspect any files changed by a pre-commit fixer before continuing.
3. Push normally, or with the exact lease for an authorized rewrite, so the pre-push hook runs.
4. Verify the remote ref matches local `HEAD`: `git rev-parse HEAD origin/$(git branch --show-current)`.

For a combined rewrite and publish, use the post-sync validation sequence instead of this order.

For a hosted pull request, inspect remote CI after the push (for example `gh pr checks` when `vcs.pr-cli` is `gh`). Report pending checks as pending, and inspect failures before attributing them to the branch or the environment.

When a GitHub pull request reports no checks at all and the Actions API lists no workflow runs for its head commit (`/actions/runs?head_sha=<sha>` returns `total_count: 0`), read its mergeability (`gh pr view <number> --json mergeable,mergeStateStatus`) before suspecting the push or a dropped event: GitHub creates no pull-request workflow runs while a pull request is `CONFLICTING` or `DIRTY`, so the absent signal is the conflict, not infrastructure. Resolving the conflict is the only fix; empty commits, `--allow-empty` pushes, draft and ready toggles, and revert-and-restore pushes leave the runs absent and add junk history. When the branch cannot be merged locally yet, list the conflicting paths with `git merge-tree --write-tree HEAD origin/<base>`.
