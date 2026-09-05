# Architecture — living description

Maintained by `/architecture`; derived from `plan/` + `DECISIONS.md` +
the code — update it there, then regenerate here. **Last updated:
2026-08-30** (Phase V planned — video source picker on the SOURCE
stage: stock clip default / local file via picker or drag-drop /
direct CORS-gated media URL, all 🟦. Queue-jumps C, user's call —
see DECISIONS 2026-08-30 "Phase V planned". Prior update 2026-08-28:
Phase G merged early, G1/G3/G4 by-eye; G2 + G5 parked.)

---

## Level 1 — the whole idea

```
┌──────────────┐      ┌────────────────────┐      ┌──────────────────┐
│ THE WORLD    │      │ THE PORTRAIT       │      │ THE COMPARISON   │
│ camera or    │─────▶│ one person's RP:   │─────▶│ filtered next to │
│ video of the │ live │ field geometry     │ what │ unfiltered — the │
│ viewer's own │ scene│ (where vision is)  │ they │ loss made        │
│ surroundings │      │ + qualia (what the │ see  │ legible to a     │
└──────────────┘      │ loss is like)      │      │ sighted viewer   │
                      └────────────────────┘      └──────────────────┘
                                ▲
                      the person's own account,
                      checked against literature
```

The simulator filters the viewer's own live surroundings through one
person's visual field. Geometry (tier 1: *where* vision survives) is
permanent; qualia (tier 2: *what the loss is like* — smoke, flashes,
sparkle) are each toggleable and tunable. A comparison view keeps the
loss legible to sighted viewers, since honest filling-in is invisible.
A third concept entered with Phase G: **the aid** — a simulated
head-worn device (glance panel) drawn INTO the world the portrait then
filters; devices are worn over the condition, never part of it.

---

## Level 2 — the pipeline

```
🟩 Built   🟧 In progress   ◐ Scaffolded   🟦 Planned   🟨 Proposed
```

