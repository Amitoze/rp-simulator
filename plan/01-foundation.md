# 01 — Foundation (Phase A)

*Iteration 1: the working simulator. Built 2026-08-12/13, before this plan
existed; recorded here retrospectively and marked done.*

**Status: COMPLETE (2026-08-13).** Live at
https://amitoze.github.io/rp-simulator/. Commits `c0fb291` → `b0a0d9f`.

See [00-context.md](00-context.md) for architecture decisions and sequencing.

## A1. Site and simulation core (`c0fb291`, 2026-08-12)

```
[x] Landing page (index.html, style.css) — motivation, warning, entry
[x] Simulation page (sim.html) + WebGL renderer (renderer.js):
      fullscreen-triangle pipeline, per-frame video texture upload
[x] Fragment shader (shader.frag):
      [x] central-island field mask with irregular, slowly-creeping edge
          (noise wobble on the boundary)
      [x] dead periphery: domain-warped smoke + murky see-through patches
          (uSeeThru) — the transparency concept RETIRED in Phase C
      [x] photopsia net: tangled flickering filaments, two noise scales,
          per-strand phase, ~9 Hz (Menzler & Zeck 2011)
      [x] flickering broken ring hugging the island edge
      [x] SAFETY amplitude caps on net and ring glow
[x] Background sources: live camera, bundled street video, procedural
    park fallback scene
[x] Split comparison view: normal vision alongside the sim
[x] Photosensitivity warning before entry
```

## A2. Attribution (`5fbf873`, 2026-08-12)

```
[x] Street footage credit — LOVE SHANGHAI, CC BY 4.0 (assets/CREDITS.md)
```

## A3. Mobile (`aa5a586`, 2026-08-12)

```
[x] Aspect handling: cover-fit immersive, contain-fit (letterboxed) halves
    in comparison view — never stretched
[x] Rear camera on phones; mirror only for front camera
[x] Touch UI
[x] Perf cap: DPR ≤ 2, ×0.75 on touch devices
[x] Comparison layout follows orientation (side-by-side / stacked)
```

## A4. Docs (`9fa3936`, 2026-08-12)

```
[x] README: motivation, iteration-1 clinical citations (Bittner 2009/2012,
    Menzler & Zeck 2011), component overview, local setup
```

## A5. Menu UX + central config (`b0a0d9f`, 2026-08-13)

```
[x] Menu overhaul; collapsible to hamburger
[x] config.js: DEFAULTS (sliders, background, view, menu state) + NET
    (fixed look of the flashing net) — nothing hardcoded in scripts
```

**Intent.** Same reason as any central config: the by-eye tuning sessions
(the gates of Phases B–D) must be edit-one-file, and the values that
produced a given look must be recordable.

## Working-tree note (2026-08-13)

Uncommitted at time of writing: `serve.py` (local dev server), minor tweaks
to `config.js` / `renderer.js` / `shader.frag`, `.claude/launch.json`.
Fold these into the first Phase B commit or commit separately before B starts.

## GATE A

```
[x] Live site serves the sim
[x] Camera and video modes both run on a phone
[x] Split view shows unfiltered vs simulated
```
