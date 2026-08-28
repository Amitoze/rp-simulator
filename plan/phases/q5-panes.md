# Phase Q5 — per-pane configs + field toggle (plan of record)

From [06-qualia-refactor.md](../06-qualia-refactor.md) Q5 as extended
2026-08-28 (DECISIONS "Q5 scope pre-ratified" + "Q5 planned"): field
joins the toggles and the presets; panes are asymmetric; menu goes
three-tab. Gate: GATE Q5 (staged), user's call. Appetite note: the
original Q5 estimate (~0.25–0.5 day) predates the field-toggle,
envelope-v2, and three-tab extensions — realistic is ~0.75 day. Flagged,
accepted by scope ratification.

## Data-flow trace (before it's built)

```
PRESET ENVELOPE v2
{ name, saved, degeneration, field: {enabled, params}, qualia: {…} }
   │ (old v1 files: missing sections fill from defaults — same
   │  can't-pin-what-didn't-exist rule as new qualia)
   ▼
materialise(values) ── NEW pure core: BASELINE-reset → overlay →
   │                   warn unknown → clamp, into a DETACHED config
   │                   { degeneration, field, qualia }
   ├──▶ applyPreset(): materialise INTO the live singletons
   │    (+ degen slider position set) ──▶ active/Symptom pane
   └──▶ reference loader: materialise into an inert copy ──▶
        reference pane { config, program } — sliders can't reach it

STITCH  stitchShader(sources, config) — per pane:
   Q_<QUALE> defines as today  +  Q_FIELD only when field.enabled
   │                              (10-field: #ifndef Q_FIELD →
   │                               survival=1, edge/oEdge=10.0,
   │                               central=1, outer=0, return)
   ▼
FRAME LOOP  for each visible pane:
   viewport+scissor to its region ── immersive: one pane, fullscreen;
   │                                 comparison: reference left/top,
   │                                 Symptom right/bottom (orientation
   │                                 picks side-by-side vs stacked)
   uniforms from THE PANE'S config (applyQualia/applyField already
   take config objects — Q3 built this); uRes = pane size;
   SHARED video texture + SHARED uTime → identical configs produce
   identical wobble/flicker (honest A/B)
   ▼
90-composite per pane: single-pane fit only — uSplit, rawScene, and
   the half-screen math DIE; a per-pane fit uniform keeps today's
   look (cover-fit immersive, contain-fit + letterbox in halves);
   addLight clamp (ADD_CAP 0.65) runs unchanged in EACH pane
```

Risks the trace surfaces, named now:

- **Degeneration gets two owners** unless declared: the General slider
  is the live owner for the Symptom pane; the reference pane's
  degeneration is frozen inside its config. snapshot() reads the
  slider; applyPreset writes it. The frame loop must pass each pane
  ITS degeneration — never the slider's — to applyField for the
  reference pane.
- **materialise() must not alias**: the reference config deep-copies
  pair arrays (the BASELINE lesson from Q4 step 1 applies twice over).
- **Two programs, one gl state**: each draw must bind its own program
  before writing uniforms; the shared `live` ref pattern grows into a
  per-pane {prog, U}. Uniform locations differ per program (field-off
  programs optimise different uniforms away — null locations are
  defined no-ops, the Q1 pattern).
- **The composite's fit math** must not regress the by-eye look: gate
  requires today's comparison view pixel-for-eye, so halves keep
  contain-fit + letterbox bars, immersive keeps cover-fit — via a fit
  uniform, not deleted behaviour.
- **SAFETY: two clamped composites.** ADD_CAP applies per pane,
  unchanged; a field-off pane contributes ~zero added light (photopsia
  weight 0, sparkle parked off-screen). The gate re-verifies both
  panes.
- **updateNote's "left/top: normal vision" caption** becomes wrong the
  moment the reference pane can hold a non-none preset — it must name
  the reference pane's loaded preset instead.

## Ratified design

DECISIONS 2026-08-28: "Q5 scope pre-ratified" (field toggleable —
user's call reversing tier-1-not-removable; field values +
degeneration into presets; none.json gains field-off) and "Q5 planned"
(compile-time field-off over parked/runtime uniforms; asymmetric panes
over symmetric; three-tab menu General | Reference | Symptom with
per-pane preset controls — ASSUMPTION on per-pane placement flagged,
correct before step 4 if wrong). See
[architecture.md](../architecture.md) §Frame loop for the intended
shape. Standing constraints: 10-field is always stitched (the
short-circuit lives inside it); SAFETY caps stay hardcoded, per pane;
deferrals unchanged (per-pane slider editing stays parked).