```
 camera / video file / procedural fallback
        │ pixels, once per frame
        ▼
┌────────────────────────┐
│ SOURCE  controls.js 🟩 │◀── 🟨 FF7 HTTPS dev serving (phone camera on LAN)
│ + mediaDevices guard 🟩│
│ video source picker 🟦 │
│  (V: stock default /   │
│  local file / direct   │
│  URL — DECISIONS       │
│  2026-08-30)           │
└────────┬───────────────┘
         │ video texture
         ▼
┌─────────────────────────────────────────────┐
│ CONFIG  config.js                           │
│  DEFAULTS (UI state) 🟩   FIELD (tier 1) 🟩 │
│  QUALIA {enabled} flags 🟩                  │
│  QUALIA full schema {value,min,max,label}   │
│    + clamp-to-range on load 🟩              │
│    (Q2, GATE passed 2026-08-20)             │◀── 🟨 FF6 island-seed editor
│  schema = LIVE state: UI writes values /    │
│    enabled at runtime 🟩 (Q3, GATE passed   │
│    2026-08-28)                              │
│  FIELD quale-shaped {enabled, params} incl. │
│    degeneration (General slider = its sole  │
│    UI), toggleable 🟩 (Q5)                  │
│  ⇄ PRESETS presets.js + presets/ 🟩 (Q4;    │
│    envelope v2 Q5, GATE passed 2026-08-28): │
│    FULL value snapshots, named envelope     │
│    {name, saved, field, qualia}; index.json │
│    manifest (browser can't ls); load =      │
│    materialise(): defaults → file → warn    │
│    unknown → clamp; export = serialise live │
│    schema; SAFETY caps out of reach (never  │
│    params); boot = schema defaults, never a │
│    file (DECISIONS 2026-08-28)              │
│  GAZE block: spring-back / ease / max-      │
│    excursion / sensitivity tunables, no     │
│    toggle 🟧 (G1/G3 done by eye)            │
│  PANEL block: the aid — quale-shaped but a  │
│    DEVICE, not a symptom; OUTSIDE presets;  │
│    single fixed-aspect size, noUI position  │
│    🟧 (G3 + G4 done by eye)                 │
└────────┬────────────────────────────────────┘
         │ enabled-flags + param values (clamped; live-edited from Q3)
         ▼
┌─────────────────────────────────────────────┐
│ STITCH + COMPILE  renderer.js 🟩            │
│  pure: (chunk sources, qualia) → program;   │
│  disabled chunks absent, off costs zero     │
└────────┬────────────────────────────────────┘
         │ compiled program + uniform locations
         ▼
┌─────────────────────────────────────────────┐
│ FRAME LOOP  renderer.js 🟩                  │
│  uniforms each frame: time, sliders,        │
│  field radii (degrees → screen units)       │
│  reads quale params from schema 🟩 (Q2)     │
│  ALL quale/field uniforms from schema each  │
│  frame, via config-object functions;        │
│  restitch() swaps programs, uniforms        │
│  self-heal next frame 🟩 (Q3, GATE passed   │
│  2026-08-28)                                │
│  two panes, two draw calls 🟩 (Q5, GATE     │
│  passed 2026-08-28)                         │
│  shared gaze offset → uGaze on BOTH panes   │
│  (one pair of eyes, like the clock) 🟧 (G1  │
│  desktop done, user by-eye 2026-08-28;      │
│  touch = G2)                                │◀── 🟨 FF1 gaze tracking
└────────┬────────────────────────────────────┘
         │ one fullscreen triangle
         ▼
┌─────────────────────────────────────────────┐
│ SHADER  shader/*.frag (7 chunks) 🟩         │
│  10-field: survival mask, ONE function 🟩   │◀── 🟨 perimetry import
│  qualia chunks 20–24 🟩 (each SAFETY-capped)│◀── 🟨 FF2–FF5 (Phase D era)
│  15-glance-panel: head-fixed aid display,   │
│    scene slot BEFORE the survival mix,      │
│    steady light only — never a time-varying │
│    term — outside ADD_CAP 🟧 (G3 + G4 done  │
│    by eye: ideal + additive optics, gain =  │
│    min(1, 1/ambient), reposition ergonomics;│
│    G5 glance-moment gate pending)           │
│  90-composite: fixed slots 🟩               │
│    addLight accumulator + global SAFETY     │
│    brightness clamp 🟩 (Q2, ADD_CAP = 0.65  │
│    measured; GATE passed 2026-08-20)        │
│  fill-in quale replaces murk 🟦 (Phase C)   │
│  peripheral look (blur/motion) 🟦 (Phase D) │
└────────┬────────────────────────────────────┘
         │ final pixels (immersive or split view)
         ▼
┌─────────────────────────────────────────────┐
│ UI  controls.js 🟩  sliders, view toggles   │
│  generated "Adjust Symptoms" panel from     │
│  the schema 🟩 (Q3, GATE passed 2026-08-28):│
│  FIELD faders first (no toggle), per-quale  │
│  toggle → faders; sliders write schema,     │
│  toggles restitch                           │
│  preset dropdown ("Defaults" + manifest) /  │
│  file picker / SAVE-AS-PRESET export 🟩     │
│  (Q4, GATE passed 2026-08-28)               │
│  gaze input: Option+mouse (desktop) 🟧 (G1  │
│  done, user by-eye 2026-08-28) / one-finger │
│  canvas drag (touch) 🟦 (G2), spring-back   │
│  on release                                 │
│  PANEL group in its own AR-aid tab — a      │
│  device never appears under Adjust Symptoms │
│  (user re-revision, G3) 🟧 (G)              │
│  Option+Shift reposition mode: field-only   │
│  view + steady boundary + delta placement   │
│  🟧 (G3)                                    │
└─────────────────────────────────────────────┘
```

