# Phase Q3 — generated advanced panel (plan of record)

From [06-qualia-refactor.md](../06-qualia-refactor.md) Q3 + the UX spec
recorded there (2026-08-20, user request); design ratified 2026-08-20
(DECISIONS "Q3 planned": schema is the live UI state; FIELD goes full
schema-shape). No shader chunk changes — Q1's pure stitcher and Q2's
schema were built precisely so Q3 is UI plumbing only. Gate: GATE Q3
(staged), user's call.

## Data-flow trace (before it's built)

```
the user's finger, in the new "Adjust Symptoms" section
  │ toggle flip                        │ fader drag
  ▼                                    ▼
controls.js — panel DOM is BORN from the schema at init
  quale.enabled = !quale.enabled      param.value = slider position
  │ then calls                        │ …and that's ALL a drag does;
  ▼                                   │ the frame loop picks it up
renderer.restitch()                   │
  makeProgram(sources, QUALIA)        │
  (the existing PURE stitcher),       │
  program swap, old one deleted       │
  │ fresh program + uniform locations │
  ▼                                   ▼
frame loop, every frame:
  applyQualia(U, QUALIA) ── enabled quales' param values ──▶ uniforms
  applyField(U, FIELD, degen) ── radii blends, coverage,
                                 seed ──▶ uniforms
  (functions of config OBJECTS, never global reads — Q5 panes
   stitch two configs; disabled quales' locations are null → gl no-op)
  ▼
shader chunks — UNTOUCHED in Q3 ──▶ pixels
```

Risks the trace surfaces, named now:

- **Stale uniform locations after restitch.** The frame loop closure
  captures `U` from main(); restitch produces a NEW `U`. The loop must
  read the *current* {prog, U} through a shared mutable ref, or the
  first toggle freezes/blackens the output.
- **Pair params cross three representations:** one schema param
  `[a, b]` → two generated sliders → one vec2 uniform. Generator and
  applyQualia must agree on the convention; sparkle's bands and
  FIELD's {mild, late} radii both ride it.
- **Schema is mutated at runtime** — reload restores defaults; nothing
  persists between visits. Accepted: persistence is Q4's job
  (save-as-preset), and this is exactly why the schema must be the one
  place that knows current state.
- **Zero-param qualia** (smoke, transition) are a toggle row with no
  faders — the generator must render nothing where params is empty,
  not an empty block.
- **SAFETY: no capped path is edited**, but the UI newly makes the
  all-on/all-max torture config reachable by anyone's fingers — the
  gate re-verifies the clamp through the new controls (cross-cutting
  rule).

## Ratified design

The stage-1 sketch survived contest unamended; see DECISIONS 2026-08-20
"Q3 planned" for both options tables' outcomes (schema-as-live-state
over set-on-change and DOM-as-state; full FIELD schema over curated
subset and degeneration-only), and
[architecture.md](../architecture.md) §Config & schema, §Frame loop,
§UI for the intended shapes (🟦 planned). Standing constraints: FIELD
gets no toggle (tier 1 not removable, DECISIONS 2026-08-18) and stays
outside presets' reach; degeneration stays the top-level headline
slider; SAFETY caps stay hardcoded in chunks, never in the schema.

## Steps

- [x] 1. `config.js` + `renderer.js` — FIELD goes schema-shape: every
      value becomes `{ value, min, max, label }`; {mild, late} radii
      pairs as pair-values `[mild, late]` (min/max per element, the
      sparkle-band pattern); the load-time clamp generalises to run
      over FIELD too. Renderer's FIELD reads re-point to `.value`.
      All values VERBATIM today's; ranges bracket today's values
      (islandSeed e.g. 0–20); nothing new invented. Check: sim
      by-eye identical at defaults; temporarily set erosion to 999 →
      console warns + clamps; revert, console clean.
- [x] 2. `renderer.js` (+ two-line `controls.js` shim) — schema
      becomes live state: `applyQualia(U, qualia)` and
      `applyField(U, field, degen)` write ALL schema-derived uniforms
      every frame (the set-once block dies); both take config objects,
      never read globals (Q5 constraint). `restitch(qualia)` rebuilds
      via the existing makeProgram, swaps {prog, U} through the shared
      ref, deletes the old program. Old sNet/sThru handlers become
      one-line writes into the schema (temporary shim — dies in step
      3). Check: by-eye identical at defaults; all three existing
      sliders still work live.
- [x] 3. `controls.js` + `sim.html` + `style.css` — the generator:
      expandable "Adjust Symptoms" section at the BOTTOM of the menu
      body; FIELD group FIRST, faders only, no toggle; then one toggle
      row per quale, its faders rendered only while enabled (pair
      params → two sliders). Fader input → schema value; toggle →
      enabled + restitch(). Zero per-quale UI code. The hardcoded
      net/transparency rows die from sim.html (their generated
      equivalents replace them); step 2's shim dies; touch targets
      follow the existing `(pointer: coarse)` pattern. Check: spot
      faders move their effect live (net density, flicker rate, FIELD
      outerCoverage reshapes islands); each toggle round-trips with
      only the expected blink; FIELD group shows no toggle; panel
      fits and scrolls on a phone-width viewport.
Steps 1–3 built in one pass (commit `2bb6812`, 2026-08-24); checks
verified by eye, desktop and phone (user, recorded at plan-sync
2026-08-28). GATE Q3 passed 2026-08-28 — phase closed.

- [x] 4. GATE Q3 payoff (user's call, never self-certified): each of
      the five qualia toggled off→on in turn, plus all-off and all-on
      — no residue, no glitch beyond the expected blink, desktop AND
      phone. SAFETY re-verify through the new UI: all-on/all-max set
      by finger must still read busier-not-brighter (the Q2 worktree
      rig, :8001 vs :8000, if a reference is wanted). Results →
      DECISIONS.md; plan-sync ticks 06's Q3 boxes.

## Gate (copied from GATE Q, staged)

```
[x] Q3: toggling any quale on/off round-trips cleanly (no residue,
    no recompile glitch beyond the expected blink)
    — PASSED 2026-08-28 (user by-eye, desktop + phone)
[x] SAFETY (cross-cutting): per-quale caps + global clamp untouched by
    Q3's edits, re-verified through the new UI — net effect can only
    be darker than today, never brighter
    — PASSED 2026-08-28 (user by-eye through the generated panel)
[x] Baseline fps on a phone (GATE Q running item — the generated
    panel must not cost frame time; it only writes ~12 floats/frame)
    — PASSED 2026-08-28 (user, phone check with the panel live)
```

Whose call: **the user's, by eye, desktop and phone** — presented,
never self-certified.
