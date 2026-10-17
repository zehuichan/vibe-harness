---
name: upgrade-guide
description: Use when a change breaks an externally perceptible surface (CLI commands or flags, configuration or settings keys, persisted user data, SDK, HTTP, or wire APIs, published package names or entry points), or when changing a surface that an unreleased upgrade guide already covers, to write or update docs/upgrade-guide/v<version>/<item>/guide.md.
---

# Upgrade guides

An upgrade guide tells a reader who runs release vT what to change to run the next release. Write it in the change that introduces the break, as soon as the break is recognized; do not defer it to release preparation. This applies when the profile enables `surfaces.public-api`.

## Scope

Write a guide only for breaks that someone outside the repository can observe after upgrading:

- commands, flags, and profile or mode names;
- configuration, settings, and environment keys or their accepted values;
- persisted user data: databases, logs, caches, and user data directories;
- SDK exports, HTTP, RPC, and other wire messages;
- published package names and entry points.

Internal APIs whose consumers are all updated in the same change need no guide. A persisted-format change still follows the project's data-migration rules; its guide states only the reader's actions and links that record.

## Location

`docs/upgrade-guide/v<version>/<item>/guide.md`

- `<version>` is the project's current released version as recorded in its package manifest or version file when you write the guide. The guide describes the upgrade from that release to the next one.
- `<item>` is a kebab-case name for the changed surface, for example `config-key-rename`.
- Each item directory holds exactly `guide.md`, plus its translated counterpart when the profile enables `surfaces.bilingual-docs`; no index and no attachments.

## Maintenance

While the version is unchanged, the current version directory describes the delta from vT to the current default branch. When a later change touches a surface a guide there covers, update that guide in the same change; delete the guide when the break is reverted. After the version bump, guides in older version directories are frozen, and a new break goes into the new version directory. Never write a guide spanning more than one release.

## Format

Start from [the template](references/template.md):

- frontmatter with `kind: upgrade-guide` and a one-sentence `description` naming what breaks;
- one `#` title, then exactly `## Change` and `## Migration`, in that order;
- at most 500 words, frontmatter included.

`Change` states the old and new behavior of the surface and who is affected. `Migration` lists ordered steps that name exact files, keys, commands, or symbols, and states how to confirm the migration worked.

When a guide needs more than 500 words, the extra text belongs elsewhere: link source files instead of restating code, move rationale into an Agent Note (see [agent-notes](../agent-notes/SKILL.md)), and turn repeated mechanical steps into a script or command the guide invokes. Follow [prose-standard](../prose-standard/SKILL.md).

## Verify

- Run every command in the Migration section against a checkout of release vT upgraded to the change, or state which step could not be exercised and why.
- Count words (`wc -w docs/upgrade-guide/v<version>/<item>/guide.md`) and confirm the section order.
- Run the profile's `commands.docs-check` and confirm relative links resolve.
