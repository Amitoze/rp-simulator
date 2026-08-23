# Search log — rp-lived-experience-support

Pass 2 executed 2026-08-21 against the ratified protocol (2026-08-21).
Sources: OpenAlex (title_and_abstract.search, language:en, relevance-
ranked), PubMed E-utilities (relevance-sorted), WebSearch for grey.
All API responses cached in session scratchpad; every query below is
re-runnable verbatim (idempotent helper: `oa.py`).

**Declared screening shortcuts (rapid-review, dated 2026-08-21):**
- Title/abstract screening applied to the relevance-ranked top-N of
  each query (N recorded per query), not to full hit lists. Beyond
  top-N, relevance ranking degraded to noise in every sampled query.
- Exclusions are logged at group level per query with reason codes;
  items that were plausible-but-excluded, and ALL borderlines, get
  individual lines. Group members are re-derivable by re-running the
  logged query.
- Snowballing stopped after round 2 (round 2 was already mostly
  re-surfacing round-1 material; adds noted below).
- Compound booleans in OpenAlex parsed loosely (verified on query Q1:
  top hits matched none of the OR terms), so Q1 was superseded by
  narrow phrase queries Q2–Q5. Q1's screened rows are still logged.

**Exclusion reason codes:**
- `OUT-a` clinical/genetic/treatment focus, no psychosocial, rehab,
  service, or QoL outcome
- `OUT-b` population mismatch (non-progressive loss, pediatric/
  education setting, carriers, unrelated condition)
- `OUT-c` off-topic noise match
- `OUT-d` inadmissible type (dataset, letter, editorial, duplicate
  record, announcement)
- `OUT-e` duplicate of an already-screened record
- `OUT-f` topic outside the RQs (reproductive-testing attitudes,
  screening-programme implementation detail, instrument psychometrics
  only, etc.)

## Round 1 — database queries (all run 2026-08-21)

| # | Source | Query (filters) | Hits | Screened |
|---|--------|-----------------|-----:|---------:|
| Q1 | OpenAlex | "retinitis pigmentosa" AND (lived experience OR qualitative OR coping OR adjustment OR psychosocial) | 335 | 25 |
| Q2 | OpenAlex | "retinitis pigmentosa" "lived experience" | 9 | 9 |
| Q3 | OpenAlex | "retinitis pigmentosa" "coping" | 25 | 19 |
| Q4 | OpenAlex | "retinitis pigmentosa" "psychosocial" | 31 | 19 |
| Q5 | OpenAlex | "inherited retinal" "lived experience" | 8 | 8 |
| Q6 | OpenAlex | "vision loss" "anticipatory" (≥1995) | 11 | 11 |
| Q7 | OpenAlex | "progressive vision loss" "preparation" (≥1995) | 9 | 9 |
| Q8 | OpenAlex | "progressive vision loss" "rehabilitation" (≥1995) | 27 | 14 |
| Q9 | OpenAlex | "deteriorating vision" "training" (≥1995) | 4 | 4 |
| Q10 | OpenAlex | "low vision rehabilitation" "timing" (≥1995) | 4 | 4 |
| Q11 | OpenAlex | "low vision services" "unmet" (≥1995) | 10 | 10 |
| Q12 | OpenAlex | "vision rehabilitation" "referral" "barriers" (≥1995) | 47 | 11 |
| Q13 | OpenAlex | "low vision service" "utilization" (≥1995) | 40 | 11 |
| Q14 | OpenAlex | "peer support" "visual impairment" | 49 | 11 |
| Q15 | OpenAlex | "support group" "vision loss" | 37 | 11 |
| Q16 | OpenAlex | "retinitis pigmentosa" "quality of life" "central vision" | 16 | 11 |
| Q17 | OpenAlex | "retinitis pigmentosa" "patient-reported" | 101 | 11 |
| Q18 | PubMed | RP[Mesh] AND (Adaptation, Psychological[Mesh] OR qualitative research[Mesh] OR QoL[Mesh]) NOT (gene therapy[ti] OR mutation[ti]) | 108 | 15 |
| Q19 | PubMed | (RP[Mesh] OR IRD) AND (Genetic Counseling[Mesh] OR diagnostic odyssey OR diagnosis disclosure) AND (psychosocial OR experience OR support) | 29 | 15 |
| Q20 | PubMed | (low vision rehabilitation OR vision rehabilitation) AND (timing OR early OR delay*) AND (progressive OR deteriorat*) | 25 | 15 |
| Q21 | OpenAlex | "transition" "print to braille" | 6 | 6 |
| Q22 | OpenAlex | "orientation and mobility" "retinitis pigmentosa" | 36 | 9 |
| Q23 | OpenAlex | "adjustment" "acquired vision loss" | 7 | 7 |
| Q24 | OpenAlex | "retinitis pigmentosa" "visual function questionnaire" | 50 | 11 |
| Q25 | OpenAlex | "braille" "progressive" (≥1995) | 51 | 9 |
| Q26 | OpenAlex | "retinitis pigmentosa" "genetic counseling" | 302 | 14 |
| Q27 | OpenAlex | "inherited retinal" "diagnosis" "support" | 157 | 14 |
| Q28 | OpenAlex | "retinitis pigmentosa" "diagnosis" "experience" | 100 | 14 |
| Q29 | OpenAlex | "mental health support" "sight loss pathway" (verification of web-found item) | 1 | 1 |

