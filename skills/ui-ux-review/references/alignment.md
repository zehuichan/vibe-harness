# UI alignment

Apply within the [UI change workflow](../SKILL.md#ui-change-workflow). Align comparable peers, including slots for optional icons and actions.

## Layout structure first, visual calibration second

Distinguish the click target, the painted button, the complete icon box, and the drawn contour. Intentional icon whitespace belongs to the layout box; do not remove it merely because painted pixels miss a guide. Enlarging a target must not move that box. Check containers, slots, columns, gaps, and unintended overrides before optical corrections. Neither matching CSS boxes nor aligning every painted contour establishes balance on its own.

A glyph that looks inconsistent across uses belongs to its icon owner. A composition-specific optical correction needs a scoped justification and a comparison with peers. Preserve intended hierarchy: a child icon may align with parent text, but DOM nesting alone does not determine indentation. When comparing a bare icon with a bordered control, extra hit padding is not a shared visible edge.

Inline SVG `vertical-align: middle` follows the font baseline and x-height, not the visible text center. Check font, size, line height, and icon box across CJK, Latin, monospace, and wrapping text. Do not make multiline links unwrappable just to center an icon.

## Choose both the object and the axis

Name the aligned object and the reference container. Equal padding need not align text starts; equal SVG dimensions need not align visible centers. For a close control beside footer actions, explicitly choose the control edge or the complete icon-box edge, and do not switch between them while measuring.

| Alignment | Use it for | Judge the actual relationship | Common mistake |
|---|---|---|---|
| Left edge | Navigation labels, list titles, field labels, reading content | Same-role text starts on one deliberate axis, including across groups | Every component has its own plausible but different inset |
| Horizontal center | A standalone primary button or a short empty-state stack | Center the icon-plus-label or the full stack in the named container | Center the label alone and attach an icon outside it |
| Vertical center | A single-line icon and label row, or peer toolbar controls | Visible centers balance; the whole clickable unit keeps a stable height | Equal CSS heights hide different SVG whitespace or line boxes |
| Baseline or first line | Mixed text sizes, multiline labels with leading icons | Text baselines agree; an icon belongs to the intended first line | Center an icon beside the entire multiline paragraph |
| Two edges | Title and action rows, left and right toolbar groups | The left group follows the content edge; the right group follows the trailing edge | Distribute every icon across the available width |
| Repeated columns | Action clusters, timestamps, file rows | Corresponding slots share centers or edges across rows | Only the last icon aligns; preceding icons drift |

In navigation, identify leading icon centers, text starts, and trailing controls by role, in every supported language. Headings, avatars, and expandable search may differ. Continue axes only where the composition establishes them. Use the reference whose layout is closest:

- **Stacked navigation list:** corresponding text starts and leading icons align across rows, and hover and selected row backgrounds align with the controls above the list.
- **Content list page:** content stays on one shared reading edge; a row's hover background may extend past that edge while the content stays in place.
- **Adjacent panel headers:** the first header rows of side-by-side panels align and share a height, the second rows do the same, and their underlines and dividers sit on shared horizontal baselines.

For a trigger and its menu, or a search field and its result rows, compare the complete text inset: outer padding, borders, leading slot, and gap. Different icon sizes can keep one text start. For adjacent statistics, check font family, size, weight, and line height together before moving the icon.

Center a button within its own bounds, a welcome group within the main pane, and an empty state within the content remaining below headings and filters. A fixed top margin is not centering. When a short window cannot fit the group, preserve scroll access with a compact top-aligned layout instead of clipping.

Normalize peer control sizes and slots before any necessary small optical offsets, and verify comparable uses. Preserve usable, non-overlapping hit targets, and do not hide an inconsistent parent layout with transforms. Transparent hit padding can exceed the painted icon slot; check neighboring target edges after tightening a cluster. Check [spacing](spacing.md) without moving the chosen axes, and consult the [alignment cases](review-cases.md#1-alignment) for uncertain judgments.
