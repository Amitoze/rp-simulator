# Research — Open-Source Libraries for Simulating Human Vision

*Gathered 2026-09-05 (web survey via research agents). Question: what open-source
code exists for simulating attention/foveation, true peripheral appearance, and
light-condition-dependent vision (rods/cones), and what is usable from this
project's single-pass WebGL1 pipeline?*

## Headline finding

**There is no drop-in library.** Everything real-time and web-usable is either
(a) a reference model to reimplement in GLSL, or (b) a Python tool used offline
to derive constants and calibration imagery. The architecture this implies —
peer-reviewed model → precomputed constants → own fragment shader — is exactly
the architecture this project already has. `[my-synthesis]` over the survey
below, high confidence.

## 1. Field-loss simulators (the direct competitors / design references)

- **OpenVisSim** (Pete Jones, UCL) — https://github.com/petejonze/OpenVisSim —
  Unity + GLSL-family shaders, GPLv3, **deprecated 2021**. The only
  peer-reviewed open-source gaze-contingent field-loss simulator
  (npj Digital Medicine 2020, https://pmc.ncbi.nlm.nih.gov/articles/PMC7064490/).
  Key idea worth stealing: **clinical perimetry data → per-pixel blur/attenuation
  map sampled as a texture in the fragment shader**. Also implements
  metamorphopsia (spatial warp), filling-in, dynamic noise, nystagmus. The paper
  explicitly notes contrast-sensitivity loss can't be truly simulated on a
  normal display. `[peer-reviewed]`
- **VARID** — https://github.com/VARID-XR/VARID-plugin-ue5 — OpenVisSim's living
  successor: Unreal Engine 5.5 post-process plugin, MPL-2.0, v2 released 2025,
  actively maintained. Simulates RP tunnel vision explicitly, plus glaucoma,
  AMD, cataract, CVD, nystagmus. **Caveat (verified 2026-09-05 by reading
  `VARIDRetinitisPigmentosaPS.usf`): the RP effect is a gaze-centred
  smoothstep fade-to-black circle** — the exact black-tunnel phenomenology
  Crabb 2013 rules out and iteration 1 already surpassed. Useful as plumbing
  reference (per-eye compute-shader Gaussian pyramid, gaze API, MPL-2.0
  licensing), not as RP phenomenology. `[measured]` (read the source)
- **NoCoffee / a11y-goggles** — JS browser extensions using CSS/SVG filters.
  Web-native but ad-hoc (static vignette overlays, no perimetry grounding).
  Prior art only. `[factual-source]`

## 2. Peripheral appearance (→ Phase D)

- **foveate_ogl** — https://github.com/ykotseruba/foveate_ogl — Geisler & Perry
  (1998) acuity-falloff foveation **already written as GLSL 3.30 fragment
  shaders** (GPL-3.0). Most directly portable code found; a short hop to
  WebGL2/WebGL1 idioms. `[peer-reviewed]` model, working code.
- **foveate_blockwise** — https://github.com/ElianMalkin/foveate_blockwise —
  MIT, PyCUDA; real-time (1080p @ 165 Hz). Value is the **human-calibrated
  eccentricity→blur-radius parameterisation** in the paper
  (arXiv:2012.08655). `[peer-reviewed]` (workshop)
- **plenoptic** — https://github.com/plenoptic-org/plenoptic — MIT, PyTorch,
  actively maintained, pyOpenSci peer-reviewed. Metamer synthesis (incl.
  Portilla–Simoncelli textures); the successor tooling to Broderick et al.'s
  foveated-metamers repo. **Offline only** (seconds–minutes per image).
  Use: synthesize ground-truth "what the periphery actually encodes" images,
  then tune D's cheap shader (blur + scramble + desat) until it qualitatively
  matches. `[peer-reviewed]`
- **Rosenholtz TTM / mongrels** — https://github.com/RosenholtzLab/TTM
  (MATLAB code drop, GPL-2.0; minutes–hours per image) and the pre-rendered
  **COCO-Periph** dataset https://github.com/RosenholtzLab/COCOPeriph — the
  crowding evidence base already cited in peripheral-perception.md, now with
  downloadable output imagery to calibrate against without running MATLAB.
  `[peer-reviewed]`
- Verdict: **no one runs crowding/metamer synthesis real-time in a browser.**
  Phase D's plan (blur + position scramble + desaturation, calibrated by eye)
  is the correct practical compromise; the offline tools upgrade "by eye"
  to "by eye against a mongrel". `[my-synthesis]`

## 3. Light adaptation / rods vs cones (night blindness — not yet in any phase)

- **colour-science** (Python) — https://github.com/colour-science/colour —
  BSD-3, very active. Provides the constants a shader needs: Stockman–Sharpe
  cone fundamentals, scotopic V′(λ), `sd_mesopic_luminous_efficiency_function`,
  chromatic adaptation transforms. Use offline to bake an RGB→(L,M,S,rod)
  matrix and mesopic blend curves into config.js. `[factual-source]` (CIE data)
- **Kirk & O'Brien 2011** (ACM TOG) — canonical peer-reviewed Purkinje-shift /
  rod-intrusion model, built on **Cao et al. 2008** rod-contribution data.
  Reference GIMP-plugin source (GPL, unmaintained):
  https://www.ocf.berkeley.edu/~yglee/gimp/Welcome.html. Reduces to per-pixel
  matrix algebra once matrices are fixed → LUT or straight shader math.
  Working WebGL references exist on Shadertoy (ft3Sz7, lXy3DW — CC BY-NC-SA,
  reimplement from the papers rather than copy). `[peer-reviewed]`
- **Pattanaik et al. 2000 time-dependent adaptation** — implemented in
  `pfstmo_pattanaik00` (pfstools, GPL). Separate rod/cone adaptation levels
  with temporal dynamics — a handful of per-frame exponential-filter ODEs,
  ideal as JS-side uniforms. Directly relevant: RP night blindness is largely
  a *dynamics* failure (slow, incomplete dark adaptation). `[peer-reviewed]`
- **Stellarium `StelToneReproducer`** — smallest credible reference (a few
  hundred lines of scalar math: Larson scotopic formula + Jensen et al. night
  blue-shift), GPL, battle-tested nightly in a planetarium. `[factual-source]`
- Retinal-circuit simulators — **ISETBio** (MATLAB, MIT, active), Virtual
  Retina / **Convis** (PyTorch, GPL), COREM — output neural activity, not
  images. Wrong tool for a rendering pipeline; ISETBio usable as ground truth
  for rod/cone weighting at a given luminance. OpenCV's `bioinspired` retina
  module models luminance/contrast adaptation (parvo/magno) but not rod/cone
  spectra, and isn't in stock opencv.js. `[my-synthesis]`

## 4. Attention / fovea placement

- Current approach (pointer-driven gaze, Phase G) is the standard one;
  **WebGazer.js** (webcam gaze) is the browser upgrade path — FF1 territory.
- For auto-placing gaze on stock video: **spectral residual saliency**
  (Hou & Zhang 2007) via opencv.js is the only realistic in-browser option;
  **DeepGaze II/III** (https://github.com/matthias-k/DeepGaze, PyTorch,
  peer-reviewed, maintained) works as an offline Python pre-pass producing a
  gaze track baked alongside the stock video. `[my-synthesis]`

## Licensing note

foveate_ogl, OpenVisSim, TTM, pfstools, Stellarium, Kirk–O'Brien plugin are
all GPL-family; Shadertoy defaults to CC BY-NC-SA. **Reimplement from the
papers rather than copying shader code** unless GPL is acceptable for this
repo. MIT/BSD assets: plenoptic, foveate_blockwise, colour-science, ISETBio.
VARID is MPL-2.0 (file-level copyleft — safe to read, port ideas freely).

## Cheapest checks

- Mesopic tooling exists as claimed:
  `pip install colour-science` →
  `python -c "import colour; print(colour.sd_mesopic_luminous_efficiency_function(0.2))"`
- foveate_ogl really is GLSL: browse
  https://github.com/ykotseruba/foveate_ogl/tree/master/shaders
- OpenVisSim effect list: skim the npj Digital Medicine paper's Table/Fig list
  at https://pmc.ncbi.nlm.nih.gov/articles/PMC7064490/
