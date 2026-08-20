# Decisions Log

Running log of judgement calls, so they are not re-litigated and so future
regressions can be traced to what changed. Newest first.

## 2026-08-20 — Q1 shipped: stitched chunks; two dev findings en route

- **GATE Q1, desktop: passed by eye** (side-by-side worktree comparison
  vs main at fixed settings) `[measured — user by-eye]`; toggle
  round-trip clean via QUALIA flags; SAFETY caps verified inside their
  chunks. Monolith `shader.frag` retired. **Phone item outstanding** —
  see guard entry below; verify via LAN check or the deployed HTTPS
  site before calling GATE Q1 fully closed.
- **Dev server threaded** (`ThreadingHTTPServer` + HTTP/1.1
  keep-alive). The 8 parallel chunk fetches stalled for seconds on the
  single-threaded HTTP/1.0 server — Network waterfall showed
  partial-overlap with long Stalled bars `[measured]`; before/after
  load times not captured. Dev-only: deployed hosts never affected.
- **mediaDevices guard in startCamera.** On insecure origins (phone via
  `http://<LAN-IP>`) the camera API is ABSENT, not denied — the old
  code threw synchronously past the .catch chains and killed main()
  before the first frame. Latent Phase A bug (pre-refactor fails
  identically — this is what proved it wasn't a Q1 regression). Guard
  returns a rejected promise → fallback sample scene renders with the
  filter. Committed unverified (recorded in the commit); HTTPS dev
  serving registered as FF7, reopens when a gate needs live phone
  camera pre-merge (plausibly Phase D).

## 2026-08-19 — Q1 build calls (chunk split in progress)

- **Transition greying is a seventh chunk** (`24-transition.frag`). The
  Q1 checklist named six chunks and omitted it; the same plan file's
  compositing diagram lists "transition greying" as a scene-modifying
  quale. The diagram won: Q3's generated UI can only offer toggles for
  things that are chunks, and the extraction cost ~15 lines. Confidence
  high that the diagram reflected intent.
- **Sparkle rate stated as `flickerHz = 60 / (2π)`** (≈9.55) in config
  rather than a rounded 9.5 — the JS conversion `2π·flickerHz` must
  reproduce the pre-refactor hardcoded `sin(uTime * 60.0)` exactly;
  behaviour-identical beats a pretty number. Band widths move to config
  as `[start, end]` pairs; the 0.5 amplitude multiplier stays hardcoded
  in the chunk — it is a SAFETY cap, not a tunable.

## 2026-08-18 — Phase Q planned: qualia architecture

- **Two-tier split: field geometry is not a quale.** The survival mask
  (the "where") is always-on and configurable; qualia (smoke, photopsia
  net, edge sparkle, fill-in, blur — the "what it's like") are each
  toggleable and render into regions tier 1 defines. Compositing order
  is fixed (fill → additive → composite → post-additive); toggling
  changes slot membership, never order.
- **Compile-time stitching over uniform branches.** Disabled qualia are
  excluded when the shader is stitched and compiled, so "off" costs
  zero on old phones; the ~tens-of-ms recompile happens once per
  settings click. The stitcher is a PURE function (config → program) —
  the per-pane feature depends on that and retrofitting would force a
  rework `[my-synthesis]`.
- **Safety becomes structural.** Per-quale caps stay AND a global
  brightness clamp lands in the compositor, verified against the
  all-on/all-max configuration — user-stackable qualia must never
  exceed today's photosensitivity envelope. Net effect of the refactor
  can only be darker than today, never brighter.
- **Presets: schema in code, values in files.** Preset JSONs are sparse
  value-overrides only (never structure, ranges, or caps); unknown keys
  warned and ignored; values clamped to schema ranges. Export
  ("save as preset") is REQUIRED — the tune → save → compare loop does
  not close without it. A "none" preset (all qualia off) replaces the
  hardcoded unfiltered-half override.
- **Per-pane configs via two draw calls** (scissor/viewport), not
  doubled uniforms in one program — perf-neutral, and split-layout
  math leaves the shader. Reference pane frozen at its preset; sliders
  edit the active pane.
- **Q slots before C** so C and D land as new chunks instead of further
  entangling a monolith; scope guard: Q1 must be by-eye identical to
  pre-refactor output before anything new builds on it.
- **Perimetry-driven geometry deferred.** Reopens when an actual visual
  field test result is in hand; first step is a coverage check —
  routine 24-2/30-2 perimetry maps only the central 24–30°, not the
  50–80° island zone; Goldmann kinetic / wide-field protocols do
  `[factual-source]` (confidence medium-high — verify against the real
  paperwork). Prep paid in Q1: survival stays one substitutable
  function, so a mask-texture path is a one-function swap.

## 2026-08-18 — Rendering stack re-affirmed

- **Raw WebGL stays; no wrapper library.** Assessed three.js, pixi.js,
  regl, twgl, p5, and CSS/Canvas after Phase B: the project's complexity
  lives in `shader.frag` (the per-pixel symptom math), which every
  library still requires as hand-written GLSL — a wrapper could only
  replace the ~120 lines of already-working plumbing in `renderer.js`,
  while adding load weight on phones. Raw WebGL is the performance
  ceiling (one draw call, one shader; nothing between them to optimise)
  `[my-synthesis]`; symptom configurability is the uniform/config.js
  pattern and is library-agnostic. **Reopens if** Phase D's peripheral
  blur proves in-shader taps insufficient and needs multi-pass
  (render-to-texture) — that is where boilerplate balloons and
  three.js/regl start paying rent; same trigger as FF3.

## 2026-08-18 — Phase B built and gated

- **FIELD geometry that passed the gate** (by-eye, all four items,
  2026-08-18): `inner {mild 81°, late 13°}`, `outer {mild 65°, late 85°}`,
  `outerCoverage 0.65`, `erosion 0.9`, `islandSeed 7.0`. Radii use the
  **{mild, late} pair pattern** — the value at degeneration slider 0 and 1,
  straight blend between — replacing renderer.js's hardcoded
  `0.45 - 0.38 * slider` mapping.
- **Island noise sampled in position space, not polar.** The plan sketched
  `fbm(vec2(ang*k, r*m) + seed)`; built as `fbm(centered*3 + seed)` because
  angle-based sampling produces a visible wrap-around seam where the angle
  jumps at the left horizontal.
- **Inferotemporal-last via fixed bias + rising threshold**, not the
  planned slider-scaled bias: biased (lower-lateral) pixels clear the
  rising coverage bar longest, giving the same erosion order with less
  machinery. Verified by eye at the gate.
- **"No uTime" is scoped to island geography.** The patch gate is fully
  static; the dead ring's far edge keeps a small uTime boundary wobble
  (amplitude 0.05 — the same idiom as the inner edge), which reads as edge
  breathing, not island drift.

## 2026-08-13 — Iteration 2 planning

- **Donut geometry adopted (Phase B).** The field is a preserved centre +
  preserved far-peripheral islands separated by a dead mid-peripheral ring —
  per the user's lived experience and Grover/Fishman 1998 + IOVS 2022 (see
  plan/research/peripheral-perception.md). Supersedes iteration 1's tunnel.