## Steps

- [x] 1. `config.js` + `controls.js` + `renderer.js` +
      `shader/10-field.frag` — the field toggle end-to-end: FIELD
      reshapes to `{ enabled: true, params: {…} }` (quale shape;
      applyField + clamp call sites re-point to `.params`); stitcher
      emits `Q_FIELD` when enabled; 10-field gains the
      `#ifndef Q_FIELD` short-circuit (survival 1, edge/oEdge 10.0,
      central 1, outer 0); generator gives the "Visual field" group a
      toggle like any quale (still listed first). Check: field toggle
      OFF → the raw unfiltered scene even with all qualia on (the
      mechanism proof); ON → by-eye identical to before; round-trips
      with only the recompile blink; a field fader drag still works.
- [x] 2. `presets.js` (+ `config.js`, `renderer.js`, `controls.js`) —
      envelope v2 (amended mid-step, user ratified: degeneration IS a
      field param — `FIELD.params.degeneration`, General slider =
      convenience view, sole UI): extract `materialise(values)` as
      the pure reset→overlay→clamp core; BASELINE/snapshot/
      applyPreset/exportPreset cover `field` {enabled, params —
      degeneration included}; envelope = { name, saved, field,
      qualia }; `presets/none.json` gains
      `"field": { "enabled": false }`.
      Check (console + UI): save → reload → load pins field values,
      field toggle state, AND slider position; loading None now shows
      the RAW scene (the Q4 ⚠ dissolving — observable); the old v1
      portrait.json still loads, field/degen at defaults, console
      clean.
- [x] 3. `renderer.js` + `shader/90-composite.frag` — the pane
      machinery: per-pane { config, prog, U }; drawPane(pane, region)
      with viewport+scissor; reference pane materialised from None at
      boot; comparison = reference left/top + Symptom right/bottom,
      orientation-aware; uSplit/rawScene/split math die from the
      composite, replaced by a per-pane fit uniform (cover immersive,
      contain + bars in halves); shared texture + uTime; per-pane
      degeneration (risk 1). SAFETY: ADD_CAP clamp verified present
      in both panes' composites. Check: immersive by-eye identical to
      today; comparison with reference=None matches today's
      comparison view by eye, desktop; toggles/faders/preset loads
      still touch ONLY the right pane.
- [x] 4. `sim.html` + `controls.js` + `style.css` — tabs + reference
      selector (user spec, REVISED mid-step after first use: two tabs
      General | Symptom, not three): General keeps degeneration +
      background + view, plus the reference preset dropdown
      (Defaults/None/manifest, default None) directly BELOW the View
      toggle, visible only in side-by-side view — loads materialise
      into the reference pane; Symptom tab = RP pane's load/save row
      above Configure symptoms (unchanged Q4 loop); updateNote names
      the reference pane's preset instead of "normal vision".
      Check: reference row appears only in side-by-side; its loads
      change ONLY the left pane; Symptom-tab loads change ONLY the
      right; two different portraits side by side render honestly;
      panel fits phone width.
- [x] 5. GATE Q5 payoff (user's call, never self-certified) — PASSED
      2026-08-28, desktop AND phone; all four items below.

## Gate (copied from GATE Q, staged + Q5 scope additions)

```
[x] Q5: comparison view with "none" reference / tuned preset right
    matches today's comparison view; two different presets render
    honestly side by side — PASSED 2026-08-28 (user by-eye,
    desktop + phone)
[x] Field toggle round-trips cleanly (off = raw scene, on = exact
    return, no residue beyond the recompile blink) — PASSED
    2026-08-28 (desktop + phone)
[x] Baseline fps on a phone in two-pane mode — PASSED 2026-08-28
    (user, phone)
[x] SAFETY (cross-cutting): ADD_CAP clamp present and effective in
    BOTH panes; field-off pane adds ~zero light — PASSED 2026-08-28
    (all-on/all-max in comparison view: busier, never brighter)
```

Whose call: **the user's, by eye, desktop and phone** — presented,
never self-certified.
