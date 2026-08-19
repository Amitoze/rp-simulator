// 23-murk — quale: patches of murky see-through vision ("smokey
// water") opening in whatever base fill is underneath.
// Minimal extraction: Phase C replaces this with fill-in — do not polish.
vec3 murkQuale(vec3 base, vec2 suv, vec2 sp, vec2 drift) {
  // the world glimpsed through turbid water: warped, dim, washed out
  vec2 warp = (vec2(noise(suv * 7.0 + uTime * 0.2),
                    noise(suv * 7.0 - uTime * 0.17)) - 0.5) * 0.03;
  vec3 murky = getScene(suv + warp);
  float mg = dot(murky, vec3(0.299, 0.587, 0.114));
  murky = mix(vec3(mg), murky, 0.35) * 0.5;

  // patchy opacity: some regions near-opaque, others half see-through
  float patch = fbm(sp * 1.1 + drift * 0.6);
  float seeThru = smoothstep(0.30, 0.70, patch) * uSeeThru;
  return mix(base, murky, seeThru);
}