Group exclusions (reason applies to every screened row of the query
not individually listed as include/borderline below): Q1 OUT-a (bulk:
clinical RP epidemiology/imaging/genetics); Q6 OUT-c (all 11 — the
term "anticipatory" does not co-occur with vision-loss preparation in
indexed literature; null result, feeds RQ2 gap); Q7 OUT-c except
Fundelius (BL); Q8 OUT-a/c except listed; Q9 OUT-c (all 4);
Q12/Q13 remainder OUT-f (developing-world service surveys off-RQ4-
geography kept OUT-b: Ghana, Nigeria ×3); Q14/Q15 remainder OUT-b/c;
Q16/Q17 remainder OUT-a (surgical/prosthesis/stem-cell trials);
Q18 remainder OUT-b (Bardet-Biedl/Alström/cochlear) and OUT-a;
Q19 remainder OUT-a (molecular diagnostics); Q20 OUT-c (all 15 —
stroke rehab, AMD clinical; second null for RQ2 timing);
Q21 remainder OUT-b (school-age education context);
Q22 remainder OUT-a (prosthesis O&M endpoints); Q24 remainder OUT-a
(trial endpoints using VFQ); Q25 OUT-c except Truan (see Q21 vein);
Q26 OUT-a (all 14 — molecular genetics; genetic-counseling
*experience* literature reached via Q19/Q27/Q28 instead);
Q27 remainder OUT-a; Q28 remainder OUT-a/e.

Individually logged exclusions (plausible but out):
- W2952626132 Hoffman-Andrews 2019 gene-editing attitudes — OUT-f
- W1912393455/PMID:26126503 Ahmed 2015 prenatal testing attitudes — OUT-f
- W2007485407 2013 "To perpetuate blindness!" testing attitudes — OUT-f
- W4283818537 2022 reproductive options attitudes — OUT-f
- W3189906663 2021 genomic unsolicited findings — OUT-f
- W2079514455 Kef 2004 adolescents parental/peer support — OUT-b
- W3108378619 Tuttle 2020 peer support for students — OUT-b
- W2883548430 Mwangi 2018 peer support for DR screening uptake — OUT-f
- W4392888722 Gocuk 2024 female carriers symptoms — OUT-b
- W2426558434 Gordon 2008 Toronto LVS (letter) — OUT-d
- W2031824541 Ryan 2008 NEI-VFQ7 Rasch — OUT-f (psychometrics only)
- W2071589675 Whitson 2011 comorbidity in LVR (geriatric) — OUT-f
- W2997529808/W3080995598 Nollett 2019/2020 + W1793954245 Rees 2012
  depression-screening implementation — OUT-f
- W2135776025 2013 disability/social-support mediation, general low
  vision — OUT-f (covered by included reviews)
- W1987080606 / W1999473782 Bittner photopsias-stress/field-health
  correlations — OUT-a (fluctuation theme carried by W2061488782)
