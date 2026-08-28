# Phase G — the glance phase: gaze simulation + AR glance panel

**Status:** planned 2026-08-28 · appetite 1–1.5 days · branch `phase-g-glance`
Ratified design: DECISIONS 2026-08-28 "Phase G planned" (panel home,
SAFETY boundary, gaze defaults, the gaze invariant). Queue-jumps C and
D on the user's call — serves the AR-aid product horizon (00-context).

Disposable after merge: the durable outputs are the DECISIONS entries
and the architecture marks.

## Data-flow trace (before it's built)

Two coordinate frames, and the phase is the space between them:
**damage is eye-fixed** (retina frame — moves with gaze), **the aid is
head-fixed** (screen frame — stays put). Everything below serves that
one distinction.

```
DESKTOP: Option + mousemove         PHONE: one-finger drag on canvas
              └───────────────┬───────────────┘
                              │ pointer position on the canvas
                              ▼
GAZE state (controls.js ← NEW)
  born here: gaze TARGET, in pane-fraction units, clamped to
  GAZE.maxExcursion; on release, target ← centre (spring back)
                              │ eased each frame toward the target
                              ▼
shared.gaze (renderer.js frame loop, changed)
  ONE value, written to BOTH panes — one pair of eyes, like the clock
                              │
                              ▼
uGaze (vec2, 00-prelude ← new uniform)
                              ▼
90-composite (one changed line):
  centered = cuv − 0.5 − uGaze        ← BEFORE aspect correction, so
                              │          diagonal drags don't distort
                              ▼
  r, ang, sp, fieldSurvival → survival, edge, oEdge, central, outer
  → island, dead ring, outer islands, sparkle band, smoke, photopsia
    ALL travel rigidly; the scene (suv) is untouched and stays put

────────────────────────────────────────────────────────────────────

PANEL schema (config.js ← NEW block, quale-shaped, enabled:false)
  born here: rect (position + size), zoom, displayBrightness,
  ambient, opaqueness — all { value, min, max, label } for the
  generator; ambient min > 0 (it divides)
                              │ applyPanel(U, panel) — ACTIVE pane
                              │ only, every frame
                              ▼
15-glance-panel.frag (← NEW chunk, scene-modifying slot)
  placed from cuv — deliberately NO uGaze term (head-fixed)
  inside the rect:
    panelUV = crop + zoom around the feed centre → getScene(panelUV)
    gain    = displayBrightness ÷ ambient
    lit     = mix(scene + feed × gain,  feed,  opaqueness)
              └── 0 = additive glasses     1 = ideal display ──┘
                              │ scene + panel light
                              │ (steady only — no time-varying term,
                              │  outside ADD_CAP; SAFETY is structural)
                              ▼
scene′ ──▶ transition ──▶ survival mix ──▶ addLight + ADD_CAP ──▶ pixels
           (rim greying and blindspots travel OVER the panel — the
            field mask composites after the panel, and moves with gaze)
```

Risks the trace surfaces (named so steps handle them, not discover
them):

- **Units of gaze.** Born in canvas pixels, consumed in cuv fractions;
  in split view each pane has its own rect — the offset is a fraction
  of a PANE, and both panes get the same fraction. Conversion lives in
  one place (controls.js), never in the shader.
- **Division by ambient.** `gain = display ÷ ambient` blows up at 0 —
  the schema's `min` on ambient is the guard (schema clamp already
  enforces it on every path, including hand-edited config).
- **Reference pane must stay panel-free.** stitchShader grows a panel
  argument; the reference pane's makeProgram passes panel-off. A
  forgotten argument would compile the panel into the reference —
  step 3's check looks for exactly that.
- **The gaze invariant** (DECISIONS 2026-08-28): qualia take position
  only from centered-derived values, world imagery only via suv,
  never vUV. Standing check: `grep -n vUV shader/*.frag` hits only
  00-prelude. Re-run when any new chunk lands.

## The ratified design

