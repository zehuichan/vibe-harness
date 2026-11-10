---
name: perf-evidence
description: Use when investigating or optimizing performance, designing realistic synthetic benchmarks or CI performance checks, profiling long-running workloads or UI responsiveness, or turning performance claims into measured, behavior-preserving fixes.
---

# Performance work backed by evidence

Turn a broad "make it faster" request into reproducible user-path measurements and small, evidence-backed fixes. This is guidance, not a quota or a script: survey broadly, follow measured cost, and reject attractive changes that do not improve the workload users actually run.

## Establish scope and current authority

Read `AGENTS.md`, the project profile (benchmark command `commands.bench`), `docs/defensive-patterns/`, and the affected modules' Agent Notes. Use [test-reliability](../test-reliability/SKILL.md) for processes, clocks, browser tests, and asynchronous cleanup.

Agree on the user-visible endpoint, workload range, resource constraints, acceptable minor behavior differences, and stopping rule. Keep backend and browser end-to-end measurements separate: a fast data-layer iterator does not prove fast transport, paint, scrolling, or input response. Exclude network or external-service latency when measuring local overhead, and say so rather than calling the result complete product latency.

Inspect the exact current base, not just the running checkout. Separate merged, closed-unmerged, superseded, estimated, and newly measured evidence; a pull-request description can describe an implementation that never landed, so verify earlier claims against final merged diffs, owning source, tests, and resolved review threads. Archived Agent Notes under `.agents/notes/` are leads, not authority to reintroduce their implementations.

## Survey user paths, then rank candidates

Delegate independent domains when breadth helps; require measurements and production call sites, not guesses. Typical domains: cold start, first read of large persisted state, repeated navigation, initial data transport and first usable paint, paging and scrolling, live streaming and reconnect, cancellation and teardown.

Vary independent cost drivers separately: bytes, record counts, nesting, individual item size, and visible DOM nodes are different quantities. A huge count of tiny identical items is not "realistic" without checking which user operation it stresses. Include typical and tail workloads, without a combinatorial matrix that has no decision value.

Rank candidates by observed latency, CPU and allocations, retained memory, frequency, and confidence. For each, name the production consumer, the repeated work, the expected complexity, the smallest falsifiable intervention, and the behavior that must stay stable. A suspicious loop, unused cache, or large file alone is not evidence of a bottleneck.

## Build realistic synthetic benchmarks first

Extend the project's existing benchmark lane instead of creating competing calibration or reporting infrastructure. Diagnostics for one module stay beside that module and outside `commands.bench`; required cases whose measured user path crosses module ownership join the benchmark lane.

Generate fixed inputs from reviewed constants or seeds; no benchmark depends on a developer's home directory, the ambient repository, network services, or private data. If the user authorizes inspecting real data, extract only aggregate characteristics and never copy content, paths, identities, IDs, credentials, recordings, or recognizable snippets into fixtures, logs, screenshots, pull requests, or artifacts.

Lay out and run the lane as follows:

- Organize benchmarks by measured user path, one directory per path; do not mirror the module tree.
- Run process-level wall-clock and retained-memory samples in fresh child processes with private temporary roots. Pure synchronous computations build a fresh object graph per sample and do not mutate process-global state. Bound every child, await its exit, and remove owned roots after failure as well as success.
- Keep scenario-specific support beside its benchmark; move a helper into shared support only after at least two benchmarks need the same behavior.
- Exercise production entry points. A compiled worker may bundle a private integration adapter when no public export exposes the measured path, but it keeps product modules external so they resolve through their built exports.
- Record the workload, timing boundary, memory endpoint, calibration reference, alternatives, and known exclusions in the owning Agent Note.

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

Measure built artifacts on the shipped runtime; source-loader overhead is not the shipped path. Browser cases run built product assets through the project's existing end-to-end harness (`commands.e2e`). Do not add a production export solely for measurement or copy the algorithm into a "benchmark implementation".

Use fresh processes and private temporary directories for cold and process-memory samples; warm samples retain the intended cache explicitly, and fixture setup never warms a cold scenario. Keep input, validation, completion condition, and reachable output identical on both sides of a comparison: a baseline that parses and discards its output is not comparable with one that validates and retains it.

Report enough raw and aggregate measurements to explain each verdict, including whether a budget uses a median, minimum, absolute value, or ratio. Keep ad-hoc diagnostics threshold-free. A required budget needs repeated measurements on the CI runner that enforces it before adoption; a required browser performance case also needs an explicit decision to gate that lane, because calibration from one lane (such as a CPU-worker multiplier) does not transfer to another. Record reference-machine expectations separately from the shared CI time scale and variance headroom. Budgets are source constants, not environment overrides. Do not apply the time scale to memory, and do not scale bytes, item counts, or dimensionless ratios by CPU speed. Serialize measured work against other CPU-heavy jobs, measure reference and candidate under comparable conditions, and never widen a budget or select a lucky run to hide a regression.