| 🟨 item | Attaches at | Adds | Revisit when |
|---|---|---|---|
| FF1 gaze tracking | frame loop | field mask follows the REAL eye (camera eye-tracker) — Phase G's mouse/touch gaze becomes the manual fallback | G proves the interaction and a hands-free demo is wanted |
| FF2 RP overlay on surviving vision | qualia chunks | contrast loss + dimming on ALL preserved field | user wants iter-3 to touch the surviving field; verify literature first |
| FF3 WebGL2 mipmap blur | shader pipeline | true LOD blur instead of taps | D1 tap blur shimmers or blows phone perf |
| FF4 motion boost | shader pipeline | previous-frame FBO, motion amplified in islands | FF3 lands, or Gate D motion feels too weak |
| FF5 opponent-space desaturation | qualia chunks | red-green fades faster than blue-yellow | Gate D says island colour is wrong in kind |
| FF6 island-seed editor | config | UI to tune island geography | a second portrait, or seed-hunting gets tedious |
| FF7 HTTPS dev serving | source | secure context → live phone camera on LAN | a pre-merge gate needs live phone camera (likely Phase D) |
| Perimetry import | 10-field | survival function body ← real field-test texture | an actual visual field test result in hand (check its coverage first) |

---

## Level 3 — per-stage deep dives

```
🟩 Built   🟧 In progress   ◐ Scaffolded   🟦 Planned   🟨 Proposed
```

### Source 🟩 → grows in V 🟦 (video source picker — DECISIONS 2026-08-30, not built)

```
getUserMedia ──camera frames──▶┐
file <video> ──decoded frames─▶├──▶ one GL texture, re-uploaded per frame
absent/denied ─────────────────┘    (fallback: procedural scene in-shader,
 (mediaDevices guard: insecure       uSrc = 0)
  origins get fallback, not a crash)

🟦 Phase V — every source funnels into the SAME <video id="vid">
   element, so renderer / panes / gaze / panel need zero changes:

Background: Video ──▶ sub-options row (revealed only in video mode)
  ├─ stock clip — DEFAULT, plays as today (path + credit → config)
  ├─ local file: picker or drag-drop ──▶ object URL (same-origin,
  │    never CORS-gated; previous object URL revoked on switch)
  └─ pasted direct media URL ──▶ crossorigin="anonymous" src
       (non-CORS host fails cleanly at LOAD → message + revert to
        stock; YouTube/Vimeo PAGE urls refused with an explanation —
        cross-origin iframes have zero pixel access, unfilterable)
```

### Config & schema 🟩 (Q2, GATE passed 2026-08-20) (DECISIONS 2026-08-20)

Schema shape and `loadQualia()` clamp built and gated (by-eye
identical at defaults; out-of-range 999 → warned and capped):

```
config.js
  DEFAULTS ── UI state only (degeneration, view, camera, menu)
  FIELD ───── tier 1 geometry, faders only, NEVER toggleable
              🟩 full schema-shape (Q3) — every value
              { value, min, max, label }, {mild,late} radii as
              pair-values; still outside presets' reach
              (DECISIONS 2026-08-20 "Q3 planned")
  QUALIA ──── per quale { enabled, params }
              each param { value, min, max, label }   ← schema IN CODE
        │
        ▼ clampParams(): every value clamped into [min, max]
  clamped values ──▶ renderer (uniforms) + controls (slider positions)

🟩 Q3 (GATE passed 2026-08-28): the schema is the LIVE state after
       load — sliders write param values, toggles write enabled; one
       declared place always holds "current settings" (what Q4 export
       serialises and Q5 panes read) (DECISIONS 2026-08-20)

presets/*.json 🟩 (Q4, GATE passed 2026-08-28) ── FULL value snapshots
       (sparse rejected: a sparse preset drifts when defaults move —
       frozen snapshots are the honest portrait semantics); named
       envelope { name, saved, qualia }; values only, never structure,
       ranges, or caps; unknown keys warn + ignore, missing keys keep
       schema defaults, everything clamped; FIELD + SAFETY excluded;
       new qualia default enabled:false so old presets keep their look
```

`NET` and `SPARKLE` blocks dissolve into `QUALIA[quale].params` — one
source of truth (ratified 2026-08-20; rejected: schema-points-at-blocks,
auto-build-at-load).

