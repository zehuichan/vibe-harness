# Simplification patterns

Use these patterns to calibrate a candidate whose value an unused-symbol search does not establish. They describe recurring decision shapes, not current removal opportunities. Verify current owners and persisted-data obligations before applying one.

## Require a complete effect path

A declaration, a serializer branch, and a test can look like support for a feature that has no effect. Trace both ends: something must produce the value, and an implementation must honor it.

- **Producerless variants:** a reserved union member or cache hint that nothing emits can go, with its declarations, forwarding, rejection-only tests, and generated documentation.
- **Inert request options:** an option every backend rejects is removable; a working option available to hooks is not, even if no built-in caller sets it.

Zero in-repository callers is weaker evidence than unreachability. A deliberate third-party registration path stays; inspect generic invocation paths before calling a catalogued service dead. A working extension point and a field no provider can honor need different verdicts.

## Reduce distinctions where consumers decide

Map every public variant to the consumer action it enables. If a consumer can do only one useful thing, project several internal states onto one public status while internal routing keeps the detail. Two approximate capability registries can often be replaced by one truthful conditional statement, deleting registration methods, disposal state, invalidation, and combination tests.

Do not erase distinct durable facts because one renderer ignores them. Explicit start and completion records may be needed for empty failed steps, crash repair, and inspection. Simplify the projection only when the underlying distinction stays available.

## Trade general behavior for a smaller explicit promise

A used feature can still be an expensive way to deliver the required outcome. Fixed-rate scheduling instead of calendar recurrence removes a parser, an evaluator, durable variants, and backlog states. Reporting activation failure instead of automatic rollback removes a transaction layer while keeping failure visibility. Moving the generic machinery to another module keeps its cost.

State the loss as clearly as the deletion. A simpler recovery algorithm that discards an unfinished unit of real work is a capability loss, not a cleanup. Convenience, smaller unions, or fewer tests do not justify losing required data or behavior.

## Make assumptions explicit at the consuming operation

Look for a local default that has grown shared storage, synchronization, or confirmation machinery. Requiring an explicit value (a time zone, an encoding, a target) on the operation that consumes it can delete stored defaults and cross-client conflict state. Leaving framing to the caller can remove envelope options threaded through unrelated layers.

Do not move a requirement past the place that must enforce it. Removing duplicate client-side validation is fine while server-side validation still runs before lookup and business logic; document the cost, such as later malformed-input failures.

## Derive at use or reuse an existing delivery owner

For each cache or subscription, ask when the consumer needs the value and whether an authoritative source already retains it. Reading the canonical log at the moment of use can delete a continuously copied buffer and its listeners. Sorting current summaries can replace persisted promotion history. Reusing an existing stream and store can remove feature-specific notifications and a second membership cache.

The timing promise decides whether this works. Use-time redaction differs from capture-time redaction; manual ordering cannot be derived from timestamps; an initial read may remain necessary when the stream has no baseline. Name such residual obligations.

## Remove accidental composition owners

Inspect actual launch and resolution paths before trusting names such as demo, support, or example. Duplicate compositions and pass-through settings can collapse into one base with overlays; a workspace that exists only to resolve dependencies can disappear when its tests and assets move to their owners; a separate control service can merge when deployment policy becomes explicit.

A smaller module count is not sufficient. Separate caller intents may differ in ownership and completion timing, and a retained interface may serve independent providers. Prove the replacement's real composition and account for remaining configuration and lifecycle glue.

## Use rejected experiments to test parity claims

A library replacement can delete generic framing and its conformance tests while keeping a small provider-specific shim, and document any stricter edge behavior. Conversely, a nominally equivalent built-in can defeat deterministic fake-clock tests for a trivial deletion, and generic code is replaceable while configured bounds, security rules, and lifecycle ownership are not.

A past rejection is a scoped falsifier, not a permanent ban. Revisit it only with new evidence addressing the failed premise, and measure implementation, glue, tests, dependencies, and supported behavior together.
