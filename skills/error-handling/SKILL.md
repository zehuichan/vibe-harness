---
name: error-handling
description: Apply error-handling principles when designing or reviewing failures, recovery, retries, background tasks, and user-visible error reports.
---

# Error handling

Define failures, their owners, and what remains safe after failure. This is guidance, not a checklist.

## Typed, structured failures

Expected failures need declared types, stable discriminants, and handling-relevant details. Reuse the project's error conventions, preserve causes, and separate machine identity from display text. Never route handling by parsing messages. Unexpected defects, such as an exhaustiveness check failing, may remain plain errors; containment must never turn them into success.

## Catch, recover, or stop

For each failure, define the handling and reporting owners, containment, and guarantees in the owning API documentation: which invariants remain valid, whether effects are absent, partial, committed, or unknown, and who is responsible for cleanup. Background work keeps these obligations.

Catching limits exception propagation, not mutations. Only the owner of the affected state can establish safe continuation. Otherwise stop dependent work, discard invalid state or instances, or escalate. Logging alone is not recovery. Retries require safe repetition, cancellation, and an explicit owner; finite operations need budgets, while continuing supervision needs lifecycle ownership and observable degradation.

## Localized, actionable, visible reports

Every final report needs a readable summary, the affected operation, and a safe next action. Localize through the receiving application's locale mechanism where one exists; other diagnostics use their existing output language. Keep sensitive internal details out of user-facing text.

Untrusted state or unknown outcomes must be visible through the UI or default-enabled, accessible logs: report the impact, the uncertainty, what the system did, and the safe next step. Persistent invalid state needs persistent visibility. Never claim success, rollback, or safe retry without the guarantees behind them. Reporting failures need an independent fallback.

Verify the resulting state and the visible outcome, not merely that an exception was caught.

## Foundations

Meyer, *Object-Oriented Software Construction* (1997): contracts and invariants. Sutter, *Exceptional C++* (1999): exception-safety guarantees. Armstrong, [Making reliable distributed systems in the presence of software errors](https://www.erlang.org/download/armstrong_thesis_2003.pdf) (2003): isolation and supervision.
