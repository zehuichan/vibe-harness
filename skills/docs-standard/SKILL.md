---
name: docs-standard
description: Create, restructure, review, audit, or fact-check Markdown documentation and module READMEs using audience-first hierarchy, one home per fact, tutorial/reference separation, progressive user-to-developer detail, executed-operation fact-checking, and the slop checklist. Use for new or revised docs, docs-tree organization, documentation-quality audits, and bilingual documentation structure.
---

# Documentation standard

Make every page searchable, newcomer-readable, and exact enough for agents and maintainers. The tiers, writing rules, budgets, and slop checklist live in `docs/AGENTS.md`; this skill owns the workflow for applying them. Preserve one owner per fact: source, tests, generated catalogs, READMEs, guides, and Agent Notes each keep their own kind of truth. This is guidance, not a checklist.

## Workflow

Follow this sequence for each requested scope. Keep the common reader path brief, but do not delete failures, ownership, limitations, or other required contracts to reduce words.

1. Read the root and subtree `AGENTS.md` files, `docs/AGENTS.md`, the target page, its source and tests, and its navigation owner.
2. Classify the page by one primary job and reader: quick start, user task guide, contributor tutorial, architecture overview, module reference, generated reference, agent instruction, decision record, or scratch.
3. Place the page at its nearest owner. Keep module contracts beside the module's code; use `docs/` for cross-module learning, user, developer, and architecture material.
4. Define the reader's starting state, observable outcome, likely failure, recovery path, and next useful depth before writing details.
5. Write in the order given by [page structure](references/page-structure.md): title, Summary, contents, user-facing content, developer-facing content, optional Further Exploration.
6. When the profile enables `surfaces.bilingual-docs`, update the counterpart in the same pass and keep headings, lists, tables, code, and links aligned line for line.
7. Verify every claim against code, tests, generators, package metadata, or a current decision owner, and run the operations the page instructs (see the fact-check procedure below). Update the owner before any derivative artifact.
8. Run the profile's `commands.docs-check` and `git diff --check`, then re-read the complete diff once for correctness and once for brevity and fit.

## Fact-check procedure: test, do not assume

Documentation states how the product behaves today, and the only admissible evidence for an operation claim is having run it. This applies to every new page and every new paragraph that claims a command, default, error, output, or platform difference.

1. **Classify the subject before writing install or usage guidance.** Read the facts (manifests, entry points, exports), not the folder name. A library, a plugin, a CLI, and a service each have a different usage path; never copy guidance written for another kind.
2. **Run every claimed operation against the current checkout.** Execute each command, configuration snippet, and example exactly as the page will show it; write down only what you observed, including warnings and failure modes. If a claim depends on credentials or a network you do not have, say so and name the verification owner instead of asserting the behavior.
3. **Delete what you could not reproduce.** Never carry a command, field, default, or behavior from memory, analogy, or a neighboring README. When a claim fails to reproduce, fix the claim, not the test.
4. **Check old docs against the latest default branch.** Before revising an existing page, fetch and compare against the default branch; correct stale statements against the code, not against the old prose.

## Voice rules

- **Summary says what the subject does.** The Summary and user-facing sections describe what a reader can do with the subject (outcomes, when to choose it, main cost), never its internal identity or registrations. Omit source identifiers unless the reader uses them directly in configuration, a command, or a public API.
- **Developer sections explain, never enumerate.** Developer detail covers the design concept, architecture, and approximate data flow, enough to understand how it works, and links code for exact detail. No full API catalogs, column lists, or API-doc restatement.
- **Current state only.** Ordinary documentation describes the current codebase; history belongs to Agent Notes, postmortems, release notes, and upgrade guides.
- **Controlled technical English.** Give each sentence an explicit actor and one main action when ambiguity can change behavior; reuse one term per concept; split stacked instructions; preserve modality and exceptions. See [page structure](references/page-structure.md#controlled-technical-english).

## Quality criteria

- **Brief:** the common path contains only facts needed for its outcome; exhaustive truth is one link or detail layer away.
- **Intuitive:** prerequisites precede dependent concepts, one next action is obvious, and headings use terms readers search for.
- **Friendly:** readers can recognize success, understand risk before acting, recover from likely failure, and choose whether to go deeper.
- **Accurate:** each durable claim has one owner and a verification path proportionate to its risk.
- **Agent-readable:** stable headings, anchors, terminology, and ownership support targeted retrieval without loading the whole corpus.
- **Newcomer-complete:** an engineer with no repository context can reconstruct the relevant architecture or feature through three to five linked pages.

Do not apply a universal word limit to exhaustive references; measure entry-path length, unrelated material scanned per lookup, and largest section, and split by an existing domain owner when retrieval cost is high.

## Audit the corpus

Apply the authoring order from `docs/AGENTS.md` to every human-facing document in scope (not to Agent Notes): locate the document and state its subject; set its permitted detail and move deeper explanations to owning descendants; classify tutorial or reference from intended use, not path; split substantial mixed forms. A move is atomic with every inbound link repaired in the same change; generated catalogs are never hand-edited.

Then hunt the slop checklist in `docs/AGENTS.md`, cheapest probes first: use [trim-cot-leakage](../trim-cot-leakage/SKILL.md) for reasoning-transcript leakage, search distinctive phrases for duplicated rules, replace hand-written catalogs with their authoritative owners, and remove spec-speak from implemented Agent Notes. If removing prose would change promised behavior rather than its explanation, propose the behavior change first (see [find-simplifications](../find-simplifications/SKILL.md)). Keep every load-bearing rule, preferably as one to three lines plus a link to its rationale.

## Detailed references

- [Page structure and style](references/page-structure.md): page order, section progression, folding, controlled technical English, and emphasis.
- [Review criteria](references/review.md): the newcomer test, evidence review, and README review.

Use [prose-standard](../prose-standard/SKILL.md) for sentence-level contract coverage and editorial judgment.
