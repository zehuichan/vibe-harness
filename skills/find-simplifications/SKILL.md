---
name: find-simplifications
description: Find evidence-backed simplifications in code, APIs, configuration, tests, and prose; write or consolidate proposals, identify small inline cleanups, or assess simplifications from another branch. Use for removing dead, duplicated, speculative, or unnecessarily maintained behavior and infrastructure.
---

# Finding simplifications

Find changes that remove maintained obligations: APIs, representations, lifecycle states, configuration paths, dependencies, tests, or documentation. Prefer a few well-supported candidates over a count of deletions. This is guidance, not a checklist; keep the user's scope, and distinguish a survey from permission to implement its proposals.

## Establish scope and constraints

Read `AGENTS.md`, the project profile's project-specific rules, `docs/defensive-patterns/`, and the active Agent Notes that own relevant decisions. Archived notes are historical examples, not current authority: never inspect, verify, or repair their outbound links.

Respect protected designs: a design the project rules or an active Agent Note mark as intentional (for example parallel implementations kept for comparison, or an extension point kept for out-of-tree providers) is not a deletion candidate unless the user explicitly overrides that constraint. Unused members within a protected design remain candidates when removing them preserves its purpose.

For broad requests, divide independent domains among subagents, give each a bounded domain, and require consumer evidence and rejected alternatives. Inspect substantial production machinery as well as obvious unused symbols; do not stop after the first promising deletion.

## Search for removable obligations

Use these questions to guide discovery. Requirements, checks, and Agent Notes introduced by the code under review are design choices to assess, not independent evidence that its distinctions are necessary. Read [the pattern reference](references/patterns.md) when a candidate needs calibration.

