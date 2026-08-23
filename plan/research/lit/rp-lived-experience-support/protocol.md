# Lit-map protocol — rp-lived-experience-support

Status: RATIFIED (user, 2026-08-21) — RQ5 kept over challenge
Genre: scoping + multivocal review (PRISMA-ScR-lite); grey literature
included and appraised separately (AACODS); rapid-review shortcuts
declared below. NOT a systematic review.

## Kept frame (verbatim, dossier §1, ratified 2026-08-21)

> Adults with partial vision who are losing more of it (RP, mid-journey)
> fail to prepare for central vision loss — not for lack of information or
> permission, but because adaptation has no guided, emotionally manageable
> path: the material is disjointed, the starting point unclear, the
> learning curve steep, and deferral is always locally rational while
> residual central vision still suffices.

Source: `plan/dossiers/rp-lived-experience-support.md` §1.
Open evidence requests inherited from §1 (§2 not yet written):
- (a) Would diagnosis-era support measurably change mid-journey
  preparedness? (weld-watch, parked belief)
- (b) "Services skew toward total blindness" — needs evidence beyond one
  person's experience.

## Review questions

**RQ1 — Lived experience of the gradient (SPIDER, qualitative).**
S: adults with RP or comparable progressive retinal conditions, partial
vision, losing more. PI: living with and anticipating further vision
loss. D: qualitative studies, surveys with open components. E: how
people experience preparation for further loss — what blocks it
(overwhelm, unclear starting point, learning-curve steepness, rational
deferral, denial). R: qualitative / mixed.
*Trace:* the frame's core clause ("fail to prepare … deferral is always
locally rational") and its blocker list.

**RQ2 — Anticipatory adaptation and its timing (PEO).**
P: adults with partial vision from progressive conditions. E:
anticipatory rehabilitation — learning skills (cane, braille, screen
reader, non-visual techniques) *before* the vision that necessitates
them is gone; staged/graded adaptation programs. O: uptake, drop-out,
timing effects (pre-loss vs post-loss training), adjustment outcomes.
*Trace:* "adaptation has no guided … path" + the deferral clause (does
earlier training actually pay off, or is deferral rational globally
too?).

**RQ3 — Diagnosis-era support → later preparedness (PEO).**
P: people diagnosed with progressive vision loss (incl. teens +
families — diagnosis often precedes adulthood). E: support at/near
diagnosis (counselling, genetic counselling, information, peer
contact). O: later adjustment, preparedness, service uptake.
*Trace:* open evidence request (a), verbatim from §1's weld-watch.

**RQ4 — Service orientation vs the progressive-partial population
(mapping question).**
P: low-vision / blindness service systems (AU, UK, US, comparable). E:
service design and eligibility. O: documented fit or misfit to people
with progressive partial vision — unmet-need studies, utilisation
studies, service-model critiques.
*Trace:* open evidence request (b).

**RQ5 — Peer support in progressive vision loss (SPIDER). ⚠ challenged
below.**
S: adults with progressive vision loss. PI: peer support — structured
(mentoring, cohort programs) vs unstructured (online groups). D: any.
E: role in adaptation, what structure adds. R: qual + quant.
*Trace:* rival frame B's absorbed residue ("peers who've walked the
path are essential; community as a necessary property of any answer").
**Challenge (per pass rule):** this traces to a property of *answers*,
not to the problem statement — it borders on solution research, which
is a declared non-goal. Kept in the draft because evidence on what
makes an adaptation path "emotionally manageable" likely lives in the
peer-support literature; drop it if you read it as solution design.

**RQ6 — Challenges of the central-vision-loss transition itself
(mapping question, PEO).**
P: adults with RP entering or undergoing loss of central vision (the
transition from peripheral-loss-with-usable-centre to central
involvement). E: progression of central vision loss. O: the documented
challenges and impacts — reading, face recognition, employment,
independence, mobility change, mental health, identity — ideally with
some signal of relative significance (prevalence, severity, patient-
reported priority). *Trace:* the frame's object, "prepare for central
vision loss" — this maps what is actually being prepared *for*, so the
gap map (Pass 4) can show where support for the transition is thinnest.
(Added at user request, 2026-08-21, pre-ratification.)

## Candidate research domains

- Low-vision rehabilitation / vision science (JVIB, Optometry & Vision
  Science, ophthalmic rehab) — **known**.
- Health psychology: adjustment to chronic illness and acquired
  disability; anticipatory coping/grief; denial as coping — **known**.
- Qualitative health research on RP / inherited retinal disease lived
  experience — **known** (a small but real literature exists).
- Genetic counselling / diagnosis-disclosure literature — **guess**
  (for RQ3).
