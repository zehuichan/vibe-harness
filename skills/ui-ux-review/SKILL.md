---
name: ui-ux-review
description: "Design and review user-visible GUI changes: a review workflow scaled to the change's impact with minimum rendered checks, alignment, spacing and grouping, icons, visual token discipline, reuse before adding, component geometry, feedback surfaces (toast versus in-place notice versus empty state), loading states, overlay and menu safety, platform window adaptation, and comprehensive page or modal reviews. Use before adding or changing product-user-visible GUI behavior, when reviewing such a change, and to verify affected rendered results before handoff."
---

# UI and UX review

Use this skill as the entry point for UI design and review. It owns the change workflow, visual foundation, geometry, and interaction guidance; alignment, spacing, icon, and comprehensive-review details live in the references below. Load only the references the task needs; examples explain judgment, not coverage. Copy quality follows `prose-standard`; failure reports follow `error-handling`; responsive behavior, including mobile and touch detection, follows [responsive-ui](../responsive-ui/SKILL.md). The project's design system and component catalog own tokens, materials, and components; this skill adds judgment on top of them, not a second copy.

## UI change workflow

Apply the relevant design rules to every UI change, including its visible loading, error, disabled, expanded, and focus states. Choose the review effort by impact and regression risk; ordinary development does not require a full design audit.

| Change | Required inspection | Additional records |
|---|---|---|
| Local copy, icon reuse, color, or spacing | Inspect the actual page, affected neighbors, and relevant states; run the applicable tests. Apply the minimum checks below. | Briefly report results and material gaps. No separate plan, axis drawing, scene inventory, source snapshot, or screenshot report is required by default. |
| Page layout, shared components, or global styles | Identify affected relationships and consumers; inspect each distinct affected layout, content, and state variant in assembled pages. Reuse evidence only for justified equivalents. | Briefly state the scope. Preserve the starting version and comparable images when requested or needed to explain a broad change or assess regression risk. |
| Explicit comprehensive review | Cover the agreed regions and relevant states; distinguish inspected results, defects, and uninspected scope. | Follow the [review procedure](references/review-workflow.md) for coverage records, findings, and supporting evidence. A comparison request alone does not require a product-wide audit. |

### Minimum checks for affected UI

These checks apply even to small changes; optional documentation does not make inspection optional. Open the actual page and inspect the changed element with its directly affected neighbors, rather than judging CSS or an isolated component alone.

- **Color or opacity:** inspect light and dark themes when the product has both, including the affected foreground and background and state combinations.
- **Layout, spacing, typography, or sizing:** inspect a constrained container and long or wrapping content; check both sides of a changed breakpoint, alignment, clipping, and access to actions.
- **Interaction:** exercise the changed path and the affected focus, disabled, loading, error, expanded, and overlapping states. Check only states the change can affect, not every possible combination.
- **Shared components or global styles:** trace affected consumers and inspect distinct assembled layouts and states; one isolated example cannot establish coverage.

If a required scene is unavailable, state what was not checked, why, and how it can be verified; a labeled fixture built from production components is partial evidence, not an actual-page pass. Do not claim verification complete while required checks remain missing. Run the applicable tests; source inspection and passing tests alone do not establish the rendered result.

Read unchanged rule owners once, and consult examples for uncertain judgments. Inspect relevant states at actual usage sizes, not a fixed screenshot count or every width, theme, and state combination. Batch related edits, and reuse a running application instance serving the current code and evidence that is still valid. Documentation-only changes and refactors with evidence of unchanged rendering need no new UI captures; state that basis.

When a before-and-after comparison is needed, preserve the actual starting implementation, including uncommitted work, and use comparable capture conditions. Never recreate a missing before image and present it as an original. Protect existing work whether or not extra evidence is needed.

Before handoff, review, or push, check only new cumulative interactions, missing required checks, and invalidated evidence; do not repeat completed verification at each stage. Report results and material gaps accurately, and do not claim full coverage or visual acceptance while required scenes or checks are missing.

These effort levels change only the additional design-review procedure. The project's existing test requirements, GIF evidence for GUI changes (see [record-browser-gif](../record-browser-gif/SKILL.md#gif-evidence-for-gui-changes)), and [design review](#evidence-and-design-review) still apply, including to local changes when their original triggers are met.

