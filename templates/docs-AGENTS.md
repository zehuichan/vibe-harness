# AGENTS.md: the documentation standard

This file defines document structure, documentation tiers, writing rules, and the slop checklist. Use the [`docs-standard`](../.agents/skills/docs-standard/SKILL.md) skill for placement, fact-checking, and audits, and the [`prose-standard`](../.agents/skills/prose-standard/SKILL.md) skill for required coverage and editorial judgment.

## Document structure

These rules apply to human-facing documentation; [Agent Notes](../.agents/notes/README.md) keep their own format. A postmortem is an incident-scoped reference: its chronology records evidence, not a teaching sequence. A document's subject and position in the tree fix its scope: describe its own subject at the appropriate detail, describe direct children only by purpose and responsibility, and link to the owning descendant for lower-level detail. Document type does not widen that scope: a reference may be exhaustive only about its own subject. Testing mechanisms, fixtures, and harnesses are documented at the lowest owning level; higher documents link there.

Classify every document as a tutorial or a reference. A tutorial follows an ordered path to an outcome and introduces only what each step needs. A reference defines a lookup scope and current behavior without a teaching sequence. Separate substantial tutorial and reference content; label a section when either part is small. Before writing a tutorial, privately classify the reader's starting knowledge and each concept as beginner, intermediate, or advanced; establish prerequisites first, raise difficulty gradually, and move unnecessary advanced material to a later tutorial or a reference.

Author in this order: locate the document in the tree; set its permitted detail; choose tutorial or reference; for a tutorial, order concepts by prerequisite and difficulty; move descendant-owned detail to its owner and link to it.

## Tiers: one home per fact

Each fact has one home, the tier whose job it is; elsewhere, link there.

| Tier | Job | Does not belong there |
|---|---|---|
| Root `AGENTS.md` | Standing orders an agent needs in every session, one to three lines each, linking their home | Stories, worked examples, situational procedures, restated rules |
| Subtree `AGENTS.md` | Orders specific to that subtree | Repository-wide rules the root already carries |
| Architecture overview | Ordered map of components, data flow, and extension points | Type catalogs, per-module detail, decision rationale, status annotations |
| [Agent Notes](../.agents/notes/README.md) | Active decision records: the why, what was given up, required verification; implemented notes describe shipped reality in the present tense | Migration plans, acceptance checklists, fixture walkthroughs, and spec-speak once the decision has shipped; archived notes are frozen history, never current authority |
| [Defensive patterns](defensive-patterns/README.md) | Rules enforced in review, one page per artifact family | Type definitions, decision rationale |
| Postmortems | Incident stories: sequence, evidence, causal chain, prevention; the only tier where war-story narrative belongs | Current behavior contracts |
| Cookbooks | Step-by-step procedures with numbered verification steps | Design rationale |
| User guides | Product-facing tasks | Contributor procedures, decision history |
| Module or package README | The consumer contract: configuration, semantics, failures, limitations, extension points | JSDoc restatement, other modules' concerns |
| Generated reference | Exhaustive catalogs regenerated from source and checked for freshness | Hand edits |
| Skills (`.agents/skills/`) | Reusable workflows and decision standards | Product and runtime contracts |

Placement: incidents go to postmortems; rationale to Agent Notes; procedures to cookbooks; module contracts to READMEs; standing orders to the root `AGENTS.md` with a link to their rationale; review-enforced rules to defensive patterns.

## Writing rules

- **Document current state.** History lives in commits, pull requests, Agent Notes, postmortems, and scoped persistence-change records. Other prose names live mechanisms, not changes, stack positions, or review rounds. General prose about a versioned format links its version authority; retain version numbers for version-specific contracts, examples, or evidence.
- **Apply the Agent Note creation criteria.** Mechanical and local edits are exempt, including local UI changes; keep existing owning notes accurate.
- **Comments and docs state complete contracts, not reasoning transcripts.** Preserve behavior, failure, timing, ownership, modality, exceptions, and consequences; delete narration, test walkthroughs, review analysis, and code restatement. Keep the local contract and link the rationale.
- **Write directly.** Name the actor and the fact. Name the exact check, type, API, operation, or behavior instead of a metaphor.
- **One physical line per paragraph** in Markdown; rely on editor soft-wrap. Code blocks, tables, and lists keep their structure; code comments stay under the linter's column limit.
- **Docs change with the code.** A change to a documented type, configuration key, default, error, command, or behavior updates the page that owns it in the same change.
- **Translations update together.** When the project keeps bilingual documentation, update the counterpart in the same change and keep structure, links, and code blocks aligned. Follow the project's terminology list, change only the counterpart prose the update affects, and preserve the rest.
- **Commands in documentation are verified.** Run every command, configuration snippet, and example you document against the current checkout before stating its behavior.

## Word budgets

Root `AGENTS.md` stays under about 2,000 words and each subtree `AGENTS.md` under about 600. When a document outgrows its budget:

1. **Relocate** content that belongs in another tier; leave a one-line link if needed.
2. **Condense** content that belongs here but can be shorter.
3. **Raise** the budget only when the words genuinely need the space, and justify the change in the pull request. A too-low budget is a budget bug.

Budgets are guardrails, not reduction targets. At or below target, keep at least 5% headroom; above target, freeze the budget until relocation or condensation brings the document under it. Lower a budget only when the document still has room.

## The slop checklist

Hunt these in any document; the `docs-standard` skill runs this list as an audit.

- Duplicated rules: search a distinctive phrase; keep one home and link the rest.
- History outside its permitted tier: state current facts and link the historical owner.
- Implementation-status annotations in prose or diagrams ("implemented!", "future: ..."). Status rots; the repository layout carries it.
- Hand-restated catalogs, API docs, or inventories of tests, modules, and status when source or a generator is authoritative.
- Reasoning transcripts: step-by-step implementation narration, proofs of obvious branches, test walkthroughs, rejected local alternatives. Keep the resulting contract or durable rationale; delete the path used to derive it. See the [`trim-cot-leakage`](../.agents/skills/trim-cot-leakage/SKILL.md) skill.
- Rationale repeated beside sibling functions instead of once at the owning capability.
- Paragraph walls: one paragraph carrying several rules and parenthetical asides. Split it or demote the detail to its home.
- Emphasis inflation: bold, capitals, or "critically" everywhere means nothing stands out. Reserve emphasis for the clause that changes behavior.
- Spec-speak in implemented Agent Notes: "should", migration plans, acceptance checklists. An implemented Agent Note describes what is.

## Repository references

Use relative Markdown links for current files, and tags, issue numbers, or pull request numbers for historical references. Do not cite raw commit hashes in maintained prose. Never write a leading-slash Markdown link such as `/docs/...` to look like a repository-root path: hosted renderers resolve it outside the repository, and link checkers typically skip it.
