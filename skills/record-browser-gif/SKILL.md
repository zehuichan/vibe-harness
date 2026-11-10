---
name: record-browser-gif
description: Record browser or Web UI interaction demos as verified, optimized GIFs using the available browser-control workflow, optional Playwright video for higher capture frame rates, and a deterministic encoder, then attach the GIF to a pull request with gh --attach; publication requires gh v2.99.0 or later, and a GIF over 5 MiB is split into parts. Use when asked to make, record, or generate a GIF demonstrating a browser workflow, and as evidence for pull requests that change user-visible GUI behavior.
---

# Record a browser GIF

Produce a short, truthful UI demonstration as a local GIF and, only when the task includes attaching it to a pull request, publish it through the attach workflow at the end. Prefer the available browser-control workflow; use [Playwright video](https://playwright.dev/docs/videos) when continuous capture at a higher frame rate helps; use the bundled encoder for trimming, speed, final hold, dimensions, and size.

## GIF evidence for GUI changes

When the profile enables `surfaces.ui`, a pull request that changes user-visible GUI behavior includes a demonstration GIF recorded with this skill and embedded through [the attach workflow](#publish-the-gif), unless the project rules waive GIF evidence; a pull request that embeds none for a GUI change says why. Record it from the change's own code. The recording is evidence: use a real server built from that branch and the real data path. Do not substitute fixture data, mock transports, synthetic event injection, or test-only hooks unless the user explicitly asks for a fixture recording. Next to the embed, state the demonstrated commit, the server and origin that served it, any mode flags or browser-state exceptions, and whether real external services ran.

## Keep recording separate from publication

- Recording produces local video or screenshots; encoding produces one `.gif` artifact, or its [numbered parts](#attach-with-gh) when it exceeds 5 MiB. Neither mutates remote state.
- Publication (attaching the GIF to a pull request body with `gh --attach`) is a separate final step, performed only when the task includes it. It never commits to any branch.
- Preserve the requested recording conditions. If credentials or the server are unavailable, report that limitation instead of substituting a fixture.
- Never read or expose credential values; use the application's normal configuration path and a benign demonstration scenario.

## Stage the application

1. Require a clean worktree, record its exact commit with `git rev-parse HEAD`, then build that tree with the profile's `commands.build`. A GIF recorded against another commit's build misattributes the evidence.
2. Boot one server per port from that tree with fresh scratch state (data directories, workspaces, sessions). Give the browser a fresh isolated context; if the browser workflow cannot create one, clear that origin's cookies and site storage before navigating.
3. Treat one storyboard as one evidence run: every published frame comes from that server, state, and scenario run. If capture automation fails, discard its frames and rerun from fresh state; never splice frames from separate runs.
4. When switching between branches, stop the old server by PID or an exact command-line match. A broad `pkill -f` pattern can kill the shell that launched it.

## Record the flow

Follow the available browser-control workflow's setup, interaction, and cleanup instructions. When it can record video on its controlled context, enable that; otherwise use screenshot capture within the same workflow. Video availability does not decide which browser-control workflow to use. Existing user browser state is allowed only as a disclosed isolation exception. Only when browser control is unavailable, use the project's own Playwright dependency in an isolated headless browser and state that fallback; do not install another driver or open the user's personal browser.

Before recording, identify the origin, the built or development server, the transport, and any mode overrides. When a production default opens a native surface that automation cannot drive, select a browser-operable production backend through the application's normal configuration and disclose that override.

Store scripts, raw video, timing notes, QA frames, and the GIF under the gitignored `.agent-scratch/` directory, in a fresh run directory.

### Capture video

Match `viewport` and `recordVideo.size` explicitly; Playwright otherwise scales video down to fit 800×800, which can make text unreadable.

```js
import { chromium } from 'playwright'
import { join } from 'node:path'

const size = { width: 1440, height: 900 }
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: size, recordVideo: { dir: join(runDir, 'videos'), size } })
try {
  const page = await context.newPage()
  const video = page.video()
  // Navigate and exercise the real application here.
  await context.close()
  await video.saveAs(join(runDir, 'demo.webm'))
} finally {
  await context.close()
  await browser.close()
}
```

Set `runDir` to an absolute path. Retain the page's video handle before closing, and await `context.close()` before `video.saveAs()` or encoding; closing only the browser does not guarantee the flush. Each page has its own video; do not concatenate unrelated pages or runs.

Choose a short story with three to six meaningful states. Wait for unique semantic locators before acting, and use exact-match predicates that cannot match an echo of the input. Fixed waits may provide a reading hold after the state is verified, never readiness. Preserve animations and scrolling. When demonstrating a failure or recovery, open its detail so the recording shows the identity, status or stable error code, and downstream result. When a transient running state matters, trigger a slow foreground operation and observe its concrete DOM marker; continuous video captures the intermediate frames. End on a visible completion marker, and stop an unnecessarily long run with real external services once the demonstrated state is visible.

Capture no secrets, personal data, unrelated tabs, or notifications. Browser video shows page content, not browser chrome, so do not render credential-bearing URLs in the application. Review the whole selected interval, including intermediate states, and keep one viewport throughout.

## Encode the GIF

Require `python3`, `ffmpeg`, and `ffprobe`. If a media binary is missing, report the dependency instead of installing software without authorization.

```sh
python3 <this-skill-dir>/scripts/encode_gif.py \
  /absolute/path/to/demo.webm /absolute/path/to/demo.gif \
  --start 2 --end 32 --speed 2 --final-hold 3 \
  --fps 10 --max-width 1200 --colors 128
```

`--start` and `--end` select one continuous source interval in seconds; defaults keep the full video at 1× speed with a two-second final hold. Disclose `--speed` and the selected interval beside the GIF so the demo cannot imply measured latency. Use observed video times, not guessed wall-clock offsets, preserve the complete cause and outcome of the demonstrated behavior, and keep the original WebM for QA. The final hold repeats the last selected frame. `--fps` cannot recover motion the source did not capture; do not splice separate runs or synthesize missing states.

The encoder probes the container duration, applies trim and speed before palette conversion, checks encoded duration, animation, width, and byte size, and refuses empty or out-of-range intervals, a selection shorter than two output frames, mode-inappropriate flags, and accidental overwrites. For a large artifact, reduce `--max-width`, then `--colors` or `--fps`, keeping text readable. Use `--force` only after resolving the exact output path.

### Screenshot capture

When continuous video is unavailable or a storyboard is requested, capture three to six verified states from one isolated run with the browser's screenshot API. Save the returned image bytes directly under one run directory as `00-initial.png`, `01-typed.png`, and so on, with identical dimensions and crop. For a transient state, poll its DOM marker and capture within the same browser-script call.

```sh
python3 <this-skill-dir>/scripts/encode_gif.py \
  /absolute/path/to/frames /absolute/path/to/demo.gif \
  --durations 1.5,1.5,1.5,3.5 --fps 10 --max-width 1200 --colors 128
```

One duration applies to every frame; otherwise supply one positive duration per frame and hold the settled state longest. Directory input rejects fewer than two frames and mismatched dimensions or duration counts. Video timing flags apply only to video files; `--durations` and `--pattern` apply only to screenshot directories.

## Verify the artifact

1. Read the encoder's JSON summary: output path, interval and speed (or frame count), encoded frames, dimensions, duration, and byte size.
2. Look at the encoded GIF itself, not only the source frames, and confirm that the transition is legible, the last state is held long enough, and no sensitive content appears. If the viewer shows only the first frame, decode representative frames with `ffmpeg` and inspect those; source screenshots do not prove the encoded order, palette, or final hold.
3. Run `git status --short` and confirm that raw video, QA frames, and the GIF landed only under ignored paths.
4. Return the absolute GIF path, render it when the client supports local media, and state whether the recording used real services, fixtures, or another transport. Stop here unless the task includes attaching it.

Encoder maintenance: `python3 -m unittest discover -s <this-skill-dir>/scripts -p 'test_*.py' -v` with the media prerequisites installed.

## Publish the GIF

Never commit a GIF to the pull request's branch or any other branch: every default clone and full-history fetch downloads media committed to any branch. Publish only with `gh --attach`, which uploads the GIF and rewrites the body reference in one command, so no branch carries the media.

### Attach with gh

Before attaching, check `gh --version`. `gh --attach` requires `gh` v2.99.0 or later, a repository on github.com (GitHub Enterprise Server is not supported), and write access. When `gh` is older, stop and ask the developer to upgrade it; keep the verified GIF for the retry, and do not install or upgrade `gh` without authorization. When any other requirement is unmet or the attach fails (authentication, write access, a host other than github.com, or an upload error), stop and report it. Never publish the GIF any other way.

Publish GIFs of at most 5 MiB, the encoder's default `--max-bytes`. When the encoder rejects the output for size, reduce `--max-width`, then `--colors` or `--fps`. When the GIF still exceeds 5 MiB at readable text quality, split it: encode consecutive, non-overlapping intervals of the same evidence run into numbered parts that each pass the size check (`--start` and `--end` over the one video, or consecutive screenshot subsets selected with `--pattern`), and verify every part as an artifact. Beside each embed, state its position (such as `2/3`) and its source interval or frames.

Reference each GIF in the body file with the same local path passed to `--attach`; `gh` uploads it and rewrites the reference in place, keeping its position and alt text, so the order of references in the body sets the display order of split parts.

The demonstrated pull request is normally the publication target. A pull request that changes tooling may instead embed a clearly labeled example from another pull request: name that source pull request, compare its live head in every check below, and never attribute the example to the tooling branch.

Immediately before attaching, re-read the demonstrated pull request's live head (for a pull request that does not exist yet, the pushed branch tip) and compare it with the commit recorded next to the GIF. Stop and re-record when it moved. Then attach:

```sh
gh pr create --body-file body.md --attach path/to/demo.gif   # new pull request
gh pr edit <pr> --body-file body.md --attach path/to/demo.gif   # existing pull request
```

`--attach` is repeatable but refuses the same file twice. Publish split parts in one `gh pr create` or `gh pr edit` with one `--attach` per part, so one pair of live-head checks covers every part. A GIF the body does not reference is appended at the end of the body, where alt text set on the flag (`--attach '<path>#<alt text>'`) applies; a rewritten reference keeps the body's alt text.

After attaching, re-read the demonstrated live head and require it to remain at the recorded commit. Re-read the live body and confirm each reference points at its uploaded URL, render the body through GitHub's Markdown API and confirm the expected image element, and fetch each uploaded URL once to confirm `200` and `image/gif`.

### Existing assets branches

If earlier pull request bodies embed GIFs from dedicated assets branches, never add to, delete, rewrite, or force-push those branches: merged pull request bodies reference their URLs.
