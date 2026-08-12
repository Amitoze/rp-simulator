// Panel UI, background sources (camera / local video), and shared state.

export const state = {
  hasCam: false,      // camera stream is live
  videoMode: false,   // self-hosted video file as the background
  splitMode: false,   // side-by-side comparison view
};

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
    (state.splitMode ? ' · left: normal vision, right: RP' : '');
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
      panel.classList.contains('min') ? '+' : '−';
  });

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      return video.play();
    })
    .then(() => { state.hasCam = true; updateNote(); })
    .catch(() => { updateNote(); });
}
