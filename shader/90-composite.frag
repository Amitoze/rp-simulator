// 90-composite — the compositor: fixed slots, in fixed order. Toggling
// a quale changes slot membership, never order. Each Q_* define is
// injected by the stitcher only when that quale is enabled — a
// disabled quale's call site AND function body are absent from the
// compiled program entirely (off costs zero).
void main() {
  vec2 uv = vUV;
  float screenAsp = uRes.x / uRes.y;
  vec2 suv;              // where in the content to sample
  vec2 cuv;              // 0..1 coords the field geometry lives in
  float contAsp;         // aspect of that geometry space
  float bars = 0.0;      // 1 = letterbox bar

  if (uSplit < 0.5) {
    // immersive: cover-fit — content fills the screen undistorted,
    // overflow is cropped (never stretched)
    vec2 frac = vec2(min(1.0, screenAsp / uAspect),
                     min(1.0, uAspect / screenAsp));
    suv = 0.5 + (uv - 0.5) * frac;
    cuv = uv;
    contAsp = screenAsp;
  } else {
    // comparison: two halves — side by side (uSplit=1, landscape) or
    // stacked (uSplit=2, portrait) — each contain-fit (letterboxed,
    // never stretched)
    vec2 halfPx, p;
    if (uSplit < 1.5) {
      halfPx = vec2(uRes.x * 0.5, uRes.y);
      p = vec2(fract(uv.x * 2.0), uv.y) * halfPx;
    } else {
      halfPx = vec2(uRes.x, uRes.y * 0.5);
      p = vec2(uv.x, fract(uv.y * 2.0)) * halfPx;
    }
    float cw = min(halfPx.x, halfPx.y * uAspect);
    float ch = cw / uAspect;
    vec2 o = (halfPx - vec2(cw, ch)) * 0.5; // centered content rect
    suv = (p - o) / vec2(cw, ch);
    if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) bars = 1.0;
    suv = clamp(suv, 0.0, 1.0);
    cuv = suv;
    contAsp = uAspect;
  }
  vec3 scene = getScene(suv);
  vec3 rawScene = scene;   // pristine copy for the comparison view

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

  // unfiltered half of the comparison: left (side-by-side) or top (stacked)
  if ((uSplit > 0.5 && uSplit < 1.5 && uv.x < 0.5) ||
      (uSplit > 1.5 && uv.y > 0.5)) {
    col = rawScene;
  }
  if (bars > 0.5) col = vec3(0.0); // letterbox
  gl_FragColor = vec4(col, 1.0);
}
