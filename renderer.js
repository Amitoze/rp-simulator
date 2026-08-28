// WebGL setup and the per-frame render loop.

import { state, video, fileVideo, initControls, IS_TOUCH } from './controls.js';
import { FIELD, QUALIA, GAZE, REFERENCE_PRESET } from './config.js';
// cycle-safe: materialise is a hoisted function declaration in
// presets.js, first called long after every module has evaluated
import { materialise } from './presets.js';

const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl');

const vsSrc = `
attribute vec2 aPos;
varying vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s));
  return s;
}

// The shader lives as ordered chunks; the stitcher concatenates them.
// Chunks not named in CHUNK_QUALE are structural (prelude, field,
// compositor) and always included.
const CHUNKS = ['00-prelude', '10-field', '20-smoke', '21-photopsia',
                '22-sparkle', '23-murk', '24-transition', '90-composite'];
const CHUNK_QUALE = {
  '20-smoke': 'smoke',
  '21-photopsia': 'photopsia',
  '22-sparkle': 'sparkle',
  '23-murk': 'murk',
  '24-transition': 'transition',
};

// PURE: (chunk sources, qualia + field configs) in → GLSL source out.
// Reads no globals — per-pane rendering (Q5) stitches two different
// configs, so nothing about "the" current config may be baked in here.
// Disabled qualia are excluded at stitch time: their chunk text is
// omitted AND the matching Q_* define is absent, so the compositor's
// #ifdef call sites vanish too — off costs zero per pixel.
// FIELD is different: 10-field is ALWAYS included (its outputs feed
// sparkle/transition/photopsia); Q_FIELD only selects which body
// compiles — the real geometry, or the full-survival short-circuit
// (DECISIONS 2026-08-28).
function stitchShader(sources, qualia, field) {
  const defines = Object.keys(qualia)
    .filter(name => qualia[name].enabled)
    .map(name => `#define Q_${name.toUpperCase()}`)
    .concat(field.enabled ? ['#define Q_FIELD'] : [])
    .join('\n');
  const body = CHUNKS
    .filter(c => !(c in CHUNK_QUALE) || qualia[CHUNK_QUALE[c]].enabled)
    .map(c => sources[c])
    .join('\n');
  return defines + '\n' + body;
}

// Chunk sources, fetched once in main(); module-level so restitch can
// rebuild without refetching.
const sources = {};

// The one live { program, uniform locations } pair. The frame loop and
// restitch both go through this shared ref — a closure-captured U would
// go stale on the first toggle's program swap.
const live = { prog: null, U: null };

// (chunk sources, qualia config) in → { program, uniform locations }
// out. Recompiling on a toggle (Q3) is just calling this again. aPos
// is pinned to attribute 0 before linking so the vertex buffer setup
// survives a program swap.
function makeProgram(sources, qualia, field) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, stitchShader(sources, qualia, field)));
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog));
  // uniforms for disabled qualia may be optimised away: their location
  // comes back null, and gl.uniform* on null is a defined no-op
  const U = {};
  for (const name of ['uTex', 'uSrc', 'uMirror', 'uTime', 'uRes', 'uEdgeBase',
                      'uNetDensity', 'uSeeThru', 'uFit', 'uAspect',
                      'uNetScale', 'uNetWarp', 'uNetFlicker',
                      'uOuterEdge', 'uOuterCover', 'uIslandSeed',
                      'uSparkleFlicker', 'uSparkleBandIn', 'uSparkleBandOut',
                      'uGaze']) {
    U[name] = gl.getUniformLocation(prog, name);
  }
  return { prog, U };
}

// Rebuild the program for the given qualia config and swap it in.
// Exported for controls.js (a quale toggle changes what's stitched);
// top-level function declaration, so the renderer↔controls import
// cycle resolves by hoisting.
export function restitch(qualia, field) {
  const old = live.prog;
  ({ prog: live.prog, U: live.U } = makeProgram(sources, qualia, field));
  gl.useProgram(live.prog);
  if (old) gl.deleteProgram(old);
}

// The comparison view's reference pane: an inert materialised config
// with its own compiled program (Q5, DECISIONS 2026-08-28 —
// asymmetric panes: sliders and presets edit the live schema above;
// nothing can reach this copy). Rebuilt only when its preset changes.
let refPane = null;
export function setReference(cfg) {
  if (refPane) gl.deleteProgram(refPane.prog);
  refPane = { cfg, ...makeProgram(sources, cfg.qualia, cfg.field) };
}

// Write every qualia-derived uniform from the schema, every frame.
// Both apply functions take config OBJECTS and read no globals —
// per-pane rendering (Q5) calls them twice with different configs.
// Uniforms of disabled qualia have null locations: gl.uniform* on
// null is a defined no-op.
function applyQualia(U, qualia) {
  const net = qualia.photopsia.params;
  gl.uniform1f(U.uNetDensity, net.density.value);
  gl.uniform1f(U.uNetScale, net.scale.value);
  gl.uniform1f(U.uNetWarp, net.messiness.value);
  gl.uniform1f(U.uNetFlicker, 2 * Math.PI * net.flickerHz.value);
  gl.uniform1f(U.uSeeThru, qualia.murk.params.transparency.value);
  const spk = qualia.sparkle.params;
  gl.uniform1f(U.uSparkleFlicker, 2 * Math.PI * spk.flickerHz.value);
  gl.uniform2f(U.uSparkleBandIn, spk.bandIn.value[0], spk.bandIn.value[1]);
  gl.uniform2f(U.uSparkleBandOut, spk.bandOut.value[0], spk.bandOut.value[1]);
}

