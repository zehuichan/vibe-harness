# Agent Notes

An **Agent Note** records a decision or proposal that affects this codebase: the *why* and *what we gave up*, which code and ordinary documentation cannot carry. This file defines where Agent Notes live, when to write one, and the in-file format. The [`agent-notes`](../skills/agent-notes/SKILL.md) skill owns the creation, supersession, and archiving workflow.

## Layout and naming

Every Agent Note encodes two axes in its path, `{lifecycle}/{class}/yyyy-mm-dd-topic-title.md`.

- **Lifecycle** is the top-level folder, and a note moves between folders as its status changes:
  - `proposed/`: reviewed before implementation; not built yet, or only partly built.
  - `implemented/`: the decision shipped. The note records what was decided and what was rejected, and it stays current with what shipped: when code later moves a file, renames a module, or changes a default, the same change updates the note's facts (paths, names, structure), not the decision itself. See [implemented/AGENTS.md](implemented/AGENTS.md).
  - `rejected/`: considered and declined. Keep it only while its rationale prevents a tempting, meaningful mistake; otherwise delete it.
  - `archived/`: frozen historical snapshots of implemented notes that no longer guide future work. See [archived/AGENTS.md](archived/AGENTS.md).
- **Class** is the nested folder naming the kind of decision.

The date in the filename is when the topic was first proposed. Cross-references between notes use relative Markdown links, never bare prose or numbers, so they are checkable and survive moves. Do not maintain a central index file: the folder tree is the inventory, and an index duplicates path metadata.

## Classification

| Class | What it covers |
|---|---|
| `feature` | A new user- or model-facing capability. |
| `bug-fix` | Corrects a defect or closes a gap an incident surfaced. |
| `simplification` | Removes code, behavior, or surface area without adding a capability. |
| `architecture` | A structural decision about the shipped source: how modules relate and what the runtime vocabulary is. |
| `process` | Tooling, policy, or workflow around the code: checks, package management, release, vendoring. |
| `testing` | Test infrastructure and strategy. |

The `architecture`/`process` line: architecture is the source the project ships; process is the surrounding tooling and workflow. There is no `refactor` class; `simplification` covers it, discriminated by whether observable behavior changes. Adding a class requires updating this table.

## When to write one

Add or update an Agent Note in the same change only for lasting decision rationale that code, tests, and existing documentation do not explain. A proposal for substantial future work starts in `proposed/`; a decision already made starts in `implemented/`.

Updating the note that already owns the decision satisfies the rule; do not create a duplicate. Mechanical or local edits, including local UI presentation changes, are exempt. A note is never edited into a different decision: supersede it with a new note and cross-link both, unless the old note is fully consolidated under the rule below.

An implemented note that is fully superseded may be consolidated into the current owning note and deleted. Before deletion, the owner preserves every unique rationale, alternative, consequence, required verification, and named coverage gap, and every inbound link is repaired. Partial supersession does not qualify: keep both notes cross-linked and keep every remaining fact current.

## The file format

### Header

The first three lines of every note are exactly:

```markdown
# Agent Note: <title>

Status: <status>
```

The status is `proposed`, `implemented`, or `rejected — <why, in one line>`, and it must agree with the lifecycle folder. It carries no dates or parentheticals: the filename holds the first-proposed date and git holds the rest. Archived notes keep `Status: implemented` and add one `Archived: YYYY-MM-DD` line directly below it.

### Body

Every note opens its body with `## Problem`, written to stand without the solution. Recurring sections use these names; bespoke technical sections (module topology, wire formats, schemas) may sit between them.

- `proposed/`: `## Problem`, `## Proposal`, `## Alternatives considered`, `## Acceptance criteria`, `## Risks`. The proposal may use the future tense; acceptance criteria state the observable state that means done; risks cover what could go wrong and what the change knowingly gives up.
- `implemented/`: `## Problem`, `## Decision`, `## Alternatives considered`, `## Consequences`. The decision describes shipped reality in the present tense; consequences record what the trade-off cost and bought. `## Proposal`, `## Plan`, `## Migration plan`, and `## Acceptance criteria` do not appear in an implemented note. A present-tense `## Testing` or `## Verification` section may record what pins the behavior.
- `rejected/`: the proposal frozen as it was, with the verdict on the `Status:` line.

### Alternatives considered

Every note has an `## Alternatives considered` section: each genuine alternative and why it lost, as one bold-led paragraph per alternative or a `### Why not <X>?` subsection per contested one. A decision recorded without what it beat invites re-litigation. Alternatives are recorded, never invented.

### Moving between lifecycles

A move updates the `Status:` line and satisfies the new folder's skeleton in the same change. `proposed/` to `implemented/` rewrites the proposal as a present-tense decision, folds acceptance criteria and risks into consequences or a verification section, and drops plans in favor of what shipped. `proposed/` to `rejected/` adds the reason to the status line and freezes the file.

### Translations

When the project keeps bilingual documentation, a translated counterpart `<name>.<lang>.md` mirrors its sibling section by section, keeps the `# Agent Note: ` and `Status:` tokens verbatim, and moves, archives, and deletes together with it.
