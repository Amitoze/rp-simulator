// WebGL setup and the per-frame render loop.

import { state, video, fileVideo, sliders, initControls, IS_TOUCH } from './controls.js';
import { NET, FIELD } from './config.js';

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

async function main() {
  // no-store: python http.server sends no cache headers, and a stale
  // cached shader silently ignores config/shader edits
  const fsSrc = await (await fetch('shader.frag', { cache: 'no-store' })).text();

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const name of ['uTex', 'uSrc', 'uMirror', 'uTime', 'uRes', 'uEdgeBase',
                      'uNetDensity', 'uSeeThru', 'uSplit', 'uAspect',
                      'uNetScale', 'uNetWarp', 'uNetFlicker',
                      'uOuterEdge', 'uOuterCover', 'uIslandSeed']) {
    U[name] = gl.getUniformLocation(prog, name);
  }

  // fixed net look from config.js — set once, not per frame
  gl.uniform1f(U.uNetScale, NET.scale);
  gl.uniform1f(U.uNetWarp, NET.messiness);
  gl.uniform1f(U.uNetFlicker, 2 * Math.PI * NET.flickerHz);

  // fixed island geography from config.js — set once, not per frame
  gl.uniform1f(U.uIslandSeed, FIELD.islandSeed);

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
