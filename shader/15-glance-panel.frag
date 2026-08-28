// 15-glance-panel — the AID, not a symptom: a head-worn see-through
// display showing the same feed, cropped and zoomed. HEAD-FIXED by
// construction: placed from cuv, never uGaze — glasses move with the
// head, damage moves with the eye. The compositor calls it BEFORE
// every symptom slot, so rim greying and the field mask (which moves
// with gaze) composite OVER the panel: blindspots travel across it
// when glancing.
// SAFETY (structural, DECISIONS 2026-08-28): NO time-varying term may
// ever enter this chunk — steady light only. A pulsing or flashing
// panel feature must route through addLight and inherit ADD_CAP.
// G3: ideal-display mode only (opaque replace); the glasses optics
// (additive light, gain = display / ambient) land in G4.

// One width knob; height follows from the fixed on-screen aspect
// ratio, converted through the pane's pixel aspect so the panel's
// shape never changes with the window (user spec 2026-08-28).
vec2 panelSize() {
  return vec2(uPanelW, uPanelW * uRes.x / (uRes.y * uPanelAspect));
}

vec3 panelQuale(vec3 scene, vec2 cuv) {
  // 0..1 inside the panel rect; outside means no panel at this pixel
  vec2 local = (cuv - uPanelPos) / panelSize() + 0.5;
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0)
    return scene;
  // zoomed crop about the feed's centre; getScene owns the flip and
  // mirror, so the panel shows exactly what the main view shows
  vec2 panelUV = 0.5 + (local - 0.5) / uPanelZoom;
  return getScene(panelUV);
}

// Reposition-mode boundary: a STEADY yellow glow along the rect's
// edge (signed distance to the rect, soft falloff). Steady is
// load-bearing — the no-time-varying-term rule above forbids a pulse.
// The compositor draws it AFTER the survival mix: it is a UI
// affordance, not world light, and must stay visible over the dead
// ring while the pane is being placed.
float panelBorder(vec2 cuv) {
  vec2 q = abs(cuv - uPanelPos) - panelSize() * 0.5;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return exp(-abs(d) * 120.0);
}
