# Phase Q4 — preset files (plan of record)

From [06-qualia-refactor.md](../06-qualia-refactor.md) Q4, as amended
2026-08-28 (DECISIONS "Q4 planned": presets are FULL value snapshots in
a named envelope — sparse rejected for default-drift; boot stays on the
schema, no default preset file; new qualia default off). Q3 built the
load-bearing prerequisite: the schema IS the live state, so export
serialises it directly and load overlays into it. No shader changes.
Gate: GATE Q4 (staged), user's call.

## Data-flow trace (before it's built)

```
boot, before any UI runs:
config.js schema (defaults, clamped) ──▶ presets.js captures
                                         BASELINE = deep snapshot
  │                                      (pristine defaults — the live
  │                                       schema mutates from the first
  ▼                                       slider drag; see risk 1)
presets/index.json ──filenames──▶ fetch each file's {name} ──▶ dropdown
                                  ("Defaults" first — computed from
                                   BASELINE, not a file)

LOAD  (dropdown pick ──▶ fetch presets/<file>.json)
      (file picker  ──▶ FileReader text)
  │ JSON text
  ▼
parse ──▶ envelope { name, saved, qualia }
  ▼
applyPreset(obj):
  1. reset live QUALIA to BASELINE        (missing keys = defaults,
  2. overlay obj.qualia onto it:           NOT whatever the user last
     known quale  → enabled ← file         dragged — full-snapshot
     known param  → value   ← file         reproducibility)
     unknown key  → console.warn, ignore
  3. clampParams over every quale         (out-of-range file values
  │                                        can never reach a uniform)
  ▼
restitch(QUALIA) ── enabled flags may have changed ──▶ program swap
rebuild "Adjust Symptoms" panel ── sliders must show loaded values;
  │                                regenerating from the schema is
  │                                zero sync code (panel is generated)
  ▼
frame loop, unchanged ── reads schema every frame ──▶ pixels

SAVE  ("Save as preset" button)
  live QUALIA ──walk──▶ { name, saved: today, qualia:
                          { <quale>: { enabled, params: {<p>: value} } } }
  ──JSON.stringify──▶ Blob ──▶ <a download="<name>.json"> click
  (FIELD, DEFAULTS, SAFETY caps never serialised — outside the walk)
```

Risks the trace surfaces, named now:

- **The live schema forgets its defaults.** Q3 made the schema mutable
  at runtime; once a slider moves, the original default is gone from
  the object. "Reset to defaults, then overlay" therefore needs a
  pristine copy captured at import time, before initControls() —
  `BASELINE` in presets.js. If it were captured lazily, "Defaults" and
  missing-key fills would silently mean "whatever the state was when
  first asked".
- **Overlay must copy pair values.** `p.value = fileArray` hands the
  schema a fresh array from JSON.parse (fine), but BASELINE reset must
  deep-copy its arrays back, never alias them — an aliased array would
  let later slider drags corrupt BASELINE itself.
- **Panel rebuild must be idempotent.** `buildAdvanced()` appends into
  `#advBody`; called twice it doubles the panel. It clears first (or a
  `rebuildAdvanced()` wrapper does).
- **Import cycle:** presets.js needs `restitch` (renderer.js) and
  QUALIA (config.js); controls.js needs presets.js. Same cycle-safe
  pattern as controls↔renderer today: `restitch` is a hoisted top-level
  function declaration, only called from event handlers.
- **SAFETY: preset files are an input channel to capped paths.** Caps
  are not params and cannot appear in files; a hand-edited file with
  out-of-range values is warned and clamped by step 3 of applyPreset —
  the same clamp that already guards hand-edited config.js. The gate
  re-verifies with a deliberate torture file.
- **Phone export path** (`<a download>` on iOS Safari → Files app) is
  assumed standard-but-unproven here; the phone half of the gate is
  what proves it. If it fails, the below-the-filter fallback is a
  copy-to-clipboard alternative — one commit.

## Ratified design

DECISIONS 2026-08-28 "Q4 planned" carries the four ratified choices and
their rejected options: full snapshots over sparse diffs (frozen-
snapshot semantics accepted knowingly); named envelope
`{ name, saved, qualia }` over bare mirror and schemaVersion;
boot-from-schema + manifest dropdown over always-boot-from-file and
picker-only; new qualia ship `enabled: false`. See
[architecture.md](../architecture.md) §Config & schema and §UI for the
intended shapes (🟦 planned). Standing constraints unchanged: FIELD and
SAFETY caps outside presets' reach; structure/ranges/caps live in code,
files carry values only; degeneration is tier 1 and not in presets.