### Stitch + compile 🟩 (DECISIONS 2026-08-18, built Q1)

```
chunk sources (fetched, no-store) ─┐
qualia config ─────────────────────┤ pure function, no globals
                                   ▼
      #define Q_* for enabled ++ concat of structural + enabled chunks
                                   ▼
                    compiled program + uniform locations
   (disabled quale: chunk text AND call site absent — off costs zero;
    recompile on toggle ≈ tens of ms, once per settings click)
```

### Frame loop 🟩 → touched by Q2 (schema reads), Q3 (live state 🟩), Q5 (panes 🟩), G (gaze 🟦)

```
each frame: video pixels ──▶ texture upload
            sliders ────────▶ uNetDensity, uSeeThru        ← Q2: seeded
            degeneration ───▶ field radii, degrees → screen   from schema
                              units (edge ≈ 90°), mild→late blend
            clock ──────────▶ uTime
🟩 Q3 (GATE passed 2026-08-28): set-once/per-frame split died — ALL
       quale + field uniforms
       written from the schema every frame (~12 floats, noise next to
       the texture upload), via functions of a config OBJECT, never a
       global read (Q5 depends on this); restitch() = makeProgram
       again + program swap + delete old — uniforms self-heal on the
       next frame (DECISIONS 2026-08-20 "Q3 planned")
🟩 Q5 (GATE passed 2026-08-28, user by-eye desktop + phone):
       ASYMMETRIC panes — active (Symptom) pane = the live schema
       singletons, panel edits as today; reference pane = inert
       materialised config from ITS preset (default None = the honest
       unfiltered view), own program, frozen by construction; two
       scissored draw calls, shared texture + clock (same frame both
       sides); uSplit/rawScene/split math dead — 90-composite renders
       ONE pane, uFit picks cover/contain; FIELD toggleable via
       compile-time Q_FIELD (off = survival 1, edges parked at 10.0 —
       raw scene, zero per-pixel cost); envelope v2 { name, saved,
       field, qualia } — degeneration is FIELD.params.degeneration,
       General slider its sole UI; menu = two tabs General | Symptoms
       + reference selector under View, side-by-side only (user
       revision); ADD_CAP clamp runs per pane
```

### Tier 1 — field geometry 🟩 (10-field)

```
pixel position ──▶ aspect-corrected polar (r, ang)
FIELD radii ─────▶ fieldSurvival(): ONE substitutable function
                   ├──▶ survival 0..1 (centre island + outer islands,
                   │    wobbly edges, dead ring between)
                   └──▶ edge/oEdge/central/outer (shared with qualia)
```

### Tier 2 — qualia chunks 🟩 (20–24, each SAFETY-capped)

```
slot order is FIXED; toggling changes membership, never order
scene ──▶ 24-transition (greying bands at both dead-ring rims) ──▶ scene'
fill:     20-smoke ──▶ 23-murk (dies in Phase C ── replaced by
                                fill-in quale 🟦)
additive: 21-photopsia (flashing net, amplitude-capped)
post-add: 22-sparkle (edge ring, amplitude-capped)
```

### Compositor 🟩 incl. addLight + clamp (Q2, GATE passed 2026-08-20)

addLight restructure and SAFETY ceiling built and gated: `ADD_CAP =
0.65`, measured 2026-08-20 (flecks at 0.55, none at 0.65, both sliders
maxed); all-on/all-max judged busier but not brighter than main
(DECISIONS 2026-08-20):

```
view math (immersive cover-fit / split contain-fit)
   ▼
scene' ──────────────────────────────┐
fill (smoke → murk) ──┐              ▼
                      ├─▶ mix by survival ──▶ base colour
photopsia ─┐          │                            │
sparkle ───┴─▶ addLight (photopsia weighted        ▼
               by deadness + sparkle) ──▶ SAFETY: luma ceiling —
                                          scale down only when over;
                                          ADD_CAP = 0.65 — measured
                                          2026-08-20, hardcoded (not a
                                          tunable, never in presets)
                                                   │
                              base colour + clamped addLight ──▶ pixels
```

