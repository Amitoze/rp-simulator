// Panel UI, background sources (camera / local video), and shared state.

import { DEFAULTS, VIDEO, FIELD, QUALIA, GAZE, PANEL, REFERENCE_PRESET } from './config.js';
// cycle-safe: restitch/setReference are top-level function
// declarations in renderer.js, only called from event handlers anyway
import { restitch, setReference } from './renderer.js';
// same pattern: hoisted declarations, called from event handlers
import { applyPreset, exportPreset, materialise } from './presets.js';

export const state = {
  hasCam: false,      // camera stream is live
  mirror: false,      // mirror the camera image (front camera only)
  videoMode: false,   // a video file as the background (vs the camera)
  videoSource: 'stock', // which video plays in video mode — 'stock'
                        // today; 'local' | 'url' join in V2–V4
  splitMode: false,   // comparison view (side-by-side / stacked)
  refName: 'reference', // the reference pane's loaded preset, for the note
  gazeTarget: [0, 0], // where the eye is being pointed (screen fractions
                      // from centre); written by gaze input, eased and
                      // consumed by the frame loop — one pair of eyes
  repositionMode: false, // Option+Shift held: placing the glance panel
                         // (field-only view + boundary highlight)
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
  const bg = state.videoMode
    ? (state.videoSource === 'local' ? `video: ${localName}`
      : state.videoSource === 'url' ? `video: ${remoteHost}`
      : VIDEO.stock.credit)
    : (state.hasCam ? 'live camera' : 'no camera — showing sample scene');
  note.textContent = bg + ' · simulated RP visual field' +
    (state.splitMode ? ` · comparison (left/top: ${state.refName})` : '');
  const flip = document.getElementById('camFlip');
  flip.hidden = state.videoMode || !state.hasCam;
}

// --- video sources (Phase V) ----------------------------------------
// Every source funnels into the one <video id="vid"> element, so the
// renderer's texture path is untouched. An object URL pins the picked
// file in memory — revoked on every source switch, never leaked.
let objectUrl = null;
let localName = '';  // the picked file's name, for the note
let remoteHost = ''; // the URL source's host, for the note

// watch-page shapes that can never render client-side (standing
// constraint: cross-origin iframe = zero pixel access; raw stream
// URLs signed + non-CORS — DECISIONS 2026-08-30, option A)
const PAGE_URL = /(^|\.|\/\/)(youtube\.com|youtu\.be|vimeo\.com)/i;

// the seg highlight follows the enum, not the click — so the
// error→revert path repaints it for free; a URL source lights
// neither button (the note names its host instead)
function markSource() {
  document.getElementById('srcStock').classList.toggle('on', state.videoSource === 'stock');
  document.getElementById('srcLocal').classList.toggle('on', state.videoSource === 'local');
}

// V3's drag-drop feeds this same path — one function, two entries
function useLocalVideo(file) {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  localName = file.name;
  state.videoSource = 'local';
  fileVideo.crossOrigin = null; // blob: is same-origin — needs none
  fileVideo.src = objectUrl;
  fileVideo.play(); // muted, so autoplay policy never blocks it
  markSource();
  updateNote();
}

function useStock() {
  if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
  localName = '';
  state.videoSource = 'stock';
  fileVideo.crossOrigin = null; // same-origin — needs none
  fileVideo.src = VIDEO.stock.src;
  fileVideo.play();
  markSource();
  updateNote();
}