## Steps

- [x] 1. `config.js` + new `presets.js` — the engine, no UI. config.js
      exports `clampParams` (it already exists; export is the only
      change). presets.js: `BASELINE` deep-snapshot captured at import;
      `snapshot()` → plain `{ <quale>: { enabled, params } }` object;
      `applyPreset(obj)` → reset-to-BASELINE, overlay with unknown-key
      warnings, clamp, restitch. Exposed as `window.rpPresets` for this
      step's check (debug handle; harmless to keep). Check (copy-paste,
      DevTools on the running sim): apply a round-trip no-op, then a
      tweaked snapshot (net density visibly changes), then an
      unknown-key + out-of-range object (two warnings, value clamped,
      sim unchanged beyond the clamped value).
- [x] 2. `controls.js` — panel rebuild + "none" behaviour reachable:
      `buildAdvanced()` becomes idempotent (clears `#advBody` first)
      and is exported for presets.js to call after apply; applyPreset
      gains the rebuild call. (Check corrected 2026-08-28: all-off is
      NOT the unfiltered scene under the current compositor — with no
      fill qualia, periphery stays vec3(0), so the dead ring renders
      BLACK; tier 1 always masks. Q5's "clean half is just the none
      preset" line inherits this gap — resolve it at Q5 phase-plan.)
      Check: from the console, apply an all-off object → smoke, murk,
      net, and sparkle all gone, dead ring plain black, every panel
      toggle reads off, faders hidden, panel not duplicated; apply
      `BASELINE` → default look back, sliders at default positions.
- [x] 3. `presets/` + `controls.js` + `sim.html` — the shipped presets
      and the dropdown: `presets/none.json` (every quale off — the
      unfiltered view, feeds Q5) and `presets/index.json` (bare
      filename list; a browser cannot list a directory). Preset row in
      the panel (above "Adjust symptoms"): dropdown with computed
      "Defaults" entry first, then one entry per manifest file,
      labelled from each file's `name`; picking one fetches
      (`cache: 'no-store'`, the shader-chunk precedent) and applies.
      Check: dropdown shows Defaults + None; pick None → unfiltered;
      drag a slider, pick Defaults → defaults restored (BASELINE, not
      the drag); console clean.
- [x] 4. `presets.js` + `controls.js` + `sim.html` — close the loop:
      "Save as preset" button → name prompt (default "portrait") →
      `{ name, saved, qualia }` Blob download; `<input type="file">`
      picker row → FileReader → parse → apply (bad JSON: console
      error + note text, sim untouched). Check (the gate rehearsal,
      desktop): tune several faders + toggle a quale off → save →
      reload the page → load the file via picker → sim and panel
      match the tuned state exactly; then hand-edit the file (add an
      unknown key, push a value out of range) → load → warned,
      clamped, nothing brighter.
- [ ] 5. `sim.html` + `controls.js` + `style.css` — menu tabs (user UX
      spec, 2026-08-28): two horizontal tabs at the top of the panel
      body. Tab "General": the degeneration slider + Background + View
      rows. Tab "Adjust Symptoms", two sections: "Load presets"
      (dropdown + save / load-file row) above "Configure symptoms"
      (the generated FIELD + qualia groups — the old expandable
      details section dies; the tab replaces it as the container, so
      the generator and its rebuild-after-load are untouched). Tab
      switching is display-only: no schema writes, no restitch.
      Check: tabs round-trip; every control works from its new home
      (slider, background/view, preset load + save, toggles, faders);
      panel fits a phone-width viewport; the panel still rebuilds
      correctly after a preset load with the Symptoms tab open.
- [ ] 6. GATE Q4 payoff (user's call, never self-certified):
      save-as-preset → reload → load reproduces the exact tuned
      state, desktop AND phone (phone proves the iOS download/Files
      path); torture file (all-on, all params at max, plus
      out-of-range values) loaded via picker stays busier-not-brighter
      — SAFETY holds through the new input channel. Results →
      DECISIONS.md; plan-sync ticks 06's Q4 boxes.

## Gate (copied from GATE Q, staged)

```
[ ] Q4: save-as-preset → reload → load preset reproduces the exact
    tuned state
[ ] SAFETY (cross-cutting): preset loading is a new input channel to
    capped paths — caps unreachable from files, out-of-range values
    clamped on load; net effect can only be darker than today, never
    brighter
[ ] Baseline fps on a phone (GATE Q running item — presets cost
    nothing per frame; verify nothing regressed with the preset row
    live)
```

Whose call: **the user's, by eye, desktop and phone** — presented,
never self-certified.
