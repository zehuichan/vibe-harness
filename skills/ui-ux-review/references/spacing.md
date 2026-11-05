# UI spacing and grouping

Apply within the [UI change workflow](../SKILL.md#ui-change-workflow). Distance should explain which text, input, and action belong together.

## Identify the group before choosing the gap

Group elements by one object, action, or repeated unit, not by DOM siblings, background, or component boundaries. State that relationship before positioning. Check each nesting level independently; larger outer gaps do not require larger inner gaps.

For example, a title and description introduce one section; three row actions form one operation group; member cards form a section separate from tasks. In a settings form, a checkbox and its label form an option, options form a field, fields form an item, and items form a list. Check each relationship rather than applying one gap everywhere.

Without an explicit divider, comparable neighboring groups need visibly greater separation between groups than within them. Equality is only a lower bound against reversal. Repeated compositions share gaps, padding, and alignment; label length does not justify unrelated spacing. Nothing sits flush against its neighbor without an intentional gap, and an unexplained one-off gap or offset usually signals a missed shared value.

When wrapping, metadata, subgroups, or independent actions increase complexity, increase the enclosing separation enough to keep the grouping. A compact icon and label pair and a section of multiline cards need different spacing levels. Do not derive gaps from card area or multiply every margin. Dividers and distinct surfaces may reinforce separation, but a heading must stay closer to its own content than to the preceding group.

Judge actual whitespace at normal size, including padding, line height, glyph whitespace, and borders. CSS margin ratios alone do not establish grouping, and an explanatory label needs one unambiguous owner. For example, declared 16px and 8px margins can still leave a heading closer to the preceding content once line height and container padding are included; compare the rendered gaps rather than adopting that pair as a rule.

When matching two visible gaps, name both pairs of endpoints and include each container's padding, border, and text line box. Equal visible gaps may require unequal margins. A control's painted edge and a text glyph's edge are different endpoints; keep that choice stable through the review.

Reuse the page's spacing and the design system's tokens, preserve the [alignment](alignment.md) axes, and consult the [grouping cases](review-cases.md#2-spatial-grouping) for uncertain judgments. This skill defines no numeric scale.
