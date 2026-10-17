# Template: upgrade guide

Copy this skeleton into `docs/upgrade-guide/v<version>/<item>/guide.md`. A translated counterpart keeps the same structure with translated section names.

````markdown
---
kind: upgrade-guide
description: "The externally perceptible surface that breaks and what replaces it."
---

# <Specific break, for example: `--profile` replaces `--preset`>

## Change

State the old and new behavior of the surface and who observes it.

## Migration

1. Name the exact file, key, command, or symbol to change, with a before/after snippet when it is shorter than prose.
2. State how to confirm the migration worked.
````
