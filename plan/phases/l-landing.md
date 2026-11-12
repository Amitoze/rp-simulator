# Phase L — deinops landing page + launch experiences

**Status:** planned 2026-11-12 · appetite 0.5 day · branch `phase-l-landing`
(cut from `phase-c-fill-in` after committing G2). Ratified design:
DECISIONS 2026-11-12 "Phase L planned" (A link mechanism, B experience
home, C landing location, D SAFETY gate, names). Queue-jumps C on the
user's call — the links serve the outreach critical path (00-context).

Disposable after merge: the durable outputs are the DECISIONS entry
and the architecture marks (LAUNCH stage, landing page).

## What the phase delivers

- `index.html` becomes the **deinops** company page: the simulator is
  one product, presented as three experiences, each a link.
- `sim.html?experience=<name>` opens the simulator already configured.
  Slugs are stable names (printed in slides): `severe`, `compare`,
  `glance`. Display names: "Through my eyes", "What you see, what I
  see", "The glance aid".
- The photosensitivity gate moves **into** sim.html (SAFETY), because
  the shareable links bypass the landing page.

## Data-flow trace (before it's built)

```
index.html (deinops)                 any shared link (slide, email)
   │ card click                            │ pasted URL
   └──────────────┬─────────────────────────┘
                  │ sim.html?experience=<name>
                  ▼
launch.js (← NEW): reads the name ONCE at module load
   born here: LAUNCH = { ...DEFAULTS, ...EXPERIENCES[name] }
   absent name  → DEFAULTS exactly (plain sim.html unchanged)
   unknown name → DEFAULTS + console warning (a typo'd slide link
                  still opens the sim, never a blank page)
                  │ one resolved entry state
       ┌──────────┴──────────────────┐
       ▼                             ▼
 applyLaunchSchema()               applyDefaults() (controls.js,
 (renderer main, BEFORE restitch,   CHANGED: reads LAUNCH, not DEFAULTS)
  AFTER module load so presets.js'   background 'video' → bgVid click
  BASELINE stays the factory look):  view 'sideBySide' → vwSbs click
   degeneration → FIELD.params…      menuCollapsed     → panelHead click
     .value, clamped to [min,max]
   panel → PANEL.enabled
       │
       ▼
 restitch(QUALIA, FIELD, PANEL)  — compiles the panel in iff enabled
 initControls → sliders.degen.value = FIELD.params.degeneration.value
                (the fader reads the schema: one write, two readers)
 buildPanelGroup → the AR-aid toggle shows the panel's true state

SAFETY gate (sim.html #gate ← NEW, static markup + ~10 lines in
controls.js): an OPAQUE, STATIC overlay above canvas, menu and note;
the sim runs beneath, nothing shows until "I understand"; the ack is
kept in sessionStorage (WARNING.rememberForSession) so hopping between
the three links in one session asks once. Config: WARNING block.
```

Risks the trace surfaces, so steps handle them rather than discover
them:

- **Order of writes.** `PANEL.enabled` must be true BEFORE `restitch`
  (the chunk is compiled in, not toggled by uniform) and the
  degeneration write must land BEFORE `initControls` draws the fader.
  Both happen in `main()` ahead of those calls. A write at module load
  would be earlier still — but presets.js captures `BASELINE` at module
  load, and "Defaults" in the preset dropdown must stay the factory
  portrait, not the experience's degeneration.
- **The gate must not leak light.** A translucent or fading overlay
  shows the ~9 Hz net through it. Opaque background, no CSS transition,
  no animation of any kind — named SAFETY in step 3.
- **Camera vs video.** Experiences boot on the stock video so a link
  works without a permission prompt; camera remains the toggle it is
  today. `[my-synthesis]` — the by-eye gate may flip it; it is one
  config value per experience.
- **"Defaults" after an experience.** Picking Defaults in the preset
  dropdown resets degeneration to the factory 0.82, not the
  experience's 1.0. Intended (a preset reset is the portrait), stated
  so it isn't reported as a bug.

## The ratified design

```
index.html ← REPLACED (deinops: eyebrow, name, lede, three experience
             cards, shortened "portrait not an average" caveats, footer;
             NO simulator JavaScript; links relative: sim.html?experience=…)
  │
  ▼
sim.html  (markup + #gate overlay ← NEW; otherwise unchanged)
  │
  ▼
launch.js ← NEW  (EXPERIENCES + EXPERIENCE_PARAM + WARNING in config.js ← NEW)
  │ LAUNCH resolved state; applyLaunchSchema(); gate wiring
  ▼
renderer.js main(): applyLaunchSchema() → restitch → initControls
controls.js applyDefaults(): LAUNCH instead of DEFAULTS
  │
  ▼
existing pipeline untouched: schema → stitch → frame loop → shader
```

