# Decisions Log

Running log of judgement calls, so they are not re-litigated and so future
regressions can be traced to what changed. Newest first.

## 2026-08-30 — Phase V planned: video sources; direct-URL-only ratified

- **Phase V queue-jumps C** (user's call, 2026-08-30, second jump after
  G's precedent): when Video is the background, a sub-options row
  appears — paste a URL, drag-drop a local video, or pick a file —
  with the stock clip remaining the default. Appetite ~0.5 day. C
  (fill-in) stays the honesty fix and next in line after V. The phase
  touches SOURCE only (controls.js / sim.html / config.js); renderer
  and shader untouched — G5's parked SAFETY re-verify is NOT triggered.
- **Remote-URL ingestion: direct video URLs only** (ratified). The URL
  field accepts direct media links (`.mp4`/`.webm`-style), loaded with
  `crossorigin="anonymous"` into the existing `<video id="vid">`;
  YouTube/Vimeo PAGE urls are detected and refused with an inline
  explanation; any load error reverts to the stock clip with a
  message. Grounding constraint `[factual-source — browser security
  model, high confidence]`: YouTube offers only a cross-origin iframe
  (zero pixel access — unfilterable by construction), and raw
  googlevideo stream URLs are signed, expiring, and not CORS-enabled;
  a cross-origin video without CORS approval taints the GL pipeline
  (texImage2D throws). Setting `crossorigin` makes non-CORS hosts fail
  cleanly at LOAD (an `error` event) instead of at texture upload — so
  the failure mode is a message, never a dead frame loop. Rejected:
  B — YouTube via `getDisplayMedia` tab-capture (double permission
  dance; unsupported on iOS Safari, the primary audience; fragile);
  C — server-side proxy/yt-dlp (turns a static page into a service,
  YouTube ToS grey area, far over appetite). Local files never hit
  CORS (object URLs are same-origin) and deliver the underlying want —
  own footage through the filter — with no walls.
- **Below-filter calls left to steps** (one commit to reverse):
  `state.videoMode` growing into a source enum; whether the drop
  target is video-mode-only or global-and-switches; stock clip path +
  credit string moving from markup/updateNote into config (the
  config-never-constants rule says they should); object-URL revocation
  on source switch.

## 2026-08-28 — Phase G merged early: G2 + G5 parked (user's call)

- **Merged without the formal gate.** G1, G3, G4 each passed the
  user's by-eye check at step level (desktop only); the user chose to
  park G2 (touch gaze) and G5 (glance-moment + SAFETY re-verify) and
  merge. Recorded plainly: the phase GATE did not formally pass.
- **What is and isn't verified:** mechanical G5 checks RUN at
  close-out — zero `uTime` in 15-glance-panel (the no-flicker SAFETY
  constraint holds in code) and the vUV gaze-invariant holds (no
  symptom chunk reads it). Covered informally during step verdicts:
  blindspots over the panel, gaze-onto-panel, reference-pane
  isolation. NOT verified: ADD_CAP all-on/all-max by eye with the
  panel lit; everything phone (gaze has NO touch input at all).
- **Reopening conditions:** G2 before any phone-audience demo of the
  glance experience (the primary audience is mobile — this is a real
  hole, not polish); the SAFETY by-eye re-verify with the panel lit
  before or with the next change touching capped paths (plausibly
  Phase C's fill-in/photopsia work).

## 2026-08-28 — G4 revised mid-step: source-brightness display, transparency knob (user spec)

- **The display has no brightness knob** — it replicates the source
  feed's brightness, so the wash-out ratio collapses to `1 / ambient`
  (ambient re-ranged 0.2–2, default 1 = panel light at exactly source
  strength). One optics slider instead of two.
- **…and never exceeds source brightness** (second correction, same
  session: "when I set it really low it gets very bright, this seems
  wrong"). `gain = min(1, 1/ambient)` — low ambient is not a boost;
  only high ambient washes out. Relative night-glow comes from the
  scene itself being dark, not from amplifying the panel.
- **`GAZE.sensitivity` became `GAZE.speed`, doubled to 2** (user,
  same session): one knob for how quickly mouse movement drives both
  modifier gestures — Option gaze and Option+Shift reposition (it
  scales the shared deltas, so both inherit it by construction). The
  200 ms gaze ease is a separate feel and was left untouched.
- **Click-drag resize inside reposition mode** (user spec): while
  Option+Shift is held, holding the mouse button turns the drag into
  a resize — LEFT grows, right shrinks (direction inverted by user
  correction the same session); the single width param keeps the
  ratio by construction. On exiting reposition the panel group
  regenerates so the size fader shows what the gesture wrote
  (verified pre-inversion: +150px drag → 0.22 → 0.5267, exactly
  150/978 × speed 2 `[measured]`).
- **Reposition view refinements** (user spec, same session): the
  field mask fades to `PANEL.repositionSeeThru` (0.5) while placing —
  drawn post-mix like the border, so the moving panel stays visible
  through the dead ring; the scroll wheel drives panel zoom
  (`GAZE.wheelZoom` per delta unit, scroll up = in); the zoom fader
  gained its own hover hint.
- **Pointer lock while Option is held** (user spec: "the screen
  boundary should be ignored"). Without lock the OS cursor pins at
  the screen edge and movement events stop; the canvas takes pointer
  lock on Alt keydown and releases it with the key (Esc also breaks
  it — degrades to bounded deltas, nothing worse). The earlier
  delta-only rewrite is what makes lock a drop-in.
- **Discoverability**: the size fader carries a hover ⓘ (schema
  params gained an optional `hint` the generator renders), and the
  AR aid tab gained a short "Moving the panel" help section.
- **"Ideal display" became "Display transparency", inverted** — 1 =
  maximum see-through, 0 = opaque display; default 1 (glasses
  realism). At full transparency the panel must not vanish: a
  presence floor `PANEL.minOpacity` (0.12 → halved to 0.06 on user
  correction "max should be twice as transparent"; a device property
  beside `aspect` — config, never a fader) keeps a faint ghost of
  the rect even over a dark feed. The shader mix is untouched; all
  changes live in the schema and the JS uniform computation.

## 2026-08-28 — G3 revised mid-step: relative input, AR-aid tab, reposition mode (user spec)

Five user corrections at the G3 review, folded into the step before
its verdict:

- **Gaze and pane input is RELATIVE — deltas only.** Surprise found at
  review: the G1 build mapped the pointer's absolute position, so
  engaging Option yanked the mask toward wherever the pointer happened
  to sit. Now only mouse MOVEMENT while the modifier is held steers
  (`movementX/Y` accumulate); the absolute pointer position is never
  read. `GAZE.sensitivity` added (screen fractions of travel per
  screen fraction of mouse movement). Verified clean-room: one −200px
  synthetic delta moved the pane centre to cuv 0.515/0.567 vs
  predicted 0.516/0.563, stable across frames `[measured]`.
- **The aid gets its own menu tab** — General | Symptoms | AR aid
  (supersedes this morning's "PANEL group on the General tab"
  ratification). A third tab returns to the layout, but for a device
  home, not the reference selector the Q5 revision killed.
- **Panel size is ONE param.** Width only; height follows a fixed
  on-screen aspect (`PANEL.aspect` = 4:3 — a device property, config
  value, never a fader), converted through the pane's pixel aspect so
  window shape can't distort the display.
- **Reposition mode: Option+Shift.** While held: the active program
  swaps to field-only (every quale masked via a DERIVED config —
  QUALIA untouched, toggles restored exactly on exit), a bright
  yellow boundary marks the pane, and deltas move it; releasing
  either key (or window blur) exits. The position param stays in the
  schema (clamping, state) but is `noUI` — placed by gesture, not
  fader.
- **The boundary glow is STEADY, drawn post-mix.** Steady is forced
  by the ratified no-time-varying-term SAFETY rule — "glowing" must
  not mean pulsing. Post-mix because it is UI affordance, not world
  light: it must stay visible over the black dead ring while placing
  (in field-only view the mask hides the pane's CONTENT in dead
  regions — honest — so the boundary is the placement guide). Steady
  additive UI light, no photosensitivity vector, outside ADD_CAP by
  the same argument as panel light.

## 2026-08-28 — Phase G planned: glance phase scoped and ratified

- **Phase G queue-jumps C and D** (user's call, 2026-08-28): the two
  backlog features "gaze simulation via Option+mouse" and "glance panel
  with AR-glasses optics" combine into one phase serving the AR-aid
  product horizon (00-context). C (fill-in) remains the honesty fix and
  next in line after G; both G features are additive (new uniforms, one
  new chunk) and don't conflict with what C/D will touch. Backlog
  entries promoted out of Inbox.
- **Panel home: standalone PANEL block, outside presets** (ratified).
  Quale-shaped `{ enabled, params }` so the generated-panel machinery
  is reused (FIELD precedent), stitched with `Q_PANEL` and genuinely
  excludable — unlike FIELD, nothing downstream reads its outputs. UI
  home is the General tab: it is a device, not a symptom, and must not
  appear under Adjust Symptoms. Excluded from preset envelopes — a
  portrait is the condition; the aid is worn over it. Panel renders in
  the ACTIVE pane only; the reference pane stays the bare condition /
  unfiltered view, keeping the with-aid vs without A/B honest.
  Rejected: sixth quale in QUALIA (mislabels a device as a symptom;
  portraits silently grow device state) and envelope v3 with a `panel`
  section (grows the preset contract before anything needs it — adding
  a missing-key-defaults section later is the cheap direction, removing
  one from files in the wild is the expensive one). Confidence high.
- **Panel light is scene light: outside ADD_CAP, under the field mask**
  (ratified). The panel composites into the scene BEFORE the survival
  mix — structurally forced: addLight applies after the mix, so a
  panel riding addLight would shine through scotomas, the exact
  opposite of the phenomenon (blindspots must travel over the panel).
  Steady light is not a photosensitivity vector, and scene brightness
  is never clamped (standing doctrine). The SAFETY constraint is made
  structural instead: **PANEL never gains a time-varying term** — no
  flicker param, ever; any future pulsing-panel idea must route
  through addLight and inherit ADD_CAP. Named in the chunk header.
  Closes the backlog's open ADD_CAP question. Rejected: panel inside
  ADD_CAP (wrong slot, and couples aid brightness to sparkle/photopsia
  flaring). Confidence high on the slot `[structural]`; medium on
  cap-free sufficing — if the gate finds a maxed panel uncomfortably
  bright, a static luma ceiling on the panel term is one commit.
- **Below-filter defaults accepted** (user, 2026-08-28): gaze SHARED
  across panes (one pair of eyes, like the shared clock); release
  springs back to centre with a short configurable ease (a glance is
  transient); max-excursion clamp in config (~0.4 screen units); touch
  gesture is one-finger drag on the canvas; all in a `GAZE` config
  block — tunable, no toggle (no input = no offset). Each one commit
  to reverse.
- **The gaze invariant, named for future symptoms** (from the 2026-08-28
  deep dive): every quale takes its POSITION from retina-frame values
  the compositor hands in (`centered`, `sp`, `r`, `ang`, `edge`…) and
  touches world imagery only via `suv`, never `vUV` — so
  `centered = cuv − 0.5 − gaze` moves every present and future symptom
  rigidly. Check: `grep -n vUV shader/*.frag` hits only 00-prelude.
  The panel deliberately breaks the rule (placed from `cuv`): glasses
  are head-fixed, damage is eye-fixed — the two frames ARE the
  phenomenology.

## 2026-08-28 — GATE Q5 passed; Q5 closed — PHASE Q COMPLETE

- **GATE Q5 passed on the user's by-eye call, desktop and phone
  (2026-08-28):** comparison view (None reference / tuned right)
  matches the pre-Q5 look; two different presets render honestly side
  by side; field toggle round-trips (off = raw scene, on = exact
  return); baseline fps holds on the phone in two-pane mode; SAFETY
  holds — ADD_CAP clamp effective in both panes, all-on/all-max in
  comparison stays busier-not-brighter. Never self-certified.
- **Phase Q is complete** (Q1–Q5 all gated): the monolith is now
  toggleable qualia + a toggleable field over per-pane preset-driven
  rendering. C and D land as new chunks + schema entries and inherit
  the panel, presets, panes, and SAFETY clamp for free. New qualia
  must ship enabled:false (2026-08-28 rule) — Phase C's fill-in is
  the first test (murk's deletion/substitution is the sanctioned
  exception, gated by eye).

## 2026-08-28 — Q5 planned: field-off mechanism, pane model, three-tab menu ratified

- **Three-tab layout revised after first use (user, 2026-08-28,
  step 4):** back to two tabs — General | Symptom. The reference
  selector lives in the General tab directly below the View toggle
  and is visible ONLY in side-by-side view (it means nothing in
  immersive). Supersedes the three-tab spec ratified earlier the
  same day; the Reference "tab" was a home for one control and a
  promise of future settings — those settings now land in the
  conditional General-tab row instead.
- **Degeneration is a FIELD param, not a separate concept** (user
  ratified mid-step-2, amending the pre-ratified "top-level
  degeneration in the envelope"): `DEFAULTS.degeneration` dissolves
  into `FIELD.params.degeneration` — it *is* the field's progression;
  the General-tab slider is a convenience view onto it (the most
  intuitive knob for a viewer), kept as its SOLE UI — not duplicated
  in the generated group (reaffirms 2026-08-20; two live sliders on
  one value would leave one showing a stale position). Envelope v2
  simplifies to { name, saved, field, qualia }; BASELINE becomes a
  pure schema walk (the DOM-read-at-import trap disappears);
  applyField(U, field) needs no degen argument — panes carry their
  own degeneration for free, closing the plan's
  "degeneration-two-owners" risk structurally.

- **Field-off is a compile-time short-circuit** (ratified). The
  stitcher emits `#define Q_FIELD` only when the field is enabled;
  `fieldSurvival` opens with an `#ifndef Q_FIELD` path returning
  survival = 1 with edge/oEdge parked at 10.0 — far past the screen
  corner (≈1.1 in aspect-corrected r), so sparkle's band, transition's
  rims, and photopsia's (1 − survival) weight all neutralise exactly.
  Same compile-time philosophy as every quale toggle; zero per-pixel
  cost; restitch-on-toggle path reused unchanged. With survival ≡ 1,
  mix(periphery, scene, 1) = scene — field-off yields the raw scene
  even with qualia enabled. Rejected: parked uniform values (schema
  max 90° is the screen EDGE, corners keep the wobbly boundary;
  magic out-of-schema values; wobble/fbm still burn per pixel) and a
  runtime uniform branch (per-pixel cost forever for an occasional
  toggle; violates off-costs-zero). `[my-synthesis]`, mechanism
  verifiable at step 1's check. Confidence high.
- **Asymmetric panes** (ratified): the ACTIVE (RP/symptom) pane is
  the existing live schema singletons — the panel keeps editing them
  with zero rework; the REFERENCE pane is an inert deep config
  snapshot materialised from its loaded preset, with its own compiled
  program, restitched only when its preset changes. Frozen by
  construction: sliders cannot reach a detached copy. Requires
  extracting the reset→overlay→clamp core into a pure
  materialise(values) → config helper shared by applyPreset and the
  reference loader — two copies of overlay logic would drift.
  Rejected: symmetric pane objects with panel indirection (rewrites
  the generator's schema binding now to enable per-pane editing the
  deferral register explicitly parks). Confidence high.
- **Three-tab menu, per-pane preset controls** (user spec 2026-08-28,
  extending the ratified reference-selector option): tabs General |
  Reference | Symptom. Panes are NAMED: left/top = "Reference",
  right/bottom = "Symptom" (RP). General keeps degeneration slider +
  background + view. Reference tab: the reference pane's preset
  dropdown (Defaults/None/manifest; defaults to None) — the declared
  home for future reference-pane settings. Symptom tab: the RP pane's
  preset load/save (Q4's tune → save → compare loop stays here) above
  Configure symptoms. ASSUMPTION flagged to user: preset controls are
  per-pane (Reference tab loads the left pane, Symptom tab the
  right); correct before step 4 if the intent was one shared home.

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
