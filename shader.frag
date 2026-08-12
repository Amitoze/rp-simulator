precision highp float;
varying vec2 vUV;
uniform sampler2D uTex;
uniform float uSrc;         // 0 = sample scene, 1 = camera (mirrored), 2 = video file
uniform float uTime;
uniform vec2 uRes;
uniform float uEdgeBase;    // radius of surviving central field
uniform float uNetDensity;  // 0..1 density of the flashing net
uniform float uSeeThru;     // 0..1 periphery transparency
uniform float uSplit;       // 1 = side-by-side comparison view
uniform float uAspect;      // aspect ratio of the content (video/camera)

// -- small value-noise helpers ------------------------------------
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),               hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)),   hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

// -- fallback scene when no camera: simple park-like view ----------
vec3 fallbackScene(vec2 uv) {
  vec3 sky = mix(vec3(0.55, 0.75, 0.95), vec3(0.85, 0.92, 1.0), uv.y);
  vec3 grass = mix(vec3(0.22, 0.45, 0.2), vec3(0.35, 0.6, 0.3), noise(uv * 18.0) * 0.5);
  vec3 col = uv.y > 0.45 ? sky : grass;
  // a few "trees" drifting slowly so there is motion to notice/lose
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float x = fract(0.27 * fi + uTime * 0.012 + 0.2);
    vec2 c = vec2(x, 0.52 + 0.03 * fi);
    float trunk = (1.0 - smoothstep(0.008, 0.012, abs(uv.x - c.x))) * step(uv.y, c.y) * step(0.42, uv.y);
    float crown = 1.0 - smoothstep(0.04, 0.09 + 0.02 * fi, distance(uv * vec2(uRes.x / uRes.y, 1.0), c * vec2(uRes.x / uRes.y, 1.0)));
    col = mix(col, vec3(0.3, 0.2, 0.12), trunk);
    col = mix(col, vec3(0.16, 0.38, 0.16), crown * 0.9);
  }
  return col;
}

vec3 getScene(vec2 uv) {
  if (uSrc > 1.5) {
    return texture2D(uTex, vec2(uv.x, 1.0 - uv.y)).rgb;       // video: flip only
  }
  if (uSrc > 0.5) {
    return texture2D(uTex, vec2(1.0 - uv.x, 1.0 - uv.y)).rgb; // camera: mirror + flip
  }
  return fallbackScene(uv);
}

