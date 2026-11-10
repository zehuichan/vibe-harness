# General defensive patterns

Each pattern below is a class of defect that ships easily in asynchronous, long-lived, or plugin-based software, stated as the rule that prevents it. Read this page before writing lifecycle, concurrency, subprocess, or teardown code. Examples use TypeScript; the rules are language-independent.

## Report orthogonal outcomes independently

A result can be several things at once: a process can time out and still exit 0 because it trapped the signal. Surface each independent fact (`timedOut`, `signal`, `exitCode`) on its own; never nest one flag's report inside another's branch, or a caller reads a cut-short run as a clean success.

The judged condition: can each fact be true independently, and is each one readable without entering another condition's branch? The rule binds the report; how the process is signalled or how long it is given is a separate decision.

## Honor public contracts on both sides

When an implementation receives several representations of one outcome (a thrown error, an error event, an error-typed result), normalize them before returning through the public API, and document the normalized contract where the type is defined. Defects in middleware or in the consumer's own code remain thrown. This keeps consumers from guessing whether a caught exception came from the provider, a wrapper, logging, or their own assembly. Exercise every source form through the real consumer.

The judged condition: can a consumer name the source of a failure from the public API alone? Internal helpers may still throw; the requirement binds the boundary the consumer crosses, not every function behind it.

## Async state is not synchronous state

