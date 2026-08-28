# Decisions Log

Running log of judgement calls, so they are not re-litigated and so future
regressions can be traced to what changed. Newest first.

## 2026-08-28 — Q5 scope pre-ratified: field joins the toggles and the presets

Three user ratifications ahead of Q5 phase-plan (given directly, not
via options tables; phase-plan folds them in as constraints rather
than re-contesting):

- **FIELD becomes toggleable, same as other symptoms** (user's call —
  REVERSES "tier 1 is not removable", 2026-08-18, reaffirmed
  2026-08-20/24). Claude recommended against: the phenomenological
  argument (where vision survives is not an experience one can switch
  off) plus the fact that a fully-surviving field VALUE set already
  yields unfiltered output without a toggle. User ratified the toggle
  anyway — a direct on/off is the UX they want; the sim is a
  communication tool and "switch the field loss off" is a natural
  viewer action. Implementation constraint carried into the plan:
  10-field can NOT be stitch-excluded like quale chunks — its outputs
  (survival, edge, oEdge, central, outer) feed photopsia weighting,
  sparkle band placement, and transition bands. Field-off must force
  full survival AND park the edge beyond the screen corner, or
  edge-riding qualia would draw their bands over surviving vision.
- **FIELD values enter presets** (REVERSES the FIELD-outside-presets
  exclusion, 2026-08-19/20/28). Reasons ratified: a portrait includes
  its geometry (two people's donuts differ as much as their smoke),
  and Q5's frozen reference pane structurally requires per-pane field
  — with a shared live FIELD, dragging a field fader would silently
  reshape the reference pane and break honest A/B. Envelope gains a
  top-level `field` section; old presets fill field from defaults
  (same can't-pin-what-didn't-exist semantics as the new-qualia rule;
  re-save to pin geometry).
- **Degeneration slider position enters presets too** (user's call on
  the open sub-question): "the peripheral filter on the General tab
  is saved as part of presets". A portrait's current state includes
  where it sits on the mild→late blend. It remains the headline
  interactive slider; loading a preset sets it, playing with it
  diverges from the loaded preset (consistent with the no-dirty-
  tracking stance).
- Consequence for the none preset: `none.json` gains field-off (or
  fully-surviving field values) — THIS is what makes "none" the
  unfiltered view, dissolving the 2026-08-28 none-≠-unfiltered ⚠
  with no compositor change; Phase C's fill-in remains unborrowed.

## 2026-08-28 — GATE Q4 passed; Q4 closed

- **GATE Q4 passed on the user's by-eye call, desktop and phone
  (2026-08-28):** save-as-preset → page reload → load-file reproduces
  the exact tuned state on both platforms (the phone run proving the
  iOS download/Files path); SAFETY holds through the new preset input
  channel (torture file via picker: unknown keys warned, out-of-range
  values clamped, busier not brighter); baseline fps clean on the
  phone with the tabbed panel live. Never self-certified; recorded on
  the user's declaration.
- **En-route findings this phase:** all-qualia-off renders the dead
  ring BLACK, not the unfiltered scene — Q5's "clean half is just the
  none preset" needs a design answer at Q5 phase-plan (⚠ noted on the
  Q5 card). The step-3 one-way-loader shortcut was half-revised on
  user request: picker loads now select an ad-hoc dropdown entry named
  from the file; slider drags still don't flip the dropdown to
  "Custom" (deliberate — dirty tracking deferred until wanted).
- **Menu UX (user spec, 2026-08-28):** panel tabbed — General |
  Adjust Symptoms (load presets above configure symptoms), tabs
  text-styled, minimalist 4px scrollbar pill; #adv id kept on the tab
  pane so the generator and its styling survived the move untouched.

## 2026-08-28 — Q4 planned: preset semantics amended and ratified

