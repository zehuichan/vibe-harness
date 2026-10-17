# General defensive patterns

Each pattern below is a class of defect that ships easily in asynchronous, long-lived, or plugin-based software, stated as the rule that prevents it. Read this page before writing lifecycle, concurrency, subprocess, or teardown code. Examples use TypeScript; the rules are language-independent.

## Report orthogonal outcomes independently

A result can be several things at once: a process can time out and still exit 0 because it trapped the signal. Surface each independent fact (`timedOut`, `signal`, `exitCode`) on its own; never nest one flag's report inside another's branch, or a caller reads a cut-short run as a clean success.

The judged condition: can each fact be true independently, and is each one readable without entering another condition's branch? How the process is signalled or how long it is given is a separate decision.

## Honor public contracts on both sides

When an implementation receives several representations of one outcome (a thrown error, an error event, an error-typed result), normalize them before returning through the public API, and document the normalized contract where the type is defined. Exercise every source form through the real consumer.

The judged condition: can a consumer name the source of a failure from the public API alone? Internal helpers may still throw; the requirement binds the boundary the consumer crosses.

## Async state is not synchronous state

A shared `running` flag, an `idle` event, or a stream `close` does not describe the completion of one specific unit of work when several units share the interval, or when cancellation can discard queued work. Never treat a whole-component state transition as the result of one request. A caller that truly owns a run defines its interval explicitly and describes its output as interval-wide. The guard cuts both ways: if the awaited transition can never occur, the wait hangs, so handle the "nothing to wait for" branch explicitly.

The judged condition: does code observe a per-unit completion that the API does not define?

## Timing does not carry correctness

Correctness comes from explicit call points and explicit state, never from where a callback lands in the event loop. A microtask or zero-delay timer that decides whether work is correct holds under light load and fails under a busy one or when batching changes. UI effects follow the same rule: an effect never supplies a "just after render" ordering that the design should have made explicit.

The judged condition: does correctness depend on "that callback already ran" instead of on a named call point or state machine? A test's timeout budget and a deliberate delay that only paces user-visible work are outside this rule.

```ts
// The order is written into the code: dispose the old store, then build its successor.
store.dispose()
store = createStore(scopeKey)
```

```ts
queueMicrotask(() => { if (!ready) refresh() })   // wrong: assumes the microtask runs before the next frame
setTimeout(() => setMounted(true), 0)             // wrong: waits for a render that was never sequenced
```

## Optional inputs state both behaviors

An optional parameter states what the callee does when it is present and when it is absent, so a caller reads both behaviors from the contract instead of inferring one from a defensive operator. Accumulating optional chaining is the signal: each `?.` can substitute for a decision about whether the field should exist at all.

The judged condition: does `?.` replace a determination that a field exists, rather than handling a genuinely optional hop on a known value?

```ts
// Both behaviors are in the contract: no options means "unknown", not "skip".
function resolve(input: { options?: readonly string[] }): { kind: 'unknown' } | { kind: 'value'; value: string } {
  if (input.options === undefined) return { kind: 'unknown' }
  return { kind: 'value', value: input.options.join(',') }
}
```

```ts
const value = a?.b?.c?.d ?? fallback   // wrong: four layers of fallback hide whether d should exist
```

## One value states one fact

An unknown value, an empty collection, and a genuinely absent field are three different facts with three representations. One `undefined` or `null` never stands for several of them; a consumer that must act differently on each discriminates explicitly.

The judged condition: does a single "no value" carry more than one meaning (not yet queried, queried and empty, cannot be determined)?

```ts
type ValueState<T> = { kind: 'unknown' } | { kind: 'empty' } | { kind: 'value'; value: T }
```

## No new global "current" singleton

Do not introduce a global `active` or `current` selection. Several views of one piece of data each hold their own reference or key. Where a concept genuinely exists once per service, a service or instance field carries it, never a module-level variable.

The judged condition: does the change introduce a globally unique selected-state field?

## Shared state has one owner

Shared state hangs on a service or an instance, so its owner is a named object with a lifecycle. A module-level cache, a singleton, a global weak map, or a `globalThis` property hides that owner and outlives every teardown, leaking state between instances and tests.

The judged condition: name the service or instance that owns the value. If no owner can be named, decide the owner before implementing.

## A business capability owns itself

A business capability lives in its own module and attaches through a registration point: a registry, a slot, a hook chain, or an event subscription. A runtime, controller, manager, or gateway carries generic orchestration and the registry's lifecycle; it never hardcodes a central table of business cases. Pure infrastructure (logging, transport, storage) is exempt.

The judged condition: does the capability register itself, with the central layer only forwarding and managing lifetime? A new branch in a central layer must explain why it cannot live in the owning module.

```ts
if (pluginName === 'attachments') { /* wrong: business branch inside the manager */ }
```

## Changes carry performance evidence

A change that can move the cost of a hot path measures the changed path before and after (runtime, peak memory, steady-state memory) in one environment on one input, and reports the numbers with their conditions. "Nothing got slower overall" is not evidence, and a faster path elsewhere does not excuse a regression here. The baseline is the same path without the change, not an instrumented old version compared with an instrumented new one. Edits that touch no runtime path need no measurement. See the [`perf-evidence`](../../.agents/skills/perf-evidence/SKILL.md) skill.

## Migrations preserve behavior

A migration or module split keeps externally observable behavior equal: error codes, diagnostics, data-flow order, and UI timing are compared item by item. Moving code is preferred over rewriting it. A defect found during a migration is fixed as its own change instead of folded into the move. Where full equality is impossible, the change lists each difference and how it is verified.

## Dispose must reach quiescence, not just request it

Await child exit after killing or aborting, await server close, and await worker termination. Optional notifications may stop early; resources and listeners needed for completion or final persistence survive until consumers settle. See the [`lifecycle-review`](../../.agents/skills/lifecycle-review/SKILL.md) skill.

The judged condition: does teardown await actual quiescence or only request it? Detached, unobserved work with no owner is outside the rule; anything the component started and can still observe is awaited before teardown reports completion.

## Contain callback exceptions in the dispatcher

Catch and report each listener's exception without rejecting the dispatch or starving later listeners. The listener's owner must still handle state it mutated, under the [`error-handling`](../../.agents/skills/error-handling/SKILL.md) rules; catching alone does not restore state.

```ts
async function dispatch(listeners: ((event: string) => Promise<void>)[], event: string): Promise<void> {
  for (const listener of listeners) {
    try { await listener(event) } catch (error) { console.warn('listener failed', error) }
  }
}
```

## Never hand untrusted output the ambient environment or predictable paths

Spawned commands get a scrubbed environment (drop names containing `KEY`, `SECRET`, `TOKEN`, or `PASSWORD`) so credentials cannot leak into output or files. Temporary files use a private directory, random names, and exclusive owner-only creation; predictable world-readable paths invite symlink races and disclosure. Trusted in-process code with no external input is outside the rule.

## Unlink link-shaped paths

Remove a path that may be a symlink or Windows junction by checking `lstat().isSymbolicLink()` and calling `unlink`: unlink deletes only the link and never follows it. Recursive removal may descend through a junction into its target. Reserve recursive removal for known real directories that the code created itself.
