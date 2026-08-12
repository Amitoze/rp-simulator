// Panel UI, background sources (camera / local video), and shared state.

import { DEFAULTS } from './config.js';

export const state = {
  hasCam: false,      // camera stream is live
  mirror: false,      // mirror the camera image (front camera only)
  videoMode: false,   // self-hosted video file as the background
  splitMode: false,   // comparison view (side-by-side / stacked)
};

export const IS_TOUCH = matchMedia('(pointer: coarse)').matches;

const note = document.getElementById('note');
export const video = document.getElementById('cam');
// self-hosted, openly licensed footage (see assets/CREDITS.md)
export const fileVideo = document.getElementById('vid');
export const sliders = {
  degen: document.getElementById('sDegen'),
  net: document.getElementById('sNet'),
  thru: document.getElementById('sThru'),
};

function updateNote() {
  const bg = state.videoMode ? 'video: Shanghai city walk, LOVE SHANGHAI, CC BY 4.0'
    : (state.hasCam ? 'live camera' : 'no camera — showing sample scene');
  note.textContent = bg + ' · simulated RP visual field' +
    (state.splitMode ? ' · comparison (left/top: normal vision)' : '');
  const flip = document.getElementById('camFlip');
  flip.hidden = state.videoMode || !state.hasCam;
}

// --- camera ---------------------------------------------------------
// touch devices default to the rear camera (the simulator is about
// looking at the world); desktops have front-facing webcams only
let facing = IS_TOUCH ? 'environment' : 'user';
let camStream = null;

function startCamera(mode) {
  if (camStream) camStream.getTracks().forEach(t => t.stop());
  camStream = null;
  state.hasCam = false;
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
    .then(stream => {
      camStream = stream;
      video.srcObject = stream;
      return video.play();
    })
    .then(() => {
      facing = mode;
      state.hasCam = true;
      state.mirror = mode === 'user'; // selfie view reads naturally mirrored
      updateNote();
    });
}

function bindToggle(idA, idB, setState) {
  const a = document.getElementById(idA), b = document.getElementById(idB);
  a.addEventListener('click', () => {
    setState(false); a.classList.add('on'); b.classList.remove('on');
    updateNote();
  });
  b.addEventListener('click', () => {
    setState(true); b.classList.add('on'); a.classList.remove('on');
    updateNote();
  });
}

function applyDefaults() {
  sliders.degen.value = DEFAULTS.degeneration;
  sliders.net.value = DEFAULTS.netDensity;
  sliders.thru.value = DEFAULTS.transparency;
  if (DEFAULTS.background === 'video') document.getElementById('bgVid').click();
  if (DEFAULTS.view === 'sideBySide') document.getElementById('vwSbs').click();
  if (DEFAULTS.menuCollapsed) document.getElementById('panelHead').click();
}

export function initControls() {
  bindToggle('bgCam', 'bgVid', v => {
    state.videoMode = v;
    // play/pause happens inside the click handler = a user gesture,
    // so playback is never blocked by autoplay policy
    if (v) fileVideo.play(); else fileVideo.pause();
  });
  bindToggle('vwImm', 'vwSbs', v => { state.splitMode = v; });

  document.getElementById('panelHead').addEventListener('click', () => {
    const panel = document.getElementById('panel');
    panel.classList.toggle('min');
    panel.querySelector('.chev').textContent =
      panel.classList.contains('min') ? '☰' : 'Done';
  });

  applyDefaults();

  document.getElementById('camFlip').addEventListener('click', () => {
    const other = facing === 'user' ? 'environment' : 'user';
    startCamera(other).catch(() => startCamera(facing)); // revert on failure
  });

  // preferred camera first, then the other, then the fallback scene
  startCamera(facing)
    .catch(() => startCamera(facing === 'user' ? 'environment' : 'user'))
    .catch(() => updateNote());
}
