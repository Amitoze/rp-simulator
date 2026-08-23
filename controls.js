// Panel UI, background sources (camera / local video), and shared state.

import { DEFAULTS, FIELD, QUALIA } from './config.js';
// cycle-safe: restitch is a top-level function declaration in
// renderer.js, and it's only called from event handlers anyway
import { restitch } from './renderer.js';

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
  // insecure origins (plain http on a LAN IP) don't just deny the
  // camera — navigator.mediaDevices is absent entirely, and asking it
  // for the camera throws synchronously past the .catch chains. Report
  // it the same way as a denied camera so the fallback scene runs.
  if (!navigator.mediaDevices)
    return Promise.reject(new Error('camera API unavailable (insecure context)'));
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
  if (DEFAULTS.background === 'video') document.getElementById('bgVid').click();
  if (DEFAULTS.view === 'sideBySide') document.getElementById('vwSbs').click();
  if (DEFAULTS.menuCollapsed) document.getElementById('panelHead').click();
}

// --- generated "Adjust symptoms" section ----------------------------
// Born from the schema: FIELD's faders first (tier 1 — configurable,
// never toggleable), then one toggle row per quale, its faders shown
// only while enabled. No per-quale UI code — add a param to the schema
// and its fader appears.

function addFader(parent, label, p, index) {
  const lab = document.createElement('label');
  lab.textContent = label;
  const s = document.createElement('input');
  s.type = 'range';
  s.min = p.min;
  s.max = p.max;
  // continuous: any stepped grid would snap defaults like 13 (of 0–90)
  // to a nearby grid point and misreport the schema's true value
  s.step = 'any';
  s.value = index === null ? p.value : p.value[index];
  // a drag only writes the schema; the frame loop reads it next frame
  s.addEventListener('input', () => {
    if (index === null) p.value = parseFloat(s.value);
    else p.value[index] = parseFloat(s.value);
  });
  parent.append(lab, s);
}

function addParams(parent, params) {
  for (const p of Object.values(params)) {
    if (Array.isArray(p.value)) {
      // pair-value → two sliders writing one [a, b] param
      addFader(parent, `${p.label} · a`, p, 0);
      addFader(parent, `${p.label} · b`, p, 1);
    } else {
      addFader(parent, p.label, p, null);
    }
  }
}

function buildAdvanced() {
  const body = document.getElementById('advBody');

  const fg = document.createElement('div');
  fg.className = 'group';
  const fh = document.createElement('div');
  fh.className = 'ghead';
  fh.textContent = 'Visual field';
  fg.append(fh);
  addParams(fg, FIELD);
  body.append(fg);

  for (const [qname, quale] of Object.entries(QUALIA)) {
    const g = document.createElement('div');
    g.className = 'group';
    const row = document.createElement('div');
    row.className = 'qrow';
    const name = document.createElement('span');
    name.textContent = qname[0].toUpperCase() + qname.slice(1);
    const btn = document.createElement('button');
    btn.className = 'qtoggle' + (quale.enabled ? ' on' : '');
    btn.setAttribute('aria-label', name.textContent);
    btn.setAttribute('aria-pressed', quale.enabled);
    row.append(name, btn);
    g.append(row);
    // zero-param qualia are a toggle row and nothing else
    let faders = null;
    if (Object.keys(quale.params).length) {
      faders = document.createElement('div');
      addParams(faders, quale.params);
      faders.hidden = !quale.enabled;
      g.append(faders);
    }
    btn.addEventListener('click', () => {
      quale.enabled = !quale.enabled;
      btn.classList.toggle('on', quale.enabled);
      btn.setAttribute('aria-pressed', quale.enabled);
      if (faders) faders.hidden = !quale.enabled;
      restitch(QUALIA);
    });
    body.append(g);
  }
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
  buildAdvanced();

  document.getElementById('camFlip').addEventListener('click', () => {
    const other = facing === 'user' ? 'environment' : 'user';
    startCamera(other).catch(() => startCamera(facing)); // revert on failure
  });

  // preferred camera first, then the other, then the fallback scene
  startCamera(facing)
    .catch(() => startCamera(facing === 'user' ? 'environment' : 'user'))
    .catch(() => updateNote());
}
