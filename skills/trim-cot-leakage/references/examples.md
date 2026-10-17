# Few-shot leakage examples

Use these examples to identify the governing principle, not as text templates. This file deliberately quotes leaked wording as calibration material; the [recall batteries](recall-batteries.md) exclude this skill's directory, and its wording is not a license elsewhere.

## Dead citations

### Decision ordinal with a committed owner

**Leaked:** "Slash input resolves against the visible catalog (decision 21)."

**Fixed:** "Slash input resolves against the visible catalog, per the plain-text-reference decision in `.agents/notes/implemented/architecture/<date>-input-machine.md`."

The ordinal resolves nowhere at HEAD; the decision's name and owning note path do. Name the owning note's path at least once per file, as a link where the surface supports one.

### Decision ordinal without an owner

**Leaked:** "The registry rejects duplicate names (decision 7: names are flat, no namespacing)."

**Fixed:** "The registry rejects duplicate names; names are flat, with no namespacing."

No committed artifact owns "decision 7", so the citation is deleted, but its factual clause is restated to stand alone.

### Audit item codes

**Leaked:** "Rendering is pure: same snapshot, same string (audit R3)."

**Fixed:** "Rendering is pure: same snapshot, same string."

There is no audit document in the repository; the code is session shorthand carrying zero propositions.

### Section numbers of uncommitted drafts

**Leaked:** "Layering follows the design (v2 §3.2): `src/core/` is the pure core."

**Fixed:** "Layering: `src/core/` is the pure core."

Contrast: "escapes per RFC 9110 §10.1.5" stays. An external standard resolves outside the repository by design, and a committed document that owns its section numbering may be cited by section.

### Plan-phase labels

**Leaked:** "`src/client/` is the shell (T4); the P-I migration owns the adapters."

**Fixed:** "`src/client/` is the shell; the adapters live in `src/client/adapters/`."

Phase labels index a plan that never landed. Replace the label with what the phase produced.

## Stack and pull-request vantage

**Leaked:** "A future remote backend implements this interface (the sandbox backend is a later PR in this stack)."

**Fixed:** "A remote backend can implement this interface without changing the render layer."

**Leaked:** "This PR adds cursor-based pagination to the session list."

**Fixed:** "The session list paginates by cursor."

Durable prose cannot see the stack, and a README outlives every pull request. Keep the extension-point contract; pending work lives in the pull request, a `TODO`, or an issue.

## Change narration and version stamps

### War story with a pull-request number

**Leaked:** "Colors used to come from `--widget-*` tokens, which nothing defined, so it always rendered the fallbacks; the alias tokens fixed that (PR #88)."

**Fixed:** "Colors come from the alias tokens; an undefined token renders the fallbacks."

Both live facts survive in the present tense. The bug's biography belongs to the pull request and its Agent Note.

### Removal narration

**Leaked:** "The `probe` field is gone with the removal cut; badges ride the generic projection pair now."

**Fixed:** "Badges use the generic projection pair."

Readers who never saw `probe` learn nothing from its absence.

### Fixed regression to counterfactual present

**Leaked:** "This used to double-encode multibyte labels."

**Fixed:** "Without the byte-length guard, multibyte labels double-encode."

The regression pin survives as a present-tense counterfactual that names the guard.

### Indexical version stamps

**Leaked:** "Batch rendering is synchronous this cut; the async path is roadmap work."

**Fixed:** "Batch rendering is synchronous." (The deferral lives in `TODO(widget-batch):` at the call site.)

## Review choreography

**Leaked:** "Rejected in review: caching the resolved spec. We keep resolution per call."

