# Phase V — video sources (stock / local file / direct URL)

**Appetite:** ~0.5 day · **Queue-jumps C** (user's call, DECISIONS
2026-08-30 "Phase V planned") · **Branch:** `phase-v-video-sources`

When **Video** is the selected background, a sub-options row appears:
paste a direct media URL, drag-drop a local video, or pick a file.
Default behaviour unchanged: the stock clip plays. Camera path
untouched. Renderer and shader untouched — **no SAFETY paths in this
phase** (G5's parked SAFETY re-verify is not triggered).

Standing constraint `[factual-source]`: YouTube links cannot render
client-side (cross-origin iframe = zero pixel access; raw stream URLs
signed + non-CORS). The URL field accepts **direct video-file URLs
only** and says so when a page URL is pasted — Option A, ratified
2026-08-30; B (tab-capture) and C (proxy) rejected, see DECISIONS.

## Data-flow trace (before it's built)

```
user gesture (one of):
  "Video" seg button ──▶ state.videoMode = true
                           ├─▶ sub-options row unhidden
                           └─▶ stock clip plays (exactly as today)

  Select file / drop ──File──▶ revoke previous object URL (if any)
                                URL.createObjectURL(file)   ← born here
                                  │ same-origin blob: URL — never CORS-gated
                                  ▼
  Paste URL + Load ──string──▶ page-URL check (youtube/vimeo/watch-page
                                shapes) ──match──▶ inline message, no load
                                  │ looks like direct media
                                  ▼
                     fileVideo.crossorigin = 'anonymous'  (remote only;
                     removed again for stock/local — same-origin needs none)
                     fileVideo.src = <blob: | https: | stock path>
                     fileVideo.play()
                       │
                       ├─ 'error' event ──▶ message in #note + revert
                       │                     to stock (source enum resets)
                       ▼ decoded frames
  frame loop (renderer.js — UNCHANGED): videoMode && readyState>=2
                       ──▶ texImage2D once per frame, both panes
                       ▼
  #note ◀── source line: stock credit / local filename / URL host
```

Where each value is born and dies:
- **source enum** (`stock | local | url`) — born in controls state,
  UI-only, never in presets (a portrait is the condition, not the
  footage).
- **object URL** — born at pick/drop, revoked at the next source
  switch (leak otherwise: each blob URL pins the file in memory).
- **crossorigin** — set per-source *before* `src` (order matters: set
  after and the fetch has already gone out uncredentialed).
- **stock path + credit string** — currently hardcoded in
  [sim.html](../../sim.html) markup and `updateNote()`; both move to
  `config.js` (config-never-constants rule). Nothing else new enters
  config — a knob nothing reads is a design smell the trace exists to
  catch.

Design risk surfaced by the trace: the **error→revert path is the only
path that writes the enum without a user gesture** — step 4's check
exercises it explicitly so a failed URL can't strand the UI showing
"URL" while stock plays.

## Ratified design

Stage-1 sketch as ratified (no amendments):

```
                      ┌─────────────────────────────────────────────┐
 Background: Video ──▶│ SOURCE  controls.js / sim.html              │
   click reveals      │                                             │
      │               │  VIDEO SOURCE PICKER  ← NEW (General tab,   │
      ▼               │  revealed only while Video is active)       │
 sub-options row ←NEW │   ├─ stock clip — DEFAULT, plays as today   │
                      │   ├─ local file: Select-file button AND     │
                      │   │  drag-drop onto the page                │
                      │   │    └── object URL ──▶ same <video> el   │
                      │   ├─ paste URL (direct .mp4/.webm)          │
                      │   │    └── crossorigin src ──▶ same <video> │
                      │   │        load error ──▶ message + revert  │
                      │   └─ credit/status line ──▶ #note           │
                      └──────────────┬──────────────────────────────┘
                                     │ decoded frames (unchanged contract)
                                     ▼
                     renderer.js frame loop — UNCHANGED
```

Everything funnels into the existing `<video id="vid">`, so the
texture upload, panes, gaze, and glance panel come along for free.
Decisions: DECISIONS 2026-08-30 "Phase V planned" (URL option A
ratified; B/C rejected; below-filter calls listed there).

## Steps

- [x] **V1 — source enum + sub-options skeleton.** Extend controls
  state with `videoSource: 'stock' | 'local' | 'url'` (default
  `'stock'`); add the sub-options row to sim.html inside the General
  tab, hidden unless video mode; move the stock path + credit string
  into `config.js` and read both from there (sim.html sets no `src`;
  controls assigns it at init). No behaviour change beyond the new
  (inert) row.
  **Check:** Camera/Video toggle behaves exactly as today — stock clip
  plays on Video, credit line in #note unchanged; the sub-row appears
  only in video mode. Preview: flip the toggle both ways, watch #note.

- [x] **V2 — local file via picker.** "Choose video…" button →
  `<input type="file" accept="video/*">` → object URL into fileVideo,
  previous object URL revoked; #note shows the filename; a "Stock
  clip" affordance returns to default (enum → `'stock'`, credit line
  returns).
  **Check:** pick a local .mp4 → it renders *through the filter* in
  both panes; switch back to stock → stock plays; pick a second file
  after the first → no console errors (revocation path). Phone
  (deferred to gate): iOS picker offers the camera roll.

- [x] **V3 — drag-and-drop.** `dragover`/`drop` on the window feed the
  same load path as V2 (one function, two entries). Non-video drops →
  #note message, current source kept. Whether a drop outside video
  mode switches to video mode is decided in-step (below filter — one
  commit either way).
  **Check:** drop a video file onto the page → plays through the
  filter; drop a .txt → message, sim unchanged; drops don't trigger
  the browser's default open-file navigation (preventDefault on both
  events).

- [x] **V4 — direct URL + honest failure.** URL text field + Load
  button. Page-URL shapes (youtube.com / youtu.be / vimeo.com watch
  pages) refused before any load, with a one-line explanation of why
  (unfilterable, direct file links only). Otherwise: set
  `crossorigin="anonymous"` *then* `src`, play; on the video element's
  `error` event → #note message naming the failure + revert to stock
  (enum resets — the trace's stranded-UI risk). #note shows the URL's
  host while a remote source plays.
  **Check (desktop, copy-paste):** paste a known CORS-friendly mp4 —
  e.g. `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`
  — → renders through the filter. Paste a YouTube watch URL → the
  explanation appears, stock keeps playing, UI shows stock. Paste a
  non-CORS mp4 URL → error message + clean revert, frame loop alive
  (fallback scene never flashes).

## Gate — Phase V (the user's call, by eye, desktop + phone; never self-certified)

- [ ] Default behaviour: selecting **Video** plays the stock clip
  exactly as before this phase; Camera path untouched.
- [ ] A local video (picker on both platforms; drag-drop desktop-only
  by nature) renders through the filter — comparison view and glance
  panel behave normally over it.
- [ ] A CORS-friendly direct URL renders; a YouTube URL produces the
  explanatory message with stock still playing; a broken URL reverts
  cleanly.
- [ ] Object-URL hygiene: several source switches in a row leave no
  console errors and no growing memory (spot-check, not a formal
  profile).
- [ ] Phone: picker + URL paths work on iOS Safari; layout of the
  sub-options row holds in the panel.