Scene brightness is never clamped — a bright real wall is the world's
business. Below the ceiling, output is identical to today.

### UI 🟩 (incl. generated panel Q3, presets Q4 — both GATES passed 2026-08-28) → grows in G 🟦 (gaze listener, PANEL group)

```
sliders / toggles ──▶ state + uniforms (live)
🟩 Q3 (GATE passed 2026-08-28, DECISIONS 2026-08-20 "Q3 planned"):
       "Adjust Symptoms" expandable section generated FROM the
       schema, at the BOTTOM of the menu — FIELD first (faders only,
       no toggle; tier 1 not removable), then one toggle per quale,
       its faders appear on enable; zero per-quale UI code.
       slider drag ──▶ writes schema value (frame loop picks it up)
       toggle flip ──▶ writes enabled + calls restitch()
       hardcoded net/transparency slider rows died (replaced by their
       generated equivalents); degeneration stays top-level

🟩 Q4 (DECISIONS 2026-08-28 "Q4 planned" + "GATE Q4 passed";
       gate passed by eye 2026-08-28, desktop + phone). Menu tabbed
       (user UX spec 2026-08-28): General (degen slider, background,
       view) | Adjust Symptoms (load presets above configure
       symptoms); picker loads select an ad-hoc dropdown entry named
       from the file. Built shape:

  presets/index.json ──filenames──▶ dropdown ("Defaults" entry first,
                                    computed from schema, no file)
  dropdown pick / file picker ──JSON──▶ loadPreset():
       schema defaults → overlay file values → warn unknown keys →
       clamp to ranges → restitch(QUALIA) + rebuild generated panel
  SAVE AS PRESET ──▶ exportPreset(): live schema → { name, saved,
       qualia } JSON → Blob download  (required — closes the
       tune→save→compare loop)
  "none" preset = every quale off = unfiltered view (feeds Q5)
```

### Gaze + glance panel 🟩* (Phase G merged 2026-08-28 — G1/G3/G4 by-eye desktop; *G2 touch gaze 🟦 PARKED (no phone input exists) and G5 formal gate incl. SAFETY by-eye 🟦 PARKED, user's call — DECISIONS "Phase G merged early")

Two coordinate frames, and the phase is the space between them: damage
is eye-fixed (retina frame), the aid is head-fixed (screen frame).

```
Option+mouse (desktop) / one-finger drag (touch)
        │ where the eye points, as an offset from straight ahead
        ▼
GAZE state (controls.js): clamp to max excursion, spring back to
centre on release (tunables in the GAZE config block)
        │ ONE shared offset per frame — both panes, like the clock
        ▼
uGaze ──▶ 90-composite:  centered = cuv − 0.5 − gaze
              └─▶ r, ang, sp, survival, edge… ALL shift rigidly —
                  every present AND future symptom moves with the
                  eye, because position is only ever derived from
                  centered (the gaze invariant, DECISIONS 2026-08-28)

PANEL schema ──position (Option+Shift drag, no fader) / size (one
width, fixed 4:3 on-screen aspect) / zoom; G4 adds brightness,
ambient, opaqueness──▶
15-glance-panel (scene slot, BEFORE transition and the survival mix):
  placed from cuv — deliberately NOT gaze-shifted (head-fixed)
  samples the SAME feed, cropped + zoomed  ──▶  panel light:
    gain = display brightness ÷ ambient   (washes out in daylight,
    lit  = mix(scene + feed × gain, feed, opaqueness)  glows at night)
           └── additive glasses ←──────→ ideal display ──┘
        │ scene + panel light (steady only — no time-varying term,
        │ outside ADD_CAP; blindspots travel OVER the panel)
        ▼
transition ──▶ survival mix ──▶ … (unchanged downstream)
```

Active pane only — the reference pane stays the bare condition, so
the comparison reads "with aid" vs "without".