**Fixed (in an Agent Note's Alternatives considered):** "**Caching the resolved spec.** Rejected: the spec depends on the per-call working directory, so a cache keyed by request would serve stale roots."

**Leaked:** "As of v5 of this note, the loader also validates manifests."

**Fixed:** "The loader validates manifests."

The alternatives section is the sanctioned home for losing options; the reviewer, the round, and the note's own revision history are not part of the rationale.

## Reviewer-addressed justification

**Leaked:** "The cast is safe — the SDK constructed the object, it simply doesn't declare the optionals strictly enough."

**Fixed:** "The SDK constructs this object with every optional field populated; the declared type is looser than the runtime guarantee."

**Leaked:** "This is correct because the reviewer confirmed the wrapping order."

**Fixed:** (deleted; the wrapping order is stated in the function's return documentation.)

State the invariant a maintainer must not break. Correctness claims cite invariants or tests, never people.

## Restatement and derivation

**Leaked:** "First we normalize the label, then we truncate it, then we wrap it."

**Fixed:** (deleted; the three lines below say the same thing in code.)

**Leaked:** "This test creates a session, sends two messages, waits for the second reply, and then asserts the log has four entries."

**Fixed:** "Two round trips must produce exactly four log entries: the projection deduplicates the shared prefix."

## Hedges and planning residue

**Leaked:** "Probably fine to render eagerly for now."

**Fixed:** (deleted; the deferral already has its `TODO(widget-batch):` marker.) If no marker exists, write one instead of keeping the hedge.

**Leaked:** "A 64 KiB buffer should be enough for most cases."

**Fixed:** "64 KiB holds the largest observed frame (48 KiB) with headroom; a larger frame fails loudly in `decode`."

## Authoring-language slips

**Leaked:** "The renderer runs on the client 端; see the 设计稿 for spacing. ---- 私有 ----"

**Fixed:** "The renderer runs on the client side; spacing follows the design frame `widget-badges`."

Working-language fragments and session separators are transcription residue. A design-tool frame name stays: it resolves outside the repository by design. Inside a code block that appears verbatim in two translated files, correct the block once and copy it byte for byte into both.

## Behavior-visible candidates

**Suspect:** An exported doc sentence says "available for now," and a generator copies it into a model-visible catalog.

**Wrong:** Rewrite only the source sentence during a prose-only purge, or hand-edit only the generated catalog.

**Right:** Trace the generated fan-out, update the owner, regenerate every derivative, and update the owning test or snapshot. If the authorized scope has no owning test, leave the wording unchanged and report the deferral.

## Keeps

### Issue references are durable on every surface

**Keep:** "The cap applies to the complete rendered value, wrappers included (issue #1470 owns the follow-up)."

Issues resolve at HEAD from any surface; "#N owns the follow-up" is the sanctioned home for deferred work in a README.

### Dead name-drops are not "naming the owner"

**Delete:** "Badge renderer over the widget layer (see the widget-rendering RFC)."

The test is resolvability, not form: no committed file answers to "the widget-rendering RFC". Retarget the pointer to a committed owner if one exists; otherwise delete it.

### Suppression justifications

**Keep (after fixing):** `// lint-disable-next-line no-non-null-assertion -- the one-element literal guarantees index 0.`

When the stated reason is false, fix the reason; never delete it.

### Measured bounds

**Keep:** "Depth cap (measured: 512 nests ≈ 0.15 s synchronous; 4096 blocks the event loop)."

### Runtime old/new and natural time

**Keep:** "The old connection drains before the new one accepts." **Keep:** a prompt asking "What is today's date?" Neither contrasts repository states.

## Overcorrection traps

Enumerate a passage's propositions before trimming it.

### Flipping an obligation into an endorsement

**Original:** "These direct registrations are exceptions pending migration to slots."

**Overcorrected:** "These direct registrations are sanctioned exceptions."

"Pending migration" is an obligation; "sanctioned" blesses the status quo. Keep the original.

### Promoting a hypothetical to a shipped feature

**Original:** "A future IPC-based shell subclasses the executor and overrides `spawn`."

**Overcorrected:** "An IPC-based shell subclasses the executor and overrides `spawn`."

**Right:** "A hypothetical IPC-based shell (no such shell exists) would subclass the executor and override `spawn`."

### Deleting a true fact with the transcript around it

**Original:** "The notice narrates the check order; the notice text is also what the doc compiler checks against."

**Right:** "The notice text is what the doc compiler checks against."

Delete clauses, not sentences, when propositions share a line.

### Dropping the measurement source while keeping the number

**Original:** "The 4 MiB ceiling is measured: the largest generated module is 3.1 MiB."

**Overcorrected:** "The ceiling is 4 MiB; the largest generated module is 3.1 MiB."

Without "measured", 3.1 MiB reads as a definition rather than an observation, and nobody re-measures before raising the ceiling.
