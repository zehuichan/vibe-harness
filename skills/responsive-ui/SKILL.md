---
name: responsive-ui
description: Use when designing, implementing, or reviewing responsive layouts, mobile and touch detection, text truncation, title wrapping, icon-only controls, hover behavior on touch devices, mobile tooltips and keyboards, and focus during width changes.
---

# Responsive UI

These are default rules; the project's design rules override them where they differ.

For visual reviews, select the [impact scope](../ui-ux-review/references/review-workflow.md#select-scope-by-visual-impact), then apply these behavioral requirements and the [applicable-standards map](../ui-ux-review/references/review-cases.md#combine-the-applicable-standards-first). Compare affected wrapping and layout relationships in the context of the whole page or modal while preserving drafts, focus, and access to actions. Inspect all regions for an explicit full-interface review. Examples do not define coverage, and fitting the viewport alone is not sufficient.

## 1. Minimum viewport

Use a viewport width of 390 CSS px as the primary acceptance minimum unless the project rules set another. At that width there must be no unintended overlap, clipping, page-wide horizontal scrolling, or inaccessible primary actions. Below it, layout requirements may relax.

## 2. Decision order

1. First adjust space allocation or wrap elements onto another line; then consider text truncation, icon-only controls, or moving actions into an overflow ("More") menu.
2. Primary actions and primary states are never omitted.
3. Do not hide conflicts through global clipping, shrinking all font sizes, or shrinking click targets.
4. Reduce font sizes only when product design specifically requires it.

## 3. Text truncation

1. Truncated content must be fully available on a secondary page or by opening a menu; a hover tooltip alone does not qualify, because touch devices cannot hover. Example: compact session statistics beside an input box whose full values open in a menu.
2. Truncation must never hide errors or other key information.
3. Prefer single-line truncation for tabs, visible selectors, buttons, tags, and similar components.
4. Important information that is not available on another page is displayed in full without truncation.

## 4. Titles

1. Prefer displaying page titles in full; move the action area onto another line when necessary.
2. Prefer natural wrapping for card titles. If lines are limited, the full title must remain viewable.

## 5. Icon-only controls

Reducing a control to an icon requires both:

- the icon clearly conveys its meaning, or the operation is familiar to users;
- a tooltip appears on hover; add one if needed.

Do not reduce a control to an icon when it navigates to a separate page, such as an account-details link. A selector that users see frequently and can open to switch its choice, such as a model selector inside an input box, can be reduced to an icon.

## 6. Hover on touch devices

1. Enable hover effects under `@media (hover: hover)`, independently of viewport width. This queries the primary pointing device, not the current event; script hover handlers must ignore touch events on mixed-input devices.
2. Tapping on a phone must not leave behind backgrounds, highlights, or action-button visibility intended only for hover. Without hover, actions remain visible or reachable through an explicit control, and keyboard users can reach and reveal the same actions.
3. Preserve normal selected, expanded, enabled, and pressed states and focus indicators, and keep these styles independent of hover capability. Do not clear focus to remove a hover effect; `:focus-visible` can also apply to text fields focused by touch.
4. Preserve focus during width changes when the control remains visible and interactive. Avoid remounting controls only to change layout. If the focused control is hidden or removed, move focus to a suitable remaining control without opening the mobile keyboard unnecessarily.

## 7. Mobile tooltips

1. Do not show tooltips that only repeat an action name or keyboard shortcut on mobile; tapping performs the action directly.
2. Tooltips that provide supplementary explanation must support tap-to-show on mobile.

## 8. Mobile keyboard

Do not raise the on-screen keyboard automatically unless that is explicitly intended.

## 9. Input capabilities and mobile text fields

1. Prefer CSS media features for presentation: `(pointer: coarse)` describes the primary pointer's accuracy, `(hover: none)` describes its inability to hover, and width queries select layout breaks. These queries do not detect a physical keyboard. Never branch layout on a parsed user agent.
2. Text fields take a 16px floor under `(pointer: coarse)` to avoid iOS Safari's focus zoom. Fine pointers keep the project's existing compact field sizes; follow its established field rules.

## Verification

Check each changed surface at the minimum viewport and at a common desktop width, with touch emulation for hover and tooltip rules. Report the evidence and any material gaps as `ui-ux-review` requires; a local change needs no separate screenshot report by default, and a pull request's visual evidence follows that skill's evidence rules.
