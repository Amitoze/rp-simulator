// 00-prelude — shared ground every chunk stands on: precision,
// uniforms, noise helpers, and the scene samplers. Always stitched in.
precision highp float;
varying vec2 vUV;
uniform sampler2D uTex;
uniform float uSrc;         // 0 = procedural scene, >0 = texture (camera/video)
uniform float uMirror;      // 1 = mirror horizontally (front camera)
uniform float uTime;
uniform vec2 uRes;
uniform float uEdgeBase;    // radius of surviving central field
uniform float uNetDensity;  // 0..1 density of the flashing net
uniform float uSeeThru;     // 0..1 periphery transparency
uniform float uFit;         // content fit: 0 = cover, 1 = contain+letterbox
uniform float uAspect;      // aspect ratio of the content (video/camera)
uniform float uNetScale;    // fineness of the net (1 = coarse, higher = tighter)
uniform float uNetWarp;     // strand messiness (0 = straight, ~0.5 = tangled)
uniform float uNetFlicker;  // flicker angular speed (2*pi*Hz)
uniform float uOuterEdge;   // radius where far-peripheral islands begin
uniform float uOuterCover;  // 0..1 how much of the outer field survives
uniform float uIslandSeed;  // picks the personal geography of the islands
uniform float uSparkleFlicker; // edge sparkle flicker angular speed (2*pi*Hz)
uniform vec2 uSparkleBandIn;   // sparkle band inside the edge: [start, end]
uniform vec2 uSparkleBandOut;  // sparkle band outside the edge: [start, end]
uniform vec2 uGaze;         // where the eye points: offset from straight ahead,
                            // screen fractions (shared by both panes)

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
  if (uSrc > 0.5) {
    float x = uMirror > 0.5 ? 1.0 - uv.x : uv.x;
    return texture2D(uTex, vec2(x, 1.0 - uv.y)).rgb;
  }
  return fallbackScene(uv);
}
