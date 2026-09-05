# RP Visual Field Simulator — Context

**Status:** Iteration 2 — the messy donut
**Last updated:** 2026-09-05

This file is the high-level context: what the project is, the decisions
already made, and the cross-cutting rules. The numbered files in this folder
are the task breakdown:

| File | Phase | Time | Status |
|---|---|---|---|
| [01-foundation.md](01-foundation.md) | A — landing page, WebGL sim, camera/video, mobile, config | — | ✅ done 2026-08-13 (built 2026-08-12/13, pre-plan) |
| [02-donut-field.md](02-donut-field.md) | B — messy-donut field geometry | 0.5 day | ✅ done 2026-08-18 (gate passed by eye) |
| [06-qualia-refactor.md](06-qualia-refactor.md) | Q — qualia refactor: toggleable qualia + toggleable field, preset files, per-pane configs | 1–1.5 days | ✅ **COMPLETE 2026-08-28** — Q1–Q5 all gated by eye, desktop + phone (Q5: per-pane rendering, field toggle, envelope v2; the none≠unfiltered ⚠ dissolved via field-off) |
| [phases/g-glance.md](phases/g-glance.md) | G — gaze simulation + AR glance panel (queue-jumped ahead of C/D, user's call — DECISIONS 2026-08-28) | 1–1.5 days | merged 2026-08-28, G1/G3/G4 gated by eye; **G2 (touch gaze) + G5 (formal gate incl. SAFETY by-eye) PARKED** — gate not formally passed, user's call |
| [phases/v-video-sources.md](phases/v-video-sources.md) | V — video sources: stock default / local file (picker + drag-drop) / direct media URL (queue-jumped ahead of C, user's call — DECISIONS 2026-08-30) | 0.5 day | ✅ done 2026-09-05 — V1–V4 built, gate passed by eye, desktop + phone |
| [03-fill-in.md](03-fill-in.md) | C — fill-in replaces transparency; photopsias confined to the scotoma | 0.5 day | **next up** |
| [04-peripheral-rendering.md](04-peripheral-rendering.md) | D — how the preserved outer islands look | 0.5–1 day | |
| [05-fast-follow.md](05-fast-follow.md) | Register of work deferred off the critical path | deferred | FF1–FF6 registered |

Phases run in order — Q modularises the shader before C and D add to it;
C depends on B's survival mask, D renders into regions B defines (C and D
land as new qualia chunks under Q's structure). Research notes live in [research/](research/) — one file per
question, with citations (first one:
[research/peripheral-perception.md](research/peripheral-perception.md), the
iteration-2 evidence base).

## The whole arc, in plain terms

Iteration 1 shipped a **tunnel**: a surviving central island, everything
beyond it smoke + flashes. Iteration 2 corrects the geometry and the
phenomenology to match both the lived experience and the literature:

- **B fixes the shape** — vision survives in the centre *and* in messy
  islands at the far edge; the dead zone is a ragged ring between them, not
  everything-beyond-a-radius.
- **C fixes what "blind" looks like** — not dark, not semi-transparent: the
  brain fills the hole with a nondescript continuation of the surround. The
  flashes live inside the dead ring and can't be localised.
- **D fixes what the surviving edges look like** — far-peripheral vision is
  not crisp; it is blurred, position-scrambled, colour-weak, but excellent at
  motion. The preserved islands must look like *peripheral* vision, not
  holes punched through to full acuity.

## What this is (and is not)

A **portrait, not an average, and not a medical model**. It represents one
person's RP from a first-person description, checked against the clinical
literature where it exists (README has the iteration-1 citations; the plan
files carry iteration-2's). Where the person's experience diverges from the
published surveys, the simulation stays faithful to the person.

**The sighted-viewer paradox**, named once so it isn't re-litigated: honest
filling-in is *invisible* — the whole point is that the person doesn't see
the hole. A simulator that renders it perfectly communicates nothing. So
defaults keep the loss slightly legible (washed-out low-contrast fill, the
split comparison view), and faithfulness is recoverable via config.

## Beyond the portrait — product horizon (noted 2026-08-18)

Not on any phase's critical path, and deliberately not in the fast-follow
register (it is a direction, not an evaluated build item). Recorded here
so it can shape architecture choices as they arise — Phase Q's presets
and per-pane configs, and FF6's island-seed editor, all point this way.

**The direction:** expand the app into a general-purpose companion for
someone diagnosed with retinitis pigmentosa, or with a family member
diagnosed. The simulator becomes one component — communicating the
experience to sighted family — surrounded by support and orientation
content shaped by what people with RP say they actually needed.

**Interview programme, two cohorts**, to ground that content:

1. **People with RP, post-diagnosis:** what supports they were given,
   what supports their *family* was given, and what they wished they had
   more support with.
2. **People with RP who have lost functional central vision:** what that
   experience was like, what was the most difficult to adjust to, and
   what they wished they had more help with.

The interviews feed both the product (what to build beyond the sim) and
the portraits themselves — other people's experiences becoming qualia
presets, at which point FF6 stops being polish and becomes load-bearing.

## Architecture decisions already made

| Layer | Choice | Reasoning |
|---|---|---|
| Rendering | **Single-pass WebGL1 fragment shader**, one fullscreen triangle | Simple, runs everywhere incl. old phones. No FBOs/mipmaps available on the NPOT video texture — blur must be done with in-shader taps (WebGL2 pipeline is FF3, only if taps prove insufficient) |
| Shader loading | Fetched at runtime with `cache: 'no-store'` | python http.server sends no cache headers; a stale shader silently ignores edits |
| Defaults | **Central `config.js`** — `DEFAULTS` + fixed-look blocks | Nothing tunable hardcoded in shader or renderer; Phase B adds a `FIELD` block, same pattern as `NET` |
| Performance | DPR capped (≤2, ×0.75 on touch) | Full retina is wasted through the smoke and runs hot on phones |
| Honesty check | Split comparison view (side-by-side / stacked) | The unfiltered half is what makes the loss legible to a sighted viewer |
| Ground truth | **The user's own visual field** | Every gate is a by-eye judgement by the user; never self-certified |

## Cross-cutting rules

- **Safety caps never regress.** The shader's `SAFETY:` amplitude caps on
  `netGlow` and `ringGlow` are load-bearing (photosensitivity — continuous
  ~9 Hz flashing). Any change touching those paths re-verifies the caps.
- **The user's field is the gate.** Phases B–D each end with the user
  comparing the sim to their own experience. That check cannot be assumed,
  simulated, or skipped.
- **Verify on a phone as well as desktop.** The primary audience is mobile;
  every phase's perf and layout must hold there (tap-count budgets in D).
- **Config, never constants.** Every value someone might tune during the
  by-eye gates goes in `config.js`.
- **Eccentricity mapping is explicit.** A screen subtends ~30–50° of real
  field, but the field geometry needs 0–90°. Convention adopted 2026-08-13:
  **screen edge ≈ 90° eccentricity** in the aspect-corrected `r` space; all
  radii in `FIELD` are stated in those terms (see DECISIONS.md).
