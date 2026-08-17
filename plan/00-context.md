# RP Visual Field Simulator — Context

**Status:** Iteration 2 — the messy donut
**Last updated:** 2026-08-18

This file is the high-level context: what the project is, the decisions
already made, and the cross-cutting rules. The numbered files in this folder
are the task breakdown:

| File | Phase | Time | Status |
|---|---|---|---|
| [01-foundation.md](01-foundation.md) | A — landing page, WebGL sim, camera/video, mobile, config | — | ✅ done 2026-08-13 (built 2026-08-12/13, pre-plan) |
| [02-donut-field.md](02-donut-field.md) | B — messy-donut field geometry | 0.5 day | ✅ done 2026-08-18 (gate passed by eye) |
| [03-fill-in.md](03-fill-in.md) | C — fill-in replaces transparency; photopsias confined to the scotoma | 0.5 day | **next up** |
| [04-peripheral-rendering.md](04-peripheral-rendering.md) | D — how the preserved outer islands look | 0.5–1 day | |
| [05-fast-follow.md](05-fast-follow.md) | Register of work deferred off the critical path | deferred | FF1–FF6 registered |

Phases run in order — C depends on B's survival mask, D renders into regions
B defines. Research notes live in [research/](research/) — one file per
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
