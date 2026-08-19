// 22-sparkle — quale: messy flashing ring hugging the inner edge of
// surviving vision: a band straddling the boundary (follows the
// irregular wobble), filled with broken flickering filaments rather
// than a clean halo. Post-additive slot: the compositor ADDS this
// AFTER the survival mix, so it glows on both sides of the boundary.
// Rate and band widths come from config via the uSparkle* uniforms
// (pre-refactor these were hardcoded: 60.0 and .08/.01/.03/.10).
vec3 sparkleQuale(float r, float ang, vec2 sp, vec2 drift, float edge) {
  float band = smoothstep(edge - uSparkleBandIn.x, edge - uSparkleBandIn.y, r)
             * (1.0 - smoothstep(edge + uSparkleBandOut.x, edge + uSparkleBandOut.y, r));
  float rn = noise(sp * 5.0 + drift * 3.0);
  float rim = pow(1.0 - abs(2.0 * rn - 1.0), 4.0);          // messy strands
  float gaps = 0.35 + 0.65 * noise(vec2(ang * 2.2, uTime * 0.15)); // broken ring
  float flickR = 0.5 + 0.5 * sin(uTime * uSparkleFlicker + rn * 20.0 + ang * 5.0);
  // SAFETY: amplitude capped, band is narrow
  return vec3(0.85, 0.9, 1.0) * band * gaps * (0.25 + rim) * flickR * 0.5;
}
