---
name: agent-notes
description: Use when deciding whether to write an Agent Note (a durable design decision or proposal record), when adding, moving, consolidating, auditing, pruning, archiving, or reviewing Agent Notes under .agents/notes/, and for the supersession check every new note requires.
---

# Agent Notes

Agent Notes keep the decision corpus small and authoritative: each note records rationale that code and documentation cannot carry, and nothing else. The rules for layout, classes, and the in-file format live in `.agents/notes/README.md`; this skill owns the workflow. Judge every note semantically; word count and age are discovery aids, never criteria. This is guidance, not a checklist.

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

- **Full supersession of an implemented note:** consolidate (the new owner preserves every unique rationale, alternative, consequence, verification, and coverage gap, then the old note is deleted and inbound links are repaired) or archive it in the same change.
- **Partial supersession:** keep both active, cross-link them, and update every fact that remains current.
- **Obsolete proposal:** move it to `rejected/` with an honest one-line reason.
- **Obsolete rejection:** delete it when it no longer prevents a plausible mistake.

Do not defer a known match to a later audit.

## Classify existing notes by future value

When auditing or pruning, apply these outcomes per lifecycle:

- **Implemented, delete:** notes that only describe small UI adjustments or purely mechanical changes. Repair or remove inbound links. Local bug fixes, performance changes, new capabilities, and substantive behavior or ownership decisions do not qualify merely because their implementation was small. Apply this test before keep or archive.
- **Implemented, keep active:** rationale, alternatives, negative guarantees, durable or wire semantics, ownership boundaries, security rules, or reintroduction conditions likely to guide a future change. Classify the decision, not the size of its implementation: a mechanical rename can still record a lasting naming or compatibility rule.
- **Implemented, archive:** a substantive historical decision that is complete and unlikely to guide future work, but whose rationale still warrants preservation.
- **Proposed, never archive:** keep a live proposal active; if it is no longer worth pursuing, reject it with an honest reason.
- **Rejected, keep only as a guardrail:** retain a rejection only while the losing proposal remains a tempting, meaningful mistake and the note explains why it loses; otherwise delete it.

Do not archive toward a quota. Inspect every note in scope, classify analogous groups under one principle, and record genuinely borderline decisions for the report.

Calibration: a note about a collapsed sidebar control's styling is deleted however long it is; a note establishing that sessions are event-sourced, or naming the single owner of a storage directory, stays active however short it is; a note recording why two packages must not be merged stays as a guardrail while merging them remains tempting.

## Archive an implemented note

1. Move the complete note, with any translated counterpart, from `implemented/<class>/` to `archived/<class>/`.
2. Make no body edits. Insert only `Archived: YYYY-MM-DD` immediately below `Status: implemented` in each language file, with the same date.
3. Search active prose for inbound links. Redirect them to current authority, retarget them to the archived path only when the historical snapshot is intentionally cited, or delete them. Never verify or repair links out of the archived note.

After archival, never edit, move, translate, reformat, or delete the note. Archived notes remain valid link targets but are not authority for current behavior.

## Validate and report

Run the profile's `commands.docs-check` and `git diff --check`, and confirm that every changed relative link resolves. Report notes created or updated, notes kept active, deleted, archived, or rejected, and every borderline case with the chosen outcome.
