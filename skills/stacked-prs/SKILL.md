---
name: stacked-prs
description: Use when landing a stack of dependent GitHub pull requests (A ← B ← C, each based on the one below) onto the default branch, merging a pull request whose base is another open pull request's branch, or whenever a request mentions "stacked PRs", "PR stack", "dependent PRs", or merging several related pull requests in sequence. Requires GitHub's official stacked-PR feature so GitHub owns stack-wide rules, CI, ordering, retargeting, and merge state.
---

# Landing an official GitHub pull-request stack

Land dependent pull requests through GitHub's native stack object and `gh stack merge`. Do not reproduce stack semantics by merging and retargeting individual pull requests with `gh pr merge` and `gh pr edit`. The project's `AGENTS.md` owns which histories (merge-forward or rebase) are allowed.

## Require native stack support

Run `gh stack --version` before changing GitHub state. Stop if the official extension or server-side stack feature is unavailable; do not fall back to merging and retargeting pull requests one at a time. Stacks require every head branch to live in the same repository, so stop on a cross-fork chain.

Use a clean dedicated worktree. Fetch current pull-request metadata and exact head commits rather than trusting branch names or an earlier report:

```sh
gh pr view <pr> --json number,author,baseRefName,baseRefOid,headRefName,headRefOid,isCrossRepository,state,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup
```

Query `PullRequest.stack` and `stackEntry.position` for at least one pull request in each apparent chain; this official object, not base-branch inference alone, is the stack-membership authority. Paginate `entries` when `size` exceeds the returned page:

```sh
gh api graphql -F owner=<owner> -F name=<repo> -F number=<pr> -f query='
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      author { login }
      baseRefName
      headRefName
      stackEntry { position }
      stack {
        number
        baseRefName
        size
        entries(first: 100) {
          nodes {
            position
            pullRequest { number author { login } baseRefName headRefName state isDraft }
          }
        }
      }
    }
  }
}'
```

Establish the expected bottom-to-top order from the live bases: the bottom targets the trunk, and each higher pull request targets the head branch immediately below it.

## Link missing stack members

Compare existing stack entries with the expected chain. One existing stack may contain an order-preserving subset of the chain; multiple stack numbers, an unexpected entry, or a conflicting order requires user direction before any change.

When a dependent pull request is not yet in the official stack:

1. Compare every `author.login` exactly.
2. If all authors match, link the chain in bottom-to-top order: `gh stack link --base <trunk> <bottom-pr> <next-pr> ... <top-pr>`.
3. If authors differ or any author is unavailable, ask the user before changing GitHub state.
4. Re-query and require one stack number, the expected trunk, the complete pull-request set, and the expected positions and base chain.

Never dissolve, reorder, or rebuild an existing stack automatically; `gh stack link` is additive, and merged or queued entries cannot be unstacked.

## Refresh only when needed

Do not rewrite branches merely because a refresh mechanism exists. When the live merge state or repository rules require an updated trunk, choose an allowed history:

- **Native cascading rebase:** check out the stack with `gh stack checkout <pr-or-stack>` when it is not tracked locally, then run `gh stack sync`. It may rebase and lease-protected force-push every active layer before local validation, so immediately inspect the rewritten scope, run the relevant checks for every affected layer (see [pre-push-checks](../pre-push-checks/SKILL.md)), and do not merge or claim readiness until they pass. On a rebase conflict, use `gh stack rebase`, resolve and validate, then publish with `gh stack push`. If local and remote stack compositions diverge, stop and ask.
- **Incremental merge-forward:** merge the trunk into the bottom affected branch, then propagate each updated parent into its child in bottom-to-top order and push normally. If the base advances during an in-progress merge, preserve that checkpoint before merging the newer tip.

A history rewrite invalidates commit-hash assumptions: re-fetch exact heads and re-audit unresolved review threads, approvals, mergeability, and checks after the push. Never use raw `--force`.

## Preflight the merge range

Re-query the stack immediately before merging. Require every selected pull request to be open, non-draft, in the expected order, and compliant with the repository's review and check requirements, each judged independently. "Land the stack" selects the whole stack; a partial landing requires an explicit boundary pull request and includes every layer from the bottom through that boundary.

## Merge through the stack API

```sh
gh stack merge <stack-number> --yes --merge   # whole stack
gh stack merge <boundary-pr> --yes --merge    # explicitly requested partial landing
```

Do not pass `--delete-branch`, retarget dependents manually, or issue per-pull-request merge commands. GitHub merges the selected range bottom-up and retargets any remaining layers. If the merge reports a blocker, resolve it through the owning pull request or stop and report it; never bypass requirements or fall back to `gh pr merge`.

## Verify the landed state

Wait until every selected pull request reports `MERGED`; a queued request is not a completed landing (`gh pr view <pr> --json number,state,mergedAt,mergeCommit`). For a partial landing, re-query the stack and verify the remaining pull requests are still linked in order, then re-check their heads, reviews, and CI.

Delete branches only in a separate final pass after their pull requests report `MERGED`, and only when `gh pr list --state open --base <branch> --json number --jq length` returns `0`.