The stage-1 sketch survived ratification unamended; the level-3
"Gaze + glance panel" section of [../architecture.md](../architecture.md)
is the design of record. Decisions: DECISIONS 2026-08-28 "Phase G
planned" — standalone PANEL block outside presets, General-tab UI,
active-pane-only (rejected: sixth quale, envelope v3); panel light =
scene light outside ADD_CAP with the structural no-flicker constraint
(rejected: riding addLight — would shine through scotomas); gaze
shared across panes, spring-back, clamp, touch drag (below-filter
defaults, user-accepted).

## Steps

Each step ends runnable and states its check. SAFETY appears by name
in every step that touches it.

- [x] **1 · Gaze end-to-end, desktop.** ✅ user by-eye pass 2026-08-28
  ("feels right") — rigid travel, clamp, spring-back, reference pane
  inert; defaults kept (maxExcursion 0.4, easeMs 200, springBack true).
  AMENDED in G3 (user): input became RELATIVE — deltas only, absolute
  pointer position never read (DECISIONS 2026-08-28 "G3 revised"). `GAZE` config block
  (`maxExcursion` ~0.4, `springBack: true`, `easeMs` ~200 — tunables,
  no toggle); `uGaze` in 00-prelude + renderer's uniform list;
  `centered = cuv - 0.5 - uGaze` in 90-composite (before aspect
  correction); Option(Alt)+mousemove listener in controls.js writing
  the clamped gaze target; frame loop eases current → target and
  writes `shared.gaze` to both panes.
  **Check (user, by eye, desktop):** hold Option, drag — island, dead
  ring, outer islands, sparkle band, smoke, photopsia net all travel
  rigidly as one body; the scene and letterbox stay put; a diagonal
  drag moves the island diagonally without stretching; release springs
  back to centre; in side-by-side, the None reference shows no change
  (field off — nothing to move) while the symptom pane moves.
- [ ] **2 · Gaze on touch.** PARKED (user's call, 2026-08-28 — merged
  without it). Gaze has NO phone input until this lands; reopens
  before any phone-audience demo of the glance experience. One-finger
  drag on the canvas drives the same gaze target (pointer events; the
  DOM menu is unaffected); same clamp and spring-back.
  **Check (user, by eye, phone):** finger-drag moves the mask, no
  page scroll/zoom interference, spring-back on lift, baseline fps
  holds.
