---
name: code-review
description: Use when reviewing a pull request or local change in this repository; orients the reviewer to the project's standards (AGENTS.md, project profile, defensive patterns, Agent Notes, documentation standard, executed checks) and the review checks that code alone cannot show.
---

# Reviewing a change

**This skill is guidance, not a complete checklist.** Verify and fetch the change's live base and exact head, then list the changed paths with the profile's `commands.change-scope` before reading the diff and enough surrounding code to understand the design. Re-establish the base after a retarget or merge. Prioritize correctness, lifecycle, security, and broken required behavior over style; a short review with one substantiated blocker is better than a list of nits.

**Read the requirements before judging the diff.** Map the changed paths to the sources below, open each owning page, and only then read the diff against those requirements. Judging a diff against memory of the rules is how a violation passes review.

## Sources of truth

- `AGENTS.md` at the root and in each touched subtree: standing orders.
- `.agents/project-profile.md`: commands, enabled surfaces, evidence per surface, and project-specific rules.
- `docs/defensive-patterns/`: rules enforced in review, one page per artifact family; read every page the diff touches.
- `docs/AGENTS.md` and [docs-standard](../docs-standard/SKILL.md): documentation placement and discipline.
- [prose-standard](../prose-standard/SKILL.md): required coverage and editorial judgment for comments, docs, prompts, and visible strings.
- [error-handling](../error-handling/SKILL.md): failure classification, ownership, containment, guarantees, and reports.
- [lifecycle-review](../lifecycle-review/SKILL.md): singleton state, unreversed effects, and cleanup ordering in plugins, services, and components.
- [test-reliability](../test-reliability/SKILL.md): isolation and regression proof for resource-owning, asynchronous, or flaky tests.
- `.agents/notes/`: design rationale. Treat disagreement with an Agent Note as a design discussion, not an automatic veto.
- When the profile enables `surfaces.ui`, the `ui-ux-review` and `responsive-ui` skills.

## Blocking requirements

1. **New prose receives semantic review.** Use prose-standard on every added or changed Markdown passage, API doc, comment, prompt, description, diagnostic, and visible string. Automated checks do not establish accuracy, placement, or coverage.
2. **Docs match the code.** Configuration, defaults, errors, wire fields, events, and public behavior update the owning README and API docs in the same diff. Flag implementation narration, test walkthroughs, review history, and duplicated rationale.
3. **Ownership and cleanup.** For plugin, service, or component code with a lifecycle, apply lifecycle-review to the changed behavior and affected consumers. Each new registration proves its disposal.
4. **Required evidence exists.** Verify that the author ran the relevant checks for the diff (see [pre-push-checks](../pre-push-checks/SKILL.md)) and that CI covers the rest; review the semantic gaps neither can detect.
5. **Localized UI copy.** When the profile enables `surfaces.localized-ui`, reject product text embedded in markup, templates, helper returns, accessibility attributes, or component defaults; require the locale mechanism and evidence in each affected locale. User, model, and wire data stay verbatim.
6. **Breaking changes are recorded.** When the profile enables `surfaces.public-api`, an externally perceptible break carries an upgrade guide in the same diff (see [upgrade-guide](../upgrade-guide/SKILL.md)).

## Manual checks

- **Intent and interface contracts:** trace both sides of every changed interface. Confirm the implementation matches the description and any Agent Note, including errors, cancellation, ownership, and disposal.
- **Error handling:** reject catch-and-continue unless the state owner establishes that later work's preconditions hold.
- **Lifecycle and concurrency:** for async setup, callbacks, processes, or teardown, check races before publication, cancellation during awaits, independent error reporting, callback containment, ownership before reentry, complete detach cleanup, and quiescent disposal.
- **Capability and consumer fit:** trace every current consumer, then flag consumer-specific behavior leaking into a shared interface. Flag the inverse too: a new public method on a generic service whose only caller is one internal consumer; prefer a private capability handed to that consumer at construction.
- **Scope, ownership, and necessity:** map each abstraction, state machine, option, defensive copy, and compatibility path to its current contract, production consumer, and owning module. Challenge unrelated features and speculative generality.
- **Configuration and public choices:** ask what current-consumer evidence or prior art supports each default, public operation set, format, or imported external concept. Require an explicit choice or deferral when that evidence is absent.
- **Model perspective:** when the project sends prompts, tool schemas, or results to a model, inspect the exact text the model receives. Flag concepts outside the model's task, and verify stable text verbatim and dynamic behavior through tests or snapshots.
- **Enforcement:** follow every denial path to the operation that executes it; exercise direct and alternate callers that can bypass schemas, prompts, facades, wrappers, or listener ordering.
- **Borrowed and derived state:** determine whether each retained value is borrowed or owned, then trace notifications and every cache, prompt, UI echo, replay, and query view to the documented success point and authoritative source.
- **Bounds cover the final operation:** locate the owner of the complete emitted or retained result, including wrappers and metadata. Probe tiny and exact limits, oversized single chunks, and multibyte text for byte limits.
- **Real entry path:** tests exercise the shipped loader, binary, worker, or subprocess where relevant. A hand-assembled test setup does not catch invalid exports.
- **Test strength:** assertions fail on the intended regression and verify external state, logs, events, or disposal rather than restating the implementation. Coverage is necessary but not evidence that the scenario is correct.
- **Negative controls:** verify that a deliberately invalid case fails through the real runner for each changed acceptance rule.
- **Implemented Agent Notes match shipped reality:** when a change implements a proposed note, move and rewrite it as present-tense shipped state in the same diff.
- **Translations:** compare meaning and terminology on both sides; matching structure does not prove translation quality.

## Reporting findings

State the defect, location, impact, and evidence. Place a localized defect inline on the tightest relevant diff range; use a top-level comment for cross-cutting architecture, scope, or synthesis. Separate blockers from suggestions, and omit issues already enforced by a passing check. When receiving review, verify each claim and fix or rebut it on technical grounds.
