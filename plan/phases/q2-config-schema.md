# Phase Q2 — config schema + global clamp (plan of record)

From [06-qualia-refactor.md](../06-qualia-refactor.md) Q2; design
ratified 2026-08-20 (DECISIONS: schema home = full migration; clamp acts
on added light only). Behaviour at today's defaults must stay by-eye
identical — the schema is a re-homing of existing values, and the clamp
is exact algebra below the ceiling. Gate: GATE Q2 (staged), user's call.

## Data-flow trace (before it's built)

```
config.js — every tunable value is BORN here, in the schema
┌────────────────────────────────────────────────────────────┐
│ QUALIA = {                                                 │
│  smoke:      { enabled, params: {} }        toggle only    │
│  murk:       { enabled, params: { transparency ← was       │
│               DEFAULTS.transparency } }     dies in C      │
│  photopsia:  { enabled, params: { density ← was DEFAULTS.  │
│               netDensity; scale, messiness, flickerHz      │
│               ← was NET } }                                │
│  sparkle:    { enabled, params: { flickerHz, bandIn,       │
│               bandOut ← was SPARKLE } }                    │
│  transition: { enabled, params: {} }        toggle only    │
│ }   each param { value, min, max, label }                  │
└──────────────┬─────────────────────────────────────────────┘
               │ loadQualia(): every value pushed into [min,max],
               │ console.warn on anything out of range
               ▼ clamped schema
   ┌───────────┴──────────────┐
   ▼                          ▼
renderer.js               controls.js
set-once uniforms         netDensity / transparency sliders
(scale, messiness,        take their INITIAL positions from
flicker rates, bands)     the schema values
   │                          │ per frame (unchanged until Q3):
   │                          │ sliders still drive uNetDensity /
   ▼                          ▼ uSeeThru live
shader/90-composite.frag — restructured mix
  scene' ─────────────────────────────┐
  fill (smoke → murk) ─▶ mix by survival ─▶ base
  photopsia × (1 − survival) ─┐
  sparkle ────────────────────┴─▶ addLight ─▶ SAFETY luma ceiling:
                                              scale down ONLY when over
                                              (CAP hardcoded in chunk,
                                              measured from today's
                                              worst case — not a
                                              tunable, never in presets)
  base + clamped addLight ─▶ pixels
```

Risks the trace surfaces, named now:

- **Two owners of density/transparency until Q3.** The schema seeds the
  sliders; after load the slider is live and the schema value goes
  stale. Accepted — Q3 rewires the UI to the schema; nothing persists
  state in between.
- **CAP has no source yet.** It must be *measured* (today's worst case
  with sliders maxed), never guessed — step 4 does the measurement
  before the constant exists.
- **Murk is not additive and not clamped** — it shows dimmed scene,
  bounded by the scene itself. Correct, not an omission.

## Ratified design

Stage-1 sketch survived contest unamended; see DECISIONS 2026-08-20
("Q2 planned") for both options tables' outcomes, and
[architecture.md](../architecture.md) §Config & schema, §Compositor for
the intended shapes (🟦 planned).

## Steps

- [x] 1. `config.js` + `renderer.js` + `controls.js` — the schema
      lands: QUALIA grows `params` per the trace; NET and SPARKLE
      blocks dissolve into it; DEFAULTS loses netDensity/transparency;
      renderer's set-once uniforms and controls' slider seeding
      re-point to schema values. All values VERBATIM today's (flickerHz
      stays `60/(2π)` exact). Ranges: min/max chosen to bracket today's
      value; nothing new invented; SAFETY multipliers stay in chunks,
      not in the schema. Check: sim renders by-eye identical at
      defaults; `grep -n "NET\b\|SPARKLE" *.js` shows no survivors.
- [x] 2. `config.js` — `loadQualia()`: clamps every param value into
      [min, max] on load, `console.warn` naming each clamped param;
      renderer/controls consume the clamped result. Check: temporarily
      set photopsia flickerHz to 999 → console warns, net flickers at
      the max instead; revert, console clean.
- [x] 3. `shader/90-composite.frag` — the exact restructure: photopsia
      leaves the periphery relay, `addLight = photopsia × (1 −
      survival) + sparkle`, final colour = survival mix + addLight.
      Identity: `mix(p + a, s, k) = mix(p, s, k) + a·(1 − k)` — any
      visible difference is a bug. SAFETY: both per-quale caps travel
      untouched. Check: by-eye identical at defaults, all toggles
      round-trip clean.
- [x] 4. Measure, then clamp: worst-case addLight luma under TODAY's
      reachable settings (both sliders maxed, defaults otherwise) is
      measured (temporary debug output — e.g. paint pixels where luma
      exceeds a trial CAP — then removed); CAP lands hardcoded in
      `90-composite.frag` with a `SAFETY:` comment stating the measured
      value and date. Clamp: `addLight *= CAP / max(luma, CAP)`.
      Check: defaults by-eye unchanged; debug paint shows the clamp
      engaging only on a torture config (all-on, all params at max).
- [ ] 5. GATE Q2 payoff (user's call, never self-certified): all-on /
      all-max config side-by-side against main's worktree (:8001 vs
      :8000, the Q1 rig) — brightest flashes must be no brighter than
      today's slider-maxed worst case; clamp observed doing its job.
      FIELD's tier-1 non-toggleable status documented in config.js.
      Results → DECISIONS.md; plan-sync ticks 06's Q2 boxes.

## Gate (copied from GATE Q, staged)

```
[ ] Q2: all-on/all-max configuration stays within today's brightness
    ceiling (clamp observed doing its job)
[ ] SAFETY: per-quale caps unchanged, global clamp added — net effect
    can only be darker than today, never brighter
```

Whose call: **the user's, by eye, against the worktree comparison** —
presented, never self-certified.
