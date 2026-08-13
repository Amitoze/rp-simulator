# Research — Field Geometry, Scotoma Phenomenology, Peripheral Perception

*Iteration-2 evidence base, gathered 2026-08-13. This file is the citation
record behind plan files 02–04; the plan files carry the build decisions.*

## 1. RP field geometry — the messy donut (→ Phase B)

- **Grover, Fishman et al., Ophthalmology 1998** — patterns of visual field
  progression in RP. Pattern III: complete or incomplete **mid-peripheral
  ring scotoma** that breaks through into the periphery; end stage of all
  patterns is a residual central field, sometimes with a small peripheral
  island. https://pubmed.ncbi.nlm.nih.gov/9627658/
- **Spatial Characteristics of Peripheral Visual Islands in RP, IOVS 2022**
  — the key quantitative source. Retained peripheral loci cluster between
  the **50° and 80° isoeccentric meridians**; ~30% of 152 subjects had
  central-only islands, **~26% had both central and peripheral islands**
  separated by mid-peripheral scotoma; **inferotemporal** loci were most
  likely to be preserved over ~4.8-year follow-up (mapping to pre-equatorial
  superonasal retina). https://pmc.ncbi.nlm.nih.gov/articles/PMC8857617/
- Mechanistic background: rod density peaks ~20–40° eccentricity, so the
  annulus dies first — the donut is the *expected* mid-course geometry, the
  tunnel only its end state.

## 2. What a scotoma looks like from inside (→ Phase C)

- **Crabb et al., Ophthalmology 2013, "How does glaucoma look?"** — 50
  patients chose images matching their percept: **"blurred patches" and
  "missing patches"; no patient chose black tunnels or black patches**.
  https://pubmed.ncbi.nlm.nih.gov/23415421/
- **Ramachandran & Gregory, Nature 1991** — perceptual filling-in of
  artificial scotomas: the surround's **texture, colour, and motion are
  actively fabricated across the hole** within seconds; colour and texture
  fill in via separate mechanisms.
  https://www.nature.com/articles/350699a0
- Consequence for the sim: blind regions are *absence + fabricated
  continuation*, never a dark or semi-transparent overlay. The retired
  transparency concept is recorded in DECISIONS.md.

## 3. Photopsias (→ Phase C, net confinement)

- **Bittner et al., IOVS** — photopsia location relates to regions of
  vision loss; described as flickering/shimmering lights, TV static,
  flashes. https://iovs.arvojournals.org/article.aspx?articleid=2187599
- **Bittner et al., Eye 2012** — prevalence/character; related in part to
  stress and mood. https://pmc.ncbi.nlm.nih.gov/articles/PMC3259584/
- (Iteration 1's README already carries Bittner 2009/2012 and Menzler &
  Zeck 2011 for the ~10 Hz flicker rate.)
- Consequence: the net lives inside the dead ring — arising from dead
  retina, it is perceptually real but **unlocalisable** ("I can't see where
  the flashes are").

## 4. How the far periphery perceives (→ Phase D)

- **Acuity/cortical magnification** — acuity roughly halves every ~2.5° of
  eccentricity, ~20/200 by 30°. Review: Strasburger, Rentschler & Jüttner,
  *Journal of Vision* 2011, "Peripheral vision and pattern recognition".
- **Crowding / summary statistics** — Bouma's law (critical spacing ≈ 0.5×
  eccentricity); the periphery encodes texture statistics over pooling
  regions growing linearly with eccentricity, so **blur alone is the wrong
  model** — stuff stays sharp, arrangement scrambles.
  - Balas, Nakano & Rosenholtz 2009, JoV:
    https://jov.arvojournals.org/article.aspx?articleid=2122150
  - Rosenholtz lab overview: https://persci.mit.edu/research/visualstatistician/
  - Freeman & Simoncelli 2011 (ventral-stream metamers), Nat. Neurosci.
- **Colour** — Hansen, Pracejus & Gegenfurtner 2009, JoV: chromatic
  discrimination measurable out to 50° but thresholds ~4.5× parafoveal;
  red-green declines fastest. https://pubmed.ncbi.nlm.nih.gov/19757935/
- **Motion/flicker** — temporal sensitivity declines far more slowly than
  acuity; the periphery is functionally a motion detector. (General
  psychophysics consensus; covered in the Strasburger review.)

## 5. Simulation-method caveats

- On-screen sims are viewed **foveally**: degradation must be baked into
  the pixels; gaze-contingent rendering with eye tracking is the academic
  gold standard (→ FF1).
- The sighted-viewer paradox: perfect filling-in is invisible; defaults
  keep the loss slightly legible (→ 00-context, Phase C).

## Unverified leads (do not build on without checking)

- Alexander et al. — contrast sensitivity losses within the surviving RP
  field (→ FF2). Flagged, not yet verified.
