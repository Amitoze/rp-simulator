// 20-smoke — quale: opaque smoke billows filling the dead ring.
// Fill slot: takes nothing, paints the periphery base.
vec3 smokeQuale(vec2 sp, vec2 drift) {
  // smoke billows churning slowly (domain-warped noise = the swirl)
  float swirl = fbm(sp + drift + 1.5 * fbm(sp * 1.7 - drift));
  return mix(vec3(0.02, 0.025, 0.035), vec3(0.11, 0.13, 0.17), swirl);
}