## Select the rule owners

For layout changes, read the alignment and spacing references. Read the icon reference when selecting, drawing, or reviewing artwork, or when adding, changing, or reviewing icon buttons, icon-only actions, or informational icons, including reuse without artwork changes. Other tasks use the relevant sections below. Do not load every reference by default; numeric scales stay with the project's implementation owners.

| Decision needed before implementation | Section or reference |
|---|---|
| Shared axes, text starts, centering, tree indentation, complete icon boxes | [Alignment](references/alignment.md) |
| Semantic groups, inner and outer gaps, repeated rhythm, section separation | [Spacing and grouping](references/spacing.md) |
| Icon selection and artwork; icon buttons and icon-only actions, tooltips, informational hover content, accessible labels, and focus | [Icons](references/icons.md) |
| Color, typography, and existing treatments | [Visual foundation](#visual-foundation); the project's styling documentation owns tokens and materials |
| Component geometry, nested contours, and state fills | [Component geometry](#component-geometry); the project's radius or shape standard owns values and exceptions |
| Feedback lifetime, loading, overlays, scrolling, and platform clearance | [Interaction and feedback](#interaction-and-feedback); `error-handling` owns failure guarantees |
| Responsive layout, mobile-specific interactions, and truncation of text and controls | [Responsive UI](../responsive-ui/SKILL.md) |
| Copy, locale ownership, and component semantics | `prose-standard`, the project's locale mechanism, and its component catalog |
| Density, information hierarchy, combined control states, and component choice | [Principles and cases](references/review-cases.md#3-whole-page-density), sections 3 to 6 |

## Reuse before adding

- **Extend an existing component, container, or interaction before creating a new one.** A new menu item or a new prop on an existing primitive beats a parallel element stacked beside it. Before restructuring a component, read the project's component architecture rules and the defensive-patterns page for client components when one exists.
- **Icons come from the existing icon library** ([icon reuse](references/icons.md#reuse-existing-icons-first)); a new glyph needs design approval.
- **Panel content registers into the existing panel or sidebar**, never a separate one, and each tab declares an icon matching its meaning.

## Visual foundation

- **Use existing tokens for color, radius, spacing, and typography.** Before introducing a literal value, search the target page and its nearest established sibling for the token or value already in use, and adopt it. The same applies to whole treatments (toasts, menus, previews, sidebars, page padding): reuse the established component or rule instead of inventing a parallel one.
- **Verify every color in both light and dark themes** when the product has both. Dimmed tones suit decorative surfaces but often fall below readable contrast on text in one theme; never put a dimmed color on text without checking both.
- **Keep emphasis within the design system's scale.** Differentiate with size or ink before reaching for heavier font weights, and do not invent a weight or size for a single element.
- **Pick font sizes from the theme's typography roles,** otherwise from the page's existing scale, otherwise from the size and spacing ratios of the most similar existing page. Peers share one size, and the number of distinct sizes on a page stays small.
- **Align and proportion.** Apply the [alignment reference](references/alignment.md) and the [same-foreground rule](references/icons.md#placement-and-use) to icon and text relationships, including value chevrons and search prompts.

## Component geometry

Choose the component's role and size variant, then its relationship to its container. Compare height, radius, curve, inset, and material together; equal radii alone do not establish coherence, and wrapping or expansion alone does not justify a larger radius. The project's radius standard owns values and exceptions.

- **Inset:** coordinate inner and outer curves with the inset. Radius subtraction is exact for concentric circular arcs; for superellipses it is only a nominal sizing rule, so inspect diagonal whitespace as well as side gaps.
- **Flush or adjoining:** the enclosure owns the exposed corners, and internal joins stay square. Hover fills and pseudo-elements follow that contour without clipping menus or focus.
- **Independent child card or group:** use its own role and size tier, not the dialog's radius or a subtraction of all parent padding.
- **Circles and capsules:** preserve the shape, including an avatar's container and image; ordinary controls use the shared curve.

Keep fills, strokes, and overlays geometrically stable across hover, pressed, selected, loading, and disabled states. Reuse the established card and elevation materials: when a shadow already includes a neutral hairline, do not add a second neutral border, but keep semantic state-colored borders.

Compare related controls, including small selection controls, at actual size in the affected themes and states and in relevant long-label and narrow layouts. Static checks reject unsupported declarations; rendered comparison judges fit. Consult the [geometry cases](references/review-cases.md#8-control-geometry-and-corner-relationships) when needed. Apply this to scoped changes, not as a reason for bulk restyling.

## Interaction and feedback

### Feedback surfaces

Follow `error-handling` for localized, actionable, visible reports. Choose the surface by the lifetime of the message relative to the surface that produced it.

- **Transient operation outcomes use the app-wide toast,** and the toast's state lives in a host that outlives the reporting surface: a deletion can close the panel that requested it, and a toast rendered by that panel unmounts with it. Report success and failure; do not report still-pending states.
- **A failed operation keeps the data visible.** A failed deletion keeps its row while the toast announces the failure; never blank content to show an error for a transient operation.
- **In-place notices are for states tied to the surface itself:** a query failure with its Retry action, or field validation on the form that owns the field. A populated panel keeps a compact notice beside its content; only an empty panel centers a full error state.
- **Error copy is plain and short:** no internal jargon unless an error code must be exposed for debugging, and preferably one sentence. In Chinese copy, a notice of at most two sentences omits the trailing full stop (。). The notice must not shift neighboring elements; reserve its space or overlay it.

### Loading states

- Lists use their skeleton; other page-level loads center one bare spinner. Never place a spinner in a corner of the page.
- One loading treatment per page or component; concurrent regions must not each flash their own style.
- No loading text unless the context needs it.

### Overlays and menus

Verify every menu, popover, and tooltip for all three before merge:

- **Dismissable:** outside click, and Escape where focusable, closes it.
- **Viewport-fitting:** it slides or flips to stay inside the window with an edge margin, and flips only into a side that actually fits, without oscillating when neither fits.
- **Unclipped:** it escapes `overflow` ancestors and containing blocks (portal to the document body where needed) and is never covered by neighboring elements.

Scrollbars stay inside their container: use the shared scrollbar styles with a small inset, and verify the bar neither overflows nor gets clipped by rounded corners or edges.

### Platform window adaptation

For desktop shells, any new header element or full page accounts for each platform's window chrome (for example the macOS title bar and traffic lights versus Windows caption buttons). Never change a global clearance value to fix one page; add a scoped platform override on that page's own inset and test it. When reviewing, state the intended total offset (clearance plus page inset) so two pages agree on the sum, not just one addend.

## Check the rules together

Inspect the composition first, then the affected relationships inside and across groups, distant peers, and expanded content. Match both endpoints of every axis, and compare complete icon boxes before optical adjustments. Preserve popup and focus visibility, field feedback, actions in narrow layouts, and drafts. Check affected theme materials and platform backdrops. A claim about the full interface covers all its regions; fixtures and crops establish only what they render.

## Changing the project's UI rules

When the project adds or changes a UI design rule, keep it in one owning document and link to it from `AGENTS.md` and review workflows instead of restating it. State the rule's applicability, the decision, its exceptions, and how to verify it observably, and add or update a distinguishing example. Remove superseded statements elsewhere. Say whether the rule applies to future edits only or comes with a migration; a new rule does not imply that existing UI conforms. Automate only mechanically decidable checks. Local review tools consume the repository's rules and record the source and rule revisions they checked, rather than maintaining another copy of the standards.

## Evidence and design review

Inspect the rendered result as the [UI change workflow](#ui-change-workflow) requires; a local change needs no separate screenshot report by default. Attach comparable images when a comparison was requested, the change is broad, or regression risk needs them. A pull request that changes user-visible GUI behavior includes a demonstration GIF, unless the project rules waive it; [record-browser-gif](../record-browser-gif/SKILL.md) owns that evidence. A change with extensive UI changes, or any clearly user-perceivable change to UI or interaction, also needs a designer or product review when the profile's project-specific rules name design or product reviewers. When no approver holds that role, suggest requesting one.
