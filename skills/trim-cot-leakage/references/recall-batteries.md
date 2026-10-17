# Recall batteries

Probes for [the taxonomy](../SKILL.md#taxonomy). Every hit needs semantic judgment: the batteries over-match by design, and they under-match by nature, so pair them with an unpatterned read of the densest prose in scope.

## Invocation rules

- Add `--hidden --glob '!.git/**'` so `.agents/` is searched; ripgrep skips dot-directories by default, and Agent Notes are a frequent miss.
- Put exclusions last so a later include cannot re-admit them: `--glob '!vendor/**' --glob '!node_modules/**' --glob '!.agents/notes/archived/**' --glob '!.agents/skills/trim-cot-leakage/**'` (this skill quotes leaked wording as calibration), plus recorded fixture and snapshot directories.
- Natural-language probes use `-i` so sentence-initial capitals match ("This PR adds…"); the code-pattern probe stays case-sensitive, because `-i` turns `\bT\d\b` into noise.
- Bound complete phrases. `\bthis PR\b` must match "this PR adds" without matching "this project" or "this provider".
- A zero-hit pattern proves nothing until it matches a known positive, and a noisy pattern proves nothing until it rejects a near-miss negative. Calibrate both before trusting a corpus result.
- Target authoring-language probes at the opposite-language surface: search non-English residue in English Markdown and code comments, and change narration inside translated files.

## English battery

```sh
rg -n --hidden '\(decision \d|\(audit [A-Z]\d|design §|plan §|design ledger|\bW\d\b|\bT\d\b' ...
rg -n --hidden -i '\bthis PR\b|\bthis branch\b|\bthis stack\b|\blater PRs?\b|\bprevious commits?\b|\bthis commit\b' ...
rg -n --hidden -i '\bused to\b|\bno longer\b|\bpreviously\b|\bthe old\b|\bwas renamed\b|\bwas moved\b' ...
rg -n --hidden -i '\bv1\b|this cut|\bcut \d|\btoday\b|\bfor now\b|roadmap' ...
rg -n --hidden -i 'rejected in review|review round|reviewer|as of v\d' ...
rg -n --hidden -i 'probably |should be enough|should suffice|it simply|is safe —|is safe --' ...
rg -n --hidden '§\d' ...
```

## Chinese batteries

Use these when the team's working language is Chinese; adapt the word lists for other working languages.

```sh
# Change or review narration in Chinese counterparts.
rg -n --hidden '评审|上一?轮|旧版|老的|不再|以前|本版|遗留' --glob '*.zh.md' ...

# Chinese authoring-language slips in English Markdown.
rg -n --hidden '设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|(^|[^a-zA-Z])端([^a-zA-Z]|$)' --glob '*.md' --glob '!*.zh.md' ...

# Chinese authoring-language slips in code comments.
rg -n --hidden '(//|/\*|^\s*\*|#)[^\r\n]*(设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|端)' --glob '*.{ts,tsx,js,jsx,mjs,cjs,css,py,go,rs,java,kt}' ...
```

## Known false-positive families

- **Instrumental "used to":** "the key used to sign requests" is instrumental, not temporal. The temporal form has a prior state before it ("colors used to come from…").
- **Runtime old/new:** "the old connection drains before the new one accepts" names live objects during handover.
- **"This PR" in process docs:** documentation about the pull-request workflow (templates, contribution guides) legitimately says "PR"; the ban is on a document adopting one pull request's vantage about the code.
- **`v1` as protocol or path segment:** `/v1/chat` endpoints and wire-format names are identifiers.
- **`§N` with a committed owner:** external standards and committed documents that own their section numbering stay citable by section.
- **Runtime "today" and recorded timestamps:** prompts or tests that ask for the current date use natural time. Wording that reaches a model or user still follows the behavior-evidence rule before any edit.
- **本版本 in Chinese prose:** a legitimate rendering of "this release" for versioned artifacts; the banned indexical is a bare 本版 mirroring "this cut".
- **Alternatives considered sections:** "rejected" inside an Agent Note's alternatives is the sanctioned home.