function useUrlVideo(raw) {
  const url = raw.trim();
  if (!url) return;
  if (PAGE_URL.test(url)) {
    note.textContent = 'watch-page links can’t be filtered (the page '
      + 'gives no pixel access) — paste a direct video-file URL (.mp4/.webm)';
    return; // refused before any load: current source keeps playing
  }
  let host;
  try { host = new URL(url).host; }
  catch {
    note.textContent = 'that doesn’t parse as a URL — source unchanged';
    return;
  }
  if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
  localName = '';
  remoteHost = host;
  state.videoSource = 'url';
  // order matters: crossorigin BEFORE src — set after, and the fetch
  // has already gone out without CORS, tainting the texture
  fileVideo.crossOrigin = 'anonymous';
  fileVideo.src = url;
  fileVideo.play();
  markSource();
  updateNote();
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
  sliders.degen.value = FIELD.params.degeneration.value;
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
  // optional schema hint → an ⓘ with a CSS tooltip (instant on
  // hover; the native title on the slider is the fallback)
  if (p.hint) {
    const dot = document.createElement('span');
    dot.className = 'tipdot';
    dot.textContent = ' ⓘ';
    dot.dataset.tip = p.hint;
    lab.append(dot);
  }
  const s = document.createElement('input');
  s.type = 'range';
  s.min = p.min;
  s.max = p.max;
  // continuous: any stepped grid would snap defaults like 13 (of 0–90)
  // to a nearby grid point and misreport the schema's true value
  s.step = 'any';
  s.value = index === null ? p.value : p.value[index];
  if (p.hint) s.title = p.hint; // native-tooltip fallback
  // a drag only writes the schema; the frame loop reads it next frame
  s.addEventListener('input', () => {
    if (index === null) p.value = parseFloat(s.value);
    else p.value[index] = parseFloat(s.value);
  });
  parent.append(lab, s);
}

function addParams(parent, params) {
  for (const [pname, p] of Object.entries(params)) {
    // degeneration's UI is the headline General-tab slider — a schema
    // param like any other, but deliberately not duplicated here
    // (DECISIONS 2026-08-20): two live sliders on one value would
    // leave whichever wasn't dragged showing a stale position.
    // noUI params (panel position) have a gesture, not a fader.
    if (pname === 'degeneration' || p.noUI) continue;
    if (Array.isArray(p.value)) {
      // pair-value → two sliders writing one [a, b] param
      addFader(parent, `${p.label} · a`, p, 0);
      addFader(parent, `${p.label} · b`, p, 1);
    } else {
      addFader(parent, p.label, p, null);
    }
  }
}

// One generated toggle-row group (label, on/off switch, faders while
// enabled). Module-level since G3: the Symptoms tab (FIELD + qualia)
// and the General tab's PANEL group (a device, not a symptom — never
// under Adjust Symptoms) share it via the parent argument.
function addGroup(parent, label, entry) {
  const g = document.createElement('div');
  g.className = 'group';
  const row = document.createElement('div');
  row.className = 'qrow';
  const name = document.createElement('span');
  name.textContent = label;
  const btn = document.createElement('button');
  btn.className = 'qtoggle' + (entry.enabled ? ' on' : '');
  btn.setAttribute('aria-label', label);
  btn.setAttribute('aria-pressed', entry.enabled);
  row.append(name, btn);
  g.append(row);
  // zero-param entries are a toggle row and nothing else
  let faders = null;
  if (Object.keys(entry.params).length) {
    faders = document.createElement('div');
    addParams(faders, entry.params);
    faders.hidden = !entry.enabled;
    g.append(faders);
  }
  btn.addEventListener('click', () => {
    entry.enabled = !entry.enabled;
    btn.classList.toggle('on', entry.enabled);
    btn.setAttribute('aria-pressed', entry.enabled);
    if (faders) faders.hidden = !entry.enabled;
    restitch(QUALIA, FIELD, PANEL);
  });
  parent.append(g);
}

// Exported for presets.js: a preset load rewrites the schema, and
// regenerating the whole section from it is the sync — no per-slider
// bookkeeping. Idempotent: clears before building, so every caller
// gets exactly one panel.
export function buildAdvanced() {
  const body = document.getElementById('advBody');
  body.replaceChildren();
  addGroup(body, 'Visual field', FIELD); // listed first, as before
  for (const [qname, quale] of Object.entries(QUALIA))
    addGroup(body, qname[0].toUpperCase() + qname.slice(1), quale);
}

// The aid's group on the General tab. Built once at init — presets
// never touch the panel (outside the envelope, DECISIONS 2026-08-28),
// so unlike buildAdvanced it never needs a rebuild.
function buildPanelGroup() {
  const holder = document.getElementById('panelGroup');
  holder.replaceChildren();
  addGroup(holder, 'Glance panel (AR aid)', PANEL);
}

