---
name: self-review
description: Use when the profile's `vcs.review-flow` is `trunk`, meaning changes land on the default branch without pull-request review, and a task has changed files. Apply it before reporting the change complete, before committing or pushing it, and whenever another skill or the working agreement names a pull-request step the project does not have. Covers the reviewed range, review depth by risk, the fix loop and its stopping rule, the completion report, and the landing checks that stand in for a merge gate.
---

# Self-review on a trunk flow

A pull request gives a change a fixed range to review, a reviewer who did not write it, a loop of findings and fixes, a merge gate, and a record. When the profile's `vcs.review-flow` is `trunk`, the author supplies each of these, and this skill says how. [code-review](../code-review/SKILL.md) owns what a review checks and [pre-push-checks](../pre-push-checks/SKILL.md) owns which evidence to run; this skill owns when the review happens, how deep it goes, when it stops, and where its results are recorded.

A change that does go through a pull request follows the pull-request steps as the other skills write them.

## Fix the reviewed range

1. When a task starts, record `git rev-parse HEAD` as the task base and run `git status --short`. Paths already modified or untracked then belong to earlier work and stay out of the range. When the task has to edit one of them, its diff mixes both changes; name that path in the report.
2. The reviewed range is everything the task changed: commits after the task base plus the worktree. List it with `git diff --name-status <task-base>` and `git status --short`, read it with `git diff <task-base>`, and read each untracked file whole, because `git diff` omits untracked files.
3. Without a recorded task base (a resumed session, or a review requested afterwards), fetch the remote default branch and review what it lacks: the profile's `commands.change-scope` against that branch, plus the worktree.

This range stands in for the base and head that `code-review` and `pre-push-checks` ask for.

## Choose the depth

Review at the highest tier that any path in the range reaches.

| Tier | The change | Review |
|---|---|---|
| Light | Copy, comments, documentation, or formatting; no behavior changes | Read the diff once against the rules that own it. No findings list is needed. |
| Standard | Behavior changes that the independent tier does not name | A full `code-review` pass by the author, started after the implementation and its checks are finished |
| Independent | Persisted data or a migration; authentication, authorization, or secrets; an external contract when the profile enables `surfaces.public-api`; lifecycle, concurrency, or teardown; an irreversible operation; or behavior the author could not exercise | The standard pass, then a reviewer that did not write the change |

### The standard pass

Authors miss the same things in their own work, so check these three before the `code-review` checks:

- **The request, not the implementation, is the requirement.** Reread the user's words. Confirm each requested behavior is present and that nothing unrequested was added.
- **Paths the implementation never ran.** For every changed interface, state, and handler, name the branch, mode, or consumer that the implementation's checks did not exercise (the abandoned operation, the other layout, the second caller) and read that path.
- **Claims in the planned report.** Each statement that something works, passes, or persists maps to a command that ran after the last edit.

### The independent reviewer

When the host can start a subagent or a second session, give it the requirement, the reviewed range, and `code-review`; withhold the author's reasoning and summary, because a reviewer that reads the author's argument tends to accept the same assumptions. Prefer a different model when the host offers one. Verify each finding against the code before acting on it: a reviewer's report is a lead, not evidence.

When the host offers no second context, the independent review has not run. Say so in the report and name the paths that needed it, so the user can review them or arrange a reviewer.

## Fix, then stop

- **Blockers are fixed before the report:** wrong or missing required behavior, a lifecycle or security defect, a violated rule in `AGENTS.md`, the defensive patterns, or an owning Agent Note, and a behavior change with no test that fails on its regression.
- **Simplifications inside the range are applied now:** state, options, or abstractions the requirement does not need, and duplication the change introduced.
- **Improvements outside the range are listed, not made.** Independent changes stay split; [find-simplifications](../find-simplifications/SKILL.md) owns a wider survey as its own task.
- **A finding left unfixed is reported with its reason,** never dropped.

After the fixes, rerun the evidence they invalidated, selected as `pre-push-checks` describes, and review the fix diff once. Run a second full pass only when the fixes changed the design: a different owner, interface, or data representation. Passes repeated until nothing is found spend the user's time on nits.

## Report

The completion report stands in for the pull-request description and the review thread. It states:

- what the change does, in the requester's terms;
- the review tier, and for the independent tier who reviewed or that the review did not run;
- findings fixed (defect and fix), findings left with their reasons, and out-of-range improvements;
- the commands run after the last edit with their results, and any required check that did not run;
- whether the change is committed and pushed.

Findings belong in the report. Comments, documentation, and Agent Notes state the resulting contract or decision, not the review that produced it.

## Where pull-request steps go

Other skills and the working agreement are written for both flows. On a trunk flow, read their pull-request steps as follows:

| A rule or skill says | On a trunk flow |
|---|---|
| State why in the pull request (a deliberate behavior or test change, a raised documentation budget) | The commit message body |
| Verify and fetch the pull-request base | The [reviewed range](#fix-the-reviewed-range); before a push, the fetched remote default branch |
| Place findings inline or reply in the review thread | The [completion report](#report) |
| Open a draft pull request, mark it ready, or inspect its checks | No draft exists: report unfinished work as unfinished. Checks run after the push; see [Land the change](#land-the-change) |
| Attach a screenshot, recording, or GIF to the pull request | Keep the file under `.agent-scratch/` and give its path in the report; never commit media |
| Request a named reviewer or approver | Ask the user to arrange it and report the review as pending |

## Land the change

A push to the default branch is the merge, and CI reports after it instead of before it. The project rules and the request decide when to commit and push; when they do:

1. Finish the self-review for every commit being pushed.
2. Select evidence with `pre-push-checks`, taking the commits the fetched remote default branch lacks as the outgoing range, and run any command the project rules require before a push.
3. After the push, watch the CI run for the pushed commit to completion and report its conclusion; report a pending run as pending. For example, when `vcs.pr-cli` is `gh`: `gh run list --commit <sha>`, then `gh run watch <run-id> --exit-status`.
4. A failed run on the default branch comes before other work. Fix forward when the cause is known and small; otherwise revert with a new commit. Do not repair it by rewriting commits the remote default branch already has: other clones, tags, and deployed revisions point at them.

When the profile's "Hooks and CI" section names no CI, local evidence is the only gate; say so in the report.