- Disability studies: liminality, passing, disclosure, "in-between"
  identities — **guess** (context for RQ1; sibling-2-adjacent, watch
  scope).
- HCI / accessibility (ASSETS, CHI): technology adoption during
  progressive vision loss — **guess**.

Pass 2 corrects this list; corrections get dated.

## Inclusion / exclusion criteria (proposed — tunables flagged)

**Include:** peer-reviewed empirical studies (any design), systematic/
scoping reviews, theses; grey: sector-organisation reports and practice
guidelines (Vision Australia, Guide Dogs, RNIB, AFB, Retina
International / FFB), accessibility conference papers. English only
(shortcut). Population: adults (RQ1/RQ2/RQ5) with *progressive* vision
loss; RQ3 admits child/teen diagnosis cohorts and families; RQ4 admits
service-level studies.

**Exclude, with logged reasons:** medical/gene-therapy treatment
literature without psychosocial or rehabilitation outcomes; congenital
stable blindness and sudden traumatic loss populations (comparators at
most); single-person blogs and forum/social posts (not individually
appraisable — their absence from the map is itself recordable).

**T1 — AMD and other progressive conditions (ADOPTED, user,
2026-08-21):** include progressive-condition literature (AMD,
Stargardt, cone-rod) with an explicit transferability flag on each
borrowed finding (AMD skews to older adults).

**T2 — date bounds (ADOPTED, user, 2026-08-21):** ≥1995 for service/
intervention/technology literature (service configurations and AT go
stale); no lower bound for adjustment-psychology and qualitative-
experience work (durable).

**T3 — community-produced grey sources (ADOPTED, user, 2026-08-21):**
exclude individual blog/forum/social posts (not individually
appraisable); admit *curated* community resources (e.g. an
org-maintained guide) under AACODS with caution default.

**Amendment 2026-08-21 (post spot-check, user):** braille-focused
studies are deprioritised — braille orientation reflects
total-blindness adaptation, outside the partial-vision frame. RQ2's
skill list should be read as cane / screen reader / non-visual
technique first; braille sources may inform timing questions only,
never carry a load-bearing claim alone.

## Draft search strings (run in Pass 2 — see search-log.md)

- RQ1 (OpenAlex/S2): `"retinitis pigmentosa" AND ("lived experience" OR
  qualitative OR coping OR adjustment OR psychosocial)`; variant with
  `"inherited retinal"`.
- RQ1/RQ2 (PubMed): `("Retinitis Pigmentosa"[Mesh] OR "inherited
  retinal disease") AND ("Adaptation, Psychological"[Mesh] OR
  "Social Adjustment"[Mesh] OR coping)`.
- RQ2: `(anticipat* OR prepar* OR "pre-emptive") AND (rehabilitation OR
  training OR braille OR "orientation and mobility") AND ("vision loss"
  OR "visual impairment" OR "low vision") AND (progressive OR
  deteriorat*)`.
- RQ3: `("genetic counseling" OR diagnosis OR "diagnostic disclosure")
  AND ("retinitis pigmentosa" OR "inherited retinal") AND (psychosocial
  OR support OR adjustment)`.
- RQ4: `("low vision service" OR "vision rehabilitation service") AND
  (access OR utilization OR utilisation OR "unmet need" OR referral)`.
- RQ5: `("peer support" OR "support group" OR mentor*) AND ("vision
  loss" OR "visual impairment") AND (progressive OR adjustment OR
  adaptation)`.
- RQ6: `"retinitis pigmentosa" AND ("central vision" OR "visual
  acuity" OR macular) AND ("quality of life" OR impact OR challenge*
  OR difficult*)`; variant via patient-reported-outcome literature:
  `("retinitis pigmentosa" OR "inherited retinal") AND ("NEI-VFQ" OR
  "patient-reported" OR "vision-related quality of life")`.
- Grey sweep: site-targeted web searches of the sector orgs above +
  ASSETS/CHI via OpenAlex venue filters.

Snowballing: citation-chase (backward + forward via OpenAlex) on
included sources, logged as rounds in search-log.md.

## Declared shortcuts (SKILL.md rule 4, verbatim)

> single (Claude) reviewer mitigated by user spot-check of a ~20%
> screening sample [peer-reviewed: solo screening misses ~13% vs ~3%
> dual]; no institutional database access (open APIs + web only);
> protocol states both.

Plus: English-only; scope changes after ratification become dated
amendments, never silent edits.

## Ratification

- [x] User ratified protocol (date: 2026-08-21; RQ5 kept over the
  recorded challenge; T1–T3 adopted as proposed; RQ6 added
  pre-ratification at user request).
