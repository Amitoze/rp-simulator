# 05 — Fast-Follow / Deferred Work

A single register of work consciously deferred off the critical path. Each
entry states what it is, why it was deferred, and the concrete trigger that
should pull it back. These are evaluated ideas, not someday-maybes.

## Register

| # | Item | From | Why deferred | Revisit when |
|---|---|---|---|---|
| FF1 | Gaze-contingent rendering (webcam eye tracking, e.g. WebGazer) | iter-2 research | The "fixate the centre" instruction + baked-in degradation is the right scope now; eye tracking adds latency, calibration, privacy questions | The foveal-viewing caveat proves to be the thing viewers trip over |
| FF2 | RP-specific overlay on ALL preserved vision: contrast-sensitivity loss + night blindness / dimming | Phase D note | Clinically defensible but citations not yet verified (start with Kenneth Alexander's contrast-sensitivity studies) | Before building: verify the literature; build when the user wants the surviving field itself to feel RP-affected, not just smaller |
| FF3 | WebGL2 pipeline: per-frame `generateMipmap` + `textureLod` blur | Phase D | In-shader Poisson taps are cheaper to build and likely sufficient at capped DPR | D1's tap blur shimmers visibly or blows the phone perf budget |
| FF4 | Frame-difference motion boost in the islands (periphery as motion detector, actively amplified) | Phase D | Needs a previous-frame FBO — a pipeline change for a subtle gain | FF3 lands (FBOs exist anyway), or Gate D shows motion salience is too weak |
| FF5 | Opponent-space desaturation — red-green degrades faster than blue-yellow/luminance (Hansen 2009) | Phase D | `mix(gray, color, k)` is 90% of the effect for 10% of the code | Gate D's by-eye check says island colour feels wrong in kind, not just amount |
| FF6 | Island-seed editor — interactive UI to tune `FIELD.islandSeed` / island geography to the user's own field | Phase B | Config-file editing is enough for one user; UI is polish | A second person with RP wants their portrait, or seed-hunting via config edits becomes tedious |

## FF1. Gaze-contingent rendering

**What it is.** Track the viewer's gaze with the webcam and move the field
mask with it, so the simulated field is anchored to the *eye* rather than
the screen — the academically standard way to simulate scotomas.

**Evaluation.** The only way to defeat the foveal-viewing caveat (viewers
foveate the "peripheral" islands). But webcam gaze estimates are coarse
(~2–4° at best, worse on phones), latency makes the mask swim, and camera
permission is already used for the background. High cost, and the baked-in
degradation of Phase D covers most of the communicative value.

**Revisit when:** demo feedback shows viewers "cheating" by inspecting the
islands directly and not getting it.

## FF2. RP overlay on surviving vision

**What it is.** Even the "good" central field in RP has reduced contrast
sensitivity, glare susceptibility, and severe night blindness. A global
contrast/dimming control applied to all preserved vision (centre included).

**Evaluation.** Real and defensible, but unverified here — flagged in the
iter-2 review as "say the word and I'll verify before building". Do the
literature check first (Alexander et al. on contrast sensitivity in RP);
the build itself is trivial once the numbers are in hand.

**Revisit when:** the user wants iteration 3 to touch the surviving field.

## FF3–FF5. Deferred rendering upgrades

All three are quality ratchets on Phase D, deferred for the same reason:
the cheap version ships first, the by-eye gate decides whether the
expensive version earns its place. FF3 unlocks FF4 (both need the render
pipeline to grow an FBO); FF5 is a colour-space refinement inside D3's
existing mix.

## FF6. Island-seed editor

**What it is.** `FIELD.islandSeed` gives every seed value a different
personal geography of preserved islands (Phase B). This item is a small UI
— scrub the seed, nudge island positions — so a person can match the sim to
their own field without editing config.

**Evaluation.** The portrait-not-average principle, extended to other
people. Worthless until someone other than the author needs it; then it is
the single highest-value feature in the project.