// Field geometry from config: degrees → screen units (edge ≈ 90°, so
// r = deg/180). The degeneration param blends each [mild, late] pair
// and erodes the outer islands' coverage — a schema param since Q5,
// so panes carry their own (the General slider is just its UI).
function applyField(U, field) {
  const d2r = deg => deg / 180;
  const lerp = (a, b, t) => a + (b - a) * t;
  const p = field.params;
  const degen = p.degeneration.value;
  gl.uniform1f(U.uEdgeBase, d2r(lerp(p.inner.value[0], p.inner.value[1], degen)));
  gl.uniform1f(U.uOuterEdge, d2r(lerp(p.outer.value[0], p.outer.value[1], degen)));
  gl.uniform1f(U.uOuterCover,
    p.outerCoverage.value * (1 - p.erosion.value * degen));
  gl.uniform1f(U.uIslandSeed, p.islandSeed.value);
}

async function main() {
  // no-store: python http.server sends no cache headers, and a stale
  // cached chunk silently ignores config/shader edits
  const refJson = fetch(REFERENCE_PRESET, { cache: 'no-store' })
    .then(r => r.json());
  await Promise.all(CHUNKS.map(async c => {
    sources[c] = await (await fetch(`shader/${c}.frag`, { cache: 'no-store' })).text();
  }));

  restitch(QUALIA, FIELD);

  // reference pane boots on the configured default (none = the honest
  // unfiltered view); until the fetch lands, comparison draws only
  // the active pane — a blink at worst
  refJson.then(p => setReference(materialise(p)))
    .catch(e => console.error('reference preset failed to load:', e));

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  // aPos is pinned to attribute 0 inside makeProgram
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 0]));

  initControls();

  function resize() {
    // cap the render resolution: full retina is wasted through the
    // smoke/flicker and runs hot on phones
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * (IS_TOUCH ? 0.75 : 1);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener('resize', resize);
  resize();

  const t0 = performance.now();

  // The eye's current direction, eased toward the input's target each
  // frame (gaze, Phase G). Frame-rate independent: the exponential
  // step uses real dt, so the saccade-ish snap feels the same at any
  // fps. Lives here, not in controls — it's render state, like the
  // clock.
  const gazeNow = [0, 0];
  let tPrev = t0;

  // One pane, one draw: clip to its rect, bind ITS program, write
  // every uniform from ITS config. fit: 0 = cover (immersive),
  // 1 = contain + letterbox (comparison halves) — today's looks.
  function drawPane(prog, U, qualia, field, rect, fit, shared) {
    gl.viewport(rect[0], rect[1], rect[2], rect[3]);
    gl.scissor(rect[0], rect[1], rect[2], rect[3]);
    gl.useProgram(prog);
    gl.uniform1i(U.uTex, 0);
    gl.uniform1f(U.uSrc, shared.src);
    gl.uniform1f(U.uMirror, shared.mirror);
    gl.uniform1f(U.uTime, shared.time);   // SHARED clock: identical
    gl.uniform2f(U.uRes, rect[2], rect[3]); // configs = identical wobble
    gl.uniform2f(U.uGaze, shared.gaze[0], shared.gaze[1]); // one pair of eyes
    gl.uniform1f(U.uAspect, shared.aspect);
    gl.uniform1f(U.uFit, fit);
    applyQualia(U, qualia);
    applyField(U, field); // each pane's OWN degeneration rides here
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  gl.enable(gl.SCISSOR_TEST);
  function frame() {
    // pick the texture source: local video file, else camera, else the
    // procedural fallback scene (uSrc = 0); uploaded ONCE, shared by
    // both panes — honest A/B needs the same frame on both sides
    const useVid = state.videoMode && fileVideo.readyState >= 2;
    const srcEl = useVid ? fileVideo
                : (state.hasCam && video.readyState >= 2 ? video : null);
    if (srcEl) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, srcEl);
    }
    const now = performance.now();
    const dt = (now - tPrev) / 1000;
    tPrev = now;
    const k = 1 - Math.exp(-dt * 1000 / GAZE.easeMs);
    gazeNow[0] += (state.gazeTarget[0] - gazeNow[0]) * k;
    gazeNow[1] += (state.gazeTarget[1] - gazeNow[1]) * k;
    const shared = {
      src: useVid ? 2 : (state.hasCam ? 1 : 0),
      mirror: !useVid && state.mirror ? 1 : 0,
      time: (now - t0) / 1000,
      gaze: gazeNow,
      aspect: srcEl && srcEl.videoWidth
        ? srcEl.videoWidth / srcEl.videoHeight : 16 / 9,
    };
    const w = canvas.width, h = canvas.height;
    if (!state.splitMode) {
      drawPane(live.prog, live.U, QUALIA, FIELD, [0, 0, w, h], 0, shared);
    } else {
      // layout follows orientation: side-by-side in landscape (ref
      // left), stacked in portrait (ref top; GL y-origin is bottom)
      const halfW = Math.floor(w / 2), halfH = Math.floor(h / 2);
      const [refRect, actRect] = w >= h
        ? [[0, 0, halfW, h], [halfW, 0, w - halfW, h]]
        : [[0, halfH, w, h - halfH], [0, 0, w, halfH]];
      if (refPane) drawPane(refPane.prog, refPane.U, refPane.cfg.qualia,
                            refPane.cfg.field, refRect, 1, shared);
      drawPane(live.prog, live.U, QUALIA, FIELD, actRect, 1, shared);
    }
    requestAnimationFrame(frame);
  }
  frame();
}

main();
