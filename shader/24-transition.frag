// 24-transition — quale: transition bands — slight desaturation +
// dimming before full loss, on BOTH boundaries of the dead ring
// (central edge and island rims). Scene-modifying slot: takes the
// scene, returns a degraded scene; the compositor applies it before
// the survival mix. The only quale that touches the scene rather than
// the periphery.
vec3 transitionQuale(vec3 scene, float r, float edge, float oEdge,
                     float central, float outer) {
  float gray = dot(scene, vec3(0.299, 0.587, 0.114));
  vec3 degraded = mix(vec3(gray), scene, 0.4) * 0.55;
  float ringC = smoothstep(edge - 0.10, edge - 0.02, r);            // centre side
  float ringO = 1.0 - smoothstep(oEdge + 0.02, oEdge + 0.10, r);    // island side
  return mix(scene, degraded, max(ringC * central, ringO * outer));
}
