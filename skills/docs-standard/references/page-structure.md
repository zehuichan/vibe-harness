# Page structure and style

## Page order

Use this order for authored human-facing pages. Generated artifacts, Agent Notes, postmortems, and parser-owned formats keep their own skeletons.

1. Optional YAML metadata when the project uses it.
2. H1 title.
3. Language switcher for a bilingual page.
4. `## Summary`: three to five sentences in one paragraph stating what the reader can do or observe, why the reader would care, the main operating model, and the most important boundary.
5. `## Table of Contents` for pages with more than about four sections: links to the H2 sections, navigational rather than descriptive.
6. Stable content, ordered from user-facing use to developer-facing design and operational detail.
7. Optional `## Further Exploration`: three to seven links to adjacent pages, ordered from closest prerequisite to deeper material, each with a short phrase saying what it adds.

Do not force this wrapper around tiny machine-owned files or generated fragments.

## Section progression

Open every substantive H2 with a short orienting paragraph before tables, code, or H3 subsections. State the section's subject and decision-relevant point; do not repeat its contents.

Order content by reader depth:

1. Basic use: when to choose the feature, required inputs, the shortest safe example, observable success, and likely recovery.
2. Advanced use: configuration choices, limits, operations, and integration behavior.
3. Developer detail: ownership, lifecycle, data model, failures, performance, security, and extension points worth maintaining.

Developer detail is concept-level: the design concept, the architecture of the main components, and approximate data flow, plus links to code for exact detail. It never becomes an exhaustive catalog of APIs, columns, or event payloads. Keep exhaustive generated types or catalogs behind a compact entry paragraph and a stable index.

## Module README skeleton

Classify the module by its entry, not its folder: read the manifest and entry exports before choosing the shape. A library (a plain API that other code imports) and a runnable or pluggable component (a CLI, a service, a plugin that registers into a host) have different usage paths; never give a library install-and-run or mount guidance.

```markdown
# <module name>

## Summary

Three to five sentences: what a caller can do with the module, who consumes it, the smallest entry point, and the main boundary.

## Use this module

### When to use it

The consuming call sites or products, and when to choose this module over an alternative.

### Entry point

The smallest working call (library) or the smallest working configuration and command (component), followed by what success and failure look like. Link the owning contracts in source for exact detail.

## Understand the implementation

Design concept, main components, and approximate data flow, with a short source map. No API catalogs.

## Further Exploration

Adjacent pages, closest prerequisite first.

## Known limitations

Current constraints that a caller or maintainer must plan around, as top-level bullets. Ordinary cleanup stays in its `TODO` or Agent Note.
```

A folder that only groups modules gets a short index README instead: three to five sentences on what the group covers, then one line per child module stating its purpose, linking the child README without restating it.

## Folding

On hosts that render HTML in Markdown (GitHub, GitLab), heavy developer detail may sit behind `<details>`/`<summary>` with the section title and anchor kept visible above the fold. Inside the block, put a blank line after `<summary>`, keep every Markdown line at column 0 (indented lines become code blocks), and close with `</details>` after a blank line.

## Small rule files

Give an independently searchable rule, practice, or decision family its own small file when it has its own owner, change cadence, inbound links, or validation. Keep tightly coupled rules together when splitting would force readers to open several files to understand one obligation. An index page explains the folder in three to five sentences and links its children by purpose without restating them.

## Controlled technical English

Use an ASD-STE100-inspired review pass for English prose that an agent, translator, or non-native reader must parse. This is a clarity discipline, not certified compliance.

- Name the actor and the action. Prefer active voice when the actor matters.
- Use one stable term for each concept; do not rotate synonyms for variety.
- Prefer direct verbs over nominalizations and ambiguous phrasal verbs.
- Put one instruction in each sentence; use a list for three or more steps or conditions.
- Split semicolon chains and long clause chains; keep each paragraph on one topic.
- Remove unsupported quality adjectives and stacked hedges, preserving every fact and degree of uncertainty.

Treat 20 words for an instruction and 25 for a description as review prompts, not mechanical limits. Keep a longer sentence when a split would hide a condition. Never remove or strengthen `must`, `may`, `never`, timing, exceptions, or numbers to meet a length target.

## Emphasis discipline

Reserve bold for the clause that changes behavior or the comparison that matters. In comparison tables, bold the headers and the best value in each row. Bold, capitals, or "critically" everywhere means nothing stands out.

## Separators

When a long page has distinct major parts, a `-----` rule on its own line with a blank line before and after may separate them. A rule directly after a paragraph parses as a Setext heading.
