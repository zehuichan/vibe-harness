---
name: pre-push-checks
description: Use before pushing, force-pushing, marking a pull request ready for review, or claiming checks pass, to select the smallest tests and checks that cover the outgoing diff without reflexively running the full repository suite, and to push history rewrites safely.
---

# Pre-push checks

Run relevant local evidence once before a push. The sole ordering exception is a tool that rewrites and publishes in one step, such as a native stacked-pull-request sync: validate immediately afterward (see "Validate after a combined rewrite and publish") and do not merge until the evidence passes. CI owns exhaustive coverage and the platform matrix; local work owns the narrow evidence that would fail for this change's regression. Commands come from the project profile (`.agents/project-profile.md`); the profile's "Evidence by surface" table maps change types to evidence. This is guidance, not a script.

## Inspect the outgoing change

1. Confirm the checkout and branch: `git status --short --branch` and `git rev-parse --show-toplevel`.
2. Verify the live pull-request base (or stack parent), fetch that ref, and list the complete scope against it with the profile's `commands.change-scope`. Never guess a base. Include staged, unstaged, and untracked paths as well as committed ones.
3. After merging a changed base, rerun the scope listing, reassess which behavior the combined scope can affect, and rerun only the checks the merge invalidated.

## Select relevant evidence

There is no universal local baseline beyond the project's git hooks. Every behavior change needs the narrowest available test or purpose-built check that would fail for its regression; add broader checks only for surfaces the diff actually reaches.

When the change adds or alters a resource-owning or asynchronous test, fixture, or CI path, use [test-reliability](../test-reliability/SKILL.md) first to decide whether restoration, negative-control, quiescent-teardown, or concurrent-process evidence applies.

- **Source behavior:** run `commands.focused-test` on the owning test file or test name. Add adjacent tests when a shared contract changes; leave repository-wide coverage to CI unless the change is genuinely cross-cutting or the user asks.
- **Types and public exports:** run `commands.typecheck`, and confirm it covers test and script files as well as shipped sources: a check scoped to package sources alone does not prove their types. If it does not, run the project's check that does before claiming completion. For manifests, exports, build configuration, or entry points, also run `commands.build` and a smoke run of the built artifact.
- **Documentation, Agent Notes, or doc-linked comments:** run `commands.docs-check` and `git diff --check`.
- **Model-, user-, CLI-, or terminal-visible output:** run the focused snapshot or end-to-end scenario that owns the output, as named in the profile.
- **Real provider or external-service behavior:** run `commands.e2e` for the relevant target when credentials are available; never print secrets.

Do not repeat a passing check merely because a commit or push follows, and do not duplicate what a git hook already runs.

When filtering tests, check the reported selected-test count before treating a filtered run as focused evidence: argument forwarding through package-manager scripts differs between tools, and a filter that silently matches nothing proves nothing.

### Focus coverage on the affected source

Test selection and coverage selection are separate. When coverage is relevant, name both the owning tests and the source files whose coverage they must prove, using the runner's coverage-include option. Do not pass "no tests is a pass" flags, lower thresholds, or narrow the coverage scope merely to hide an uncovered affected file. Dependency-graph test discovery cannot find behavior reached only through configuration, dynamic loading, subprocesses, workers, built artifacts, or external providers; select those tests explicitly.

## Full local rehearsal

Run the complete local approximation of CI (`commands.full-test`, `commands.coverage`, `commands.lint`, `commands.build`) only when the user explicitly asks, while diagnosing a CI failure, or when the change spans the repository so broadly that no narrower set is credible.

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

When a GitHub pull request reports no checks at all, read its mergeability (`gh pr view <number> --json mergeable,mergeStateStatus`) before suspecting the push: GitHub creates no pull-request workflow runs while a pull request is conflicting. Resolving the conflict is the only fix; empty commits, draft toggles, and revert-and-restore pushes leave the runs absent and add junk history.
