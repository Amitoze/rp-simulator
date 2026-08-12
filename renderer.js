// WebGL setup and the per-frame render loop.

import { state, video, fileVideo, sliders, initControls } from './controls.js';

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
  const fsSrc = await (await fetch('shader.frag')).text();

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
  for (const name of ['uTex', 'uSrc', 'uTime', 'uRes', 'uEdgeBase',
                      'uNetDensity', 'uSeeThru', 'uSplit', 'uAspect']) {
    U[name] = gl.getUniformLocation(prog, name);
  }

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
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
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
    gl.uniform1f(U.uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    // degeneration 0..1 maps to island radius 0.45 (mild) .. 0.07 (late)
    gl.uniform1f(U.uEdgeBase, 0.45 - 0.38 * parseFloat(sliders.degen.value));
    gl.uniform1f(U.uNetDensity, parseFloat(sliders.net.value));
    gl.uniform1f(U.uSeeThru, parseFloat(sliders.thru.value));
    gl.uniform1f(U.uSplit, state.splitMode ? 1 : 0);
    gl.uniform1f(U.uAspect,
      srcEl && srcEl.videoWidth ? srcEl.videoWidth / srcEl.videoHeight : 16 / 9);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  frame();
}

main();
