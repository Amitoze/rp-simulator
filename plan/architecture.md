# Architecture — living description

Maintained by `/architecture`; derived from `plan/` + `DECISIONS.md` +
the code — update it there, then regenerate here. **Last updated:
2026-08-20** (Q2 steps 1–3 landed: schema + clamp-on-load in config.js,
addLight restructure in the compositor, user pass all; the global
SAFETY ceiling itself — step 4 — still to come).

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
└────────┬───────────────┘
         │ video texture
         ▼
┌─────────────────────────────────────────────┐
│ CONFIG  config.js                           │
│  DEFAULTS (UI state) 🟩   FIELD (tier 1) 🟩 │
│  QUALIA {enabled} flags 🟩                  │
│  QUALIA full schema {value,min,max,label}   │
│    + clamp-to-range on load ◐               │
│    (Q2 steps 1–2 landed, user pass;         │
│    🟩 at GATE Q2)                           │◀── 🟨 FF6 island-seed editor
│  preset files, sparse overrides 🟦 (Q4)     │
└────────┬────────────────────────────────────┘
         │ enabled-flags + param values (clamped)
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
│  reads quale params from schema ◐ (Q2 s1)   │
│  two panes, two draw calls 🟦 (Q5)          │◀── 🟨 FF1 gaze tracking
└────────┬────────────────────────────────────┘
         │ one fullscreen triangle
         ▼
┌─────────────────────────────────────────────┐
│ SHADER  shader/*.frag (7 chunks) 🟩         │
│  10-field: survival mask, ONE function 🟩   │◀── 🟨 perimetry import
│  qualia chunks 20–24 🟩 (each SAFETY-capped)│◀── 🟨 FF2–FF5 (Phase D era)
│  90-composite: fixed slots 🟩               │
│    addLight accumulator ◐ (Q2 step 3,       │
│    user pass — by-eye identical)            │
│    global SAFETY brightness clamp 🟦 (Q2    │
│    step 4)                                  │
│  fill-in quale replaces murk 🟦 (Phase C)   │
│  peripheral look (blur/motion) 🟦 (Phase D) │
└────────┬────────────────────────────────────┘
         │ final pixels (immersive or split view)
         ▼
┌─────────────────────────────────────────────┐
│ UI  controls.js 🟩  sliders, view toggles   │
│  generated "Adjust Symptoms" panel from     │
│  the schema 🟦 (Q3)                         │
│  preset dropdown / file picker / export 🟦  │
│  (Q4)                                       │
└─────────────────────────────────────────────┘
```

| 🟨 item | Attaches at | Adds | Revisit when |
|---|---|---|---|
| FF1 gaze tracking | frame loop | field mask follows the eye, not the screen | viewers "cheat" by foveating the islands |
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

### Source 🟩

```
getUserMedia ──camera frames──▶┐
file <video> ──decoded frames─▶├──▶ one GL texture, re-uploaded per frame
absent/denied ─────────────────┘    (fallback: procedural scene in-shader,
 (mediaDevices guard: insecure       uSrc = 0)
  origins get fallback, not a crash)
```

### Config & schema ◐ (Q2 steps 1–2 landed; 🟩 at GATE Q2) (DECISIONS 2026-08-20)

Schema shape and `loadQualia()` clamp both landed, user-checked
(by-eye identical; out-of-range 999 → warned and capped):

```
config.js
  DEFAULTS ── UI state only (degeneration, view, camera, menu)
  FIELD ───── tier 1 geometry, faders only, NEVER toggleable
  QUALIA ──── per quale { enabled, params }
              each param { value, min, max, label }   ← schema IN CODE
        │
        ▼ loadQualia(): every value clamped into [min, max]
  clamped values ──▶ renderer (uniforms) + controls (slider positions)

presets/*.json 🟦 (Q4) ── sparse VALUE overrides only; never structure,
                          ranges, or caps; unknown keys warn + ignore
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

### Frame loop 🟩 → touched by Q2 (schema reads), Q5 (panes 🟦)

```
each frame: video pixels ──▶ texture upload
            sliders ────────▶ uNetDensity, uSeeThru        ← Q2: seeded
            degeneration ───▶ field radii, degrees → screen   from schema
                              units (edge ≈ 90°), mild→late blend
            clock ──────────▶ uTime
🟦 Q5: pane = (screen region, preset, compiled program);
       immersive = 1 pane, comparison = 2; two scissored draw calls,
       shared texture + clock; split math leaves the shader
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

### Compositor 🟩, addLight ◐, clamp 🟦 (DECISIONS 2026-08-20)

The addLight restructure landed (Q2 step 3, user pass — by-eye
identical, toggles round-trip clean); the SAFETY ceiling itself is
step 4 and not built yet:

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
                                          ceiling MEASURED from today's
                                          worst case, hardcoded (not a
                                          tunable, never in presets)
                                                   │
                              base colour + clamped addLight ──▶ pixels
```

Scene brightness is never clamped — a bright real wall is the world's
business. Below the ceiling, output is identical to today.

### UI 🟩 → grows in Q3/Q4 🟦

```
sliders / toggles ──▶ state + uniforms (live)
🟦 Q3: "Adjust Symptoms" section generated FROM the schema —
       FIELD first (faders only, no toggle), then one toggle per
       quale, its sliders appear on enable; toggle → restitch,
       slider → uniform
🟦 Q4: preset dropdown (presets/index.json manifest) + file picker
       + SAVE AS PRESET export (required — closes the tune→save→
       compare loop); "none" preset = unfiltered view (feeds Q5)
```
