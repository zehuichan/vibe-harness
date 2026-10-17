---
name: perf-evidence
description: Use when investigating or optimizing performance, designing realistic synthetic benchmarks or CI performance checks, profiling long-running workloads or UI responsiveness, or turning performance claims into measured, behavior-preserving fixes.
---

# Performance work backed by evidence

Turn a broad "make it faster" request into reproducible user-path measurements and small, evidence-backed fixes. This is guidance, not a quota or a script: survey broadly, follow measured cost, and reject attractive changes that do not improve the workload users actually run.

## Establish scope and current authority

Read `AGENTS.md`, the project profile (benchmark command `commands.bench`), `docs/defensive-patterns/`, and the affected modules' Agent Notes. Use [test-reliability](../test-reliability/SKILL.md) for processes, clocks, browser tests, and asynchronous cleanup.

Agree on the user-visible endpoint, workload range, resource constraints, acceptable minor behavior differences, and stopping rule. Keep backend and browser end-to-end measurements separate: a fast data-layer iterator does not prove fast transport, paint, scrolling, or input response. Exclude network or external-service latency when measuring local overhead, and say so rather than calling the result complete product latency.

Inspect the exact current base. Separate merged, abandoned, estimated, and newly measured evidence; a pull-request description can describe an implementation that never landed.

## Survey user paths, then rank candidates

Delegate independent domains when breadth helps; require measurements and production call sites, not guesses. Typical domains: cold start, first read of large persisted state, repeated navigation, initial data transport and first usable paint, paging and scrolling, live streaming and reconnect, cancellation and teardown.

Vary independent cost drivers separately: bytes, record counts, nesting, individual item size, and visible DOM nodes are different quantities. A huge count of tiny identical items is not "realistic" without checking which user operation it stresses. Include typical and tail workloads, without a combinatorial matrix that has no decision value.

Rank candidates by observed latency, CPU and allocations, retained memory, frequency, and confidence. For each, name the production consumer, the repeated work, the expected complexity, the smallest falsifiable intervention, and the behavior that must stay stable. A suspicious loop, unused cache, or large file alone is not evidence of a bottleneck.

## Build realistic synthetic benchmarks first

Extend the project's existing benchmark lane instead of creating competing infrastructure. Generate fixed inputs from reviewed constants or seeds; no benchmark depends on a developer's home directory, network services, or private data. If the user authorizes inspecting real data, extract only aggregate characteristics and never copy content, paths, identities, or credentials into fixtures, logs, or artifacts.

Before implementation, record a measurement card:

| Field | Required decision |
|---|---|
| User operation | Exact action and externally observable completion condition |
| Workload | Fixed dimensions, distributions, seed or constants, and why they exercise ordinary and tail use |
| Entry path | Production calls and built artifacts; which external boundaries are mocked |
| Clock | Included setup, cold or warm state, timing start and end, excluded costs |
| Memory | Reachable endpoint objects, baseline, GC policy, retained versus transient limits |
| Verdict | Raw samples, chosen aggregate, absolute, ratio, and memory limits, negative control |
| Behavior | Owning functional tests or snapshots and permitted minor differences |

Measure built artifacts on the shipped runtime; source-loader overhead is not the shipped path. Do not add a production export solely for measurement or copy the algorithm into a "benchmark implementation". Use fresh processes for cold samples; never let fixture setup warm a cold scenario. Keep input, validation, completion condition, and reachable output identical on both sides of a comparison.

Report all samples and the aggregate that decides the result. Calibrate timing budgets on the actual CI runner before adopting them; do not scale byte counts or dimensionless ratios by CPU speed. Serialize measured work against other CPU-heavy jobs, and never widen a budget or select a lucky run to hide a regression.

Track retained memory with the intended objects still reachable, and transient pressure separately. Faster execution with unbounded retention is not an automatic win. For browser responsiveness, use real input, observe the resulting UI update, and include the final stall; component-level timings and fake DOMs cannot establish browser responsiveness.

## Prove the regression, then remove work

Run the unoptimized workload before changing production code, and save the command, revision, runtime and platform, fixture dimensions, raw measurements, and verdict. Reduce a failing scenario until it still exercises the real bottleneck, then rank falsifiable hypotheses and use profiles, allocation samples, work counts, or phase timings to distinguish them.

Patterns worth testing, not automatic prescriptions:

- Keep compact representations compact through downstream readers; avoid per-delta objects when the consumer needs settled content or one aggregate.
- Remove duplicate parsing, copying, and validation only after identifying the actual ownership and trust transition; never weaken validation at file or wire boundaries.
- Stream transformations and bound intermediate state rather than retaining every generation.
- Separate read-only preparation from write or publication work without moving awaited work past a correctness-required endpoint.
- Defer inactive-view and collapsed-detail work, and measure first activation too. Deferral is not deletion.
- Stabilize identities and narrow subscriptions so one changed item does not invalidate a whole list; preserve update ordering.
- Prefer a suitable data structure to repeated shifting, scanning, or rebuilding; measure the whole consumer path.
- Use revision-keyed reuse or request coalescing only with explicit invalidation, bounded retention, independent waiter cancellation, and disposal ownership.

Change one causal factor at a time. Re-run both the focused scenario and its end-to-end parent. Require a negative control: the tightened assertion fails on the original implementation or a controlled reintroduction of the targeted cost. A threshold so generous that the regression passes is not protection; a budget below the verified noise floor is not reliable either.

## Preserve behavior and resource ownership

Performance measurements complement functional evidence; they do not replace it. Run or add the owning tests for output, ordering, paging, errors, cancellation, concurrency, and disposal. Do not silently truncate data, skip work, or change lifecycle semantics to reach a number. State any deliberate minor visible difference and verify it through the owning test or snapshot.

Reject an optimization when the gain disappears end to end, a typical workload regresses materially, complexity outweighs a small gain, or cancellation, retention, or durability cannot be explained and tested. Record the rejected hypothesis briefly instead of expanding scope to justify it.

## Deliver a bounded, reviewable result

Record durable rationale, calibration, exclusions, and remaining risks in an Agent Note (see [agent-notes](../agent-notes/SKILL.md)). Keep benchmark infrastructure and the optimization in separately mergeable layers when the change is large: the benchmark protects the measured baseline; the optimization carries its fix, functional coverage, and tighter budget.

Apply [pre-push-checks](../pre-push-checks/SKILL.md) and report only executed evidence. Summarize each result as: workload, before and after absolute values and ratio, endpoint and memory semantics, behavior evidence, negative control, exact checks, exclusions. Separate historical numbers, fresh local measurements, and CI evidence. Stop at the agreed scope and keep a short ranked follow-up list.
