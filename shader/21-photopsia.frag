// 21-photopsia — quale: a messy net of continuous rapid flashes —
// curved, interconnected filaments (noise ridges at two scales), each
// strand flickering with its own phase, in varying shades of light.
// Additive slot: returns light the compositor ADDS to the periphery.
vec3 photopsiaQuale(vec2 sp, vec2 drift) {
  // value noise rides a square lattice, which makes its ridges run
  // straight along rows/columns; warping the coordinates with a second
  // noise field first bends the strands into tangled filaments
  vec2 np = sp * uNetScale;
  vec2 bend = (vec2(fbm(np * 0.9 + drift),
                    fbm(np * 0.9 + 4.7 - drift)) - 0.5) * 2.0 * uNetWarp;
  np += bend;
  float n1 = noise(np * (1.5 + 5.0 * uNetDensity) + drift * 2.0);
  float n2 = noise(np * (3.0 + 11.0 * uNetDensity) - drift * 1.5);
  float net = pow(1.0 - abs(2.0 * n1 - 1.0), 5.0)
            + 0.7 * pow(1.0 - abs(2.0 * n2 - 1.0), 5.0);
  float shade = 0.25 + 0.75 * noise(np * 1.4 + vec2(7.0, 3.0));
  float flick = 0.55 + 0.45 * sin(uTime * uNetFlicker + n1 * 14.0 + n2 * 9.0);
  // SAFETY: amplitude capped so the net stays well below full white
  return vec3(0.8, 0.87, 1.0) * net * shade * flick
       * 0.55 * smoothstep(0.0, 0.08, uNetDensity);
}