Measure end-to-end latency independently of phase timings. Track retained memory with the intended objects still reachable, and transient pressure separately, by completing under a constrained heap or by a peak measurement. A retained-memory claim that depends on memory pressure reruns under a memory cap with swap disabled and unchanged budgets. Faster execution with unbounded retention is not an automatic win.

For browser responsiveness, use real input, observe the resulting UI update, and include the final stall. Distinguish scheduled timers from actual input, and bound synthetic producers so catch-up bursts do not invent a different workload. State whether first paint, scrolling, paging, live updates, and activated-but-hidden views are covered. Component-level timings, fake DOMs, and synthetic heartbeat events cannot establish browser responsiveness. Two animation frames prove a rendering opportunity, not presentation on hardware. Use fresh browsers and private state per sample, and report a source-loaded test server separately from evidence on the published server.

## Prove the regression, then remove work

Run the unoptimized workload before changing production code, and save the command, revision, runtime and platform, fixture dimensions, raw measurements, and verdict. Reduce a failing scenario until it still exercises the real bottleneck, then rank falsifiable hypotheses and use profiles, allocation samples, work counts, or phase timings to distinguish them.

Patterns worth testing, not automatic prescriptions:

- Keep compact representations compact through downstream readers; avoid per-delta objects when the consumer needs settled content or one aggregate.
- Remove duplicate parsing, copying, freezing, and validation only after identifying the actual ownership and trust transition. Typed same-process borrowing is not permission to weaken parsing at file or wire boundaries.
- Stream transformations and bound intermediate state rather than retaining every generation. Include publication, verification, and readiness obligations where the user operation requires them.
- Separate read-only preparation from write or publication work without moving awaited work past a correctness-required endpoint.
- Defer inactive-view and collapsed-detail work, and measure first activation and retained state too. Deferral is not deletion, and highlighting only the viewport is not full virtualization.
- Stabilize identities and narrow subscriptions so one changed item does not invalidate a whole list; preserve update ordering and immediate-event behavior.
- Prefer a suitable data structure to repeated shifting, scanning, or rebuilding; measure the whole consumer path.
- Use revision-keyed reuse or request coalescing only with explicit invalidation, bounded retention, independent waiter cancellation, and disposal ownership. Avoid caching expanded representations merely to make repeated benchmarks look fast.

Change one causal factor at a time. Re-run both the focused scenario and its end-to-end parent. Require a negative control: the tightened assertion fails on the original implementation or a controlled reintroduction of the targeted cost. A threshold so generous that the regression passes is not protection; a budget below the verified noise floor is not reliable either.

## Preserve behavior and resource ownership

Performance measurements complement functional evidence; they do not replace it. Run or add the owning tests for output, ordering, paging, errors, cancellation, concurrency, and disposal. Preserve immutability of released data, atomic publication, required validation, and readiness. Do not silently truncate data, skip work, or change lifecycle semantics to reach a number. State any deliberate minor visible difference and verify it through the owning test or snapshot; when the profile enables `surfaces.ui` and the change is visible, include browser evidence (`ui-ux-review`, `record-browser-gif`). Keep functional expectations independent of benchmark internals: benchmark assertions need enough evidence to reach the real endpoint, not a second semantic test suite.

Reject an optimization when the gain disappears end to end, a typical workload regresses materially, complexity outweighs a small gain, or cancellation, retention, or durability cannot be explained and tested. Record the rejected hypothesis briefly instead of expanding scope to justify it.

## Deliver a bounded, reviewable result

Record durable rationale, calibration, exclusions, and remaining risks in an Agent Note (see [agent-notes](../agent-notes/SKILL.md)). Check relevant notes for supersession without turning performance work into a corpus-wide prose cleanup. Keep the reusable procedure here and scenario-specific truth with its benchmark or module owner.

When the task requests layered pull requests, choose the layers before editing and give each its own worktree (see `stacked-prs` when installed). Keep each layer mergeable: benchmark infrastructure protects the measured baseline; the optimization carries its fix, functional coverage, and tighter budget. Independent bottlenecks may use separate stacks. Fix a finding in its owning layer before propagating upward.

Apply [pre-push-checks](../pre-push-checks/SKILL.md), report only executed evidence, and inspect CI results; local timing does not prove runner stability. After marking the pull request ready, evaluate review findings against code and executable evidence, reply with the reason or the fix, resolve addressed threads, and do not dismiss a report merely because it came from a bot. Summarize each result as: workload, before and after absolute values and ratio, endpoint and memory semantics, behavior evidence, negative control, exact checks, exclusions. Separate historical numbers, fresh local measurements, and CI evidence. Stop at the agreed scope and keep a short ranked follow-up list.