- **Does a declared feature have a complete effect path?** Trace producer, transformations, provider or endpoint support, and observable result. A field copied everywhere may have no setter, no reader, or only implementations that reject it. For command-line and configuration pass-throughs, follow authoritative reads and precedence to find forwarded values that are shadowed before use. Search constructors and discriminant emitters as well as callers.
- **Which distinctions change a consumer's action?** First ask whether the distinction, field, or adapter is needed at all. Trace existing source fields and discriminants through their emitters and authorization or capability checks before adding a transport-specific marker; a broad category in an envelope need not carry the source field's meaning. Consider deleting a distinction separately from relocating its declaration, and state which inputs or capabilities each alternative admits. Several internal states may need only one public status or one usable identifier. Preserve required authorization, residency, durability, and ownership behavior; remove public distinctions that only invite an unusable choice.
- **Could a smaller explicit behavior remove the subsystem?** A fixed interval, a caller-supplied value, or a reported failure can eliminate a generalized calendar, persisted defaults, or automatic rollback. Name the capability given up and the machinery deleted. A production caller makes this a behavior decision, not an automatic rejection; implementation must stay within the user's authorization.
- **Can a consumer read the authoritative value when needed?** Look for copied histories, promotion ledgers, invalidation events followed by reads, and caches beside an existing shared stream. Deriving at use can delete subscriptions, retained data, stale-response handling, and recovery paths together. Establish the required time of observation first.
- **Is composition being mistaken for policy?** Optional service presence, a provider method, or a sibling feature can express availability without deciding deployment behavior. Explicit configuration or an operation that states the caller's intent may remove registries and dependency checks. Preserve distinct operations when their ownership or completion timing differs.
- **What owns the complete maintenance cost?** Trace duplicate application trees, demo launchers used by products, workspaces that exist only to resolve dependencies, and installation helpers with their own upgrade lifecycle. For required behavior, compare existing extension points near the producer or consumer with changes to distant core or shared type declarations under [the ownership rule](../../../docs/defensive-patterns/general.md#a-business-capability-owns-itself). Compare the whole removed system with the replacement, including residual glue; moving an unnecessary concept closer to its owner or adding a check that keeps duplicate definitions equal does not remove its maintenance cost.

## Prove reachability and the trade-off

Start with a text search, then read the matches. Search exact symbols, property reads and writes, discriminants, event and wire strings, configuration keys, package names, and both `.method(` and `method(` forms. Tests and declarations can show a contract without proving a shipped producer or consumer.

Include source, applications, scripts, shipped configuration, package manifests and exports, dynamic loading, generated assets, and external consumers of published packages. Classify examples and fixtures by their actual entry point rather than directory name. Follow generated catalogs to their consumers: a catalog that model-written or user-written configuration loads from is a dynamic product API, while a documentation-only listing is not a fixed caller. Public third-party extension points can be intentional with zero in-repository callers. A static unused-code checker must cover manifest-driven loading, generated outputs, and every build target without maintaining a parallel per-module exception inventory.

For each candidate, record the current owner, the effective producer and consumer path, what disappears, what remains, capability and compatibility effects, and the strongest reason to keep it. Distinguish:

- removal of unreachable or unread behavior;
- a narrower public or product behavior with an explicit loss;
- a protected obligation or insufficient evidence.

Reject a candidate that breaks a retained obligation, merely relocates the same complexity, or has no meaningful reduction. Read rejection reasons at the level of the proposed change: a stale inventory or a mixed proposal's rejected behavior does not settle every independent item. Refresh the evidence before re-proposing a previously rejected candidate. Small local improvements belong in actionable `TODO`/`FIXME` comments, not standalone design records.

## Preserve ownership and failure semantics

For copies, freezes, validators, and callback captures, name the value's origin, next owner, and trust boundary. Typed same-process calls ordinarily borrow read-only values; parsers, configuration loaders, queues, model or tool JSON, files, workers, processes, and wire decoders own or validate their inputs. Hostile-getter or callback-replacement tests do not establish a requirement by themselves. A frozen root does not prove its descendants immutable, and equal ids do not prove object identity.

For asynchronous machinery, map each promise, flag, cancellation path, disposer, and reservation to its owner and transition. Collapse mechanisms only when they express the same fact. Preserve synchronous publication and rollback, callback containment, first-terminal-outcome arbitration, worker and process ownership, and dispose-to-quiescence where required. Durable start and end markers can record real facts even when a renderer ignores them; dropping interrupted work is a capability loss, not redundant-log cleanup.

## Replace infrastructure only for a net reduction

Search existing dependencies and the standard library available at the project's minimum supported runtime version before adding a package. Identify the exact implementation and dedicated tests the replacement deletes, its maintenance and transitive cost, and every residual behavior the glue must preserve.

Exercise the mismatches most likely to defeat the replacement: protocol truncation, cancellation and teardown, configured bounds, deterministic test clocks, platform packaging, and source versus built entry points. A library that covers framing but requires rebuilding the same framing to enforce a size limit is not a simplification. An accepted edge-behavior change belongs in the proposal and relevant tests. Do not re-prove a dependency's generic specification while omitting tests for the project-specific glue around it.

## Record, consolidate, and validate

Use [prose-standard](../prose-standard/SKILL.md) when prose is in scope. Remove code-restating or remotely owned explanations while preserving local behavior, timing, ownership, and failure obligations. Update affected READMEs, API docs, model-visible catalogs, configuration, snapshots, and generated files with their owning change.

A substantial proposal is a proposed Agent Note using the proposal skeleton in `.agents/notes/README.md` (`Problem`, `Proposal`, `Alternatives considered`, `Acceptance criteria`, `Risks`), with concrete consumer evidence, the removed maintenance cost, the capability given up, and observable acceptance conditions; an implemented decision uses the implemented skeleton instead. Update an existing owner when the decision is the same; do not create duplicate notes to preserve candidate counts.

Every new note requires a scoped supersession check through [agent-notes](../agent-notes/SKILL.md), which owns retention, consolidation, deletion, and archive mechanics. A code survey does not imply a repository-wide note audit; preserve partial supersessions and current durable, wire, compatibility, or rejected-alternative obligations.

When folding simplifications from another branch, compare its independent diff against the target base, port only supported proposals that do not overlap, and consolidate overlapping rationale. Closing another pull request requires authorization or clear ownership of that housekeeping.

For docs-only Agent Note work, run `commands.docs-check`, `commands.lint`, and `git diff --check`; for skill or comment edits, include the applicable validator. Select other checks through [pre-push-checks](../pre-push-checks/SKILL.md). Report the surveyed areas, supported candidates, meaningful rejections or deferrals, notes added, consolidated, retained, or removed, and commands actually run. Use a draft pull request while the survey is still expanding, and do not describe an unverified search as exhaustive.