- **Presets are FULL value snapshots, not sparse diffs** (ratified —
  amends the 2026-08-19 "Presets: schema in code, values in files"
  entry's sparse clause; the rest of that entry stands). The user
  caught the flaw: a sparse preset means "this look relative to
  whatever the defaults are today" — retune a default and every saved
  portrait that omitted that value silently changes appearance, which
  for a portrait project is a correctness bug, not a nuisance. The
  recorded rationale for sparsity ("old presets survive schema
  evolution") was mis-attributed: survival comes from the LOADING RULE
  (start from schema defaults → overlay file → warn-and-ignore unknown
  keys → clamp to ranges), which full presets share identically.
  Consequence accepted knowingly: full presets are FROZEN SNAPSHOTS —
  a later improvement to a default does NOT propagate into saved
  presets; for portraits, pinned is the honest semantics. Export
  becomes simpler, not harder (serialise the live schema; no diffing).
  Speed: preset surface is 5 enabled flags + 8 params today (~30 after
  C/D), ≤2 KB JSON, one fetch + parse at load/switch, zero per-frame
  cost `[measured]` (param count counted from config.js; timing check:
  console.time around the load path, expect sub-ms). Rejected: sparse
  diffs (the drift bug above) and a separate defaults FILE alongside
  full presets (redundant once presets are full — the coupling is
  already severed — and it splits the schema: values in a file,
  ranges/labels/caps in code — the two-structures-to-align smell
  rejected 2026-08-20; a committed default-look snapshot, if ever
  wanted, is just an ordinary exported preset, a snapshot of defaults
  rather than their owner). `[my-synthesis]`, but the drift argument
  is structural.
- **New qualia ship `enabled: false` by default** (ratified). Full
  snapshots cannot pin a quale that didn't exist when they were saved,
  so a new quale defaulting ON would change every saved portrait's
  appearance the day it merges. Rule: a preset's rendered look changes
  only when the preset file changes. Phase C's fill-in quale is the
  first test. (Murk's replacement is the one sanctioned exception
  class: C deletes murk and substitutes fill-in as the new default
  look — that swap is a deliberate portrait revision, gated by eye,
  not silent drift.) `[my-synthesis]`.
- **Preset file shape: named envelope** (ratified) —
  `{ name, saved, qualia: { <quale>: { enabled, params: {<p>: value} } } }`.
  `name` makes ad-hoc files loaded via the picker self-describing
  (filenames get renamed; the manifest only covers shipped presets);
  `saved` documents when the snapshot froze — honest metadata under
  frozen-snapshot semantics. Rejected: bare mirror (anonymous files)
  and schemaVersion field (YAGNI — unknown-key-warn + missing-key-
  default + clamp already absorb schema evolution; a version number
  with no migration code is dead weight). Confidence medium-high.
- **Boot from the schema; no default preset file** (ratified — amends
  the Q4 card line "config.js names the default preset", which was
  written for the sparse design). config.js's schema values ARE the
  default look: no boot fetch, single owner of defaults. The preset
  dropdown lists a computed "Defaults" entry (reset = re-apply schema
  defaults) plus the manifest entries from `presets/index.json` (a
  browser cannot list a directory; manifest is a bare filename list —
  labels come from each file's `name`). Rejected: always-boot-from-
  preset-file (reintroduces the dual-ownership drift this whole
  amendment kills, plus a blocking fetch) and no-manifest/picker-only
  (clumsy on the phone, the primary audience; "none" loses its one-tap
  affordance, which Q5's comparison pane wants). Confidence high.
- Below-the-filter choices left to steps (one commit to reverse):
  new `presets.js` module; panel rebuild after load rather than
  per-slider sync; Blob + `<a download>` export with `<input
  type="file">` ad-hoc load (phone half of the gate proves it on iOS);
  dropdown as one-way load action, no dirty-state tracking.

## 2026-08-28 — GATE Q3 passed; Q3 closed

- **GATE Q3 passed on the user's by-eye call, desktop and phone
  (2026-08-28):** all gate items declared good — qualia toggles
  round-trip cleanly through the generated panel (no residue, nothing
  beyond the expected recompile blink), and the SAFETY re-verify
  through the new UI holds (all-on/all-max reachable by finger stays
  within the ADD_CAP 0.65 ceiling — busier, not brighter). Never
  self-certified; recorded here on the user's declaration at close-out.
- **Q3 steps 1–3 had landed in one commit** (`2bb6812`, 2026-08-24)
  without per-step verification notes; checks were confirmed by eye
  (desktop + phone) at the 2026-08-28 plan-sync. Noted so the gap in
  the commit trail isn't read as unverified work later.
- **Generated faders are continuous (`step='any'`).** A stepped grid
  would snap schema defaults (e.g. inner-late 13° of 0–90) to a nearby
  grid point and misreport the schema's true value.

## 2026-08-20 — Q3 planned: live-state home and FIELD faders ratified

- **The schema is the live UI state** (ratified). Slider drags write
  into `QUALIA[quale].params[p].value`, toggles write `enabled`; the
  frame loop re-writes all quale/field uniforms from the schema every
  frame (~12 floats — noise next to the per-frame video texture
  upload), via functions of a config OBJECT, not global reads (Q5
  panes depend on that). Shader rebuilds self-heal: the next frame
  repopulates the fresh program's uniforms, so restitching needs no
  re-seeding code. This closes Q2's recorded "two owners of
  density/transparency until Q3" risk — one declared place always
  knows the current settings, which is what Q4's save-as-preset
  serialises and Q5's per-pane rendering reads. Rejected: set-on-change
  uniform pushes (every restitch must manually re-push every uniform —
  a forgotten one is a stale-value bug class; state scattered across
  GPU memory) and DOM-as-state, today's pattern (Q4 export and Q5
  panes would scrape slider positions for "current state").
  `[my-synthesis]` — but the Q4/Q5 dependency argument is structural.
- **FIELD goes full schema-shape** (ratified). Every FIELD value
  becomes `{ value, min, max, label }` ({mild, late} radii pairs via
  the existing pair-value pattern), so the same generator renders the
  FIELD group — listed FIRST, faders only, no toggle (tier 1 is not
  removable, DECISIONS 2026-08-18). Whole geometry becomes
  live-tunable for Phase C/D by-eye gates; the islandSeed fader is
  proto-FF6 for free. Degeneration stays the top-level headline
  slider, not duplicated in the group; FIELD stays outside presets'
  reach regardless of shape (Q4 exclusion unchanged). Rejected:
  curated fader subset (two categories of FIELD value to remember,
  saves almost nothing — pair rendering must exist anyway for
  sparkle's bands) and degeneration-only (barely honours the specced
  UX; C/D geometry tuning would keep requiring file-edit + reload).
  `[my-synthesis]`, confidence medium on the seed-as-fader feel —
  reverts to file-only in one commit if it reads wrong.

## 2026-08-20 — Q2 planned: schema home and clamp mechanism ratified

- **Schema home: full migration** (ratified). `NET`, `SPARKLE`, and the
  two quale-owned slider defaults (`netDensity`, `transparency`)
  dissolve into `QUALIA[quale].params`, each param
  `{ value, min, max, label }` — one declared structure that Q3's
  generated UI and Q4's sparse presets both consume. Rejected:
  schema-points-at-blocks (two structures to keep aligned — the
  retrofit-rework smell the Q1 pure-stitcher decision warned about) and
  auto-build-at-load (ranges/labels get no declared home; violates
  "schema lives in code"). `[my-synthesis]` — but the enforcement
  argument is structural: value-only presets are only checkable against
  a structure that visibly declares ranges.
- **Global clamp acts on ADDED light only** (ratified). The compositor
  accumulates all added flashing light — photopsia weighted by
  (1 − survival), plus sparkle — into one `addLight` term and scales it
  down when its luma exceeds a SAFETY ceiling. The restructure is
  algebraically exact: `mix(p + a, s, k) = mix(p, s, k) + a·(1−k)`, so
  below the ceiling the output is bit-comparable to today. Scene
  brightness is never touched (a bright real-world wall stays the
  world's business); hue preserved (uniform scale, not per-channel
  clip). Future additive qualia (Phase C photopsias) inherit the cap by
  accumulating into the same term. Rejected: hard `min()` on final
  colour (greys the real scene or does nothing; per-channel clipping
  shifts hue) and soft tone-mapping (alters today's defaults near the
  threshold — breaks by-eye-identical). Ceiling value to be MEASURED
  from today's worst case (sliders maxed) during the step, then
  hardcoded in the chunk per the 2026-08-19 precedent — a SAFETY cap is
  not a tunable and never enters the schema or presets. `[my-synthesis]`
  mechanism, `[measured]` ceiling once the step lands.
  - Ceiling measured 2026-08-20 (step 4, magenta-bisection at both
    sliders maxed): addLight luma flecked at 0.55, none at 0.65 —
    `ADD_CAP = 0.65`, the bracket's upper bound, so today's output is
    untouched. Torture config (all params at schema max) observed
    busier but not brighter `[measured — user by-eye]`.
  - **GATE Q2 passed 2026-08-20** (user by-eye): all-on/all-max on the
    branch vs main worktree sliders-maxed, side by side — within
    today's brightness ceiling, clamp observed working. SAFETY gate
    line passed for Q2; re-verify when Q3–Q5 touch the capped paths.

## 2026-08-20 — Q1 shipped: stitched chunks; two dev findings en route

- **GATE Q1, desktop: passed by eye** (side-by-side worktree comparison
  vs main at fixed settings) `[measured — user by-eye]`; toggle
  round-trip clean via QUALIA flags; SAFETY caps verified inside their
  chunks. Monolith `shader.frag` retired. Phone item confirmed passed
  by the user 2026-08-20 (post-guard) — GATE Q1 fully closed.
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
