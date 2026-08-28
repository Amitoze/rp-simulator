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
  inert; defaults kept (maxExcursion 0.4, easeMs 200, springBack true). `GAZE` config block
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
- [ ] **2 · Gaze on touch.** One-finger drag on the canvas drives the
  same gaze target (pointer events; the DOM menu is unaffected);
  same clamp and spring-back.
  **Check (user, by eye, phone):** finger-drag moves the mask, no
  page scroll/zoom interference, spring-back on lift, baseline fps
  holds.
- [ ] **3 · Panel skeleton, ideal mode.** `PANEL` config block
  (quale-shaped, `enabled: false`, params: rect position/size, zoom;
  schema-shaped for the generator); stitcher gains a panel argument
  (`Q_PANEL` define + chunk genuinely excluded when off; reference
  pane's makeProgram passes panel-off); `15-glance-panel.frag` drawing
  the OPAQUE zoomed crop (ideal-display mode only — simplest
  verifiable slice); `applyPanel` uniforms, active pane only;
  generated PANEL group rendered into the General tab (generator
  gains a parent-container argument — a device never appears under
  Adjust Symptoms).
  **Check (user, by eye, desktop):** toggle on → a sharp zoomed inset
  of the same feed appears; rect/zoom sliders move, resize, and zoom
  it; toggle off → gone; side-by-side → the reference pane never
  shows the panel.
- [ ] **4 · Glasses optics.** Additive compositing:
  `lit = mix(scene + feed × gain, feed, opaqueness)` with
  `gain = displayBrightness ÷ ambient`; `ambient` slider (schema
  min > 0) and `opaqueness` slider (0 = glasses, 1 = ideal — step 3's
  look). SAFETY named in the chunk header: **no time-varying term in
  this chunk, ever** — a pulsing panel must route through addLight
  and inherit ADD_CAP (DECISIONS 2026-08-28).
  **Check (user, by eye, desktop):** at low ambient the panel glows
  and dark feed pixels vanish (black is transparent); raising ambient
  washes the panel out; opaqueness at 1 reproduces step 3 exactly;
  point the panel crop at a dark scene region → nothing visible
  (additive honesty).
- [ ] **5 · The glance moment + SAFETY re-verify.** No new machinery —
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
