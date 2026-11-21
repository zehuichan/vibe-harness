---
name: code-style
description: Use when writing, refactoring, or reviewing source code. One principle - put state and ownership into types and structure instead of relying on timing, convention, or defensive code - applied as replacements - tagged unions and request-to-spec types instead of flag combinations and hidden defaults; owner objects, disposers, finally blocks, and single commit points instead of ordering assumptions; boundary validation and coded failures instead of scattered checks and silent fallbacks.
---

# Code style

**Put state and ownership into types and structure, instead of relying on timing, convention, or defensive code.**

Code that relies on timing works only while events arrive in the order the author pictured. Code that relies on convention works only while every caller remembers an unwritten rule. Defensive code checks again for states the design should have made impossible, and hides which values are actually untrusted. All three move correctness out of the code and into the reader's memory. The structural form makes the wrong state impossible to write, the cleanup impossible to forget, and the check unnecessary.

The formatter and linter (the profile's `commands.format` and `commands.lint`) own layout. Examples use TypeScript; express the same structure in the project's language with tagged enums, sealed classes, context managers, `defer`, or `using`. Project rules outside this skill take precedence, and inside an existing module, match the established idiom; propose a migration separately.

## Recognize the three substitutes

Stop when you are about to write one of the forms on the left, and use the structure on the right.

| Relies on | Smell | Structure instead |
|---|---|---|
| Convention | Booleans and optional fields that are valid only in certain combinations | A tagged union whose variants carry exactly their data (§1) |
| Convention | `?? default` inside the operation; callers must know which fields get filled | A request type, a complete spec type, and an explicit `resolve` (§1) |
| Convention | "Remember to call `stop()`" | Registration returns its disposer; an owner disposes it (§2) |
| Convention | One sentinel (`null`, `-1`, `''`) meaning several things | Distinct types or documented distinct absences (§1) |
| Timing | Cleanup at the end of the happy path | `finally`, or a scope-bound resource (§2) |
| Timing | Abort without awaiting; "it will be done by then" | An owner that aborts, then awaits settlement (§2) |
| Timing | State assigned in several places, notifications sent before success | One commit function that publishes after the change succeeds (§2) |
| Timing | A second copy of a value kept in sync by watchers or callbacks | One source, with every other view derived from it (§2) |
| Defensive code | Runtime checks for values the static type already guarantees | Trust the type; validate once where trust changes (§3) |
| Defensive code | `catch` that continues, fallback that hides a missing referent | Coded failure, contained at one boundary that reports it (§3) |
| Defensive code | Checks repeated in every helper | Parse into a typed value at the boundary; helpers take the typed value (§3) |

## 1. Write state into types

**Make invalid states unrepresentable.** Represent a value that moves through phases as a union tagged by one `kind` field. Data that exists only in one phase lives only in that variant.

```ts
// Convention: four fields admit sixteen combinations; readers must know which are legal.
interface Runner { running: boolean; abort?: AbortController; turn?: number; lastTurn: number }

// Structure: each phase carries exactly the data it owns.
type Phase =
  | { kind: 'idle'; lastTurn: number }
  | { kind: 'running'; abort: AbortController; turn: number; wakeRequested: boolean }
```

Return values follow the same rule: `{ kind: 'reject' } | { kind: 'enter'; messages: Message[] }`, or `{ ok: true; value } | { ok: false; error }` when the caller is expected to branch on an anticipated failure.

**Make every case handled.** Switch on the tag. A closed union ends in an exhaustiveness helper, so adding a variant fails to compile at every switch that missed it. An extensible union (one other modules may widen) ends in a documented default.

```ts
/** Mark an unreachable closed-union branch; an unhandled variant fails to compile at the call site. */
export function assertNever(value: never, context?: string): never {
  throw new Error(`unreachable variant${context ? ` in ${context}` : ''}: ${JSON.stringify(value)}`)
}
```

**Give each absence one meaning.** A common split: `undefined` means not yet known (loading, or the capability is absent) and `null` means known to be empty. Document the meaning on the field. When two absences need different handling, they need different representations.

**Write defaults into a type change.** When an operation has defaults, caps, or derived fields, the caller's request type has optional fields and the operation's spec type has none. The implementation owns an explicit `resolve(request): Spec`; `execute(spec)` cannot apply a default because there is nothing left to default.

```ts
interface ExecRequest { command: string; workdir?: string; timeoutMs?: number }
interface ExecSpec { command: string; workdir: string; timeoutMs: number }

resolve(request: ExecRequest): ExecSpec {
  return {
    command: request.command,
    workdir: request.workdir ?? this.config.workdir,
    timeoutMs: Math.min(request.timeoutMs ?? this.config.timeoutMs, this.config.maxTimeoutMs),
  }
}
```

Defaults become testable without running the operation, and a logged spec reproduces the run.

**Write the remaining rules into types too.**

- Opaque identifiers that cross module, process, or wire boundaries get distinct branded types, so a session id cannot be passed where a tool-call id is expected.
- Interface fields are `readonly`; parameters take `readonly T[]` and `ReadonlySet<T>` unless mutation is the contract. Shared snapshots are frozen or replaced whole rather than patched.
- Lookup tables are `as const satisfies Record<Key, Value>`, so a missing or misspelled key fails to compile.
- Units live in names (`timeoutMs`, `maxResponseBytes`), so a mismatch is visible at the call site.

## 2. Write ownership into structure

**Every piece of asynchronous work has an owner whose lifetime bounds it.** The owner can cancel the work and wait for it to stop. Disposal is a sequence: stop admitting, abort, await settlement.

```ts
class Translator {
  private readonly lifetime = new AbortController()
  private readonly pending = new Set<Promise<void>>()

  async dispose(): Promise<void> {
    this.lifetime.abort(new Error('Translator disposed'))
    await Promise.allSettled(this.pending)
  }

  /** Combine the caller's cancellation with this owner's lifetime. */
  private signal(caller?: AbortSignal): AbortSignal {
    this.lifetime.signal.throwIfAborted()
    return caller === undefined ? this.lifetime.signal : AbortSignal.any([caller, this.lifetime.signal])
  }

  private track(work: Promise<unknown>): void {
    const settled = work.then(() => {}, () => {})
    this.pending.add(settled)
    void settled.then(() => { this.pending.delete(settled) })
  }
}
```

- Every registration returns its disposer (`track(x)` returns `() => { set.delete(x) }`), and the owner that registered it holds the disposer. Callers never need to remember a matching `stop()`.
- When several tasks need coordinated teardown, give them one small owner class, private to the module, instead of spreading flags across the caller.
- No module-level mutable state, singleton, or global cache: a value without an owner has no defined lifetime. [lifecycle-review](../lifecycle-review/SKILL.md) audits this.

**Cleanup lives in structure, not at the end of the happy path.** Release resources in `finally`, or in a scope-bound resource, so every exit path runs it. A record that must close what it opened (an end event, an unlock, a dispose) is written in `finally`.

```ts
const toolSet = await this.tools.resolve(request)
try {
  return await this.runStep(toolSet)
} finally {
  toolSet.dispose()
}
```

**Cancellation is checked where it matters, not assumed.** Check after every `await` that precedes a side effect (`signal.throwIfAborted()`). When racing an operation against an abort, remove the listener in `finally`, and release a value that arrives after cancellation (close the handle, dispose the resource) instead of dropping it. Fire-and-forget is explicit: `void promise`, with the rejection handled or deliberately contained.

**State changes at one commit point.** Assign phased state in one function, and publish a notification only from there, only when the externally visible value changes, and only after the operation succeeded:

```ts
private setPhase(next: Phase): void {
  const previous = this.status
  this.phase = next
  if (this.status !== previous) this.emit('status', { status: this.status })
}
```

**A fact has one source.** Durable state that several readers need is folded from one authoritative record (an event log, a persisted snapshot) by a pure reducer: `init()` plus `apply(state, event)`. Caches, UI state, prompts, and query views derive from it and keep no second writable copy, so no ordering of updates can make them disagree.

**When order genuinely matters, write it down as structure.** If correctness depends on one step finishing before another, express it as an `await`, a composed owner that disposes its children before releasing their resources, or a value captured before the call that could change it. Then state the constraint at that line (§4).

## 3. Replace defensive code with boundaries

**Trust the type inside the process.** At typed same-process boundaries, do not add runtime checks, fallbacks, or hostile-input tests for values the static interface already guarantees. A check for an impossible state tells the next reader that the state is possible.

**Validate once where trust changes.** At parsers, configuration, files, queues, worker and process messages, network payloads, and model or tool JSON, parse into a typed value and fail closed. Helpers downstream take the typed value and never re-check it. For untrusted nested input, prefer iterative traversal with an explicit stack to recursion, and reject values that cannot round-trip (non-finite numbers, cycles, forged prototypes) when losslessness matters.

**Fail loudly instead of falling back.** Misconfiguration fails at load when it is self-contained, otherwise at the earliest point it can be resolved. A missing referent is an error, never a silent skip. [error-handling](../error-handling/SKILL.md) owns failure classification; the structural rules are:

- Error classes carry machine data: a stable domain-prefixed `UPPER_SNAKE_CASE` `code`, plus any committed partial result the caller needs (`readonly partial`). Callers branch on `code`, never on `message`.
- Messages name the specific object and the next action: `agent "${id}" has no model: set options.model or record a model selection`.
- Concurrent failures are collected and reported together: rethrow one unchanged, wrap several in an `AggregateError`. A failed recovery keeps the original as its cause: `new AggregateError([error, recoveryError], 'Step failed and recovery failed', { cause: error })`.
- Containment happens at one boundary (a driver loop, a request handler) that reports the failure. Helpers below it propagate; they do not catch and continue.

## 4. Write what a type cannot carry at the declaration

Some obligations do not fit in a type signature. Write them once, where every implementer and caller reads them, rather than leaving them to convention.

- A capability is one interface or abstract class whose documentation lists, as bullets, the semantics every implementation must honor: which conditions reject and which resolve with a descriptive result, when a handle becomes valid, how cancellation behaves, what teardown does with running work.

  ```ts
  /**
   * Command execution. Implementations must honor these semantics:
   * - `result` rejects only for infrastructure failures; nonzero exits, timeouts, and aborts
   *   resolve with a result that names the first cause.
   * - The handle is published after preparation; `done` settles at process close and never rejects.
   * - A still-running process is stopped and awaited when its owner is disposed.
   */
  export abstract class CommandExecutor {
    abstract resolve(request: ExecRequest): ExecSpec
    abstract execute(spec: ExecSpec): Promise<Execution>
  }
  ```

- Every optional field states what its absence means: "Undefined uses the executor's configured limit", "absent means no stdin".
- A timing constraint that structure cannot remove is stated at the line that depends on it:

  ```ts
  // Captured before the insertion so a reentrant cancel from an observer cannot reclassify it.
  const wakingAfterAbort = wakeup && this.phase.kind !== 'idle' && this.phase.abort.signal.aborted
  ```

- A coverage exclusion for an unreachable branch carries its reason, in the syntax the project's coverage tool uses.

Comments state constraints; they do not narrate the next line or argue the change is correct ([prose-standard](../prose-standard/SKILL.md)).

## 5. Supporting habits

These keep the structure readable.

- **Small pure helpers named for their result.** Logic lives in module-private functions; classes hold state and lifecycle only. A helper's one-line doc begins with what it returns or does ("Whether…", "Read…", "Reject…"), and its name states its result (`requestProposal`, `abortedCancelCause`), not its mechanics.
- **Guard clauses.** Return early for the exceptional cases so the main path stays flat.
- **Exact object construction.** Remove keys with rest destructuring instead of `delete`; add an optional field with `...(value === undefined ? {} : { value })` instead of assigning `undefined`, which serializers, equality checks, and exact optional property types treat differently.
- **Names by domain and role.** Events are `domain/action` (`turn/start`); predicates read as questions (`isActive`, `hasPending`); derived values are getters or computed properties; parallel values get parallel names, and unexplained asymmetry usually signals a missed extraction.
- **Tests through the real composition.** Replace only the outermost expensive or nondeterministic boundary (network, model provider, clock), and assert durable, visible, or emitted output rather than internal calls ([test-reliability](../test-reliability/SKILL.md)).

## Review questions

Ask these of every change; each "yes" names the structure to introduce.

1. Can a combination of fields express a state that should not exist? → Tagged union.
2. Does a switch over a closed set lack an exhaustiveness check? → `assertNever`.
3. Does one value stand for two different absences? → Separate representations.
4. Is a default applied inside the operation, or must a caller know which fields get filled? → Request, spec, `resolve`.
5. Must a caller remember to stop, close, or unregister something? → Return a disposer; give it an owner.
6. Does any work outlive the object that started it, or does disposal return before work stops? → Owner that aborts and awaits.
7. Does cleanup run only on the success path? → `finally`.
8. Is state assigned or announced in more than one place, or before success? → One commit point.
9. Is a value copied and kept in sync? → Derive it from one source.
10. Does the code check a value its type already guarantees, or check the same input twice? → Trust the type; validate once at the boundary.
11. Does a `catch` continue or a fallback hide a missing referent? → Coded failure, contained at one boundary.
12. Is there an obligation every implementer must honor that is written nowhere? → Document it at the declaration.
