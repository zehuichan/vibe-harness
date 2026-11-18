---
name: error-handling
description: Apply error-handling principles when designing or reviewing failures, error classes and codes, tool failures, recovery, retries, background tasks, and user-visible error reports.
---

# Error handling

Define failures, their owners, and what remains safe after failure.

## Typed, structured failures

Expected failures need declared types, stable discriminants, and handling-relevant details. Reuse the project's error conventions, preserve causes, and separate machine identity from display text. Never route handling by parsing messages. Unexpected defects, such as an exhaustiveness check failing, may remain plain errors; containment must never turn them into success.

An error class that carries a machine code extends the project's coded base error class, which carries `name` and `code` beside `message` and `cause`, directly or through its domain's error class, never the language's bare error type. A project without such a base class declares one before adding its first coded error. Prefer one error class per owning package or domain over a class per failure; a separate class is justified when callers catch it by type or it carries its own structured fields, such as a list of argument violations. `name` is the class name, except for cancellation, and `code` values are stable `UPPER_SNAKE_CASE` strings, usually prefixed by the domain and declared as a union or constants beside the class. A code names the failure class its consumers act on, not the call site; add a code rather than reuse one whose meaning differs. The [error class and code guide](references/error-codes.md) defines class choice, naming, the standard conditions, declaration, foreign-error conversion, and compatibility.

Convert foreign failures where the dependency is owned. Runtime errno, SDK, protocol, native, worker, and cross-realm errors become the owning package's error with the original as `cause`; a foreign numeric or vendor code belongs in the message, not in `code`. Preserve structure across layers: never re-wrap a coded error in a plain error, store only its message for a later rethrow, or drop its `name` and `code` while redacting text. A process or worker boundary transports `name` and `code` and reconstructs the error.

## Tool failures

When the project runs tools for a model or another caller and records their results, the runtime keeps a machine `name` and `code` on the recorded result only when the producer supplies them: a coded error thrown by the tool body, a denial or block from a policy that attaches its own `name` and `code`, or the runtime's own cancellation and timeout results. The runtime's cancellation result also applies to a cancellation reason or cancellation error that the tool body, or a wrapper around the tool's execution, throws after cancellation. Any other thrown value, and a denial or block without them, persist only text that retry policy, UI, and analytics cannot route on. Every expected failure reachable from a tool body therefore throws a coded error, normally the owning domain's class:

- Argument constraints that the parameter schema cannot express, such as an empty string, a range, or a cross-field rule, throw the project's invalid-arguments error.
- Missing composition or caller context, such as an absent agent, service, or open turn, throws a context-unavailable error rather than a generic failure.
- Caller cancellation propagates the cancellation reason or the cancellation error the runtime recognizes, or throws a coded error with the cancellation `name` and code. Never replace it with a different plain error; a failure distinct from the cancellation, such as a cleanup failure, keeps its own class and code.
- Dependency failures follow the conversion rule above; filesystem errno maps to the filesystem domain's codes, such as not found, permission denied, and I/O failure.

A policy that denies a call before it runs, or blocks its result afterward, supplies its own `name` and `code`. A failure the model must not treat as success is an error result; a successful domain outcome in a non-ideal state, such as a non-zero exit or no matches, stays a success value, and a success-shaped failure value is allowed only when the output schema documents it. Tests assert the recorded `name` and `code` for each expected failure path, not only the message.

Recorded `name` and `code` values persist in logs and feed analytics. When the profile enables `surfaces.public-api` and those records are persisted user data or reach consumers outside the repository, renaming or reclassifying one is an externally perceptible change that needs an [upgrade guide](../upgrade-guide/SKILL.md).

## Catch, recover, or stop

For each failure, define the handling and reporting owners, containment, and guarantees in the owning API documentation: which invariants remain valid, whether effects are absent, partial, committed, or unknown, and who is responsible for cleanup. Background work keeps these obligations.

Catching limits exception propagation, not mutations. Only the owner of the affected state can establish safe continuation. Otherwise stop dependent work, discard invalid state or instances, or escalate. Logging alone is not recovery. Retries require safe repetition, cancellation, and an explicit owner; finite operations need budgets, while continuing supervision needs lifecycle ownership and observable degradation.

### Empty catch clauses

An empty `catch` has no statement other than `;` in its block, and it discards every failure its `try` raises. Use one only when every such failure leaves the owner's state valid and no caller could act on it, such as failing to remove a temporary file that nothing reads. A `catch` that logs, reports, rethrows, or returns a fallback is not empty, and the rules below do not apply to it. The rules cover every `try`/`catch` statement in first-party code, including tests. A lint rule or checker can enforce the form; it checks the form, and review checks that the name and the reason are true.

**The `try` holds one statement.** One statement means one syntactic statement, such as one call or one assignment, however many lines it spans; it does not mean one line. With several statements, the reason covers one expected failure while the clause also discards the others, including defects such as a `TypeError`, and a failure in an early statement skips the later ones while the caller sees success:

```ts
// Rejected: three statements in one try.
try {
  await unlink(tempFile)
  registry.delete(id)
  emit('removed', id)
} catch (_cleanupFailed) {
  // A leftover temporary file holds no state anything reads.
}

// Accepted: only the unlink failure is discarded.
try {
  await unlink(tempFile)
} catch (_cleanupFailed) {
  // A leftover temporary file holds no state anything reads.
}
registry.delete(id)
emit('removed', id)
```

When several statements each tolerate a failure, give each its own `try` and reason. A syntactic count treats one block or one compound statement, such as one `if`, as one statement; review rejects such a `try` when it contains several operations.

**The binding names the expected failure.** Write `catch (_cleanupFailed)`, not `catch {}` or `catch (_)`. Where lint requires an unused binding to start with `_`, keep the prefix; a bare `_` names nothing.

**A comment states why discarding the failure is safe.** Put it in the `catch` block or after the clause's closing `}` on the same line. A comment inside the `try` block or above `try` does not count. `// ignore` and `// expected` restate the empty block; say which failure is expected and why the state stays valid.

**Accept only some failures by testing them.** When only some failures are safe, such as a missing file while a permission error must still surface, write a non-empty `catch` that tests `code` or `name` and rethrows the rest; the empty-catch rules do not apply to such a clause.

```ts
try {
  await unlink(tempFile)
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
}
```

## Localized, actionable, visible reports

Every final report needs a readable summary, the affected operation, and a safe next action. Localize through the receiving application's locale mechanism where one exists; other diagnostics use their existing output language. Keep sensitive internal details out of user-facing text.

Untrusted state or unknown outcomes must be visible through the UI or default-enabled, accessible logs: report the impact, the uncertainty, what the system did, and the safe next step. Persistent invalid state needs persistent visibility. Never claim success, rollback, or safe retry without the guarantees behind them. Reporting failures need an independent fallback.

Verify the resulting state and the visible outcome, not merely that an exception was caught.

## Foundations

Meyer, *Object-Oriented Software Construction* (1997): contracts and invariants. Sutter, *Exceptional C++* (1999): exception-safety guarantees. Armstrong, [Making reliable distributed systems in the presence of software errors](https://www.erlang.org/download/armstrong_thesis_2003.pdf) (2003): isolation and supervision.
