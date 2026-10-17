---
name: responsive-ui
description: Use when designing, implementing, or reviewing responsive layouts, text truncation, title wrapping, icon-only controls, hover behavior on touch devices, mobile tooltips and keyboards, and focus during width changes.
---

# Responsive UI

These are default rules; the project's design rules override them where they differ. This is guidance, not a checklist.

## 1. Minimum viewport

Use a viewport width of 390 CSS px as the primary acceptance minimum unless the project rules set another. At that width there must be no unintended overlap, clipping, page-wide horizontal scrolling, or inaccessible primary actions. Below it, layout requirements may relax.

## 2. Decision order

1. First adjust space allocation or wrap elements onto another line; then consider text truncation, icon-only controls, or moving actions into an overflow ("More") menu.
2. Primary actions and primary states are never omitted.
3. Do not hide conflicts through global clipping, shrinking all font sizes, or shrinking click targets.
4. Reduce font sizes only when product design specifically requires it.

## 3. Text truncation

1. Truncated content must be fully available elsewhere: on a detail page, in a menu, or in a tooltip.
2. Truncation must never hide errors or other key information.
3. Prefer single-line truncation for tabs, visible selectors, buttons, tags, and similar components.
4. Important information not available anywhere else is displayed in full.

## 4. Titles

1. Prefer displaying page titles in full; move the action area onto another line when necessary.
2. Prefer natural wrapping for card titles. If lines are limited, the full title must remain viewable.

## 5. Icon-only controls

Reducing a control to an icon requires both:

- the icon clearly conveys its meaning, or the operation is familiar and frequently used;
- a tooltip appears on hover.

Do not reduce a control to an icon when it navigates to a separate page whose purpose the icon cannot convey. A frequently used selector whose menu shows the current choice can be reduced safely.

## 6. Hover on touch devices

1. Enable hover effects only on devices that support hovering. Use `@media (hover: hover)`, not viewport width, to decide.
2. Tapping on a phone must not leave behind backgrounds, highlights, or action-button visibility intended only for hover.
3. Preserve normal selected, enabled, and pressed states, and keyboard focus indicators.
4. Preserve focus when the width changes, unless the focused element disappears as a result.

## 7. Mobile tooltips

1. Do not show tooltips that only repeat an action name or keyboard shortcut on mobile; tapping performs the action directly.
2. Tooltips that provide supplementary explanation must support tap-to-show on mobile.

## 8. Mobile keyboard

Do not raise the on-screen keyboard automatically unless that is explicitly intended.

## Verification

Check each changed surface at the minimum viewport and at a common desktop width, with touch emulation for hover and tooltip rules, and include the evidence (screenshots or a recording) in the change.
