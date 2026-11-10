---
name: agent-notes
description: Use when deciding whether to write an Agent Note (a durable design decision or proposal record), when adding, moving, consolidating, auditing, pruning, archiving, or reviewing Agent Notes under .agents/notes/, and for the supersession check every new note requires.
---

# Agent Notes

Agent Notes keep the decision corpus small and authoritative: each note records rationale that code and documentation cannot carry, and nothing else. The rules for layout, classes, and the in-file format live in `.agents/notes/README.md`; this skill owns the workflow. Judge every note semantically; word count and age are discovery aids, never criteria.

## Decide whether a note is needed

Write or update a note only for lasting decision rationale: why one design won, what it gave up, which alternatives lost and why, and what verification pins it. Do not write one for mechanical or local edits, including local UI presentation changes, or for facts that belong in code, API docs, READMEs, or a cookbook.

- A proposal for substantial future work goes to `proposed/<class>/`; a decision made in the current change goes to `implemented/<class>/`.
- If an active note already owns the decision, update it instead of creating a duplicate.
- A reversal of a decision is a new note that cross-links the old one; never edit a note into a different decision.

## Write the note

1. Choose the class from the table in `.agents/notes/README.md` and name the file `yyyy-mm-dd-topic-title.md`, using the date the topic was first proposed.
2. Use the exact header and the lifecycle's section skeleton from the README. `## Alternatives considered` is mandatory: record each genuine alternative and why it lost; never invent alternatives.
3. Write implemented notes in the present tense as shipped reality: no plans, acceptance checklists, or "should". Keep the verification that pins the behavior and any named coverage gaps.
4. Link other notes and documents with relative Markdown links. Follow [prose-standard](../prose-standard/SKILL.md) and [trim-cot-leakage](../trim-cot-leakage/SKILL.md): no review choreography, session citations, or change narration outside the note's own change-story sections.

## Check supersession for every new note

Before drafting, search the active tree (`proposed/`, `implemented/`, `rejected/`) for notes covering the same decision, mechanism, or rejected alternative. Classify each match while writing the new note:

- **Full supersession of an implemented note:** consolidate under the consolidation rules in `.agents/notes/README.md` (the new owner preserves every unique rationale, alternative, consequence, verification, and coverage gap, then the old note is deleted and inbound links are repaired; a feature-addition note folds into a removal note only when the feature is completely absent) or archive it in the same change.
- **Partial supersession:** keep both active, cross-link them, and update every fact that remains current.
- **Obsolete proposal:** move it to `rejected/` with an honest one-line reason.
- **Obsolete rejection:** delete it when it no longer prevents a plausible mistake.

Do not defer a known match to a later audit.

## Classify existing notes by future value

When auditing or pruning, establish whether each rationale still owns or constrains anything from current code, configuration, module docs, generated catalogs, newer Agent Notes, and inbound links. Then apply these outcomes per lifecycle:

- **Implemented, delete:** notes that only describe small UI adjustments or purely mechanical changes. Repair or remove inbound links. Local bug fixes, performance changes, new capabilities, and substantive behavior or ownership decisions do not qualify merely because their implementation was small. Apply this test before keep or archive.
- **Implemented, keep active:** rationale, alternatives, negative guarantees, durable or wire semantics, ownership boundaries, security rules, or reintroduction conditions likely to guide a future change. Classify the decision, not the mechanics of its implementation: a mechanical rename or type extraction can still record a lasting naming, compatibility, or ownership rule.
- **Implemented, archive:** a substantive historical decision that is complete and unlikely to guide future work, but whose rationale still warrants preservation. Do not archive a note that meets the direct-deletion criterion.
- **Proposed, never archive:** keep a live proposal active; if it is no longer worth pursuing, reject it with an honest reason and satisfy the rejected lifecycle's format.
- **Rejected, keep only as a guardrail:** retain a rejection only while the losing proposal remains a tempting, meaningful mistake and the note explains why it loses.
- **Rejected, delete:** delete the note, with any translated counterpart, when the rejected idea is obsolete, superseded, no longer plausible, or unlikely to prevent re-litigation. Repair or delete inbound links.

Do not archive toward a quota. Inspect every note in scope, classify analogous groups under one principle, use best judgment for close cases, and record genuinely borderline decisions for the report.

Calibration (length is not the test; each example holds regardless of word count):

- Delete a note about a collapsed sidebar control's styling however long it is, and a note that records a completed function relocation with unchanged behavior.
- Keep active a note establishing that sessions are event-sourced, or naming the single owner of a storage directory, however short it is; a borderline process note while it still guides tuning; and a note that states the condition for reintroducing a removed capability until that condition is met.
- Keep a rejected note recording why two packages must not be merged while merging them remains tempting; delete a rejected note whose premise is obsolete or whose question a later decision settled.

## Archive an implemented note

1. Move the complete note, with any translated counterpart, from `implemented/<class>/` to `archived/<class>/`.
2. Make no body edits. Insert only `Archived: YYYY-MM-DD` immediately below `Status: implemented` in each language file, with the same date. Do not translate, reformat, update facts, or fix title punctuation or layout first; existing formatting is preserved, not a prerequisite for archival.
3. Search active prose for inbound links. Redirect them to current authority, retarget them to the archived path only when the historical snapshot is intentionally cited, or delete them. Never verify or repair links out of the archived note.

After archival, never edit, move, translate, reformat, or delete the note. Archived notes remain valid link targets but are not authority for current behavior.

## Validate and report

Run the profile's `commands.docs-check`, `commands.lint`, and `git diff --check`, and confirm that every changed relative link in active prose resolves; select any further evidence through [pre-push-checks](../pre-push-checks/SKILL.md). Link checking should skip outbound links from `.agents/notes/archived/`. If `commands.docs-check` reports a broken link inside an archived note, report it instead of editing the note, and never claim archived outbound links are valid. Report notes created or updated, notes kept active, deleted, archived, or rejected, and every genuinely borderline case with its word count and chosen outcome.
