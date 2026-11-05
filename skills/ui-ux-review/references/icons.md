# UI icons

Apply within the [UI change workflow](../SKILL.md#ui-change-workflow), in the affected page or modal context.

## Reuse existing icons first

Search the icon library and comparable UI for the intended meaning and its supported variants. Reuse the shared component; do not copy its SVG into a feature or create a near-duplicate. Size, color, and placement mismatches belong to the variant or the consumer's layout, not to a new drawing.

Draw only when existing artwork cannot express the meaning or the user requests a distinct design. Before drawing, explain the closest alternatives and the unmet meaning or requested difference. A new glyph needs design approval before it lands; requested drafts can be prepared locally. Do not redraw a shared glyph to fix one consumer.

The icon library's documentation and source own the available variants, stroke scaling, and per-control sizes. Product, package, and brand artwork has its own owner and is not normalized to interface icons.

## System style

- Use minimal, geometric, functional glyphs with familiar meanings. Match peers in contour, endings, joins, weight, whitespace, and complexity; avoid decorative, playful, or illustration-like detail. A supplied reference guides the requested meaning and distinctive form within this system.
- Use simple geometry and restrained rounding. Around 1px at a 16px design size is a starting point for softened corners, not a rule for every turn. Preserve useful sharp corners.
- Default to monochrome outlines that inherit `currentColor`, without gradients, shadows, textures, or 3D effects. Preserve intentional fills, status dots, selected marks, and knockouts. File, site, plugin, and brand artwork keep their own palettes and roles.
- Balance structure and whitespace without requiring symmetry; avoid accidental tilt or a top-heavy silhouette, and preserve meaningful direction. Use gaps, overlap, nesting, and broken obscured lines to clarify complex meanings; avoid accidental tangencies, dark knots, and gaps that disappear at actual size. Add contour detail only when it improves recognition; do not force every subject into a closed outline.

## Optical size and clarity before implementation

Use the owning control's supported icon size and weight; shared sizes belong to the icon library, and feature-specific sizes belong to their feature. A reviewed proposal for a larger or heavier icon in one control is not a statement that every existing consumer already uses it. Compare at the owning control's size, weight, colors, and label, using an outlined circle and a rectangular control as references. Open silhouettes may need more extent than dense fills; supporting chevrons, handles, and dots keep their roles. Do not normalize by ink area or fill every view box.

A shared view-box change affects every consumer at its own CSS size. Inspect both compact menus and larger icon-only controls: a clearer small chevron can become oversized in a floating button. Adjust a consumer's supported icon size when needed while keeping its button base and hit target.

For softness, check CSS dimensions and ancestor transforms, the view box and drawing bounds, stroke versus filled contour, device-pixel placement, then color and opacity. View boxes other than 16 are valid; compare identical artwork before attributing sharpness to inline SVG versus sprites.

Follow the library's implemented stroke behavior. Do not add non-scaling strokes or convert filled contours during an ordinary placement or reuse fix. A change to that rendering behavior belongs to a separately scoped library change with consumer validation; keep intentional silhouettes and knockouts.

Check straight-stroke edges at the actual device pixel ratio after all scaling: center and width jointly determine pixel coverage, and integer source coordinates alone do not guarantee crisp edges. Round positioned overlays to device pixels only when layout places otherwise crisp artwork between pixels, and preserve anchoring and viewport containment. Keep antialiasing on curves and diagonals; do not globally round paths or use `crispEdges` to hide placement errors. Partial pixel coverage is legitimate for fractional stroke widths.

## Draw a new icon

Establish meaning, placement, actual sizes, peers, and states; ask only when missing information changes the design. Produce editable SVG. Shared line icons provide every weight variant the library defines, sharing one construction; intentional fill-only variants may share geometry. Tune silhouette, gaps, center, and weight at the intended size using the library's conventions, not consumer-specific stroke or scale overrides.

Deliver editable artwork and a rendered peer comparison, including its label or control when relevant. Explain the semantic choice and unresolved alternatives. Keep drafts local; when implementing, register reusable components and update their documentation. Distinguish review-ready proposals from approved glyphs.

## Normalize user-supplied artwork

Before changing supplied artwork, establish its meaning, recognizable features, and intended use. Preserve the original and its recognizable form. Show an existing equivalent as a reference when one exists, but do not substitute it for the drawing the user asked to normalize. Separate technical fixes (canvas, scale, stroke, color inheritance, placement) from silhouette or metaphor changes, and identify any required simplification.

Apply the same system style and verification criteria as for new artwork. Inspect SVG paths, transforms, fills, strokes, and references. Reconstruct raster references without tracing rasterization or compression artifacts; identify interpreted details and ask about unrecoverable defining features. Deliver editable SVG and original, normalized, and peer comparisons under identical conditions at the intended size. Keep artwork changes separate from consumer layout fixes.

## Placement and use

Distinguish the click target, the visible button base, the icon slot, and the painted glyph. Equal targets or SVG dimensions do not imply equal optical size; compare silhouette, stroke, whitespace, and center beside the label. Fix containers and unintended CSS overrides first. Correct shared artwork only when the imbalance follows it across uses.

An icon and its associated text for one action, value, or input prompt share foreground color, effective opacity, and state changes. This includes submenu value chevrons and search placeholders: inherit the shared role instead of assigning the icon an independent color token. Typed text and independent clear actions may differ; status, warning, and brand roles keep their semantic colors. Check computed color and ancestor opacity in both themes. Apply the rule to changed consumers; stating it does not certify untouched UI. Compare native file icons and folder outlines deliberately; do not normalize logos, status dots, or decorative illustrations to toolbar icons.

Every panel or sidebar tab needs an icon that matches its meaning. [Alignment](alignment.md) owns positioning and [spacing](spacing.md) owns gaps.

## Icon controls and interaction

Use the shared tooltip primitive for icon-only actions whose meaning is not obvious, and a hover card or popover for informational content the pointer must rest on or select; prefer these primitives over ad hoc `title` attributes. Preserve accessible labels and focus. [Responsive UI](../../responsive-ui/SKILL.md) owns mobile tooltips and collapsing labels to icons.

## Verification and handoff

For ordinary icon reuse or placement changes, inspect the affected control at its actual size and relevant states; no fixed size and device-pixel-ratio matrix or separate raster report is required. For new or changed artwork, strokes, or rendering, compare affected sizes and weights with peers; check device pixel ratios 1 and 2 when stroke scaling or pixel placement can change, and both themes when color or optical weight is affected. Keep before-and-after captures when the change or a requested deliverable needs them. Judge recognition, clipping, center, gaps, and neighboring text at actual size; enlarged views diagnose pixels only.

After a set-wide change, trace affected families, consumers, and weights, including unchanged artwork whose rendering can change, and use unchanged peers for comparison. An explicitly requested full-set review inventories and compares every glyph under matching conditions. Consolidate duplicate artwork only when the current fix needs it; record unrelated duplicates separately instead of expanding the task. Consult the [icon cases](review-cases.md#7-icon-optics) for uncertain judgments.