- **Transparency concept retired (Phase C).** The `uSeeThru` murk implied
  the blind region passes attenuated scene. Wrong per the user's report and
  Crabb 2013 / Ramachandran & Gregory 1991: scotomas read as filled-in
  absence. Replaced by a fill-in field; slider becomes "fill-in vividness".
- **Photopsias confined to the scotoma (Phase C).** Flashes arise from dead
  retina: masked by `(1 - survival)`, never over seeing regions.
- **Sighted-viewer paradox default.** Perfect fill-in is invisible, so the
  default fill stays slightly legible (washed-out low-contrast blur —
  Crabb's most-chosen percept image); faithfulness recoverable via config.
- **Eccentricity convention: screen edge ≈ 90°.** All FIELD radii stated in
  degrees under this mapping. A screen can't show 50–80° islands at true
  scale; the compression is now explicit instead of implicit.
- **Island geography is seeded and static.** No `uTime` in the patch gate —
  islands are places, not weather. `FIELD.islandSeed` selects the geography.
- **Peripheral blur via in-shader Poisson taps, not WebGL2 mipmaps.** The
  WebGL1 single-pass pipeline stays; the WebGL2/LOD route is FF3, gated on
  the tap blur actually proving insufficient.
- **Crowding rendered as blur + position scramble, not blur alone.** Per
  Rosenholtz/Bouma: periphery keeps texture, loses arrangement.
- **Islands are never temporally smoothed.** Peripheral motion sensitivity
  is the one thing that survives; motion stays fully salient (boost = FF4).

## 2026-08-12/13 — Iteration 1 (recorded retrospectively)

- **Portrait, not an average.** Where one person's experience diverges from
  published surveys, the sim follows the person (README).
- **~9 Hz flicker rate** from Menzler & Zeck 2011 (retinal oscillation);
  photopsia prevalence/character from Bittner 2009/2012.
- **SAFETY caps** on net and ring glow amplitudes are load-bearing
  (photosensitivity) and must never regress.
- **Central config** (`config.js`) — nothing tunable hardcoded in scripts.
- **Shader fetched with `cache: 'no-store'`** — python http.server sends no
  cache headers; a stale cached shader silently ignores edits.
- **DPR capped** (≤2, ×0.75 touch) — retina wasted through smoke, hot phones.