- [x] **3 · Panel skeleton, ideal mode.** ✅ user by-eye pass
  2026-08-28 ("works as expected"), as amended — relative gaze, AR
  aid tab, single fixed-ratio size, Option+Shift reposition mode all
  verified together; clean-room delta placement measured at
  cuv 0.515/0.567 vs 0.516/0.563 predicted. `PANEL` config block
  (quale-shaped, `enabled: false`, params: rect position/size, zoom;
  schema-shaped for the generator); stitcher gains a panel argument
  (`Q_PANEL` define + chunk genuinely excluded when off; reference
  pane's makeProgram passes panel-off); `15-glance-panel.frag` drawing
  the OPAQUE zoomed crop (ideal-display mode only — simplest
  verifiable slice); `applyPanel` uniforms, active pane only;
  generated PANEL group rendered into its own AR aid tab (generator
  gains a parent-container argument — a device never appears under
  Adjust Symptoms).
  AMENDED mid-step (user spec, DECISIONS 2026-08-28 "G3 revised"):
  AR aid tab replaces the General-tab group; size is a single width
  param with fixed 4:3 on-screen aspect; position has no fader —
  Option+Shift enters reposition mode (field-only view, steady
  yellow boundary, delta-driven placement, exit on key release).
  **Check (user, by eye, desktop):** toggle on the AR aid tab → a
  sharp zoomed inset appears; size/zoom sliders resize and magnify
  it holding shape; Option+Shift → symptoms drop to field-only,
  boundary glows, mouse movement places the pane, release restores
  symptoms and keeps the position; toggle off → gone; side-by-side →
  the reference pane never shows the panel.
- [x] **4 · Glasses optics.** ✅ user by-eye pass 2026-08-28, heavily
  amended in flight (all user-specced, DECISIONS "G4 revised"):
  source-brightness display capped at gain 1, transparency knob with
  0.06 ghost floor, GAZE.speed 2, pointer lock kills the screen
  boundary, click-drag resize (left grows) + wheel zoom + half-
  transparent field in reposition mode, ⓘ CSS tooltips + help
  section. Measured en route: resize/zoom gestures exact to
  arithmetic; shift-remapped wheel deltaX handled. Additive
  compositing:
  `lit = mix(scene + feed × gain, feed, opaque)`. AMENDED mid-step
  (user spec, DECISIONS 2026-08-28 "G4 revised"): the display
  replicates SOURCE brightness and never exceeds it — no brightness
  knob, `gain = min(1, 1 ÷ ambient)` (slider 0.2–2, default 1; low
  ambient is not a boost, only high ambient washes out); "Display
  transparency" slider (1 = max see-through, 0 = opaque display),
  floored by `PANEL.minOpacity` (0.06) so full transparency keeps a
  faint ghost.
  SAFETY named in the chunk header: **no time-varying term in this
  chunk, ever** — a pulsing panel must route through addLight and
  inherit ADD_CAP (DECISIONS 2026-08-28).
  **Check (user, by eye, desktop):** at low ambient the panel glows
  relative to the world; raising ambient washes it out; transparency
  at 1 shows the world through the panel with a faint ghost even
  over a dark feed (never fully gone); transparency at 0 reproduces
  step 3's opaque inset exactly.
- [ ] **5 · The glance moment + SAFETY re-verify.** PARKED (user's
  call, 2026-08-28 — merged without the formal pass). Mechanical
  half RUN at close-out: `grep uTime shader/15-glance-panel.frag` →
  zero hits (no time-varying term ✓) and the vUV gaze-invariant
  holds (no symptom chunk reads it). Informally covered during
  G3/G4 verdicts: blindspots compositing over the panel, gaze
  sliding the island onto it, reference-pane isolation. NOT
  verified anywhere: ADD_CAP all-on/all-max by-eye with the panel
  lit, and anything on a phone. Reopens with G2 or before the next
  SAFETY-touching change. No new machinery —
  integration verification of gaze × panel: code check that
  15-glance-panel contains no `uGaze` (head-fixed by construction),
  then the glance itself.
  **Check (user, by eye, desktop + phone):** drag gaze onto the panel
  — the surviving island slides over it and the panel snaps into
  "focus" conceptually (it was always sharp; now it's *seen*);
  blindspots and rim greying travel across the panel; SAFETY: all-on/
  all-max with the panel on stays busier-not-brighter (ADD_CAP paths
  unchanged — panel light is scene light), and
  `grep -n "uTime" shader/15-glance-panel.frag` returns nothing.

## GATE (every by-eye item is the user's call — never self-certified)

**NOT FORMALLY PASSED.** Phase merged 2026-08-28 on the user's
explicit call with G2 + G5 parked. Items marked ~ were covered
informally during step verdicts; phone items and the SAFETY by-eye
re-verify were not covered at all.

- [ ] Gaze: Option-drag (desktop) and finger-drag (phone) move ALL
  symptoms rigidly; the scene stays put; spring-back reads as a
  glance, not a camera pan.
- [ ] Panel optics honest: additive panel glows at low ambient, washes
  out as ambient rises, black is transparent; the ideal-vs-glasses
  slider demos the difference between a perfect display and optical
  see-through.
- [ ] The glance moment: dragging gaze onto the panel brings it into
  the surviving island; blindspots travel over it.
- [ ] Comparison view: reference pane panel-free and gaze-consistent
  (shared eyes); side-by-side and stacked both behave.
- [ ] SAFETY: panel adds no flashing light (no time-varying term —
  grep check above); ADD_CAP behaviour unchanged; all-on/all-max
  with panel on stays busier-not-brighter. Never regresses.
- [ ] Perf: phone fps holds with panel on and gaze active.