Config additions (all tunable, nothing hardcoded):

```js
EXPERIENCE_PARAM = 'experience'
EXPERIENCES = {
  severe:  { background: 'video', view: 'immersive',  degeneration: 1.0, panel: false },
  compare: { background: 'video', view: 'sideBySide', panel: false },
  glance:  { background: 'video', view: 'immersive',  panel: true },
}
WARNING = { rememberForSession: true, storageKey: 'rp-sim-warning-ack' }
```

## Steps

Each ends with something observable. Checks the served preview can
make are stated; the by-eye calls are the user's.

- [x] **1 · LAUNCH stage + the glance experience.** ✅ 2026-11-12 served-preview checks passed (glance: PANEL.enabled true, aid toggle on, Video on, immersive; plain sim.html: camera, panel off, degeneration 0.82; `?experience=typo`: as plain + one console warning). `EXPERIENCES`,
  `EXPERIENCE_PARAM` in config.js; `launch.js` resolves `LAUNCH` and
  exports `applyLaunchSchema()`; renderer `main()` calls it before
  `restitch`; controls `applyDefaults()` reads `LAUNCH`. Only `glance`
  defined so far.
  **Check:** `sim.html?experience=glance` boots with the panel drawn,
  the AR-aid tab's toggle on, background Video; plain `sim.html` is
  pixel-for-pixel today's boot (camera, panel off); `?experience=typo`
  boots as plain with one console warning.
- [x] **2 · `severe` and `compare`.** ✅ 2026-11-12 served-preview checks passed (compare: side-by-side on, reference row shown, note names the None reference; severe: degeneration 1 in schema and fader, immersive; Defaults in the preset dropdown returns 0.82). Two more entries, no new code
  paths.
  **Check:** `?experience=compare` boots side-by-side, note reads
  "comparison (left/top: None — all symptoms off)"; `?experience=severe`
  boots immersive with the degeneration fader at 1 (far right) and the
  field visibly tighter than plain `sim.html`; the preset dropdown's
  Defaults still returns the fader to 0.82.
- [x] **3 · SAFETY gate overlay in sim.html.** ✅ 2026-11-12 served-preview checks passed (computed: opacity 1, transition none, animation none, opaque #0b0d10, z 100, button focused; overlay covers the full 375×812 viewport, no horizontal scroll; ack hides it and persists for the session — a second link in the same tab does not ask; clearing the ack asks again). Phone by-eye for edge leakage still the user's. `#gate` markup (warning
  text, "I understand — start" button), opaque static CSS, `WARNING`
  config, wiring in controls.js: shown at boot unless the session ack
  exists; the button hides it and stores the ack. No transition, no
  animation, opaque — SAFETY.
  **Check:** first open of any link shows only the warning (nothing
  flashing visible anywhere, including around the edges on a phone
  viewport); after "I understand", opening another experience in the
  same tab does not ask again; a new tab asks again. Computed style
  check: `getComputedStyle(gate).opacity === '1'` and
  `transition === 'all 0s ease 0s'` (or `none`).
- [ ] **4 · deinops landing page.** `index.html` replaced: eyebrow
  "deinops", name, one-line lede, "Products" with the RP simulator and
  its three experience cards (each linking by slug, each stating
  "contains rapid flashing"), caveats shortened from today's page,
  footer with the footage credit. No simulator JavaScript. Same dark
  tokens as today so the hand-off into the sim is seamless.
  **Check (served preview, desktop + 375 px viewport):** three links
  resolve to the three experiences; no horizontal scroll at phone
  width; keyboard focus visible on every card. **Check (user, by eye):**
  the page reads as a company home, not a simulator splash.
- [ ] **5 · README, plan sync, PR.** README's live link and the "How it
  works" paragraph mention the landing page and the three links; plan
  row updated; push; PR into main (carries G2 + shortcuts — stated in
  the PR body).

## Gate (the user's call, never self-certified)

On desktop and on a phone, from the deinops page: each of the three
cards opens the simulator in the named state, the warning appears once
per session and nothing flashes before it is dismissed, plain `sim.html`
is unchanged, and the landing page reads as deinops rather than as the
simulator's splash. Per-experience values (degeneration, background,
panel placement) are tuned by eye in config, not in code.