// --- preset dropdown -------------------------------------------------
// Born from presets/index.json (a browser cannot list a directory);
// each option is labelled from the file's own "name". "Defaults" comes
// first and is COMPUTED — applyPreset({}) resets to the BASELINE
// captured at load — so the default look has no file to drift from
// (DECISIONS 2026-08-28). One-way loader: picking loads; later slider
// drags don't update the selection.
async function initPresets() {
  const sel = document.getElementById('presetSel');
  const refSel = document.getElementById('refSel');
  sel.addEventListener('change', async () => {
    // the ad-hoc entry only labels what the picker loaded — a local
    // file can't be re-fetched, so re-picking it is a no-op
    if (sel.value === '::file') return;
    if (!sel.value) { applyPreset({}); return; }
    try {
      const r = await fetch(`presets/${sel.value}`, { cache: 'no-store' });
      const preset = await r.json();
      applyPreset(preset);
    } catch (e) {
      // a broken file must never half-apply: applyPreset was not
      // reached, so the sim keeps its current state
      console.error(`preset "${sel.value}" failed to load:`, e);
    }
  });
  // reference dropdown: picks what the LEFT/TOP pane shows — an inert
  // materialised config handed to the renderer; the live schema (and
  // the Symptom tab) are never touched from here
  refSel.addEventListener('change', async () => {
    const label = refSel.options[refSel.selectedIndex].textContent;
    try {
      const preset = refSel.value
        ? await (await fetch(`presets/${refSel.value}`, { cache: 'no-store' })).json()
        : {};   // Defaults: materialise of an empty preset = BASELINE
      setReference(materialise(preset));
      state.refName = label;
      updateNote();
    } catch (e) {
      console.error(`reference preset "${refSel.value}" failed to load:`, e);
    }
  });

  const opt = (select, value, label) => {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    select.append(o);
  };
  opt(sel, '', 'Defaults');
  opt(refSel, '', 'Defaults');
  try {
    const files = await (await fetch('presets/index.json', { cache: 'no-store' })).json();
    for (const f of files) {
      const p = await (await fetch(`presets/${f}`, { cache: 'no-store' })).json();
      opt(sel, f, p.name ?? f);
      opt(refSel, f, p.name ?? f);
      // the reference pane boots on REFERENCE_PRESET (renderer main):
      // pre-select it and let the note name it
      if (`presets/${f}` === REFERENCE_PRESET) {
        refSel.value = f;
        state.refName = p.name ?? f;
        updateNote();
      }
    }
  } catch (e) {
    console.error('preset manifest failed to load:', e);
  }

  // save: the tune → save → compare loop closes here (export is
  // required, not polish — DECISIONS 2026-08-19)
  document.getElementById('presetSave').addEventListener('click', () => {
    const name = prompt('Preset name:', 'portrait');
    if (name) exportPreset(name.trim() || 'portrait');
  });

  // ad-hoc load: any preset file, not just the shipped manifest
  const fileIn = document.getElementById('presetFile');
  document.getElementById('presetLoad').addEventListener('click',
    () => fileIn.click());
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0];
    if (!f) return;
    try {
      const preset = JSON.parse(await f.text());
      applyPreset(preset);
      // reflect the load in the dropdown: one reusable ad-hoc entry,
      // labelled from the file's own name (user request 2026-08-28)
      const sel = document.getElementById('presetSel');
      let adhoc = sel.querySelector('option[data-adhoc]');
      if (!adhoc) {
        adhoc = document.createElement('option');
        adhoc.dataset.adhoc = '1';
        adhoc.value = '::file';
        sel.append(adhoc);
      }
      adhoc.textContent = preset.name ?? f.name;
      sel.value = '::file';
    } catch (e) {
      // unreadable must never half-apply: the parse fails before
      // applyPreset is reached, so the sim keeps its current state
      console.error(`preset file "${f.name}" unreadable:`, e);
      note.textContent = 'preset file unreadable — see console';
    }
    fileIn.value = ''; // so re-picking the same file fires again
  });
}

