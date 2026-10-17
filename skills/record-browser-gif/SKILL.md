---
name: record-browser-gif
description: Record browser or Web UI interaction demos as verified, optimized GIFs using the available browser-control workflow, optional Playwright video for higher capture frame rates, and a deterministic encoder, then attach the GIF to a pull request with gh --attach, falling back to a dedicated assets branch. Use when asked to make, record, or generate a GIF demonstrating a browser workflow, and as evidence for pull requests that change user-visible GUI behavior.
---

# Record a browser GIF

Produce a short, truthful UI demonstration as a local GIF and, only when the task includes attaching it to a pull request, publish it through the attach workflow at the end. Prefer the available browser-control workflow; use [Playwright video](https://playwright.dev/docs/videos) when continuous capture at a higher frame rate helps; use the bundled encoder for trimming, speed, final hold, dimensions, and size.

## GIF evidence for GUI changes

When the project rules require GIF evidence for user-visible GUI changes, record it with this skill from the change's own code. The recording is evidence: use a real server built from that branch and the real data path. Do not substitute fixture data, mock transports, synthetic event injection, or test-only hooks unless the user explicitly asks for a fixture recording. Next to the embed, state the demonstrated commit, the server and origin that served it, any mode flags or browser-state exceptions, and whether real external services ran.

## Keep recording separate from publication

- Recording produces local video or screenshots and one `.gif` artifact; it never mutates remote state.
- Publication (attaching to a pull request body, or pushing to an assets branch) is a separate final step, performed only when the task includes it. It never touches the pull request's own branch.
- Preserve the requested recording conditions. If credentials or the server are unavailable, report that limitation instead of substituting a fixture.
- Never read or expose credential values; use the application's normal configuration path and a benign demonstration scenario.

## Stage the application

1. Require a clean worktree, record its exact commit with `git rev-parse HEAD`, then build that tree with the profile's `commands.build`. A GIF recorded against another commit's build misattributes the evidence.
2. Boot one server per port from that tree with fresh scratch state (data directories, workspaces, sessions). Give the browser a fresh isolated context; if the browser workflow cannot create one, clear that origin's cookies and site storage before navigating.
3. Treat one storyboard as one evidence run: every published frame comes from that server, state, and scenario run. If capture automation fails, discard its frames and rerun from fresh state; never splice frames from separate runs.
4. When switching between branches, stop the old server by PID or an exact command-line match. A broad `pkill -f` pattern can kill the shell that launched it.

## Record the flow

Follow the available browser-control workflow's setup, interaction, and cleanup instructions. When it can record video on its controlled context, enable that; otherwise use screenshot capture within the same workflow. Only when browser control is unavailable, use the project's own Playwright dependency in an isolated headless browser and state that fallback; do not install another driver or open the user's personal browser.

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

Choose a short story with three to six meaningful states. Wait for unique semantic locators before acting, and use exact-match predicates that cannot match an echo of the input. Fixed waits may provide a reading hold after the state is verified, never readiness. Preserve animations and scrolling. When demonstrating a failure or recovery, open its detail so the recording shows the identity, status or stable error code, and downstream result.

Capture no secrets, personal data, unrelated tabs, or notifications. Review the whole selected interval, including intermediate states, and keep one viewport throughout.

## Encode the GIF

Require `python3`, `ffmpeg`, and `ffprobe`. If a media binary is missing, report the dependency instead of installing software without authorization.

```sh
python3 <this-skill-dir>/scripts/encode_gif.py \
  /absolute/path/to/demo.webm /absolute/path/to/demo.gif \
  --start 2 --end 32 --speed 2 --final-hold 3 \
  --fps 10 --max-width 1200 --colors 128
```

`--start` and `--end` select one continuous source interval in seconds; defaults keep the full video at 1× speed with a two-second final hold. Disclose `--speed` and the selected interval beside the GIF so the demo cannot imply measured latency. Use observed video times, preserve the complete cause and outcome of the demonstrated behavior, and keep the original WebM for QA. `--fps` cannot recover motion the source did not capture.

The encoder probes the container duration, applies trim and speed before palette conversion, checks encoded duration, animation, width, and byte size, and refuses empty or out-of-range intervals, mode-inappropriate flags, and accidental overwrites. For a large artifact, reduce `--max-width`, then `--colors` or `--fps`, keeping text readable. Use `--force` only after resolving the exact output path.

### Screenshot capture

When continuous video is unavailable or a storyboard is requested, capture three to six verified states from one isolated run, saved as `00-initial.png`, `01-typed.png`, and so on, with identical dimensions and crop.

```sh
python3 <this-skill-dir>/scripts/encode_gif.py \
  /absolute/path/to/frames /absolute/path/to/demo.gif \
  --durations 1.5,1.5,1.5,3.5 --fps 10 --max-width 1200 --colors 128
```

One duration applies to every frame; otherwise supply one positive duration per frame and hold the settled state longest.

## Verify the artifact

1. Read the encoder's JSON summary: output path, interval and speed (or frame count), encoded frames, dimensions, duration, and byte size.
2. Look at the encoded GIF itself, not only the source frames. If the viewer shows only the first frame, decode representative frames with `ffmpeg` and inspect those.
3. Run `git status --short` and confirm that raw video, QA frames, and the GIF landed only under ignored paths.
4. Return the absolute GIF path, render it when the client supports local media, and state whether the recording used real services, fixtures, or another transport. Stop here unless the task includes attaching it.

Encoder maintenance: `python3 -m unittest discover -s <this-skill-dir>/scripts -p 'test_*.py' -v` with the media prerequisites installed.

## Publish the GIF

Never commit a GIF to the pull request's branch or any branch that merges into a long-lived branch: binary media there bloats history for every clone.

### Attach with gh

`gh --attach` requires `gh` v2.99.0 or later, a repository on github.com, write access, and a GIF of at most 10 MB. Reference the GIF in the body file with the same local path passed to `--attach`; `gh` uploads it and rewrites the reference in place:

```sh
gh pr create --body-file body.md --attach path/to/demo.gif   # new pull request
gh pr edit <pr> --body-file body.md --attach path/to/demo.gif   # existing pull request
```

Immediately before attaching, re-read the pull request's live head and compare it with the commit recorded next to the GIF; re-record if it moved. Afterward, re-read the live body, confirm the reference points at the uploaded URL, and fetch that URL once to confirm `200` and `image/gif`.

### Fall back to an assets branch

Only when `gh --attach` cannot apply, push the GIF to a dedicated orphan assets branch (`<series>-assets`) from a shallow scratch clone, never your working tree. Verify the branch holds media only and the staged checksum matches the verified artifact. Embed it with `https://github.com/<owner>/<repo>/blob/<assets-branch>/<name>.gif?raw=true`; the `?raw=true` suffix is required. Never rewrite, force-push, or delete an assets branch, because merged pull request bodies reference its URLs forever.
