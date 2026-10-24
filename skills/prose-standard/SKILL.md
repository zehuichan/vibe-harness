---
name: prose-standard
description: Use when writing, reviewing, restoring, trimming, or auditing prose in the repository, including deciding where documentation or comments are required across Markdown, API docs, code and test comments, prompts, tool descriptions, diagnostics, and CLI or UI strings.
---

# Prose standard

Write enough to preserve the contract, then remove reasoning transcripts, repetition, and decoration. A contract is an obligation, invariant, precondition, postcondition, or compatibility promise that a caller, callee, implementer, producer, or consumer relies on. This skill owns editorial judgment and required prose coverage; use [docs-standard](../docs-standard/SKILL.md) for placement and documentation checks, and [trim-cot-leakage](../trim-cot-leakage/SKILL.md) for hunting reasoning-transcript leakage. It is guidance, not a script.

Treat `contract`, `boundary`, `shape`, `surface`, `seam`, `gate`, and `vocabulary` as words to check before use, not banned words. First ask whether the exact rule, API, field set, type, validation, timing point, or failure states the fact better: write "response fields" or "JSON validation" instead of "response shape" or "validation boundary". Keep a term when it names the exact technical subject, such as a caller/callee contract or a process or security boundary.

Comments describe non-obvious contracts or rationale that code cannot express; they do not restate what code already implies.

## Inputs and exclusions

Require an explicit `scope`. If it is missing, report the required input and stop; do not infer a repository-wide scope.

Accept `mode: automatic | interactive`, default `automatic`. Enter interactive mode only when the user explicitly asks for questions or calibration. `mode` controls questions, not write authority: review and audit tasks report findings without editing; explicitly requested write, fix, or trim tasks apply clear changes.

Exclude vendored and third-party code from discovery, review, and edits, even when the scope is the whole repository; put exclusion globs after inclusion globs so a later include cannot re-admit them. Exclude archived Agent Notes (`.agents/notes/archived/`): inspect an exact archived target only to understand a historical citation, never to modernize it.

Treat generated catalogs, snapshots, and fixtures as derivatives. Trace every consumer before editing: source API docs may also feed a generated, model-visible catalog. Edit the owning source or scenario first, then regenerate every derivative. When the project keeps bilingual documentation, update the counterpart minimally in the same change.

## Preserve the complete proposition

Before editing, identify every proposition in the passage. Preserve each relevant:

- actor and action;
- condition, timing, and ordering;
- modality such as must, may, or never;
- negative guarantee and exception;
- ownership, side effect, failure mode, and consequence.

Remove adjectives, repetition, and narration only when every factual clause survives and the result is clearer. A smaller word count alone is not an improvement.

Keep a complete local contract at the point of use: the behavior, failure, ownership, and consequence a caller or maintainer needs there. Link to the owning document for architecture, rationale, algorithms, history, or extended examples. One explanation has one home; essential contract facts may repeat locally.

Keep non-obvious rationale when omitting it could plausibly cause misuse or an incorrect simplification. Otherwise state the consequence and link the rationale.

## Required coverage by prose location

This is not a one-way shortening pass. Add or restore prose when code, types, and structure do not communicate a required contract below; do not add a comment when those facts are already obvious locally.

- **Public API docs:** caller-visible return distinctions, throws or rejections, side effects, ownership, timing, cancellation, and durability.
- **Internal comments:** orient non-local structure and obviously complicated local structure, including invariants, race ordering, ownership, security boundaries, and surprising failure behavior. Delete control-flow narration and code restatement.
- **Module comments:** the module's role, dependencies, responsibilities, and non-obvious architecture choices, linked to their owning explanation.
- **Tests:** only non-obvious test design: why a fixture, assertion, platform accommodation, real entry path, or indirect observation is necessary. Delete walkthroughs and inventories.
- **Cookbooks:** prerequisites, required actions, the real entry path, observable verification, and concise warnings.
- **READMEs:** the consumer contract: configuration, semantics, failures, limitations, extension points, and model-visible effects. Keep durable gaps and maintainer traps, not cleanup inventories.
- **Agent Notes:** unique rationale, mechanisms, alternatives, consequences, shipped verification evidence, and named coverage gaps. Implemented notes state shipped reality in the present tense.
- **Postmortems:** the incident sequence, evidence, causal chain, impact, and prevention.
- **Skills and agent instructions:** behavioral guardrails and explicit scope limitations such as "guidance, not a checklist". Keep the workflow concise and link its source of truth.
- **Examples and configuration comments:** access limits, non-obvious wiring or load order, security stance, exceptions, and likely misuse. Do not narrate entries the configuration already shows.
- **Prompts and visible strings:** wording is behavior. When the profile enables `surfaces.localized-ui`, user-visible copy goes through the locale mechanism; inspect text, accessibility names, tooltips, placeholders, and format templates together. English UI copy uses sentence case unless the project's design rules say otherwise: capitalize only the first word, proper nouns, and product names (`Git worktrees`, not `Git Worktrees`); copy in other languages keeps that language's conventions. Update the owning test or snapshot for model-visible text. If no owning test exists in the authorized scope, leave the wording unchanged and report the deferral.
- **Diagnostics:** the failing subject or path, the violated rule, and the correction when it is not obvious. Remove internal execution narration.

Preserve searchable mechanism names and meaningful modal, temporal, or negative emphasis. Normalize decorative emphasis only.

## Workflow

1. Confirm the scope, mode, current branch or pull request base, and applicable `AGENTS.md` files.
2. Read the documentation standard (`docs/AGENTS.md`) and the owning code or document before judging a passage. For calibration or unfamiliar cases, read [the distilled examples](references/examples.md).
3. Inspect the requested scope, not only the largest files. Use searches and word counts to find candidates, then judge passages semantically.
4. Classify each candidate as keep, add, trim, restore, restructure, or defer. Apply clear changes only when the task authorizes edits; do not manufacture edits to meet a deletion target.
5. Update the owner before derivative artifacts. Re-check analogous passages after learning a new rule.
6. Run the profile's `commands.docs-check`, `git diff --check`, and behavior tests for visible strings. Verify the final diff touches no excluded path.
7. Report the inspected scope, clear changes, deliberate keeps, deferred cases, and checks actually run.

## Borderline decisions

A case is borderline only when at least two versions satisfy the complete-proposition rule but trade accepted principles, and this skill does not already resolve the trade-off. In automatic mode, apply clear edits when authorized and report genuine borderline cases without asking. Do not weaken a proposition to make progress.

In interactive mode, group analogous passages under the governing principle, present two or three viable versions, recommend one, and state the factual or structural difference. After the user decides, distill the principle and versions into [the examples](references/examples.md) without review narration, and apply the rule to every analogous passage in scope.
