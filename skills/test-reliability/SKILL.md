---
name: test-reliability
description: Design, review, and diagnose tests and fixtures that can fail nondeterministically under CI concurrency, shared host resources, clocks, process-global state, subprocesses, network listeners, or asynchronous teardown. Use when adding or changing tests with those risks, investigating flaky CI, or reviewing test isolation; use pre-push-checks separately to select outgoing commands.
---

# Reliable tests under real CI topology

Build tests that remain correct under the project's real CI topology, not only when run alone on a quiet workstation. This skill owns isolation and reliability decisions; it does not replace the project's test-tier policy or select every command for a push. It is guidance, not a checklist.

## Read the owning rules

- The project profile (`.agents/project-profile.md`) for test commands and the evidence each surface requires.
- `docs/defensive-patterns/` for lifecycle, subprocess, cancellation, and teardown behavior.
- The active test-runner configuration and CI workflow when their worker or job topology affects the test.
- [pre-push-checks](../pre-push-checks/SKILL.md), after the test design is sound, to select outgoing validation.

## Model the execution topology

Assume these layers can overlap unless the active configuration proves otherwise:

1. Tests in one file.
2. Separate test files or worker processes.
3. Independent test-runner or check processes in one CI job.
4. Different CI jobs whose runners share one host.

Process isolation does not isolate host ports, predictable filesystem paths, external services, databases, sockets, or inherited child processes. For every acquired resource, identify its owner, atomic allocation mechanism, observable readiness signal, registered cleanup, and quiescent completion signal.

Do not serialize an entire suite because one fixture lacks isolation. Narrow the exclusive scope or change the resource allocation first. A sequential block inside one file cannot protect a host resource from another file, process, job, or runner.

## Allocate resources atomically

Use the resource owner's allocator instead of checking availability and claiming it later.

- Network fixtures bind loopback with port 0 and read the assigned address only after the server reports that it is listening. Never scan for a free port and bind it later.
- Create private per-test temporary directories with a unique-directory API; do not acquire predictable shared paths.
- Give shared databases, sockets, sessions, and output locations unique per-test namespaces.
- Use exclusive creation where a path must not already exist.
- Keep stable recorded identifiers separate from ephemeral transport addresses; translate inside the fixture instead of forcing the live resource to use the recorded value.

Literal paths and URLs used only as parser inputs or expected values are not acquired resources.

## Contain process-global state

Treat environment variables, the working directory, fake timers, locale and time zone, module mocks, registries, console hooks, globals, and global network interception as exclusive mutable resources.

Prefer an injected dependency or instance-local adapter. When mutation is required:

- capture whether the original value was absent or present, and restore that exact state;
- register restoration immediately, with `try/finally` around the smallest mutation scope;
- keep an after-each fallback when failure before the local `finally` is plausible;
- intercept the narrowest exact request or call the fixture owns.

## Respect platform-owned semantics

When CI runs on Windows and POSIX hosts, a value the operating system owns does not always come back the way a test wrote it.

- Writing a value back is safe only when the assertion tolerates the write-back failing. Restoring a file's modification time to prove a fingerprint invalidates anyway holds everywhere; restoring it to prove a record stays valid assumes a lossless round trip that NTFS's 100-nanosecond ticks do not give a fractional millisecond. Take the expected value from a fresh read.
- Windows matches environment variable names case-insensitively, so `http_proxy` and `HTTP_PROXY` are one entry there.
- Windows releases file handles asynchronously, so a rename or removal needs a bounded retry sized to the observed contention.
- Windows has no POSIX permission or signal semantics. A case that depends on them takes an explicit platform skip naming the reason, not an assertion weakened everywhere.

## Budget timeouts against the lane

A per-suite or per-case timeout overrides the runner's global timeout instead of yielding to it, so a value below the lane's budget lowers what CI already granted. A suite bound by process creation takes the lane budget; a tighter value carries the reason it is tighter. Raise the hook budget with the test budget, because setup and teardown pay the same contention.

Where a timeout is the subject, keep the outer wait far larger than the timeout under test, or load decides which deadline reports first.

## Synchronize on state

A fixed sleep is not evidence that setup completed or cleanup settled.

- Wait for an explicit readiness event, handshake, state transition, owned promise, or externally observable condition.
- Use deferred promises or barriers to place a race at a deterministic point and prove the operations overlap.
- Use a timeout only to bound a wait, never as the condition that makes the assertion correct.
- Do not assert scheduler-dependent ordering unless that ordering is the product behavior under test.
- When time itself is the subject, inject or fake the clock and always restore real timers.

## Dispose to quiescence

Register cleanup immediately after acquisition so assertion failures also release the resource. Cleanup stops new callbacks or requests, detaches listeners, restores global hooks, terminates owned work, and awaits child exit, server close, or worker termination. Calling `abort()`, `close()`, or `kill()` without awaiting the completion signal is incomplete teardown. When late completion is possible, prove that disposal prevents it from mutating another test.

## Prove the intended regression

- Observe an ordinary regression fail before the fix when practical.
- For a new static or corpus check, temporarily introduce the rejected case and observe the intended failure.
- For a race, use barriers to prove overlap; repeated execution alone is not a race test.
- For ports, sockets, shared paths, or subprocesses, run independent test processes concurrently when cross-process isolation is part of the fix.
- Where a fixture spawns a child with its own deadline, assert that no signal or timeout ended the child before asserting its exit status.
- Verify external state, events, files, logs, exits, or disposal instead of trusting the component's self-report.

Stress runs supplement a deterministic regression; they do not replace one.

## Reject flake-masking fixes

Do not present these as root-cause fixes: increasing a timeout without identifying the awaited state; adding retries; making all files serial; swallowing an error or unhandled rejection; weakening an assertion; normalizing away unstable behavior; adding a sleep before cleanup or assertion.

Retries remain valid for documented transient external-provider tests at the external boundary. Restoring a budget the lane already granted, or sizing a bounded retry to measured contention, is not masking.

## Diagnose existing flakes

For an existing probabilistic CI failure, follow [the CI flake diagnosis workflow](references/ci-flake-diagnosis.md). A diagnosis-only request stays read-only: report the cause and evidence unless the user also asks for a fix.

## Validate and report

Run the smallest focused regression for the affected behavior, plus topology-specific evidence only when the change owns that risk: restoration evidence for global mutation, quiescent-teardown evidence for lifecycle or subprocess work, concurrent independent-process evidence for ports, sockets, or shared paths, and a negative control for a new check. Report exact commands and observed results; do not describe retries, skipped tests, or pending CI as passing.