// --- gaze + panel reposition (Phase G) -------------------------------
// RELATIVE input (user spec 2026-08-28): only mouse MOVEMENT while the
// modifier is held steers — the pointer's absolute position is never
// read, so engaging Option cannot yank the eye toward wherever the
// pointer happens to sit. Option = steer the gaze (length-clamped,
// springs back on release). Option+Shift = reposition the glance
// panel: the active program swaps to field-only (every quale masked
// off, panel kept) so pane and field are all that shows while
// placing, the boundary highlight lights up, and deltas write the
// panel's position; releasing either key restores the live schema.
function initGaze() {
  const release = () => {
    if (GAZE.springBack) state.gazeTarget = [0, 0];
  };

  // While Option is held the canvas takes POINTER LOCK: the OS cursor
  // (which would pin at the screen edge and stop reporting movement)
  // disappears, and raw mouse deltas keep flowing at any excursion —
  // the screen boundary is ignored for every modifier gesture (user
  // spec 2026-08-28). Lock is released with the key; Esc also breaks
  // it (browser built-in), which merely degrades to bounded deltas.
  const lockPointer = () => {
    if (!document.pointerLockElement)
      document.getElementById('gl').requestPointerLock()?.catch?.(() => {});
  };
  const unlockPointer = () => {
    if (document.pointerLockElement) document.exitPointerLock();
  };

  // While repositioning, holding the mouse button switches the drag
  // to RESIZE: left = bigger, right = smaller (one width param, so
  // the ratio keeps itself); releasing the button resumes placing.
  // The scroll wheel drives the panel's zoom in the same mode.
  let resizing = false;

  // masked view for reposition mode — derived, never mutating QUALIA:
  // the user's toggles come back untouched on exit
  const maskedQualia = () => Object.fromEntries(Object.entries(QUALIA)
    .map(([qname, quale]) => [qname, { ...quale, enabled: false }]));
  const setReposition = on => {
    if (state.repositionMode === on) return;
    state.repositionMode = on;
    if (!on) {
      resizing = false;
      // a gesture resize wrote the schema behind the size fader's
      // back — regenerate the group so the slider shows the truth
      buildPanelGroup();
    }
    restitch(on ? maskedQualia() : QUALIA, FIELD, PANEL);
  };
  const syncMode = e =>
    setReposition(e.altKey && e.shiftKey && PANEL.enabled);

  addEventListener('keydown', e => {
    syncMode(e);
    if (e.altKey) lockPointer(); // a keydown is gesture enough to lock
  });
  addEventListener('keyup', e => {
    syncMode(e);
    if (e.key === 'Alt') { release(); unlockPointer(); }
  });
  // Cmd-Tab must not strand the eye, the mode, or the lock
  addEventListener('blur', () => { setReposition(false); release(); unlockPointer(); });

  addEventListener('mousedown', () => { if (state.repositionMode) resizing = true; });
  addEventListener('mouseup', () => { resizing = false; });

  // wheel = panel zoom while repositioning (scroll up = zoom in);
  // passive:false so preventDefault can stop the browser's own
  // pinch-zoom/scroll handling of the gesture
  addEventListener('wheel', e => {
    if (!state.repositionMode) return;
    e.preventDefault();
    // Shift is held in this mode, and macOS remaps a shifted wheel's
    // vertical delta onto deltaX — read whichever axis carries it
    const d = e.deltaY !== 0 ? e.deltaY : e.deltaX;
    const z = PANEL.params.zoom;
    z.value = Math.min(z.max, Math.max(z.min,
      z.value - d * GAZE.wheelZoom));
  }, { passive: false });

  addEventListener('mousemove', e => {
    // moving without Option is not a release: the glance holds until
    // the key lifts
    if (!e.altKey) return;
    syncMode(e); // catches Shift changing between key events
    const dx = e.movementX / innerWidth * GAZE.speed;
    const dy = -e.movementY / innerHeight * GAZE.speed; // GL y up
    if (state.repositionMode) {
      // button held = resize (drag LEFT = bigger — user correction
      // 2026-08-28 inverting the first spec); otherwise place
      const p = resizing ? PANEL.params.size : PANEL.params.position;
      if (resizing) {
        p.value = Math.min(p.max, Math.max(p.min, p.value - dx));
      } else {
        p.value[0] = Math.min(p.max, Math.max(p.min, p.value[0] + dx));
        p.value[1] = Math.min(p.max, Math.max(p.min, p.value[1] + dy));
      }
    } else {
      const t = [state.gazeTarget[0] + dx, state.gazeTarget[1] + dy];
      const len = Math.hypot(t[0], t[1]);
      if (len > GAZE.maxExcursion) {
        t[0] *= GAZE.maxExcursion / len;
        t[1] *= GAZE.maxExcursion / len;
      }
      state.gazeTarget = t;
    }
  });
}

