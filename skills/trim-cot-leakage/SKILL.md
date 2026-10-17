---
name: trim-cot-leakage
description: Use when auditing or fixing prose that reads like a leaked reasoning transcript, such as dead design-session citations ("decision 7", audit item codes, section numbers of uncommitted drafts), change narration ("used to", "no longer", "this cut"), pull-request or review vantage ("a later PR in this stack", "rejected in review"), reviewer-addressed justifications, control-flow narration, or hedged planning residue in comments, API docs, documentation, or Agent Notes.
---

# Trimming chain-of-thought leakage

Chain-of-thought leakage is prose whose vantage is the authoring session rather than the repository: it cites artifacts only that session could see, narrates the change instead of the state, or argues with a reviewer who has left. The fix is never deletion alone when a passage carries factual clauses: restate each so it stands at HEAD, then delete the transcript around it. A passage carrying no facts (an audit code, control-flow narration) is deleted outright. [prose-standard](../prose-standard/SKILL.md) owns the complete-proposition rule this skill applies. This is guidance, not a script.

## The one test

For every suspect passage ask: **could a reader at HEAD, with no access to any session transcript, pull request thread, or uncommitted draft, resolve every reference and verify every claim?** If not, restate the surviving facts from the repository's vantage and delete the rest. If yes, it is not leakage, however historical it sounds; but on current-state surfaces (READMEs, docs, API docs) a resolvable change story is still change narration, and class 3 routes it to its sanctioned home.

## Taxonomy

1. **Dead design-session citations:** `(decision 7)`, `(audit C2)`, `design §4.7`, `plan §1.4`, phase labels (`T4`, `W3`), "the design ledger". If the decision has a committed owner, cite it by name and path; otherwise delete the citation and restate its factual clause to stand alone.
2. **Stack and pull-request vantage:** "a later PR in this stack", "this PR adds", "the previous commit". State the shipped mechanism or the extension point; deferred work moves to a `TODO` marker or an issue reference.
3. **Change narration and version stamps:** "used to", "no longer", "the old X", and indexical stamps ("v1", "this cut", "today", "now" contrasting with a past state). State the present behavior; a fixed regression becomes a present-tense counterfactual ("without X, Y happens"), never repository history.
4. **Review choreography:** "Rejected in review:", "the reviewer confirmed", draft ordinals ("v5 of this note"). Keep the surviving decision and rationale as plain fact; delete who said it when.
5. **Reviewer-addressed justification:** "the cast is safe — it simply…", "this is correct because…". State the invariant that makes the code safe, or delete the comment if the code shows it.
6. **Restatement and derivation transcripts:** control-flow narration ("first we X, then we Y"), test walkthroughs, proofs of obvious branches. Delete; keep only a non-obvious contract or invariant.
7. **Hedges and planning residue:** "probably fine for now", "should be enough", deferrals with no marker. Promote to `TODO`/`FIXME` or restate as the actual bound; delete the hedge.
8. **Authoring-language slips:** fragments of the author's working language in prose whose language is otherwise different, or session separators. Translate or delete.

## What is not leakage

Unaided passes fail in both directions, deleting durable references and keeping dead ones. Apply these keep rules; [the examples](references/examples.md) calibrate each.

- **Issue references** (`#1470`, `TODO(name):`, "issue #N owns the follow-up") resolve at HEAD; keep them on any surface, including READMEs.
- **Merged pull request and issue citations inside Agent Notes and postmortems** are sanctioned evidence.
- **Suppression justifications** (lint-disable reasons, coverage-ignore reasons, empty-catch explanations) are required prose; fix a false reason, never delete it.
- **Counterfactual-present regression pins:** "without X, Y happens", "a naive X would…".
- **Measured bounds:** "(measured: 512 nests ≈ 0.15 s)"; the word "measured" is load-bearing.
- **Runtime old/new states:** "the old connection drains before the new one accepts" is lifecycle, not change history.
- **Historical stage names inside an Agent Note's change-story sections:** "the first cut shipped X" is safe there; indexical stamps ("this cut") are banned everywhere.
- **External references that resolve outside the repository by design:** standards sections (RFC 9110 §10.1.5), design-tool frame names.
- **Project voice and genre forms:** "we" as project voice; an Agent Note's Alternatives considered section.

## Workflow

1. Scope and exclusions follow [prose-standard](../prose-standard/SKILL.md): require an explicit scope; never touch vendored code or `.agents/notes/archived/`. Recorded fixtures and snapshots are derivatives: change the owning source and regenerate them only when an authorized behavior change requires it.
2. Audit read-only first. Run the [recall batteries](references/recall-batteries.md), calibrating each probe against a known positive and a near-miss negative before trusting its output, then judge every hit semantically. The batteries are probes, not the definition: also read the densest prose in scope (module docs, READMEs, Agent Notes) without a pattern in hand.
3. Fix owner-first per surface: generated catalogs trace every consumer and fix the source or generator, then regenerate; translated prose updates the counterpart minimally; model- or user-visible strings change only with owning behavior evidence, otherwise leave them unchanged and report the deferral.
4. Before deleting anything, enumerate the passage's propositions and check the [overcorrection traps](references/examples.md#overcorrection-traps): trims that flip an obligation into an endorsement, promote a hypothetical to a shipped feature, delete a true fact, or drop the evidence source.
5. Verify: re-run the batteries expecting only sanctioned keeps and this skill's own directory; confirm every remaining citation resolves at HEAD; run the profile's `commands.docs-check` for touched documentation.
