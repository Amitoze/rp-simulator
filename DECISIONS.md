# Decisions Log

Running log of judgement calls, so they are not re-litigated and so future
regressions can be traced to what changed. Newest first.

## 2026-08-18 — Phase B built and gated

- **FIELD geometry that passed the gate** (by-eye, all four items,
  2026-08-18): `inner {mild 81°, late 13°}`, `outer {mild 65°, late 85°}`,
  `outerCoverage 0.65`, `erosion 0.9`, `islandSeed 7.0`. Radii use the
  **{mild, late} pair pattern** — the value at degeneration slider 0 and 1,
  straight blend between — replacing renderer.js's hardcoded
  `0.45 - 0.38 * slider` mapping.
- **Island noise sampled in position space, not polar.** The plan sketched
  `fbm(vec2(ang*k, r*m) + seed)`; built as `fbm(centered*3 + seed)` because
  angle-based sampling produces a visible wrap-around seam where the angle
  jumps at the left horizontal.
- **Inferotemporal-last via fixed bias + rising threshold**, not the
  planned slider-scaled bias: biased (lower-lateral) pixels clear the
  rising coverage bar longest, giving the same erosion order with less
  machinery. Verified by eye at the gate.
- **"No uTime" is scoped to island geography.** The patch gate is fully
  static; the dead ring's far edge keeps a small uTime boundary wobble
  (amplitude 0.05 — the same idiom as the inner edge), which reads as edge
  breathing, not island drift.

## 2026-08-13 — Iteration 2 planning

- **Donut geometry adopted (Phase B).** The field is a preserved centre +
  preserved far-peripheral islands separated by a dead mid-peripheral ring —
  per the user's lived experience and Grover/Fishman 1998 + IOVS 2022 (see
  plan/research/peripheral-perception.md). Supersedes iteration 1's tunnel.
- **Transparency concept retired (Phase C).** The `uSeeThru` murk implied
  the blind region passes attenuated scene. Wrong per the user's report and
  Crabb 2013 / Ramachandran & Gregory 1991: scotomas read as filled-in
  absence. Replaced by a fill-in field; slider becomes "fill-in vividness".
- **Photopsias confined to the scotoma (Phase C).** Flashes arise from dead
  retina: masked by `(1 - survival)`, never over seeing regions.
- **Sighted-viewer paradox default.** Perfect fill-in is invisible, so the
  default fill stays slightly legible (washed-out low-contrast blur —
  Crabb's most-chosen percept image); faithfulness recoverable via config.
- **Eccentricity convention: screen edge ≈ 90°.** All FIELD radii stated in
  degrees under this mapping. A screen can't show 50–80° islands at true
  scale; the compression is now explicit instead of implicit.
- **Island geography is seeded and static.** No `uTime` in the patch gate —
  islands are places, not weather. `FIELD.islandSeed` selects the geography.
- **Peripheral blur via in-shader Poisson taps, not WebGL2 mipmaps.** The
  WebGL1 single-pass pipeline stays; the WebGL2/LOD route is FF3, gated on
  the tap blur actually proving insufficient.
- **Crowding rendered as blur + position scramble, not blur alone.** Per
  Rosenholtz/Bouma: periphery keeps texture, loses arrangement.
- **Islands are never temporally smoothed.** Peripheral motion sensitivity
  is the one thing that survives; motion stays fully salient (boost = FF4).

## 2026-08-12/13 — Iteration 1 (recorded retrospectively)

- **Portrait, not an average.** Where one person's experience diverges from
  published surveys, the sim follows the person (README).
- **~9 Hz flicker rate** from Menzler & Zeck 2011 (retinal oscillation);
  photopsia prevalence/character from Bittner 2009/2012.
- **SAFETY caps** on net and ring glow amplitudes are load-bearing
  (photosensitivity) and must never regress.
- **Central config** (`config.js`) — nothing tunable hardcoded in scripts.
- **Shader fetched with `cache: 'no-store'`** — python http.server sends no
  cache headers; a stale cached shader silently ignores edits.
- **DPR capped** (≤2, ×0.75 touch) — retina wasted through smoke, hot phones.
