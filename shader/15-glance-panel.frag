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

// One width knob; height follows from the fixed on-screen aspect
// ratio, converted through the aspect of the space cuv lives in —
// the whole pane under cover fit, the letterboxed CONTENT rect under
// contain fit (the compositor's contAsp) — so the panel's shape never
// changes with the window OR the view mode (user spec 2026-08-28;
// converting through uRes assumed cuv ≡ pane, wrong in comparison
// view: the panel drew at ~2× its width:height there).
vec2 panelSize(float contAsp) {
  return vec2(uPanelW, uPanelW * contAsp / uPanelAspect);
}

vec3 panelQuale(vec3 scene, vec2 cuv, float contAsp) {
  // 0..1 inside the panel rect; outside means no panel at this pixel
  vec2 local = (cuv - uPanelPos) / panelSize(contAsp) + 0.5;
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0)
    return scene;
  // zoomed crop about the feed's centre; getScene owns the flip and
  // mirror, so the panel shows exactly what the main view shows
  vec2 panelUV = 0.5 + (local - 0.5) / uPanelZoom;
  vec3 feed = getScene(panelUV);
  // optical see-through (G4): the display ADDS light over the world —
  // black is transparent, dim feed pixels vanish. The display has no
  // brightness of its own: it replicates the source feed, so the
  // wash-out ratio is 1 / ambient — relatively glowing in the dark,
  // fading in daylight. uPanelOpaque blends toward the opaque
  // display; the JS floors it at minOpacity so full transparency
  // keeps a faint ghost (never invisible).
  return mix(scene + feed * uPanelGain, feed, uPanelOpaque);
}

// Reposition-mode boundary: a STEADY yellow glow along the rect's
// edge (signed distance to the rect, soft falloff). Steady is
// load-bearing — the no-time-varying-term rule above forbids a pulse.
// The compositor draws it AFTER the survival mix: it is a UI
// affordance, not world light, and must stay visible over the dead
// ring while the pane is being placed.
float panelBorder(vec2 cuv, float contAsp) {
  vec2 q = abs(cuv - uPanelPos) - panelSize(contAsp) * 0.5;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return exp(-abs(d) * 120.0);
}
