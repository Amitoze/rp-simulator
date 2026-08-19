// WebGL setup and the per-frame render loop.

import { state, video, fileVideo, sliders, initControls, IS_TOUCH } from './controls.js';
import { NET, FIELD, SPARKLE, QUALIA } from './config.js';

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

// PURE: (chunk sources, qualia config) in → GLSL source out. Reads no
// globals — per-pane rendering (Q5) stitches two different configs, so
// nothing about "the" current config may be baked in here. Disabled
// qualia are excluded at stitch time: their chunk text is omitted AND
// the matching Q_* define is absent, so the compositor's #ifdef call
// sites vanish too — off costs zero per pixel.
function stitchShader(sources, qualia) {
  const defines = Object.keys(qualia)
    .filter(name => qualia[name].enabled)
    .map(name => `#define Q_${name.toUpperCase()}`)
    .join('\n');
  const body = CHUNKS
    .filter(c => !(c in CHUNK_QUALE) || qualia[CHUNK_QUALE[c]].enabled)
    .map(c => sources[c])
    .join('\n');
  return defines + '\n' + body;
}

// (chunk sources, qualia config) in → { program, uniform locations }
// out. Recompiling on a toggle (Q3) is just calling this again. aPos
// is pinned to attribute 0 before linking so the vertex buffer setup
// survives a program swap.
function makeProgram(sources, qualia) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, stitchShader(sources, qualia)));
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog));
  // uniforms for disabled qualia may be optimised away: their location
  // comes back null, and gl.uniform* on null is a defined no-op
  const U = {};
  for (const name of ['uTex', 'uSrc', 'uMirror', 'uTime', 'uRes', 'uEdgeBase',
                      'uNetDensity', 'uSeeThru', 'uSplit', 'uAspect',
                      'uNetScale', 'uNetWarp', 'uNetFlicker',
                      'uOuterEdge', 'uOuterCover', 'uIslandSeed',
                      'uSparkleFlicker', 'uSparkleBandIn', 'uSparkleBandOut']) {
    U[name] = gl.getUniformLocation(prog, name);
  }
  return { prog, U };
}

async function main() {
  // no-store: python http.server sends no cache headers, and a stale
  // cached chunk silently ignores config/shader edits
  const sources = {};
  await Promise.all(CHUNKS.map(async c => {
    sources[c] = await (await fetch(`shader/${c}.frag`, { cache: 'no-store' })).text();
  }));

  const { prog, U } = makeProgram(sources, QUALIA);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  // aPos is pinned to attribute 0 inside makeProgram
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // fixed net look from config.js — set once, not per frame
  gl.uniform1f(U.uNetScale, NET.scale);
  gl.uniform1f(U.uNetWarp, NET.messiness);
  gl.uniform1f(U.uNetFlicker, 2 * Math.PI * NET.flickerHz);

  // fixed island geography from config.js — set once, not per frame
  gl.uniform1f(U.uIslandSeed, FIELD.islandSeed);

  // fixed sparkle look from config.js — set once, not per frame
  gl.uniform1f(U.uSparkleFlicker, 2 * Math.PI * SPARKLE.flickerHz);
  gl.uniform2f(U.uSparkleBandIn, SPARKLE.bandIn[0], SPARKLE.bandIn[1]);
  gl.uniform2f(U.uSparkleBandOut, SPARKLE.bandOut[0], SPARKLE.bandOut[1]);

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
  function frame() {
    // pick the texture source: local video file, else camera, else the
    // procedural fallback scene (uSrc = 0)
    const useVid = state.videoMode && fileVideo.readyState >= 2;
    const srcEl = useVid ? fileVideo
                : (state.hasCam && video.readyState >= 2 ? video : null);
    if (srcEl) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, srcEl);
    }
    gl.uniform1i(U.uTex, 0);
    gl.uniform1f(U.uSrc, useVid ? 2 : (state.hasCam ? 1 : 0));
    gl.uniform1f(U.uMirror, !useVid && state.mirror ? 1 : 0);
    gl.uniform1f(U.uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    // field geometry from config: degrees → screen units (edge ≈ 90°,
    // so r = deg/180). The slider blends mild → late for both radii and
    // erodes the outer islands' coverage.
    const degen = parseFloat(sliders.degen.value);
    const d2r = deg => deg / 180;
    const lerp = (a, b, t) => a + (b - a) * t;
    gl.uniform1f(U.uEdgeBase, d2r(lerp(FIELD.inner.mild, FIELD.inner.late, degen)));
    gl.uniform1f(U.uOuterEdge, d2r(lerp(FIELD.outer.mild, FIELD.outer.late, degen)));
    gl.uniform1f(U.uOuterCover,
      FIELD.outerCoverage * (1 - FIELD.erosion * degen));
    gl.uniform1f(U.uNetDensity, parseFloat(sliders.net.value));
    gl.uniform1f(U.uSeeThru, parseFloat(sliders.thru.value));
    // comparison layout follows orientation: side-by-side in landscape,
    // stacked in portrait
    gl.uniform1f(U.uSplit,
      state.splitMode ? (canvas.width >= canvas.height ? 1 : 2) : 0);
    gl.uniform1f(U.uAspect,
      srcEl && srcEl.videoWidth ? srcEl.videoWidth / srcEl.videoHeight : 16 / 9);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  frame();
}

main();