export function initControls() {
  initGaze();
  // config owns the stock clip's path (markup carries no src) — the
  // one assignment every later source switch will route back through
  fileVideo.src = VIDEO.stock.src;
  const vidRow = document.getElementById('vidRow');
  bindToggle('bgCam', 'bgVid', v => {
    state.videoMode = v;
    vidRow.hidden = !v; // the source sub-options only mean video mode
    // play/pause happens inside the click handler = a user gesture,
    // so playback is never blocked by autoplay policy
    if (v) fileVideo.play(); else fileVideo.pause();
  });
  // local-file source (V2): the visible button proxies the hidden input
  const vidFile = document.getElementById('vidFile');
  document.getElementById('srcLocal').addEventListener('click', () => vidFile.click());
  vidFile.addEventListener('change', () => {
    if (vidFile.files[0]) useLocalVideo(vidFile.files[0]);
    vidFile.value = ''; // so re-picking the same file fires again
  });
  document.getElementById('srcStock').addEventListener('click', useStock);
  // direct URL (V4): refusal/parse checks live in useUrlVideo
  const vidUrl = document.getElementById('vidUrl');
  document.getElementById('srcUrl').addEventListener('click',
    () => useUrlVideo(vidUrl.value));
  // honest failure: a source that can't decode reverts to stock — the
  // enum resets with it, so the UI can't show "URL" while stock plays.
  // Guarded on stock itself failing: reverting to stock again would
  // loop error→useStock→error forever.
  fileVideo.addEventListener('error', () => {
    if (state.videoSource === 'stock') return;
    const failed = state.videoSource === 'url' ? remoteHost : localName;
    useStock(); // repaints note + seg; the message then overwrites it
    note.textContent = `"${failed}" failed to load (CORS or format) — back to the stock clip`;
  });
  // drag-drop (V3): the whole window is the target, feeding the same
  // load path as the picker. preventDefault on BOTH events, or the
  // browser navigates away to open the file itself.
  addEventListener('dragover', e => e.preventDefault());
  addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return; // e.g. dragged text — nothing to do
    if (!file.type.startsWith('video/')) {
      note.textContent = `"${file.name}" is not a video — source unchanged`;
      return;
    }
    // a dropped video is intent enough: switch to video mode if the
    // camera is up (below-filter call, V3) — via the seg button, so
    // highlight, sub-row, and pause/play stay consistent
    if (!state.videoMode) document.getElementById('bgVid').click();
    useLocalVideo(file);
  });
  // the reference selector only means something in comparison view —
  // shown exactly then (user revision 2026-08-28 of the three-tab
  // spec: reference controls live under View, not in their own tab)
  const refRow = document.getElementById('refRow');
  bindToggle('vwImm', 'vwSbs', v => {
    state.splitMode = v;
    refRow.hidden = !v;
  });

  // menu tabs (user spec 2026-08-28, re-revised in G3): General |
  // Symptoms | AR aid — the aid is a device and gets its own home.
  // Display-only: flipping panes touches no state, never restitches
  const tabs = [['tabGen', 'tabGeneral'], ['tabSym', 'adv'], ['tabAid', 'aid']];
  for (const [btnId, paneId] of tabs) {
    document.getElementById(btnId).addEventListener('click', () => {
      for (const [b, p] of tabs) {
        document.getElementById(b).classList.toggle('on', b === btnId);
        document.getElementById(p).hidden = p !== paneId;
      }
    });
  }

  document.getElementById('panelHead').addEventListener('click', () => {
    const panel = document.getElementById('panel');
    panel.classList.toggle('min');
    panel.querySelector('.chev').textContent =
      panel.classList.contains('min') ? '☰' : 'Done';
  });

  // the General slider is the convenience view onto the schema's
  // degeneration param: drags write the schema (the frame loop reads
  // it next frame, same contract as every generated fader)
  sliders.degen.addEventListener('input', () => {
    FIELD.params.degeneration.value = parseFloat(sliders.degen.value);
  });

  applyDefaults();
  buildAdvanced();
  buildPanelGroup();
  initPresets(); // async: options appear when the manifest arrives

  document.getElementById('camFlip').addEventListener('click', () => {
    const other = facing === 'user' ? 'environment' : 'user';
    startCamera(other).catch(() => startCamera(facing)); // revert on failure
  });

  // preferred camera first, then the other, then the fallback scene
  startCamera(facing)
    .catch(() => startCamera(facing === 'user' ? 'environment' : 'user'))
    .catch(() => updateNote());
}
