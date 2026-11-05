# UI design principles and review cases

Consult the relevant cases when a design relationship is unclear. Ordinary changes inspect affected relationships in page or modal context; they do not require every case, an inventory, or a full-page audit. The whole-interface sections apply when a comprehensive review is explicitly requested. Examples explain transferable principles, not coverage. The [review procedure](review-workflow.md) holds the optional detailed methods, and the [UI change workflow](../SKILL.md#ui-change-workflow) owns effort levels.

## What a review must judge

A well-composed interface makes relationships visible before the reader studies individual labels. Alignment lets people compare parallel items without repeatedly searching for their starting points. Spacing tells them which icon, label, description, control, and action belong together. These are primary design requirements, including for a fully functional screen, not optional polish after token checks pass.

Prioritize alignment and spatial grouping in visual review. First identify the task and the semantic groups, then inspect shared axes across the whole region, then check each group's internal relationships. Follow with hierarchy, state, geometry, color, density, and optical detail. A blocked action or a misleading state still takes priority over cosmetic work. Do not make every element equally large, equally spaced, or equally prominent in pursuit of consistency.

The page or modal is the reference for composition; the [impact scope](review-workflow.md#select-scope-by-visual-impact) decides which relationships a change requires you to inspect. Navigation, content, forms, and actions may come from different components while sharing text axes and spacing rules. Explain exceptions through role, hierarchy, or state; component ownership alone is not a design reason. The examples below explain particular principles and do not establish coverage of the interface under review.

## Review the entire page or modal as one unit

Treat the entire page or modal as one visual unit when choosing references and judging relationships. A routine change reviews its affected groups and cross-group relationships in that context; it does not automatically audit every region or the whole product. An explicit whole-interface review inspects all its regions. A sidebar, form, or toolbar remains part of the larger composition even when a separate component owns it.

For a modal, include its title, close control, all content sections, scrolling area, and footer actions. For a page, include its navigation, header, toolbars, content, and persistent actions. Content below the fold is part of the same unit. Follow the page's or modal's own edges when choosing alignment and centering references; an open modal has its own composition above the page beneath it.

### Judge the whole, the groups, and the elements

First read the whole composition: content edges, visual center, reading order, primary action, and overall density. Then identify groups and subgroups by what they describe or operate on. Compare neighboring groups, then the elements within them. Repeated relationships stay consistent across the entire page or modal, including distant sections.

| Aspect | Compare throughout the page or modal | Basis for judgment |
|---|---|---|
| Alignment | Text starts, icon centers, control edges, repeated action columns | Choose left, center, or two-sided alignment by role; continue shared axes across groups; judge an icon and its label together |
| Spatial grouping | Label-to-content, item-to-item, group-to-group, and section-to-section distances | Internal gaps are smaller than external gaps; more complex groups need greater separation; repeated group structures reuse internal gaps |
| Size and proportion | Same-role controls, icon backgrounds, icons, and adjacent text | Use consistent size variants and optical balance; adjusting size can support shared alignment |
| Corner geometry | Containers, cards, fields, buttons, and selection controls | Apply one role-based radius system; distinguish inset, flush, and independent relationships using the project's radius standard |
| Color and emphasis | Text, associated icons, backgrounds, borders, and secondary information | Match the emphasis of an icon and label that communicate together; explain role or state differences |
| Typography and density | Headings, labels, descriptions, repeated rows, and overall whitespace | Keep equal-level content consistent and hierarchy readable; local spacing fits the whole composition |
| States and behavior | Selected, hovered, focused, disabled, expanded, loading, and failed content | State changes preserve recognizable groups, alignment, and action access; compare states that appear together |

Consistency means applying the same reasoning throughout the unit. Elements with the same role and size variant get the same treatment; differences follow from role, hierarchy, or state. Being implemented by a different component does not justify a different text start, spacing pattern, or radius. A centered title and a left-aligned reading column can coexist when their roles support that composition.

### Relate each finding back to the whole

Record which elements conflict, which relationship they should share, and how the correction fits the rest of the page or modal. Compare every occurrence of that relationship within the review scope. After a local adjustment, return to the whole composition and check affected axes, grouping, geometry, and hierarchy together.

A full review covers all regions in scope, including relevant scroll positions, expanded content and tabs, and states that change their relationships. Inspect supported widths, themes, and input methods where applicable. Preserve drafts, focus, dismissal, and primary-action access, and show failures with their recovery. Report uninspected regions and states explicitly. One clean crop, component fixture, or selected example cannot establish that the whole page or modal is consistent.

### Use a relationship inventory to establish coverage

List the semantic groups in the assembled interface, then the relationships to compare: parent-child indentation, text columns across sections, repeated action slots, headings and descriptions, fields and validation, prose and inline controls, and scrolling content versus fixed actions. Inspect more than group interiors; every cross-group relationship needs two actually inspected endpoints. When changing a shared primitive, include consumers with and without descriptions, unequal content, and different action combinations.

A relationship passes only when its structure uses one reference, its rendered appearance communicates that relationship, and relevant content or state changes preserve it. An existing assertion, a shared token, a successful capture, or an isolated crop cannot replace these three requirements. Prioritize by misleading effect, frequency, and reach; a difference of only a few pixels does not excuse repeated misalignment.

Record inspected-without-findings, fixed-and-rechecked, found-but-unresolved, and uninspected separately. Declare platform and exceptional-state limits where exhaustive coverage is unavailable; example counts, component-test counts, and page-entry counts do not establish that every design passes.

## Combine the applicable standards first

Use the [rule-owner map](../SKILL.md#select-the-rule-owners) to select the current guidance, including alignment, spacing, and icons.

A review has two independent obligations: honor the project's applicable rules, and explain whether the assembled result communicates the intended relationships. A convincing silhouette does not excuse the wrong control semantics; legal tokens do not excuse bad alignment. For a scoped review, mark unrelated areas out of scope. For a whole-interface review, apply the relevant rows below across all regions.

| Owner | What it contributes to the review | What to compare across the page or modal |
|---|---|---|
| The project's radius or shape standard | Role before size; inset, flush-fill, and independent-child arrangements; curve and documented exceptions | Outer surface, field, hover fill, indicator, and clipped edges together |
| The project's styling or design-token documentation | Semantic colors, typography pairs, hairlines, elevation, menu material, and motion | Same-role surfaces across features, both themes, native desktop backdrops |
| This skill | Component reuse, hierarchy, loading, feedback ownership, and window clearance | Loaded, empty, and error scenes in the actual surrounding page |
| [responsive-ui](../../responsive-ui/SKILL.md) | Space allocation before truncation, input capabilities, focus, and primary-action access | Wide, constrained, keyboard, and touch use of the same task |
| The `error-handling` skill | Visible failure, retained valid state, and a safe next action | Field correction, failed operation, and failed query as distinct situations |
| The component catalog and the relevant package documentation | Existing variants, focus and interaction behavior, and feature-specific requirements | The intended component role versus a visually similar substitute |

The current repository owner and its explicitly recorded exceptions take precedence over an older personal skill or an external example. A user's choice applies to its named family; it does not silently replace the global system. If the implementation disagrees with its stated owner, report the discrepancy instead of treating the existing code as a new rule. Re-read the owner when selecting a radius or material rather than copying a scale into the review.

## Choose cases that expose a design decision

An example makes a principle observable through a task, related elements, surrounding context, and a condition that can challenge the correction. Extract the relationship and apply it throughout the interface under review; a sidebar or form example does not restrict the principle to sidebars or forms. Examples are explanatory evidence, not a review menu or a coverage list.

Distinguish three kinds of evidence. An actual scene from the product establishes a defect under the displayed conditions. An official design-system example teaches a particular relationship; its dimensions and interaction policy remain that system's. An original diagram explains a proposed relationship and must not be labeled an implemented improvement. A fixture covers only its rendered conditions. Keep the source, compared objects, applied rule, and retest conditions next to the case.

Present each case as scene and problem, then design judgment, then its screenshot or paired comparison immediately below, with a caption naming what to inspect, what each side means, and the source. Do not collect unrelated cases into a detached screenshot wall. If the difference is only faintly visible or the image omits the relationship, choose stronger evidence instead of presenting it as an exemplar.

## Principle examples

Use these examples to understand a relationship that is unclear, and apply the same principles to every relevant region of the interface under review, including regions not illustrated here.

## 1. Alignment

The [alignment reference](alignment.md) owns shared axes, complete layout boxes, indentation, and text metrics. Compare content, painted backgrounds, and hit targets separately; different roles need not share every axis.

### Text metrics and unequal content

An inline icon refers to adjacent text, not the center of the entire paragraph's line box. Cap height can calibrate a particular font combination but is not a universal formula for every font and icon; do not copy one successful offset into every control. A status icon beside multiline guidance usually attaches to the first line, while a single-line button centers its icon and label together. Recheck that relationship after changes to font size, fallback font, or language. For inline links with icons, keep the icon dimensions and correct vertical placement through font metrics across CJK, Latin, and code text; inspect long links wrapping inside a complete paragraph.

Peer cards jointly establish heading starts, description first lines, and action edges. A short description must not center vertically on its own because its neighbor is longer; put the remaining height after the content group, while bottom actions may align separately. Equal card height does not establish a consistent reading order or require truncating real content to force equal heights. The same applies to result cards, choice cards, and parallel summaries.

### A1: Role-based sidebar alignment

**Scene.** Compare navigation, workspace or project rows, list items, and the account area in an expanded sidebar, including a centered primary action and the painted row edges, not only text starts.

**Failure and correction.** Applying one leading-slot width to every role can move titles, enlarge spacing, or distort the account row. Keep the owning shared variables, compact icon slots, and paint insets. Keep deliberate account geometry and hierarchy instead of manufacturing one text axis across all roles.

**Acceptance.** Use guides to compare same-role rows. Check short and long titles, optional icons, expanded groups, and signed-in and signed-out states. Revealing row actions must not move the title start. A list crop does not establish whole-sidebar alignment.

### A2: Distinct header and row action groups

**Scene.** Header search, filter, and add actions and row more, archive, and pin actions occupy the same trailing region but have different roles and spacing. Compare repeated rows with each other; compare the header with its own collapsed and expanded search states.

**Correction and acceptance.** Choose control sizes, gaps, and trailing insets by group role, including during search expansion, and keep the title-to-action separation independent of the gaps inside a cluster. Show the header and row actions together, then expand search and collapse the sidebar; verify the intended edges, unclipped hit targets, and long-title clearance. Do not add empty actions or offsets merely to make unrelated controls form columns.

### A3: Alignment between rows and compound controls

**Scene.** Panel controls sit above display controls and a split button in one preview header, and each row holds operations with different scopes.

**Failure and correction.** Each component may be internally centered while the assembled header has unrelated right insets, heights, and group gaps. Relate the upper icon boxes to the complete lower control, keeping internal icon whitespace rather than aligning extra hit padding or a glyph's painted pixels. Align peer control centers, keep display controls together, and separate the external action. Treat the split button as one unit, verify both segment targets, and do not force its arrow onto a column meant for an unrelated action.

**Acceptance.** Inspect both rows with the path, tabs, and content edge visible, then repeat with a long path and a narrow pane. A row of standalone icons does not substitute for the actual split control.

### A4: Centering a content group within its container

**Scene.** A page has a heading and filters above an empty state with an illustration, explanation, and create action; the group belongs in the remaining content region with one horizontal center and a deliberate vertical position.

**Failure and correction.** Centering each child horizontally while giving the parent fixed top padding strands the group near the top of a tall viewport. Let the content region fill the remaining height, then position the complete group, and review its internal rhythm; moving only the button does not center the group.

**Acceptance.** Mark the remaining content rectangle and the bounds of the complete stack, and compare tall, short, and narrow windows with the same content. Distinguish a deliberate, documented optical offset from accidental fixed spacing; do not demand window centering when a sidebar or toolbar changes the usable area.

### A5: Visible size and center of peer controls

**Scene.** Attach and send actions anchor the same input toolbar; when the design gives them equal bases and a shared vertical center, their different importance comes from fill and state.

**Correction and acceptance.** Different base diameters plus an extra vertical translation create two unrelated anchors. Normalize the peers' outer geometry, remove layout compensation, then balance each glyph within its slot; a thin plus and a solid arrow need not have equal painted area. Compare bases and centers in empty, enabled, busy, and narrow layouts, alongside the input outline. A reference product's unequal controls do not override the project's own requirement.

### A6: Text starts across triggers and menus

**Scene.** A trigger uses a larger, heavier icon than its menu rows, but their corresponding labels should start on one axis; a search prompt, result heading, and option label can share a similar reading edge.

**Correction and acceptance.** Sum each surface's border, padding, leading slot, and gap before adjusting it; matching only icon sizes or outer edges leaves different text starts. Check the assembled open menu, longer labels, and narrow layouts, and distinguish device-pixel rounding of popup coordinates from a whole inset mismatch.

### A7: Choosing the close-control edge

**Scene.** A modal has a close glyph inside a larger button and a footer action at the content edge; an icon-box edge and a button edge imply different header insets.

**Correction and acceptance.** Name the intended edge before changing a shared header. If the full button aligns with the footer action, keep the icon's internal centering instead of pulling it to that edge; an explicitly icon-aligned composition is a distinct variant. Check short and wrapping titles, description and body combinations, and footer actions, and preserve the target size.

## 2. Spatial grouping

The [spacing reference](spacing.md) owns semantic groups, internal and external gap relationships, and visible whitespace. When a page becomes denser, keep the hierarchy between levels rather than subtracting the same amount from every gap.

### G1: Separating content from its action group

**Scene.** A title is one group and three actions are another, and the icons inside the cluster are peers. A title-to-action gap smaller than the icon-to-icon gaps attaches the title to the first icon and separates that icon from its peers.

**Correction and acceptance.** Reserve the cluster as a unit with compact regular internal gaps and a distinctly larger title-to-cluster gap. Inspect the visible end of the title, not only its flex box. Repeat with a long title, hover, focus, and an open menu; truncation or scrolling text must not consume the separation.

### G2: Spacing between complex sections

**Scene.** Member cards form a section, and the following heading belongs to the task cards below it. The transition must be more evident than the separation within either section, especially when the last member row is only partly filled.

**Correction and acceptance.** Treat each heading and its content as one section and give the two sections explicit separation. Compare the last-card-to-next-heading gap with the heading-to-first-card gap using actual text and card edges; a 2:1 CSS margin ratio is not a substitute for looking. Check one and several member rows, wrapping task text, and the empty variant.

### G3: Nested groups along the reading order

**Scene.** A page heading and introduction form one group, search serves the catalog, and each subsection heading and description introduce that subsection's cards. Reusing one vertical gap at every transition flattens three levels into one sequence.

**Correction and acceptance.** Keep each heading close to its explanation, separate the page introduction from the catalog tools, and keep each subsection closer to its cards than to its neighbor; repeated subsections reuse the rhythm. Inspect the full stack with a wrapped introduction and expanded cards. Do not solve the problem by boxing every paragraph.

Public design systems show the same judgment. [Primer's form structure](https://primer.style/product/ui-patterns/forms/#structure) contrasts one vertical reading sequence with a two-column arrangement whose wrapping option-group label starts a second reading path: inspect the order and ownership of groups, not just matching input edges. [Carbon's form specification](https://www.carbondesignsystem.com/building-blocks/core/components/form/specifications) separates the introduction, repeated fields, and final action with different spacing levels on one content edge. Their numeric scales are evidence for their own systems, not defaults for this project.

### G4: Separating groups with different purposes

**Scene.** A sidebar's primary action, a global navigation group, and a heading that introduces a project list have different relationships, which equal row heights do not express.

**Correction and acceptance.** Keep the navigation rows together, separate that group from the project section, and bring the section heading closer to the items it labels; the primary action has its own separation. Review the full sidebar with the account area visible. A larger gap before every item would falsely turn each item into its own section.

### Composed whitespace and responsive grouping

Identify the layer responsible for group separation, then account for the assembled result: parent gap, child margins, native paragraph margins, heading padding, line-box whitespace, and conditional nodes can accumulate. Compare visible internal and external distances at the same hierarchy level; do not mechanically compare every large internal space against an unrelated outer gap. Initial-content spacing may differ when a heading has a description, but both structures need clear ownership.

Shared containers provide stable heading, description, body, and action arrangements that consumers reuse. Do not spread negative margins through consumers to cancel container defaults; express a concrete role or variant when a different distance is needed, then recheck the shared container's other combinations. A tighter local arrangement does not imply compressing every dialog. For example, when body and native paragraph margins accumulate and detach a dialog's guidance from its heading, move the guidance into the container's description region so it stays with the heading and apart from the actions.

In narrow containers, reflow complete semantic groups first. If an input squeezes its guidance into a very narrow column, keep the label and guidance together and move the input below them; do not shrink every font or move guidance into a neighboring group. Verify the actual component width and both sides of the breakpoint, not only the browser width. Container queries must work in the assembled application, where selectors, generated class names, or ancestor structure can stop a plausible declaration from applying.

## 3. Whole-page density

Allocate available space to the task's content and controls instead of reducing every gap or font size.

Density is how much useful work fits in the available space and how clearly it is organized. Compact repeatable rows can coexist with generous section gaps. Start from the reading and operating task, not an empty-space percentage: a long list benefits from stable row rhythm, a decision form needs its explanations and validation, and an empty page needs a coherent central group rather than the padding of a populated list.

When width decreases, preserve semantic groups before shortening labels or moving actions; wrap complete groups and keep their internal spacing. When height increases, decide which region expands; fixed gaps alone do not place an empty state. Inspect both excessive compression and excessive separation. A dense page is acceptable when comparison stays easy; a sparse page can still have poor grouping.

## 4. Information hierarchy

Make the next reading or decision step visible without turning every text element into a heading.

Use emphasis to express a task-relevant difference. A current selection, an actionable error, and the data needed for a decision deserve stable recognition. Labels and supporting metadata can be quieter, but making useful text hard to read is not hierarchy. Inspect size, weight, color, position, and surrounding whitespace together; piling all five onto every heading removes meaningful contrast.

The [icon reference](icons.md#placement-and-use) owns icon and label foreground roles and their semantic exceptions; case C1 applies the rule to search fields.

Typography participates in geometry: compare text starts, baselines, and line boxes with the intended font, long translations, and relevant font preferences. Pair size with line height and keep weights within the [visual foundation](../SKILL.md#visual-foundation). Content, code, terminal, and fixed interface roles need not scale identically; check the theme's font-setting owner before treating a deliberate difference as a defect. Correct the container allocation before shrinking useful text to force alignment.

### C1: Color emphasis within one information unit

**Scene.** Two search fields each pair a magnifier with a prompt, but one makes the icon darker and the other makes the text darker.

**Correction and acceptance.** Give the empty-field prompt one foreground role, including its leading icon. Compare computed color, opacity, disabled styling, and background together; two identical color tokens can still differ after an ancestor fades one child. Test empty, typed, focused, disabled, light, and dark variants. Typed query text and an independently actionable clear button need not use the placeholder's weaker role. A submenu value and its trailing chevron also form one value: a muted value with a darker chevron fails the relationship even when the geometry is correct.

## 5. Control states

Persistent state and transient feedback must stay distinguishable when they occur together.

State design assigns stable meanings, not just different colors. Selection says "this is the current item"; hover says "the pointer is here"; focus says "keyboard input goes here"; disabled says "this action is unavailable." Compare simultaneous states and adjacent items: a selected row beside a hovered unselected row matters as much as selected-plus-hover on one row.

| Combination | What must remain legible | Failure to look for |
|---|---|---|
| Selected, with another row hovered | The current location stays recognizable | The temporary row looks more selected than the current row |
| Selected, with hover on the same item | Selection persists while interaction feedback appears | A generic hover fill erases the current state |
| Selected, with keyboard focus | Location and keyboard target stay distinguishable | Focus disappears into the selection treatment |
| Selected and disabled | The retained choice and the temporary unavailability both stay visible | Fading the item makes it look deselected |
| Expanded, with a menu open | The active operation has a clear owner | A panel highlight and a row highlight compete without a stable relationship |

### S1: Persistent selection beside temporary hover

**Scene.** A selected list row, a neighboring hovered row, and an open row menu. Background paint is one cue alongside current-row semantics and revealed actions; selection and hover do not require different colors.

**Correction and acceptance.** Verify that selection persists when hover ends or a menu closes. Move between neighboring rows and traverse by keyboard, inspecting focus, action visibility, and current-row semantics together. Compare in the same theme and platform material; an opaque fixture cannot establish contrast on a translucent desktop backdrop.

## 6. Component choice

Choose the component by the interaction it represents, then fit its layout to the available space.

Navigation opens a destination, a toggle changes a setting, a checkbox adds an independent choice, and an action button starts an operation; similar geometry does not make them interchangeable. A card adds a containing group and more space, which is justified when that group needs an independent summary, state, or action, not merely because a row looks plain.

Keep the control's label, visible bounds, focus behavior, and click target consistent with the chosen interaction. If a visual correction changes those semantics, it needs behavior review as well. Geometry and radius are judged separately in [section 8](#8-control-geometry-and-corner-relationships); a native control is neither a guarantee of visual fit nor a reason to discard keyboard and accessibility behavior.

## 7. Icon optics

The [icon reference](icons.md) owns interface icon roles, slots, color, and optical balance. Product and package artwork keeps its separate owner.

### O1: Optical alignment of different icon types

**Scene.** At one tree depth, compare closed and open folders, native file-type icons, generic files, and names without icons, then the same pattern one level deeper.

**Correction and acceptance.** Preserve the depth indent and the common text start. Normalize the placement slots, then compare visible centers and perceived weight within them. Do not move a label to compensate for one glyph or align all depths to one edge. Inspect at normal size and magnification with selected backgrounds and long names; magnification diagnoses the drawing, while normal size decides whether the result balances.

### O2: Shared artwork at different consumer sizes

**Scene.** A chevron appears beside a menu label and inside a larger floating button, so enlarging its drawing within the same view box changes both.

**Correction and acceptance.** Compare the directional family, every weight, and the actual consumer sizes. Keep a modest supporting glyph beside text, and reduce the floating control's icon size if needed without shrinking its button. A large glyph sheet alone does not establish balance in either composition.

## 8. Control geometry and corner relationships

Equal roles and size variants follow one rule, and different roles have an understandable relationship. Review outer height, width, radius, curve, inset, and visible base together. Legal tokens can produce an incoherent combination, and one radius on every element can be equally incoherent. The project's radius standard owns values and nested geometry; this section does not create another scale.

Distinguish a tightly inset surface that follows its container from an independent card inside a panel: the first needs coordinated outer and inner curves and inset, and the second follows its own component role. Check the background, border, highlight, pseudo-elements, and clipping together. A hover fill that changes the visible silhouette is a state defect even when the resting border is correct.

### Decide geometry in this order

Classify the semantic role, select its existing size variant, identify the parent-child relationship, then inspect curve, material, and state. The radius standard and its named exceptions supply values; a larger bounding box after expansion does not select a new tier. Equal radius numbers can still look different when height or curve differs.

| Relationship | Decision | Visual failure to look for |
|---|---|---|
| Circular concentric inset | The inner radius is the outer radius minus the inset, clamped at zero; the arcs share a center | Same-radius inner and outer corners pinch or widen the visible band |
| Nested superellipses | Use the shared nominal size relationship, then inspect diagonal spacing; they are not exact offset curves | Claiming mathematically equal spacing from subtraction alone |
| Flush fill or adjoining segments | The enclosing silhouette owns exposed corners; internal joins stay square | Notches, crescents, double contours, or focus clipped with the fill |
| Independent child card or group | Choose its role tier instead of subtracting all surrounding space | Collapsing a legitimate child radius to zero because of large parent padding |
| Explicit circle or pill | Preserve round arcs for the container and its painted contents | A round avatar container holding a non-circular image; squircle-like capsule ends |

Compare fill, stroke, hover overlay, focus, and clipping together throughout the page or modal. Flat card borders and elevated materials have different paint ownership; applying both can double the edge. When a contour clips its fill, keep popups and keyboard focus fully visible.

[Fluent's shapes guidance](https://fluent2.microsoft.design/shapes/#when-to-avoid-rounded-corners) marks the notch where two separately rounded halves of a split button meet: treating each half as a complete silhouette breaks the shared enclosure. Apply the flush-fill arrangement, then check independent hover regions, focus, and the popup together. Fluent's radius and stroke scale are not this project's defaults.

### R1: Radii across container and control roles

**Scene.** An editor contains grouped rows, two inputs per row, an add button, and cancel and save actions, so every corner appears on one screen.

**Correction and acceptance.** Classify the outer editor, group, field, and button before selecting their existing variants; same-role controls at the same size match. Coordinate tightly nested curves with the actual inset, while independent children keep their own role. Check collapsed and expanded rows, field focus, hover fills, and long names. Do not justify an arbitrary radius by the total height after expansion.

### R2: Small selection controls within a form

**Scene.** Native checkboxes sit beside rounded form controls. The mismatch concerns the small control's silhouette and visual weight, not a requirement to give a checkbox the radius of a large input.

**Correction and acceptance.** Use a coherent small-selection-control treatment while keeping the recognizable checkbox silhouette and its label association. If native appearance is replaced, keep checked, unchecked, disabled, keyboard focus, and assistive semantics. Compare these states at actual size in both themes; an unchecked outline and its checked fill belong to one control family.

### R3: Justified geometry differences between roles

**Scene.** Nearby filter chips, a search field, and a primary create action have similar heights but a conspicuous jump in roundness because each feature chose its own radius.

**Correction and acceptance.** Reuse the established control variants. A true pill is an explicit component type; it does not authorize every compact button to use half its height as radius. Compare filters, search, and primary and secondary buttons in one frame, including hover and focus contours. Keep a meaningful pill-versus-field distinction where intended rather than forcing equal radii because the controls share a row.

## Reproduce and compare

Fixtures built from production components can supply isolated examples with repeatable content and state. Derive actual application captures from the whole page or modal under review, including its relevant regions and states. A fixture establishes only what it renders; it does not decide or complete the review scope.

Dimensions found in these components are evidence about those examples, not universal design constants. The project's styling documentation, radius standard, and component owners keep authority over shared values. Extend the evidence for new consumers or a different task instead of copying an example's number without its conditions.

Public design systems and published agent skills are research inputs, not replacements for the project's rules: borrow their relationship tests and inspection methods, not their token names, numeric scales, typography, or title-case conventions. A product screenshot is evidence with a defined scope; it does not reveal unseen states, resizing, or nested-corner behavior.
