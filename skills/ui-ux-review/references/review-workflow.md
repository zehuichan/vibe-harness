# Review a UI design

Use this procedure for an explicitly requested comprehensive review and for the evidence steps a change's impact or regression risk justifies. Ordinary development follows the lightweight path in the [UI change workflow](../SKILL.md#ui-change-workflow) and does not execute every section below. The [principles and cases](review-cases.md) supply judgment criteria, not a mandatory checklist. The project's test requirements, GIF evidence, and design or product review stay governed by their original owners.

Check the complete icon box, including intentional internal whitespace, text columns, and gaps, before judging the drawn contour. Hit targets are not icon boxes; do not align each glyph's painted pixels independently ([alignment](alignment.md)). Check associated icons and text against the [same-foreground rule](icons.md#placement-and-use), including submenu values with chevrons and search placeholders with magnifiers; compare rendered color and opacity in both themes and preserve semantic exceptions.

## 1. Define the page or modal in scope

Identify the user task and the affected page or modal. Record the scope when several regions, consumers, or design choices need coordination; a straightforward local change needs no separate plan. For an explicitly requested comprehensive review, enumerate the requested pages or modals and their relevant states. Do not present a local inspection as a whole-page result.

Apply the [judgment priorities](review-cases.md#what-a-review-must-judge) across that scope: alignment and spatial grouping first, then density, hierarchy, states, component choice, icon optics, and geometry. Express each finding as an observable relationship, such as content appearing closer to the next group than to its own label. Follow the user's requested order and authorization. A full review can identify several related defects, and permission to implement routine adjustments does not replace a required design or product review.

Read the [UI skill](../SKILL.md), the project's applicable architecture rules, and its design-system documentation before editing. Use [responsive-ui](../../responsive-ui/SKILL.md) for width and input changes. This procedure adds review and evidence steps, not another set of visual tokens.

### Select scope by visual impact

Choose the inspection scope from the table below. For broader changes, a few task-note sentences can track affected groups, consumers, and risk conditions; use a coverage table only when it helps a multi-region review. Local changes need no scene inventory. File count and package boundaries do not determine visual reach.

| Change | Minimum inspection scope |
|---|---|
| Local copy, icon, color, or spacing | Read the containing page or modal for context; inspect the owning group, neighboring groups, and affected peers sharing its axes or role, including distant peers |
| Page, form, or card layout; a new page or modal | Review the containing page or modal as a whole, including relevant scrolling and expanded content |
| Shared component | Trace all affected consumers; inspect each distinct layout, content, and state variant in its assembled context |
| Global typography, tokens, or styling | Map affected component families and page layouts, and expand coverage across those families rather than treating the change as local |
| Behavior without an intended style change | Inspect the states that can change visible relationships, including loading, errors, disabled controls, expansion, and focus |

A shared consumer can reuse another's evidence only when the relevant implementation, size, container constraints, content behavior, and states are equivalent; record the grouping and its basis, and inspect uncertain cases directly. Reading the source of every consumer is not a claim to have opened every page. Expand the scope when a defect recurs beyond the initial region or a fix changes adjacent relationships. Record unrelated discoveries separately instead of silently starting a product-wide redesign.

Apply the [minimum checks](../SKILL.md#minimum-checks-for-affected-ui) to each changed property: color requires both themes; layout, spacing, typography, and sizing require constrained and long-content checks; interaction requires the affected path and states. These are inspection requirements, including for local edits, not a demand for a screenshot of every condition. Do not exhaust unrelated combinations or replace coverage reasoning with a fixed screenshot count. Reuse unchanged rules and valid evidence within the task, and recapture after a coherent batch of edits rather than after every CSS adjustment. Read only the relevant principle sections and examples; an uncertain design decision is a reason to retrieve more detail.

## 2. Inspect the task and its implementation

Inspect the affected result at the application's normal entry point. Reuse an instance serving the current implementation; do not restart or rebuild solely for each small edit. Follow the relevant task path, and use computed styles when needed to distinguish layout defects from content, loading, or an unfinished animation.

For ordinary changes, a finding needs its location, the visible problem, the correction, and its verification. Add source ownership, alternatives, and conditions that would invalidate the correction when they affect the decision. Prioritize visible or shared defects; differing source numbers alone do not justify standardization.

When diagnosing spacing, record layout boxes, margins, padding, line boxes, and visible glyph edges separately. State whether a close control aligns by its button edge or its icon box, and check trigger and menu text insets across their different icon sizes. An annotation of visible whitespace is not a measured CSS margin.

### Reconcile the baseline across the whole interface

Use the [applicable-standards map](review-cases.md#combine-the-applicable-standards-first) to gather the current radius, material, typography, component, feedback, responsive, and artwork rules that apply. Record named exceptions and the relevant existing variants. When a personal or external skill differs from a repository owner, use the repository owner; when the implementation differs from its owner, report the discrepancy as a finding rather than silently choosing one.

Apply the [whole-interface principles](review-cases.md#review-the-entire-page-or-modal-as-one-unit) to the selected scope. Keep the whole composition as context and compare affected regions and repeated relationships before using local fixtures for detail. An explicit full review covers every region; a local correction must preserve neighboring alignment, grouping, nested corners, clipping, and focus.

### Make the relationships explicit

Identify the relevant groups and alignment references. Draw axes or annotate a full-context screenshot only when the relationship is complex, disputed, or needs explanation; this is not a prerequisite to reading CSS. These prompts are optional aids for documenting a review, not fields to fill for every local change.

| Observation | Record | Example |
|---|---|---|
| Task and groups | What each group describes or operates on; its children and neighboring groups | A title and its three-action cluster; a members section and a tasks section |
| Alignment | Objects, axis, and reference container; deliberate exceptions | Baseline-defined peer-row text starts; a centered icon-plus-label in the primary button |
| Spacing | Which gaps are internal, repeated, and between groups | A heading is closer to its cards than to the preceding section |
| Peer geometry | Comparable roles and visible size, radius, and color relationships | Equal circular bases; one search-prompt foreground role |
| States | Simultaneous and neighboring combinations | A selected row beside another hovered row |
| Evidence scope | What is visible and what remains uninspected | The full sidebar versus an isolated row |

Walk the region in three passes: the whole composition, the relationships between groups, and the details within groups. Use source and computed geometry to explain the visible result afterward. For alignment, compare rendered text starts and slot centers; for spacing, compare visible boundaries as well as CSS boxes. Record CSS pixels separately from screenshot pixels and note the zoom and device scale. Do not infer a new design constant from a scaled image.

A useful finding states a violated relationship: "The title-to-action gap is smaller than the gaps inside the action cluster, so the title joins the first action visually; separate the two groups and retest long-title hover." "Spacing looks off" and "all gaps use tokens" do not explain the judgment. A visible inconsistency can fail the design requirement even when it does not block a task; do not dismiss it as harmless because a click still succeeds.

Before declaring a page or modal reviewed, reconcile its actual regions and relevant states with the inspected evidence, including content reached by scrolling, expansion, or tab changes. A local fixture or example cannot substitute for an uninspected part of that whole. For a limited review, list the remaining scope explicitly.

Fixtures built from production components can reproduce controlled states or compare variants; they supplement inspection of the actual application. Capture and report tools may live outside the repository; they are not product dependencies or CI acceptance.

### Keep a coverage record

Use this record for an explicitly requested comprehensive review or when several regions need tracking. Ordinary local changes need no coverage table.

| Page or dialog and entry | Semantic groups and cross-group relationships | Inspected conditions | Finding and owner | Evidence after correction | Uninspected |
|---|---|---|---|---|---|
| The actual entry and region | Both endpoints and complete boxes or text axes | Content, width, theme, state | The rule and the responsible component | Comparison and relevant behavior results | Limits, stated rather than an ambiguous "covered" |

For complex findings, explain the compared objects, the intended relationship, the supporting evidence, and risky neighboring effects. Include a plausible wrong fix or a retest condition when it clarifies the decision. Keep unsupported candidates pending, and investigate confirmed repeated problems within the chosen scope without starting unrelated cleanup.

## 3. Preserve the starting point

Preserve a recoverable starting version and relevant captures when a comparison is requested or needed to assess a broader change or its regression risk. Routine local changes need no extra source snapshot or before image. When keeping a baseline, include existing uncommitted work rather than assuming `HEAD` represents the visible application, and record the source identity and capture conditions.

Save captures and their conditions under `.agent-scratch/` or another explicitly chosen local directory that is not committed.

Use a scene map for comprehensive reviews or multi-state comparisons that need one; simple changes can be checked directly at the affected position. Include expanded rows, dialogs, and relevant loading or disabled states when they affect the claim; a collapsed parent does not cover hidden controls. Use safe fixture data for destructive or unavailable states instead of changing a user's real work for a screenshot.

## 4. Change the smallest responsible component

Fix the owner responsible: the page for page layout, its primitive for a shared control state, or the library for a glyph imbalance repeated across consumers. Reuse components and theme aliases, verify affected relationships, and preserve independent workspace changes. A development fix need not first become a formal review finding.

Check the states that can conflict with the change: selected with hover or keyboard focus, expanded with focus, busy with disabled, and validation with long content. Check the narrow container and the width just on each side of a changed breakpoint. Preserve input drafts, keyboard focus, dismissal, and access to the primary action when the layout changes. Follow the project's testing policy for checks that exercise behavior; do not add assertions that merely repeat CSS declarations.

Verify the causal structure first, confirm that the styles actually apply, then inspect appearance and behavior. Record complete icon boxes, text starts, painted button edges, and hit-target positions separately where useful; target rectangles cannot stand in for every alignment measurement. A shared-component adjustment includes consumers with and without optional descriptions, unequal content, and real neighbors, not only the report fixture.

When build or hot-reload state is uncertain, start a separate application instance from the intended sources and verify its artifacts, so old scripts do not run with new styles. An unchanged DOM snapshot, a stale test selector, or a failing capture hook cannot establish whether a visual correction passes or fails; identify the failure's owner and verify current behavior with the relevant tests without capture hooks.

## 5. Verify behavior and comparable images

Inspect the affected result and its directly affected neighbors in the actual page. If a required scene is unavailable, report the missing check, the reason, and the next verification; a labeled production-component fixture is partial evidence, not an actual-page pass. Extra screenshots and comparisons are required when requested or needed to explain broad changes or assess regression risk; routine edits need no separate report. This changes recordkeeping, not the minimum inspection or the GIF rules. For a comparison, match content, theme, locale, viewport, zoom, device scale, interaction state, and content anchor, and let fonts, data, and transitions settle.

When producing a comparison, save the final captures separately and pair each with its starting scene under matching conditions. Check dimensions and capture conditions, using scene IDs when there is an inventory. Correct mismatched conditions instead of stretching images, silently changing crops, or presenting a reconstructed fixture as an earlier application screenshot. Inspect the delivered images and confirm they support the stated scope.

Two captures with the same rendered-source fingerprint demonstrate the capture and reporting workflow, not a UI improvement. An actual before-and-after comparison captures the starting implementation before editing and the result afterward; keep that distinction visible in the report.

Use equal-sized paired crops with the same content origin when a full page hides a small difference, keeping enough context to show the relationship being judged. If a content change requires a different crop, disclose it and keep the original full-context captures available. Verify both themes when color, state, or icon balance is involved, and use enlarged views only as a supplement to the intended display size.

## 6. Deliver the evidence

An ordinary handoff states what changed, what was checked, and any material gap; a short explanation or screenshot can suffice. For a requested detailed report, place each scene, problem, and design judgment beside its image, caption the source, and say what to inspect. Avoid detached screenshot collections and images that do not show the claimed relationship.

When a before-and-after comparison is part of the deliverable, label both sides and distinguish application captures from isolated component scenes. If the user asks for all changes, reconcile that scope with the final diff, including nested controls, and state missing evidence. Do not require a paired report for every ordinary correction.

For comprehensive reviews, distinguish inspected-without-findings, defects, and uninspected regions. For ordinary changes, report the result and material gaps without a per-region status ledger. Known defects are not canceled by unrelated passing checks.

Report the checks actually run and their outcomes, and distinguish automated metadata checks, behavior tests, and human visual inspection. Include material limitations such as an unavailable application state or an untested platform. Do not describe the work as fully verified while required scenes or checks remain outstanding.

At handoff, review, and push, use the [UI change workflow](../SKILL.md#ui-change-workflow) to check new cumulative effects or invalidated evidence, not to repeat completed inspection. Tests and agent inspection do not replace a required design or product review.

### Comparison delivery and cumulative changes

For a formal comparison report, put before on the left and after on the right. Add non-obscuring annotations only when helpful, only on the after image, and keep the originals. Choose a presentation readable on a narrow screen. Ordinary handoffs may use simple labeled images or concise text.

Deduplicate cumulative summaries by location: pair the earliest reliable before image with the final implementation under comparable conditions. Keep intermediate rounds only as historical evidence, not as separate final results; reverted proposals are not current results. List another session's retained changes separately without claiming them. Disclose missing baselines or uncertain ownership, and record actual checks without counting repeated runs as extra coverage.

For an all-changes summary, trace each claim to the cumulative diff, its current owner, and the retained evidence. Separate net changes from behavior already in the baseline, and resolve later user revisions before naming final values. Label older captures as historical when they no longer show the current result, and distinguish source-confirmed behavior from a scene inspected again. Feed reusable decisions back to their rule owner and its contrasting cases, not local pixel values or an unsupported whole-product pass.
