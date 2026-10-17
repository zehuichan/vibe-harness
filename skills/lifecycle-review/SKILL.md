---
name: lifecycle-review
description: Use during code review or focused audits of plugins, services, components, and other code with an explicit lifecycle (setup, registration, disposal, hot reload). Checks singleton state, unreversed side effects, and cleanup dependencies released before consumers finish; reports substantiated P0 findings with ownership evidence and deterministic verification.
---

# Ownership and lifecycle review

A focused semantic review of who owns each piece of state and each side effect, and whether teardown really completes. Start from the entry points the lifecycle framework invokes (plugin `apply` or activation functions, service constructors, component mount hooks, server startup), then trace module initialization, registered services, listeners, effects, disposers, and the calls reachable from those roots. Exclude unrelated helpers, build tools, and tests as finding targets, but read tests and the framework's implementation to establish behavior. Do not report defects in vendored code.

## Sources of truth

- `AGENTS.md` and `docs/defensive-patterns/general.md`: shared-state ownership, quiescent disposal, and callback containment.
- The lifecycle framework's documentation and source: how it orders setup and disposal, and whether sibling disposers run concurrently.

## Review workflow

1. Locate mutable owners, registrations, resource acquisition, and work admission reachable from the requested roots. For large scopes, scan directories independently, then consolidate findings involving the same consumer and resource.
2. Trace ownership through the actual context: identify who owns each effect and which disposer releases it. A method called on a shared service may run under the caller's scope, not the service's.
3. Trace cleanup through every await to its last service call, emitted event, acknowledged operation, and durable write, including indirect event delivery and cleanup performed after abort, kill, or cancellation.
4. Compare consumer completion with the moment each required listener, registry, writer, connection, or transport becomes unusable. Inspect the framework's implementation: reverse start order and declared dependencies alone do not establish completion order.
5. Establish a legal failing interleaving and its observable impact. Check existing cancellation, explicit sequencing, and documented discard semantics before reporting. Use controlled promises for reproduction where feasible, and label source-only findings as such.

## P0: singleton state

Flag one process-wide instance or mutable state owner whose identity or lifetime comes from module loading, a static field, a global symbol, a hidden cache, or a `getInstance()` accessor. Weak keys, size bounds, generation checks, and memoization do not give a module-level cache an owner.

Exclude immutable constants, frozen tables, stateless functions, and objects allocated inside an explicitly scoped owner. Recommend a service or instance owned by the lifecycle framework, with declared consumer dependencies; use a scoped context or a service-owned keyed record for narrower lifetimes.

## P0: unreversed side effect

Flag an owner that leaves a live effect behind after disposal: listeners, registrations, timers, watchers, child tasks, processes, connections, temporary files, subscriptions, monkey patches, or asynchronous work. Aborting or killing without awaiting settlement is a violation when cleanup can return before owned work stops.

Registrations made through the framework's own scoped registration API are already reversed; callers need not retain their disposers. Unmanaged resources need an owned effect or explicit awaited cleanup. Do not demand rollback of intentional durable writes or remote mutations; the temporary and live resources those operations use still need owners.

## P0: cleanup dependency released before consumer completion

Any service call or event delivery required to finish cleanup is a lifecycle dependency. Keep its resources and listeners usable until the consumer has settled, including final result publication and durable writes. A provider's disposal finishing after its consumers' does not prove its resources survived their cleanup: many frameworks start sibling disposers concurrently, and declaring a dependency, reversing registration order, or holding a reference does not fix that race.

Require explicit ownership and awaited sequencing:

1. Stop admission of new work; scope rejection of new requests separately from completion of accepted ones.
2. Settle admitted consumers while their dependencies remain usable.
3. Drain and release the resources.

Express that order with one composed owner (a parent that awaits its consumer children before releasing resources, or a single disposal function that yields the exact disposers it captured), and verify the actual captured disposer identities: wrapping an independently registered disposer does not transfer ownership of the original. Check failure paths too: one cleanup error must not skip required abort, settlement, or release.

Do not report a missing dependency declaration alone, a merely possible late call with no reachable consumer, or intentional suppression of optional notifications. Required persistence and completion observers are not optional notifications.

For a regression test: pause the consumer immediately before its last dependency use, start provider or enclosing-owner disposal, verify the resource and required listeners remain usable, then release the consumer. Assert its actual terminal result and durable output, and assert that disposal stays pending until completion. Cover provider unload or replacement as well as consumer-only cleanup; call counts and idle happy-path disposal are insufficient.

## Reporting

Report only substantiated P0 violations of the three rules. Give a tight source location, the lifecycle root, the consumer and resource owner, the failing interleaving, the observable impact, the correction, and a deterministic acceptance test. Consolidate multiple locations implementing one failure. State the inspected scope, rejected candidates, and reproduction limits; do not claim exhaustive safety from a pattern search. If no violations are established, say that no P0 violations were found in the inspected scope and name any material evidence gaps.

If asked to record unresolved findings, use proposed Agent Notes (see [agent-notes](../agent-notes/SKILL.md)); otherwise return the findings directly.