- W4381158329 2023 cancer-diagnosis phenomenology — OUT-b
- W4392559259 2024 UK public attitudes to VI — OUT-f (sibling-2 scope:
  legibility dossier, not this frame)

## Included sources (title/abstract stage; deduplicated)

Legend: RQs served; [T1] = transferability flag (non-RP progressive or
broad-VI population); (g) = grey, AACODS appraisal due in Pass 3.
Verification state: all OpenAlex/PubMed items below are API-verified
records (rule-1 compliant); read-depth tagging happens at extraction.

**RQ1 — lived experience / blockers of preparation (24)**
1. W2578863234 Prem Senthil 2017, Eye — RP lived experiences (also RQ6)
2. W1982027290 Fourie 2007, Br J Vis Impair — qualitative self-study RP
3. W2968766491 Garip 2019, BMC Ophthalmol — SR+meta-synthesis coping RP
4. W4408734060 Ng 2025, Disabil Health J — qual SR, IRD lived experience
5. W4408076987 Ng 2025, Disabil Health J — IPA working-age IRD Singapore
6. W4407989820 Bakir 2025, Disabil Health J — hidden disability, early-stage IRD
7. W4409953404 Ng 2025, J Community Genet — Reddit thematic analysis RP
8. W2061488782 Bittner 2010, Optometry — coping w/ stress + fluctuations
9. W2787275493 Anil 2018, BMC Ophthalmol — coping strategies survey
10. W2212627298 Latham 2015, PLoS ONE — emotional health in RP-VI
11. W2132005186 Jangra 2007, Ophthalmic Genet — psychosocial adjustment RP
12. W2035288993 Kim 2013, Optom Vis Sci — mental health RP
13. W2160260694 Hayeems 2005, Br J Ophthalmol — adjustment model, progressive loss (also RQ2/RQ3)
14. W2009694934 2010 — emotional impact of sight loss + counselling needs (also RQ4/RQ5)
15. W2167316384 2010 — socio-emotional transition sight→blindness (also RQ6)
16. W1944204354 2015 — identity concealment at work, degenerative eye conditions
17. W1986475192 2015, Ophthalmology — psychologic adjustment to irreversible vision loss (review) [T1]
18. W1995261163 2013, Br J Vis Impair — grief-process model revised [T1]
19. W2029865175 Nyman 2011, Disabil Rehabil — meta-synthesis, adjustment later life [T1] (also RQ5)
20. W3006525517 2020, Surv Ophthalmol — psychosocial impacts of Mendelian eye conditions SR
21. W4283156377 Cross 2022, Clin Ophthalmol — RP burden + unmet needs (also RQ4/RQ6)
22. W4288046217 Kherani 2022, Can J Ophthalmol — IRD impact mixed-methods
23. W2161409708 2014 — "They think they know what's best for me" IPA (independence) [T1]
24. W2180031158 2015 — working-age coping qualitative (UK ex-service) [T1]
Also: W2979224922 Bednarski 1998 JVIB coping survey; W2109278165
Adhami-Moghadam 2014 psych disorders RP; W4296446098 2022 narrative
medicine IRD; W2555892775 2016 driving behaviour, degenerative eye
conditions; W3111419613 2020 living w/ Stargardt [T1]; PMID:30974979
Arcous 2020 Usher QoL scoping [T1].

**RQ2 — anticipatory adaptation & timing (8 + 2 null results)**
25. W225315009 Geruschat 2002, JVIB — RP research → O&M practice
26. W2032871860 Herse 2005, Clin Exp Optom — RP multidisciplinary management
27. W268612280 Truan 1997, JVIB — braille skill vs adjustment during progressive loss (case studies)
28. W1910786347 2015, Technol Disabil — cane use, late-onset VI
29. W2146143780 Chacón-López 2013 — visual training + emotional state RP
30. W2073681930 2011 — clinical & rehabilitative management RP
31. W4297222260 Gothwal 2022, Ophthalmic Physiol Opt — LV device abandonment
32. W4404812934 Aminparvin 2024 — follow-up in LVR scoping review (also RQ4)
Also: W3164161508 Norman 2021 echolocation training [T1].
Null results (recorded): Q6 and Q20 — no indexed literature found on
*anticipatory* skill acquisition timing in progressive vision loss.