void main() {
  vec2 uv = vUV;
  // side-by-side: both halves show the same content, aspect-fitted
  // (letterboxed, never stretched); suv is the coordinate within the
  // content rectangle of the current half
  vec2 suv = uv;
  float contAsp = uRes.x / uRes.y;
  float bars = 0.0;                        // 1 = letterbox bar
  if (uSplit > 0.5) {
    vec2 halfPx = vec2(uRes.x * 0.5, uRes.y);
    vec2 p = vec2(fract(uv.x * 2.0), uv.y) * halfPx;
    float cw = min(halfPx.x, halfPx.y * uAspect);
    float ch = cw / uAspect;
    vec2 o = (halfPx - vec2(cw, ch)) * 0.5; // centered content rect
    suv = (p - o) / vec2(cw, ch);
    if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) bars = 1.0;
    suv = clamp(suv, 0.0, 1.0);
    contAsp = uAspect;
  }
  vec3 scene = getScene(suv);
  vec3 rawScene = scene;   // pristine copy for the comparison view

  // ---- tunnel-vision field mask ----------------------------------
  vec2 centered = suv - 0.5;
  centered.x *= contAsp;                   // aspect-correct so island is round
  float r = length(centered);
  float ang = atan(centered.y, centered.x);

  // irregular boundary: radius wobbles around the island edge and
  // creeps slightly over time so the edge feels alive, not stenciled
  float wobble = noise(vec2(ang * 1.6 + 10.0, uTime * 0.05)) * 0.06
               + noise(vec2(ang * 5.0, uTime * 0.03)) * 0.025;
  float edge = uEdgeBase + wobble;

  // survival: 1 inside the central island, 0 in the dead periphery
  float survival = 1.0 - smoothstep(edge - 0.05, edge + 0.06, r);

  // periphery: patches of murky see-through vision ("smokey water")
  // between opaque smoke, with a persistent flashing net laid over it
  vec2 sp = centered * 2.6;
  vec2 drift = vec2(uTime * 0.035, uTime * -0.02);

  // the world glimpsed through turbid water: warped, dim, washed out
  vec2 warp = (vec2(noise(suv * 7.0 + uTime * 0.2),
                    noise(suv * 7.0 - uTime * 0.17)) - 0.5) * 0.03;
  vec3 murky = getScene(suv + warp);
  float mg = dot(murky, vec3(0.299, 0.587, 0.114));
  murky = mix(vec3(mg), murky, 0.35) * 0.5;

  // smoke billows churning slowly (domain-warped noise = the swirl)
  float swirl = fbm(sp + drift + 1.5 * fbm(sp * 1.7 - drift));
  vec3 smoke = mix(vec3(0.02, 0.025, 0.035), vec3(0.11, 0.13, 0.17), swirl);

  // patchy opacity: some regions near-opaque, others half see-through
  float patch = fbm(sp * 1.1 + drift * 0.6);
  float seeThru = smoothstep(0.30, 0.70, patch) * uSeeThru;
  vec3 periphery = mix(smoke, murky, seeThru);

  // photopsia: a messy net of continuous rapid flashes — curved,
  // interconnected filaments (noise ridges at two scales), each strand
  // flickering ~9 Hz with its own phase, in varying shades of light
  float n1 = noise(sp * (1.5 + 5.0 * uNetDensity) + drift * 2.0);
  float n2 = noise(sp * (3.0 + 11.0 * uNetDensity) - drift * 1.5);
  float net = pow(1.0 - abs(2.0 * n1 - 1.0), 5.0)
            + 0.7 * pow(1.0 - abs(2.0 * n2 - 1.0), 5.0);
  float shade = 0.25 + 0.75 * noise(sp * 1.4 + vec2(7.0, 3.0));
  float flick = 0.55 + 0.45 * sin(uTime * 56.5 + n1 * 14.0 + n2 * 9.0);
  // SAFETY: amplitude capped so the net stays well below full white
  vec3 netGlow = vec3(0.8, 0.87, 1.0) * net * shade * flick
               * 0.55 * smoothstep(0.0, 0.08, uNetDensity);
  periphery += netGlow;

  // transition ring: slight desaturation + dimming before full loss
  float gray = dot(scene, vec3(0.299, 0.587, 0.114));
  vec3 degraded = mix(vec3(gray), scene, 0.4) * 0.55;
  float ring = smoothstep(edge - 0.10, edge - 0.02, r);
  scene = mix(scene, degraded, ring);

  vec3 col = mix(periphery, scene, survival);

  // messy flashing ring hugging the inner edge of surviving vision:
  // a band straddling the boundary (follows the irregular wobble),
  // filled with broken flickering filaments rather than a clean halo
  float band = smoothstep(edge - 0.08, edge - 0.01, r)
             * (1.0 - smoothstep(edge + 0.03, edge + 0.10, r));
  float rn = noise(sp * 5.0 + drift * 3.0);
  float rim = pow(1.0 - abs(2.0 * rn - 1.0), 4.0);          // messy strands
  float gaps = 0.35 + 0.65 * noise(vec2(ang * 2.2, uTime * 0.15)); // broken ring
  float flickR = 0.5 + 0.5 * sin(uTime * 60.0 + rn * 20.0 + ang * 5.0);
  // SAFETY: amplitude capped, band is narrow
  vec3 ringGlow = vec3(0.85, 0.9, 1.0) * band * gaps * (0.25 + rim) * flickR * 0.5;
  col += ringGlow;

  if (uSplit > 0.5 && uv.x < 0.5) {
    col = rawScene;               // left half of comparison: unfiltered
  }
  if (bars > 0.5) col = vec3(0.0); // letterbox
  gl_FragColor = vec4(col, 1.0);
}