A shared `running` flag, an `idle` event, or a stream `close` does not describe the completion of one specific unit of work when several units share the interval, or when cancellation or disposal can discard queued work; a `close` may fire for both end of input and disposal. Never treat a whole-component state transition as the result of one request. A caller that truly owns a run defines its interval explicitly (for example, from its request's durable receipt through the next whole-component `idle`) and describes its output as interval-wide rather than causally attributed to that request. The guard cuts both ways: if the awaited transition can never occur, the wait hangs, so handle the "nothing to wait for" branch explicitly.

The judged condition: does code observe a per-unit completion that the API does not define? Where the interval genuinely belongs to the caller, the caller states the interval and the output scope; a shared `running` flag is never that statement.

## Timing does not carry correctness

Correctness comes from explicit call points and explicit state, never from where a callback lands in the event loop. A microtask or zero-delay timer that decides whether work is correct races the rest of the program: it holds under light load and fails under a busy one or when batching changes. UI effects follow the same rule: an effect never supplies a "just after render" ordering that the design should have made explicit.

The judged condition: does correctness depend on "that callback already ran" instead of on a named call point or state machine? Two boundaries: a test's timeout budget waits for a failure and is not timing-dependent correctness, and a deliberate delay that only paces user-visible work is outside this rule. There is no developer-side exception; a genuine need for a timing technique goes to the domain owner.

```ts
// The order is written into the code: dispose the old store, then build its successor.
store.dispose()
store = createStore(scopeKey)
```

```ts
queueMicrotask(() => { if (!ready) refresh() })   // wrong: assumes the microtask runs before the next frame
setTimeout(() => setMounted(true), 0)             // wrong: waits for a render that was never sequenced
```

The wrong form fails intermittently: a dropped refresh or a state that never syncs, reproducing only under load.

## Optional inputs state both behaviors

An optional parameter states what the callee does when it is present and when it is absent, so a caller reads both behaviors from the contract instead of inferring one from a defensive operator. Accumulating optional chaining is the signal: each `?.` can substitute for a decision about whether the field should exist at all.

The judged condition: does `?.` replace a determination that a field exists, rather than handling a genuinely optional hop on a known value? The requirement binds the interface contract: both branches state their return value and their side effects, and the contract is where the caller reads them. There is no exception channel; a call site that cannot state both behaviors is a review blocker, not a style preference.

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

The wrong form keeps the contract vague and swallows the error, so the next caller adds another fallback on top.

## One value states one fact

An unknown value, an empty collection or string, and a genuinely absent field are three different facts with three representations. One `undefined` or `null` never stands for several of them; a consumer that must act differently on each discriminates explicitly instead of collapsing them at the boundary.

The judged condition: does a single "no value" carry more than one meaning (not yet queried, queried and empty, cannot be determined)? A discriminated union or an explicit enum value is the ordinary implementation, documented where the type is defined.

```ts
type ValueState<T> = { kind: 'unknown' } | { kind: 'empty' } | { kind: 'value'; value: T }
```

```ts
return null   // wrong: means "not queried", "queried, nothing there", and "cannot tell", all at once
```

The wrong form leaves the caller unable to distinguish the cases, so UI states, cache policy, and retry decisions all go wrong.

## No new global "current" singleton

Do not introduce a global `active` or `current` selection, and migrate existing ones out. Several views of one piece of data each hold their own reference or key. There is no default exception; where a concept genuinely exists once per service, a service or instance field carries it, never a module-level variable.

The judged condition: does the change introduce a globally unique selected-state field?

```ts
let activeTabId: TabId | undefined   // wrong: module-level; every component reads the same one
```

The wrong form makes independent instances interfere with each other, and no reviewer can audit which view owns the focus.

## Shared state has one owner

Shared state hangs on a service or an instance, so its owner is a named object with a lifecycle. A module-level cache, a singleton, a global weak map, or a `Symbol.for` or `globalThis` property hides that owner and outlives every teardown.

The judged condition: name the service or instance that owns the value. If no owner can be named, decide the owner before implementing. Any number of consumers may read a field on that service or instance, and passing the value across modules goes through the owner's existing interface rather than a global namespace. There is no default exception; a genuine need for a global lookup key goes to the domain owner together with its reclamation policy.

```ts
globalThis.__appCache = new Map()   // wrong: shared across instances, never reclaimed
```

The wrong form lets instances overwrite each other, makes reclamation timing unknowable, and leaks state between tests.

## A business capability owns itself

A business capability lives in its own module and attaches through a registration point: a registry, a slot, a hook chain, or an event subscription. A runtime, controller, manager, or gateway carries generic orchestration: it may hold the registry structure and the disposal lifecycle, while the owning modules write the entries, and it never hardcodes a central table of business cases.

Establish whether a new distinction, field, or adapter is needed before choosing its owner; moving an unnecessary concept does not remove its maintenance cost. For required behavior, prefer an existing extension point near its producer or consumer when the local implementation adds little complexity: a producer extends a shared type or registry from its own module, without editing the module that declares it. Obligations common to all consumers belong in the shared owner.

The judged condition: does the capability register itself, with the central layer only forwarding and managing lifetime rather than making business decisions? One exception: pure infrastructure (logging, transport, storage) does not attach through a business registration point. A new branch in a central layer must explain why it cannot live in the owning module.

```ts
if (pluginName === 'attachments') { /* wrong: business branch inside the manager */ }
```

The wrong form makes every new capability edit the central layer, which becomes the change bottleneck and the conflict hotspot.

## Changes carry performance evidence

A change that can move the cost of a hot path measures the changed path before and after (runtime, peak memory, steady-state memory) in one environment on one input, and reports the numbers with their conditions. "Nothing got slower overall" is not evidence, and a faster path elsewhere does not excuse a regression here.

The judged condition: under one environment and one input, any of the three metrics is significantly worse on the changed path.

The baseline is the same path without the change under measurement, normally the implementation that carries no measurement hook, not the previous implementation. Comparing old against new with the same hook attached on both sides dilutes the difference: both sides pay the same overhead, so the measurement reports "no change" while both are slow. Run the profile's `commands.bench` scenario that owns the path before and after, and record the command, the numbers, the environment, and the input size so the baseline can be rebuilt. Diagnostics for one module stay beside that module and outside `commands.bench`.

A CI benchmark is an alert, not a pass: a green result does not prove neutrality for a path it does not model, and a red one is located by rerunning the owning scenario and profiling its segments locally to find which part slowed and which change introduced it. A retained-memory claim reruns under a memory cap with swap disabled and an unchanged budget. Edits that touch no runtime path (comments, documentation, test-only code) need no measurement. Production performance code (chunk scheduling, yielding, timing that drives batching) is not benchmark instrumentation to delete opportunistically. An architectural change that genuinely costs performance states the measured cost and the reason, and the domain owner approves it; "the layering needed it" is not a self-service reason.

```text
CI benchmark reported green, so the change is accepted as performance-neutral.
```

That form ships a real regression in a path the benchmark does not model. See the [`perf-evidence`](../../.agents/skills/perf-evidence/SKILL.md) skill.

## Migrations preserve behavior

A migration or module split keeps externally observable behavior equal: error codes, diagnostics, data-flow order, and UI timing are compared item by item. Moving code is preferred over deleting and rewriting it; a rewrite suits code whose semantics are changing anyway, and then the change lists its differences. A module or export-path change is a carrier change rather than a behavior change, and a behavior change is its own change.

The judged condition is the item-by-item comparison of observable behavior before and after. Where full equality is impossible, the change lists each difference and how it is verified, and the domain owner approves it. A defect found during a migration is fixed as its own change instead of folded into the move.

```ts
// wrong: the migration silently changes the error handling it was only supposed to move.
throw new EndpointError('not found')   // was: return { ok: false, code: 'not_found' }
```

The wrong form buries behavior changes inside a move, so review cannot separate the relocation from the semantics and regressions cannot be localized.

## Dispose must reach quiescence, not just request it

Await child exit after killing or aborting, await server close, and await worker termination. Optional notifications may stop early; resources and listeners needed for completion or final persistence survive until consumers settle. See the [`lifecycle-review`](../../.agents/skills/lifecycle-review/SKILL.md) skill.

The judged condition: does teardown await actual quiescence or only request it? Detached, unobserved work with no owner to await is outside the rule; anything the component started and can still observe is awaited before teardown reports completion.

## Contain callback exceptions in the dispatcher

Catch and report each listener's exception without rejecting the dispatch or starving later listeners. The listener's owner must still handle state it mutated, under the [`error-handling`](../../.agents/skills/error-handling/SKILL.md) rules; catching alone does not restore state.

The judged condition: can a throwing listener reject the dispatch or prevent later listeners from running? An error the dispatcher deliberately propagates to the operation that requested it is not a containment failure.

```ts
async function dispatch(listeners: ((event: string) => Promise<void>)[], event: string): Promise<void> {
  for (const listener of listeners) {
    try { await listener(event) } catch (error) { console.warn('listener failed', error) }
  }
}
```

## Never hand untrusted output the ambient environment or predictable paths

Spawned commands get a scrubbed environment (drop names containing `KEY`, `SECRET`, `TOKEN`, or `PASSWORD`) so credentials cannot leak into output, environment dumps, or spill files. Temporary and spill files use a private directory (mode `0700`), random names, and exclusive owner-only creation (`'wx'` with mode `0o600`); predictable world-readable paths invite symlink races and disclosure.

The judged condition: does a spawned process inherit the ambient environment, or write somewhere another process can predict and replace? Trusted in-process code with no external input is outside the rule.

## Unlink link-shaped paths

Remove a path that may be a symlink or Windows junction by checking `lstat().isSymbolicLink()` and calling `unlink`: unlink deletes only the link, refuses a real directory, and never follows the link into its target. On Windows, Node's non-recursive `rmSync(link)` throws `ERR_FS_EISDIR` on a junction, and recursive removal may descend through a junction into its target. Reserve recursive removal for known real directories.

The judged condition: can the removal primitive follow a link into its target? A path the code created itself in a directory it owns, where plain recursive removal is already known to be safe, is outside the rule.