**RQ3 — diagnosis-era support (10)**
33. W4284693850 Krauss 2022, Ophthalmic Genet — genetic testing experiences RP
34. W4415938902 Melhuish 2025, J Genet Couns — factors in testing experience IRD
35. W2003670528 Combs 2013, Br J Ophthalmol — patient expectations IRD
36. W2034934184 2013, Eur J Hum Genet — impact of genetic testing IRD
37. W2069671562 2014 — genetics information needs, adults with IRD
38. W2914856908 2019 — genomic testing psychosocial + service-delivery impact IRD
39. W2096627254 2013 — understanding/attitudes genetic testing IRD
40. W4385418592 Murro 2023, Orphanet J Rare Dis — multidisciplinary diagnosis→initial care
41. PMID:7120328 Bundey 1982, J Med Genet — patients' wishes re counselling (historic anchor)
42. PMID:35106875 Inaba 2022, J Genet Couns — genetic testing perceptions Japan
Also: W3020971007 2020 Usher I patients+parents [T1]; PMID:37530443
Alabek 2023 genetic-counselor workforce IRD clinics (also RQ4).

**RQ4 — service orientation vs progressive-partial population (15)**
43. W1973481653 Overbury 2011, IOVS — Montreal Barriers Study
44. W1568132834 Matti 2010, Clin Exp Optom — access barriers/enablers LVR
45. W4317605791 Stolwijk 2023, BMC Health Serv Res — referral pathways qual
46. W2081657425 O'Connor 2008 — access/utilization of new LVR service
47. W3185021576 Khimani 2021, J Ophthalmol — barriers in multidisciplinary practice
48. W2051776427 Wittich 2013, Can J Ophthalmol — continuum-of-care barriers
49. W2143102706 Adam 2007 — "Where are all the clients?" referral
50. W2765553997 Fontenot 2017, Ophthalmology — Vision Rehab Preferred Practice Pattern
51. W2055528435 2011 — long-term access to support, sight loss
52. W2132723275 Nyman 2010, Br J Ophthalmol — counselling provision UK
53. W2037108599 2012, Arch Ophthalmol — health services utilization + cost RP
54. W3109961591 2020 — VI & mental health: unmet needs review [T1]
55. W2008003517 2013 — emotional support & counselling service role
56. W4315489475 Trott 2023, Eye — mental health support across sight-loss pathway (ECLOs)
57. W1754134529 Ryan 2010 — Welsh primary-care LVS access
Also: W113524459 Casten 2005 AMD knowledge/use of LVS [T1].

