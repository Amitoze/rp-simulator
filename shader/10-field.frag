// 10-field — tier 1: the field geometry. ALWAYS stitched in, never
// toggleable: qualia describe what the experience is like, this says
// WHERE vision survives. Kept as one substitutable function — a future
// perimetry import replaces this body with a texture lookup and
// nothing downstream changes.
//
// Returns survival: 1 where vision works, 0 in the dead ring. The out
// params hand back the wobbly edge radii and the two partial masks,
// which downstream qualia (sparkle, transition) reuse.
float fieldSurvival(vec2 centered, float r, float ang,
                    out float edge, out float oEdge,
                    out float central, out float outer) {
  // irregular boundary: radius wobbles around the island edge and
  // creeps slightly over time so the edge feels alive, not stenciled
  float wobble = noise(vec2(ang * 1.6 + 10.0, uTime * 0.05)) * 0.06
               + noise(vec2(ang * 5.0, uTime * 0.03)) * 0.025;
  edge = uEdgeBase + wobble;

  // central island — preserved centre (as before)
  central = 1.0 - smoothstep(edge - 0.05, edge + 0.06, r);

  // outer islands — far-peripheral vision that survives beyond the dead
  // ring. STATIC geography: no uTime anywhere here — islands are places,
  // not weather. Noise is sampled in position space (not angle) to avoid
  // the wrap-around seam at the left horizontal.
  float geo = fbm(centered * 3.0 + uIslandSeed);

  // inferotemporal bias: the lower-lateral field survives longest, so
  // those pixels get a bonus toward passing the gate (lateral = both
  // screen edges — one binocular view)
  float lower   = smoothstep(0.05, -0.25, centered.y);
  float lateral = smoothstep(0.10, 0.45, abs(centered.x));
  float bias = 0.35 * lower * lateral;

  // coverage sets the bar the noise must clear: full coverage = low bar
  float bar = mix(0.78, 0.38, clamp(uOuterCover, 0.0, 1.0));
  float gate = smoothstep(bar - 0.07, bar + 0.07, geo + bias);

  // the ring's far side gets its own irregular, slowly-creeping edge
  float wobble2 = noise(vec2(ang * 2.1 + 33.0, uTime * 0.04)) * 0.05;
  oEdge = uOuterEdge + wobble2;
  outer = smoothstep(oEdge - 0.06, oEdge + 0.05, r) * gate;

  return max(central, outer);
}
