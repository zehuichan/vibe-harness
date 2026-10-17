# CI flake diagnosis

Use this workflow only to investigate an existing probabilistic test or CI failure. Preserve the requested read/write scope: diagnosis does not authorize a fix, a workflow rerun, or a CI configuration change.

## Freeze the evidence

Record the repository, workflow, job, commit, runner labels, timestamps, exact failing test or command, and the first stable failure signature. Keep infrastructure messages separate from test output.

Compare multiple failing and passing runs. Prefer runs of the same commit; otherwise verify that the relevant test and CI configuration are identical across the compared commits. One passing rerun does not prove an infrastructure fault, and one timeout does not prove a product race.

Use CI logs and metadata to establish whether failures overlap on one host or resource namespace. Link the supporting runs rather than pasting large logs.

## Classify the failure

Classify from recorded evidence, not from the eventual fix:

- **Host-resource collision:** the same port, socket, database, predictable path, cache, or external namespace is acquired by independent processes or jobs.
- **Incomplete lifecycle:** teardown returns before children, workers, streams, servers, or callbacks reach quiescence; later output or mutations appear in another test.
- **Process-global contamination:** the outcome depends on test order or leaked environment, working directory, fake timers, globals, mocks, locale, or module state.
- **Load-sensitive synchronization:** a sleep, polling interval, or assumed event-loop turn substitutes for observable readiness or completion.
- **Platform or entry-path mismatch:** the failure follows an operating system, shell, filesystem rule, source or build mode, or executable entry. Timestamp precision, environment variable case, handle-release timing, and permission semantics differ between Windows and POSIX hosts, so a pass on one says nothing about the other.
- **Product concurrency defect:** the test controls its resources, reproduces deterministically with explicit overlap, and exposes a race in shipped behavior.
- **External-provider transience:** a live API or network boundary owns the failure, and it matches the documented retry policy.
- **Runner infrastructure:** checkout, dependency download, disk, host process, or runner service fails independently of the test command. Require direct runner evidence. Where a self-hosted pool exposes no host metrics, say so; one signature repeating across unrelated branches on one pool is still evidence of shared-host contention.

If evidence supports more than one independent fact, report each one. Do not collapse a timeout, signal, exit code, and assertion into one inferred outcome.

## Reproduce the smallest relevant topology

Start with the owning test file or test name. Increase concurrency only to the first topology that reproduces the signature:

1. one test process;
2. concurrent tests or files;
3. multiple independent test-runner processes;
4. the owning check with its configured worker count;
5. separate jobs or runner processes sharing the implicated host resource.

Match the active runner configuration, environment, source or build mode, and platform. Do not lower a production timeout or add random load to manufacture a different failure.

Where the signature belongs to a platform the available host cannot run, stop at the last reachable rung and record that limit; then use CI as the reproduction, changing one suspected owner per run so the result stays attributable.

For a suspected race, replace probabilistic timing with a barrier at the contested transition. For a suspected host collision, prove simultaneous acquisition of the same identifier, or prove that atomic unique allocation removes the conflict.

## Fix at the owner

When a fix is authorized, fix the component that allocates, publishes readiness, mutates global state, or owns teardown. Do not hide the failure in a snapshot normalizer, retry wrapper, broader timeout, global serialization setting, or weaker assertion. Keep stable fixture data separate from live resource allocation.

## Close the investigation

The evidence is complete when:

- the original signature has a supported classification;
- the smallest relevant topology reproduces it, or the external evidence is sufficient and the reproduction limit is explicit;
- an authorized fix fails under a negative control or pre-fix state and passes under the same topology afterward;
- any concurrent-process, restoration, or quiescent-teardown proof required by the resource owner passes;
- remaining CI checks are reported as passing, pending, skipped, or failing from their observed state.

Do not rerun until a test happens to pass and call that stable. Stop when the selected evidence establishes the conclusion, or report the missing fact that blocks classification.
