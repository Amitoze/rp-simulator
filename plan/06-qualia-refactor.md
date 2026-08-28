# 06 — Qualia Refactor (Phase Q)

*~1–1.5 days across five items; Q1–Q2 are the critical path. Goal: the
monolithic shader becomes a stack of toggleable, configurable "qualia" —
atomised descriptions of the experience — over an always-on field
geometry, with preset files and per-pane configs for A/B comparison.*

Slots between Phase B (merged donut field) and Phase C (fill-in), so C
and D land as new self-contained qualia instead of more lines woven into
a 215-line monolith.

## In plain terms

A **quale** (plural qualia) is one nameable part of the experience — the
smoke, the flashing net, the edge sparkle. Each can be toggled on/off and
tuned. Qualia are *not* independent layers, though: they all read from a
shared skeleton, the **field geometry** (the donut: where vision
survives, where it's dead). You can toggle the smoke; you cannot toggle
where your vision is. So the architecture is two tiers:

- **Tier 1 — field geometry (always on):** computes the survival mask.
  Configurable via `FIELD`, never toggleable. Kept as ONE isolated
  function — the future perimetry import (see deferrals) replaces just
  that function body with a texture lookup.
- **Tier 2 — qualia (each toggleable):** render *what it's like* in the
  regions tier 1 defines.

Stacking is not free-form — compositing order is fixed; toggling changes
slot membership, never order:

```
scene ──▶ [scene-modifying qualia: transition greying] ──▶ scene'
periphery base ◀── [fill qualia: smoke, murk (dies in C), fill-in (C)]
periphery      ◀── + [additive qualia: photopsia net] (each capped)
        │
        ▼
mix(periphery, scene', survival) ──▶ + [post-additive: edge sparkle]
                                              │
                                              ▼
                                   GLOBAL BRIGHTNESS CLAMP
```

**Safety becomes structural.** Today's caps are tuned against a fixed
stack; once qualia are user-stackable, the worst-case sum is untested.
Each quale keeps its own cap AND a global clamp after compositing
guarantees no configuration exceeds today's brightness ceiling.

## Q1. Shader chunks + stitcher (`shader/`, `renderer.js`)

Behaviour-identical restructure — output must match today pixel-for-eye
at fixed settings before anything else lands on top.

```
[x] Split shader.frag into chunks: 00-prelude (noise helpers, uniforms),
    10-field (tier 1 — survival mask as ONE function), 20-smoke,
    21-photopsia, 22-sparkle, 23-murk (minimal extraction — Phase C
    deletes it; do not polish), 90-composite (fixed slots + clamp)
    — built as SEVEN chunks: 24-transition added (DECISIONS 2026-08-19)
[x] Stitcher in renderer.js: a PURE function, config in → compiled
    program out — no global config baked in (per-pane feature depends
    on this; retrofitting it later forces a rework)
[x] Disabled qualia are EXCLUDED at stitch time (compile-time, not
    uniform branches) — off costs literally zero; recompile on toggle
    (~tens of ms, once per settings click) is acceptable
[x] En route: edge sparkle's hardcoded rate (uTime * 60.0) and band
    widths move to config — closes the trace's "config, never
    constants" flag (SPARKLE block; flickerHz = 60/(2π) exact)
```

## Q2. Config schema + global clamp (`config.js`, `90-composite`)

```
[x] QUALIA block: per quale { enabled, params }, each param
    { value, min, max, label } — schema lives IN CODE; preset files
    (Q4) may only override values, never structure, ranges, or caps
[x] Param values clamped to schema ranges on load
[x] Global brightness clamp in the compositor — verified against the
    worst-case all-on, all-max configuration (ADD_CAP 0.65, measured)
[x] FIELD stays tier 1 (unchanged pattern), documented as non-toggleable
```

## Q3. Generated advanced panel (`controls.js`)

```
[x] Advanced section renders FROM the schema: one toggle per quale;
    its sliders appear when toggled on — zero per-quale UI code, so
    Phase C/D qualia get their UI for free (2026-08-24, gated 08-28)
[x] Toggle flips → renderer restitches; slider moves → uniform update
    (2026-08-24, gated 08-28)
[x] UX (specced 2026-08-20, user request): expandable "Adjust
    Symptoms" section at the BOTTOM of the menu. FIELD listed FIRST
    with faders only — no toggle, tier 1 is not removable (DECISIONS
    2026-08-18); each quale below it gets toggle → faders on enable
    (2026-08-24, gated 08-28)
```

## Q4. Preset files (`presets/`)

*Amended 2026-08-28 (DECISIONS "Q4 planned"): sparse presets rejected —
a sparse preset silently changes look when defaults are retuned, a
correctness bug for portraits. Plan of record:
[phases/q4-presets.md](phases/q4-presets.md).*

```
[ ] Preset = FULL value snapshot in a named envelope
    { name, saved, qualia } — frozen-snapshot semantics; loading rule
    (defaults → overlay → warn unknown keys → clamp) is what lets old
    presets survive schema evolution; new qualia default enabled:false
    so old presets keep their look
[ ] Boot from the schema — config.js's values ARE the default look, no
    default preset file; presets/index.json is the manifest (a browser
    cannot list a directory), dropdown = computed "Defaults" entry +
    manifest entries
[ ] Load: manifest dropdown + file picker for ad-hoc files
[ ] SAVE AS PRESET (export current state as downloadable JSON) — the
    tune → save → compare → iterate loop does not close without this;
    export is required, not polish
[ ] A "none" preset: every quale off — becomes the unfiltered view (Q5)
```

## Q5. Per-pane configs (`renderer.js`, `controls.js`)

```
[ ] Pane = (screen region, preset, compiled program); immersive = one
    pane, comparison = two
[ ] Two draw calls per frame, scissor/viewport clipping — NOT doubled
    uniforms in one program; perf-neutral (two half-screen passes =
    one full-screen pass of pixel work)
[ ] Split-layout arithmetic moves out of GLSL into viewport math;
    the hardcoded rawScene override dies — the clean half is just the
    "none" preset
[ ] Reference pane (left / top in stacked) frozen at its loaded
    preset's values; sliders edit only the active pane (right / bottom)
[ ] Both panes share camera texture and clock — identical configs
    produce identical wobble/flicker, which is what honest A/B needs
```

## Deferrals registered

```
[ ] Perimetry-driven geometry: REOPENS when an actual visual field test
    result (file or printout) is in hand — first step is checking its
    coverage: routine 24-2/30-2 perimetry maps only the central 24–30°
    and says nothing about the 50–80° islands; Goldmann kinetic or
    wide-field protocols do. Prep already paid by Q1: survival is one
    substitutable function.
[ ] Pane UI niceties (per-pane slider sets, editing-side indicator
    styling) — reopens if the basic Q5 flow proves clumsy in use
```

## GATE Q (staged; Q1–Q2 gate before Q3–Q5 build on them)

```
[x] Q1: by-eye identical to pre-refactor output at fixed settings,
    desktop AND phone (side-by-side against a pre-refactor tab)
    — desktop PASSED 2026-08-19, phone PASSED 2026-08-20 (user by-eye;
    phone was initially blocked by the insecure-context crash, fixed
    by the mediaDevices guard, q1-chunks step 12)
[x] Q2: all-on/all-max configuration stays within today's brightness
    ceiling (clamp observed doing its job) — PASSED 2026-08-20 (user
    by-eye, main worktree sliders-maxed vs torture config: busier,
    not brighter; ADD_CAP 0.65 measured, see q2-config-schema.md)
[x] Q3: toggling any quale on/off round-trips cleanly (no residue,
    no recompile glitch beyond the expected blink)
    — PASSED 2026-08-28 (user by-eye, desktop + phone; SAFETY
    re-verified through the new panel — see q3-generated-panel.md)
[ ] Q4: save-as-preset → reload → load preset reproduces the exact
    tuned state
[ ] Q5: comparison view with "none" left / tuned preset right matches
    today's comparison view; two different presets render honestly
    side by side
[ ] Baseline fps on a phone throughout (two-pane mode included)
[x] SAFETY: per-quale caps unchanged, global clamp added — net effect
    can only be darker than today, never brighter — PASSED for Q2
    2026-08-20; the cross-cutting rule re-verifies whenever Q3–Q5
    touch these paths
```
