# Documentation review criteria

Review documentation by whether a reader completes an outcome, not by whether every template heading exists. Verify prose against code and tests, preserve exact contracts, and keep READMEs useful to consumers while exposing enough implementation detail for maintainers.

## Newcomer test

An engineer with no repository context should be able to answer the following after three to five linked pages: what the product or feature does, how to run or use it safely, where its state lives, which component owns it, how it fails, and where to change it. If the reader must inspect source merely to discover the public flow, restore the missing explanation. If the reader must absorb unrelated internals, move those details deeper.

## Evidence review

Check each material statement against its strongest owner: package metadata for names and entry points, public types and API docs for contracts, runtime code for behavior, tests for exercised failure paths, generated catalogs for exhaustive inventories, and active Agent Notes for rationale. Never treat a prior README, discussion, or report as stronger than current code and tests.

For every operational claim (a command, a configuration snippet, a default value, an error message, a platform difference) the evidence is running it, not reading it. Quote only observed output, warnings, and failures. Claims that depend on unavailable credentials or networks name their verification owner instead of asserting behavior.

Retain a statement only when it helps the target reader act, reason, or avoid misuse. Move rationale, history, test walkthroughs, duplicate catalogs, and unrelated module detail to their owners.

## README review

Require the following without forcing one universal heading set:

- a precise title and a three-to-five-sentence Summary saying what the subject does for its reader;
- when to choose or avoid the module;
- the smallest safe configuration or usage path that applies to this kind of module;
- observable behavior, failures, durability, security, and performance limits relevant to consumers;
- developer-facing ownership and data or lifecycle design at concept level, with code links for exact detail;
- known limitations and deferred work that affect use or safe maintenance (not a cleanup backlog);
- Further Exploration where adjacent docs materially help.

Do not restate API docs or generated catalogs; link the owner and explain only the decision or relationship needed locally. Reject user-facing sections that narrate internals and developer sections that enumerate APIs instead of explaining the concept.

## Verification

Run the smallest focused checks while iterating, then the profile's `commands.docs-check` and `git diff --check`. For bilingual pairs, compare structure, links, and code blocks line by line. Re-read the final diff once for factual completeness and once for brevity, navigation, and ownership.