**RQ5 — peer support (4)**
58. W3033136399 Van Zandt 1994, JVIB — support groups, adjustment [T1]
59. W3033436180 McCulloh 1994, JVIB — structured group midlife/older [T1]
60. W4399970735 Botha 2024, Rehabil Psychol — peer support discourse analysis
61. W3010421208 Galler 1981, JVIB — long-term group, elderly low vision [T1]
(Plus RQ5 duty carried by Nyman 2011 (#19) and W2009694934 (#14).)

**RQ6 — challenges of central-vision-loss transition (20)**
62. W2159834561 Hahm 2008, Br J Ophthalmol — depression + VRQoL RP
63. W2591047105 Chaumet-Riffaud 2017, Am J Ophthalmol — QoL/mental health/employment young adults
64. W1989074613 Sugawara 2009, Eye — peripheral field loss vs VRQoL
65. W2044275562 Sugawara 2011, Jpn J Ophthalmol — macular sensitivity vs VRQoL
66. W2799757981 Sainohira 2018, PLoS ONE — anxiety/depression factors RP
67. W2562934411 Latham 2016, Optom Vis Sci — relative difficulty of daily tasks RP
68. W2083227742 Latham 2015, IOVS — activity-inventory goals RP + supporters
69. W4390448493 Karuntu 2023, Acta Ophthalmol — MRDQ vs visual function
70. W3112003390 2020, Am J Ophthalmol — Michigan Vision-Related Anxiety Questionnaire
71. W3120423789 2021, J Patient-Rep Outcomes — VRQoL severe peripheral loss qual
72. W2095002501 1997 — daily-activity difficulty vs visual function RP
73. W3022780576 Green 2020, Adv Ther — RLBP1 RP PRO qualitative
74. PMID:38718781 Humphries 2024, Ophthalmic Res — QoL analysis RP
75. PMID:36947329 Watanabe 2023, Adv Ther — QoL + economic impact RP Japan
76. W4410118582 Zehe-Lindau 2025, J Clin Med — patient-reported social impact RP
77. W4406135062 Parmeggiani 2025, Eye — EXPLORE XLRP-2 PROs
78. W3174091004 Chivers 2021 — XLRP burden narrative review
79. PMID:37625511 Ehrlich 2023, Am J Ophthalmol — LV-SCOPE questionnaire
80. PMID:39312049 Sugawara 2024, Jpn J Ophthalmol — visual ADL survey RP
81. W4384664179 2023 — visual function impairments/ADL impacts IRD qual
Also: W2778968503 Prem Senthil 2017, J Patient-Rep Outcomes — QoL
issues retinal diseases; W4304202693 2022 Beyond NEI-VFQ (instrument
landscape); W2567830491 2017 PRO SR retinal diseases; W2744294155 2017
fatigue in VI qual [T1]; W3009621895 Galvin 2020 IRD cost-of-illness
ROI/UK; W2110... (econ set continued under borderlines).

**Grey (verified this pass)**
G1. RNIB, *My Voice 2015* — 1,200-interview survey (g). Verified via
    SEAPN mirror 2026-08-21; full PDF fetch due in Pass 3.
G2. RNIB, *Voice of the Customer: Emotional Impact of Sight Loss*
    (2024) — 402-person survey (g). Verified via AOP news 2026-08-21
    (74% no emotional-support signposting; 26% waited >1yr for rehab).
G3. Simarasl 2012 (W627733807) — RP challenges Iran/Sweden, university
    archive (g).

**Grey candidates NOT yet verifiable (RNIB site serves JS shells /
404 to fetcher) — carried to Pass 3 with PDF-hunt, NOT citable until
fetched:** Sight Loss Pathway final report; Early reach research; Eye
care support pathway insight report. Null grey result: Vision
Australia / Guide Dogs sweep found service pages only, no research
reports (recorded; aligns with dossier's "services skew" claim but is
absence-of-evidence, not evidence).

## BORDERLINE (user call at spot-check; not yet in/out)

B1. W3008135444 Martiniello 2019 — adult braille-training barriers;
    conference abstract only (RQ2 — on-point but thin type)
B2. W4412973891 Fundelius 2025 — "Surviving & Thriving with
    Progressive Vision Loss" (vision-professional autoethnography)
B3. W2971038510 2019 + B4. W3112418835 2020 — Usher 2 deafblindness
    lived experience/work (dual-sensory confound) [T1]
B5. W2989643680 2019 — parenting a son with X-linked retinoschisis
    (RQ3-family; non-RP) [T1]
B6. W891512644 Sussman-Skalka 2003 — support groups for *partners*
B7. W3016861377 Heppe 2020 — loneliness, young adults VI, longitudinal
B8. W2762224934 Stanimirović 2014 — peer support identity crisis
    (venue quality unclear)
B9. W2038348058 Heckenlively 1988 — RP common symptoms (clinical
    symptom survey as RQ6 challenge-map input)
B10. W1970212100 2008 — low vision & well-being, 10 countries [T1]
B11. W1972452567 Bittner 2011 — vision-test variability + psychosocial
     factors; B12. W2324015353 Bittner 2009 photopsias survey;
     B13. W2038161517 Rozanski 2014 behavioral medicine + field
     variability (fluctuation-as-challenge cluster)
B14. W4283219341 2022 lifetime income childhood-onset; B15.
     W2064332949 2014 socio-economic characteristics DK; B16.
     W2146307111 2014 health behaviors Korea; B17. W4392296331 2024
     IRD cost-of-illness SR (economic-burden cluster: in via RQ6
     "significance" or out as OUT-f?)
B18. W2789027559 Crudden 2017 — transportation stress survey [T1]
B19. W2312668273 2016 — safety perceptions/hazards qual [T1]

## Round 2 — snowballing (2026-08-21)

| Round | Seed | Direction | Pool | Screened | New candidates |
|-------|------|-----------|-----:|---------:|----------------|
| S1 | Garip 2019 (W2968766491) | backward | 42 | 42 | Hayeems dup, W2167316384, W2009694934, W1944204354, W2055528435, W1970212100, W2744294155, W1986475192 vein |
| S1 | Ng 2025 SR (W4408734060) | backward | 44 | 44 | W2096627254, W2069671562, W2914856908, W3111419613, W3020971007, W2095002501, W4384664179, econ cluster |
| S1 | Hayeems 2005 (W2160260694) | forward | 66 | 15 | W1986475192, W1995261163, W1910786347, W2034934184, W2037108599, W3006525517 |
| S1 | Prem Senthil 2017 (W2578863234) | forward | 68 | 15 | W2778968503, W3120423789, W3112003390, W4304202693, W4296446098, W2567830491 |
| S2 | W1944204354 | forward | 21 | 12 | W2555892775, W4392559259 (OUT-f) |
| S2 | W2167316384 | forward | 61 | 12 | W3109961591, W2008003517, W2161409708, W2180031158, W2312668273 (BL) |

Closure: S2 yielded 5 adds vs S1's ~20, with heavy re-surfacing of
S1 material; stopped per declared shortcut. Backward S2 on new adds
deferred — reopen only if Pass 3 extraction exposes a thin RQ.

## Grey sweep queries (WebSearch, 2026-08-21)

| # | Query gist | Outcome |
|---|-----------|---------|
| G-1 | RNIB research: progressive sight loss, emotional support | 4 report candidates + Trott 2023 (verified via Q29) |
| G-2 | Vision Australia / Guide Dogs research reports RP | Null: service pages only |
| G-3 | RNIB My Voice 2015 | Verified via mirror (G1) |
| G-4 | Retina Intl / FFB cost-of-illness, lived experience | Peer-reviewed versions already in net (Galvin 2020; B17) |

## PRISMA-ScR-lite totals

- Records identified: database queries ≈ 1,634 (sum of hits, overlap
  uncounted) + snowball pools 302 + grey candidates 7
- Records screened (title/abstract, relevance-ranked top-N +
  snowball): 467 rows incl. cross-query duplicates
- Excluded at screening: bulk by reason code per query (above);
  individually logged near-misses: 18
- **Included: 81 numbered + 15 "also" entries ≈ 96 academic + 3 grey
  verified; 3 grey pending verification**
- **Borderline (user decision): 19**

## GATE — user spot-check (PASSED, 2026-08-21)

Sample presented 2026-08-21 (chat): all 19 borderlines + 8 includes +
8 exclusions (~20% of non-bulk decisions). Verdicts:

- **Borderlines: ALL 19 DROPPED** (user). New code `OUT-user` applied
  to B1–B19. Consequences accepted knowingly: the economic-burden
  cluster (B14–B17) is out, so RQ6 maps lived/functional challenges,
  not financial burden; the fluctuation cluster (B9, B11–B13) is out,
  so day-to-day variability enters the map only via the coping papers
  that carry it (W2061488782).
- **Sampled includes/exclusions: no disagreements** — criteria held.
- **Recalibration (user): braille-focused studies deprioritised** —
  braille orientation reads as total-blindness adaptation, off the
  partial-vision frame. Re-screen of affected records:
  - Truan 1997 (W268612280) KEPT but tagged `[deprioritised:braille]`
    — retained only as an RQ2 timing data point, never load-bearing
    on its own.
  - Consistency sweep from the B14–B17 drop: Galvin 2020 (W3009621895,
    pure cost-of-illness) moved from include to OUT-f. Watanabe 2023
    (PMID:36947329) and W2037108599 stay — QoL / service-utilization
    primary, economics secondary.
- Revised totals: **included ≈ 95 academic + 3 grey verified** (3 grey
  still pending verification); borderline 0.

Pass 2 exit check satisfied: queries logged with counts, exclusions
reasoned, snowballing to closure, PRISMA totals, dated spot-check.
Nothing extracted or appraised yet → Pass 3.
