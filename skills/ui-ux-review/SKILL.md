---
name: ui-ux-review
description: Design and review user-visible GUI changes: visual token discipline, reuse before adding, feedback surfaces (toast versus in-place notice versus empty state), loading states, overlay and menu safety, platform window adaptation, spacing, and error copy placement. Use when adding or changing product-user-visible GUI behavior, or when reviewing such a change.
---

# UI and UX review

This skill is guidance, not a complete checklist. It covers judgment calls that lint, typecheck, and localization checks cannot make: where feedback appears, what gets reused, and how surfaces behave at window edges and across platforms. Copy quality follows `prose-standard`; failure reports follow `error-handling`; responsive behavior, including mobile and touch detection, follows [responsive-ui](../responsive-ui/SKILL.md). The project's design system and component catalog own tokens and components; this skill adds judgment on top of them, not a second copy.

## Visual foundation

- **Use existing tokens for color, radius, spacing, and typography.** Before introducing a literal value, search the target page and its nearest established sibling for the token or value already in use, and adopt it. The same applies to whole treatments (toasts, menus, previews, sidebars, page padding): reuse the established component or rule instead of inventing a parallel one.
- **Verify every color in both light and dark themes** when the product has both. Dimmed tones suit decorative surfaces but often fall below readable contrast on text in one theme; never put a dimmed color on text without checking both.
- **Keep emphasis within the design system's scale.** Differentiate with size or ink before reaching for heavier font weights, and do not invent a weight or size for a single element.
- **Pick font sizes from the theme's typography roles,** otherwise from the page's existing scale. Parallel content shares one size, and the number of distinct sizes on a page stays small. When a page has no precedent, borrow the ratios of the most similar existing page.
- **Align and proportion.** Every element lines up with its siblings along a deliberate axis (baseline, center, or shared edge), and an icon's size stays in proportion to the text beside it.

## Reuse before adding

- **Extend an existing component, container, or interaction before creating a new one.** A new menu item or a new prop on an existing primitive beats a parallel element stacked beside it.
- **Icons come from the existing icon library.** Pick the semantically closest existing icon; a new glyph needs design approval.
- **Panel content registers into the existing panel or sidebar**, never a separate one, and each tab declares an icon matching its meaning.
- **Icon-only actions whose meaning is not obvious get a tooltip.** Information the pointer must rest on or select uses a hover card or popover instead. Prefer shared primitives over ad hoc `title` attributes.

## Feedback surfaces

Choose the surface by the lifetime of the message relative to the surface that produced it.

- **Transient operation outcomes use the app-wide toast,** and the toast's state lives in a host that outlives the reporting surface: a deletion can close the panel that requested it, and a toast rendered by that panel unmounts with it. Report success and failure; do not report still-pending states.
- **A failed operation keeps the data visible.** A failed deletion keeps its row while the toast announces the failure; never blank content to show an error for a transient operation.
- **In-place notices are for states tied to the surface itself:** a query failure with its Retry action, or field validation on the form that owns the field. A populated panel keeps a compact notice beside its content; only an empty panel centers a full error state.
- **Error copy is plain and short:** no internal jargon unless an error code must be exposed for debugging; one clear sentence is best, and two is the limit. The notice must not shift neighboring elements; reserve its space or overlay it.

## Loading states

- Lists use their skeleton; other page-level loads center one spinner. Never place a spinner in a corner of the page.
- One loading treatment per page or component; concurrent regions must not each flash their own style.
- No loading text unless the context needs it.

## Overlays and menus

Verify every menu, popover, and tooltip for all three before merge:

- **Dismissable:** outside click, and Escape where focusable, closes it.
- **Viewport-fitting:** it slides or flips to stay inside the window with an edge margin, and flips only into a side that actually fits, without oscillating when neither fits.
- **Unclipped:** it escapes `overflow` ancestors and containing blocks (portal to the document body where needed) and is never covered by neighboring elements.

Scrollbars stay inside their container: use the shared scrollbar styles, and verify the bar neither overflows nor gets clipped by rounded corners.

## Platform window adaptation

For desktop shells, any new header element or full page accounts for each platform's window chrome (for example the macOS title bar and traffic lights versus Windows caption buttons). Never change a global clearance value to fix one page; add a scoped platform override on that page's own inset and test it. When reviewing, state the intended total offset (clearance plus page inset) so two pages agree on the sum, not just one addend.

## Spacing review

- Nothing sits flush against its neighbor without an intentional gap, and adjacent elements keep the region's established spacing.
- Prefer symmetry for parallel elements; an unexplained one-off gap usually signals a missed shared value.
- **On complex pages and containers, set shared horizontal and vertical alignment axes before adjusting local spacing.** Check the axes in hover, selected, and expanded or collapsed states, and against adjacent panels and other page elements. Use the reference whose layout is closest:
  - **Stacked navigation list:** corresponding text starts and leading icons align across rows, and hover and selected row backgrounds align with the controls above the list.
  - **Content list page:** content stays on one shared leading edge; a row's hover background may extend past that edge while the content stays in place.
  - **Adjacent panel headers:** the first header rows of side-by-side panels align and share a height, the second rows do the same, and their underlines and dividers sit on shared horizontal baselines.

## Evidence and design review

A change to user-perceivable UI or interaction needs visual evidence (screenshots or a recording; see `record-browser-gif`) and, when the profile's project-specific rules name design or product reviewers, their review. When no approver holds that role, suggest requesting one.
