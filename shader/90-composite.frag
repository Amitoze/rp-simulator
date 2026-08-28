// 90-composite — the compositor: fixed slots, in fixed order. Toggling
// a quale changes slot membership, never order. Each Q_* define is
// injected by the stitcher only when that quale is enabled — a
// disabled quale's call site AND function body are absent from the
// compiled program entirely (off costs zero).
//
// Since Q5 this shader knows nothing about split views: it renders
// ONE pane. The renderer draws it once per pane (viewport+scissor),
// each pane with its own program and config; uFit picks the content
// fit — 0 = cover (immersive), 1 = contain + letterbox (comparison
// halves) — preserving the pre-Q5 looks exactly.
void main() {
  vec2 uv = vUV;
  float screenAsp = uRes.x / uRes.y;
  vec2 suv;              // where in the content to sample
  vec2 cuv;              // 0..1 coords the field geometry lives in
  float contAsp;         // aspect of that geometry space
  float bars = 0.0;      // 1 = letterbox bar

  if (uFit < 0.5) {
    // cover-fit: content fills the pane undistorted, overflow cropped
    vec2 frac = vec2(min(1.0, screenAsp / uAspect),
                     min(1.0, uAspect / screenAsp));
    suv = 0.5 + (uv - 0.5) * frac;
    cuv = uv;
    contAsp = screenAsp;
  } else {
    // contain-fit: whole content visible, letterboxed, never
    // stretched; geometry maps over the CONTENT rect (pre-Q5
    // comparison semantics)
    vec2 frac = vec2(max(1.0, screenAsp / uAspect),
                     max(1.0, uAspect / screenAsp));
    suv = 0.5 + (uv - 0.5) * frac;
    if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) bars = 1.0;
    suv = clamp(suv, 0.0, 1.0);
    cuv = suv;
    contAsp = uAspect;
  }
  vec3 scene = getScene(suv);

  // ---- tier 1: field geometry (always on) ------------------------
  vec2 centered = cuv - 0.5;
  centered.x *= contAsp;                   // aspect-correct so island is round
  float r = length(centered);
  float ang = atan(centered.y, centered.x);

  float edge, oEdge, central, outer;
  float survival = fieldSurvival(centered, r, ang, edge, oEdge, central, outer);

  // shared coordinate frames for the qualia
  vec2 sp = centered * 2.6;
  vec2 drift = vec2(uTime * 0.035, uTime * -0.02);

  // ---- slot: scene-modifying qualia ------------------------------
#ifdef Q_TRANSITION
  scene = transitionQuale(scene, r, edge, oEdge, central, outer);
#endif

  // ---- slot: fill qualia (relay: each modifies the periphery) ----
  vec3 periphery = vec3(0.0);
#ifdef Q_SMOKE
  periphery = smokeQuale(sp, drift);
#endif
#ifdef Q_MURK
  periphery = murkQuale(periphery, suv, sp, drift);
#endif

  // ---- slot: additive qualia (each capped) -----------------------
  // All ADDED flashing light accumulates in addLight; the global
  // SAFETY clamp (Q2) acts on this term alone — the scene is never
  // clamped. Photopsia's (1 - survival) weight is exactly what the
  // mix applied to it when it rode the periphery:
  // mix(p + a, s, k) == mix(p, s, k) + a * (1 - k).
  vec3 addLight = vec3(0.0);
#ifdef Q_PHOTOPSIA
  addLight += photopsiaQuale(sp, drift) * (1.0 - survival);
#endif

  // ---- the mix: periphery where dead, scene where vision survives -
  vec3 col = mix(periphery, scene, survival);

  // ---- slot: post-additive qualia (also added light) -------------
#ifdef Q_SPARKLE
  addLight += sparkleQuale(r, ang, sp, drift, edge);
#endif

  // ---- slot: global brightness clamp -----------------------------
  // SAFETY: ceiling on ADDED flashing light (photopsia + sparkle) —
  // the scene itself is never clamped. Measured 2026-08-20 by magenta
  // bisection at today's reachable worst case (both sliders maxed):
  // flecks at 0.55, none at 0.65; the ceiling sits at that upper
  // bound, so today's output is untouched and NO configuration of
  // stacked qualia can ever add more light than today. Not a tunable:
  // stays out of config, schema, and presets. Scales, never clips —
  // hue preserved, and below the ceiling the scale factor is exactly 1.
  const float ADD_CAP = 0.65;
  float addLuma = dot(addLight, vec3(0.299, 0.587, 0.114));
  addLight *= ADD_CAP / max(addLuma, ADD_CAP);
  col += addLight;

  if (bars > 0.5) col = vec3(0.0); // letterbox
  gl_FragColor = vec4(col, 1.0);
}
