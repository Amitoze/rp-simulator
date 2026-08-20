# Phase Q1 — shader chunks + stitcher (plan of record)

Grandfathered from [06-qualia-refactor.md](../06-qualia-refactor.md) Q1;
step queue agreed 2026-08-19. Behaviour-identical restructure: any
visible difference at step 10 is a bug. Gate: by-eye identical to
pre-refactor output, desktop AND phone (GATE Q, staged).

- [x] 1. `shader/00-prelude.frag` — uniforms (incl. 3 new sparkle) +
      noise/scene helpers. Check: 65 lines, 20 uniforms, 5 functions.
- [x] 2. `shader/10-field.frag` — tier 1: survival mask as ONE
      substitutable function, out-params for edge/oEdge/central/outer.
      Check: ~45 lines, single function, math verbatim from monolith.
- [x] 3. `shader/20-smoke.frag` + `shader/23-murk.frag` — fill qualia
      pulled apart; murk takes the running periphery as base (minimal
      extraction — Phase C deletes murk; do not polish).
      Check: smoke≈7 lines, murk≈17; with both on, math == today's.
- [x] 4. `shader/21-photopsia.frag` — net as additive quale; SAFETY cap
      travels inside the function. Check: cap line present verbatim.
- [x] 5. `shader/22-sparkle.frag` — post-additive quale; hardcoded 60.0
      rate + band numbers become uSparkle* uniforms. Check: no numeric
      literals 60.0/.08/.01/.03/.10 in band/flick lines.
- [x] 6. `shader/24-transition.frag` — scene-modifying quale (added
      chunk; see DECISIONS 2026-08-19 diagram-vs-list call).
      Check: ~14 lines, math verbatim.
- [x] 7. `shader/90-composite.frag` — main(): layout code + fixed slots
      with #ifdef Q_* guards; Q2's clamp slot marked. Check: slot order
      scene-mod → fill → additive → mix → post-additive.
- [x] 8. `config.js` — SPARKLE block (flickerHz = 60/(2π) exact) +
      QUALIA enabled map (all true). Check: values reproduce today's.
- [x] 9. `renderer.js` — fetch chunks, pure stitchShader(), makeProgram()
      with pinned aPos + link check, 3 sparkle uniforms set once.
      Check: sim renders, console clean.
- [x] 10. Payoff: worktree of main on :8001, side-by-side vs :8000,
      desktop + phone; toggle round-trip via QUALIA flags; then
      `git rm shader.frag`. GATE: user's call, results to DECISIONS.md.
      PASSED 2026-08-19 (user by-eye; monolith retired in 474958c).
- [ ] 11. `serve.py` — ThreadingHTTPServer + HTTP/1.1 keep-alive: the
      8 chunk fetches stalled seconds on the single-threaded HTTP/1.0
      dev server (measured: partial-overlap waterfall, long Stalled
      bars). Dev-only; deployed hosts unaffected. Check: parallel
      waterfall, load back to pre-refactor feel.
- [x] 12. `controls.js` — mediaDevices guard: on insecure origins
      (phone via LAN http) the camera API is absent and startCamera
      threw synchronously past the .catch chains, killing main() before
      the first frame (both versions — latent Phase A bug, not a Q1
      regression). Guard returns a rejected promise → fallback scene
      renders. HTTPS-for-phone-camera registered as FF7. Check: LAN-IP
      URL shows filtered sample scene, console clean, desktop + phone.
