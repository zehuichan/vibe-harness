# Defensive patterns

Each page in this directory states rules this repository enforces in review: the rule, the defect it prevents, the condition a reviewer judges, its boundary, and who approves an exception. Read the page for the artifact you are about to change before you change it.

## Why these rules

Five habits cover most of what follows; each page applies them to one kind of artifact.

- **Make correctness explicit.** Write it into the structure (named call points, explicit lifecycles, explicit conditions and types) instead of compensating afterwards with timing.
- **Keep one source of truth.** One read path for a piece of data, one home for a fact, one owner for shared state.
- **Extend through the registered extension point.** A new capability registers itself; an existing carrier stops taking new branches.
- **Keep the change equal to its review.** A change carries only the lines its stated behavior change needs, a migration moves code instead of rewriting it, and a performance-sensitive change carries its measurement.
- **Require evidence.** A claim is falsifiable and recomputable, measured before and after or checked by an executed check, instead of kept in sync by hand.

| Changing | Read |
|---|---|
| Timing, state representation, shared ownership, capability placement, migrations, performance, disposal, callbacks, subprocesses, filesystem cleanup | [general.md](general.md) |

Add a page per artifact family when the project accumulates rules that only apply there (for example client components, remote APIs, persistence, or package exports), and add its row to the table. Each rule on a page states what must hold, the judged condition, its boundary, and a correct and a wrong example.

The [`code-review`](../../.agents/skills/code-review/SKILL.md) skill reads this directory when judging a change; decision rationale belongs in Agent Notes and the [documentation standard](../AGENTS.md) owns placement.
