# Architecture — living description

Maintained by `/architecture`; derived from `plan/` + `DECISIONS.md` +
the code — update it there, then regenerate here. **Last updated:
2026-08-28** (GATE Q3 passed by eye, desktop + phone — generated
panel and live-schema marks flip 🟦 → 🟩; Q4 design ratified, see
DECISIONS 2026-08-28 "Q4 planned": presets become FULL value
snapshots in a named envelope, boot stays on the schema — preset
marks updated with the ratified shapes, 🟦 planned).

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
│    + clamp-to-range on load 🟩              │
│    (Q2, GATE passed 2026-08-20)             │◀── 🟨 FF6 island-seed editor
│  schema = LIVE state: UI writes values /    │
│    enabled at runtime 🟩 (Q3, GATE passed   │
│    2026-08-28)                              │
│  FIELD full schema-shape, same param        │
│    pattern, still preset-proof 🟩 (Q3)      │
│  ⇄ PRESETS presets.js + presets/ 🟩 (Q4,    │
│    GATE passed 2026-08-28):                 │
│    FULL value snapshots, named envelope     │
│    {name, saved, qualia}; index.json        │
│    manifest (browser can't ls); load =      │
│    defaults → file → warn unknown → clamp;  │
│    export = serialise live schema; FIELD +  │
│    SAFETY caps out of reach; boot = schema  │
│    defaults, never a file (DECISIONS        │
│    2026-08-28)                              │
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
│  two panes, two draw calls 🟦 (Q5)          │◀── 🟨 FF1 gaze tracking
└────────┬────────────────────────────────────┘
         │ one fullscreen triangle
         ▼
┌─────────────────────────────────────────────┐
│ SHADER  shader/*.frag (7 chunks) 🟩         │
│  10-field: survival mask, ONE function 🟩   │◀── 🟨 perimetry import
│  qualia chunks 20–24 🟩 (each SAFETY-capped)│◀── 🟨 FF2–FF5 (Phase D era)
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
│  file picker / SAVE-AS-PRESET export 🟦 (Q4)│
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

presets/*.json 🟦 (Q4, DECISIONS 2026-08-28) ── FULL value snapshots
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

### Frame loop 🟩 → touched by Q2 (schema reads), Q3 (live state 🟩), Q5 (panes 🟦)

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

### UI 🟩 (incl. generated panel, Q3 GATE passed 2026-08-28) → grows in Q4 🟦

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
