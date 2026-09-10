# AR assistance for RP residual vision — informal field exploration

Date: 2026-09-09. Status: **INFORMAL orientation notes** — deliberately
separate from `plan/research/lit/` (the dossier's verified corpus).
Nothing here feeds the lit map or the dossier without going through
that skill's own protocol.

Method: three parallel web-research agents with a fetch-before-cite
rule. Tags: `[verified-fetch]` = agent fetched a confirming page/record
(URL given); `[uncertain]` = suspected, not confirmed — do not cite.
Ranking weights per brief: Melbourne > AU > rest, crossed with
frontier status (active last ~3 years).

---

## 1 The field map (orientation)

```
          THE IDEA: AR that helps someone with RP-pattern residual
                    vision do day-to-day tasks better
                                   |
    +--------------+---------------+----------------+---------------+
    |              |               |                |               |
  BUILD         GROUND          PROVE            VALUE           REACH
    |              |               |                |               |
 HCI /          Low-vision      Clinical-trial   Health          IRD clinical
 accessibility  rehab +         methodology      economics &     research +
 computing      visual          for functional   disability      sector orgs
 (CHI, UIST,    psychophysics   vision           policy          (registries,
 ASSETS,        (field expan-   (+O&M research)  (cost-of-       charities,
 UbiComp)       sion, contrast                    illness, QALY,  service
    |           enhancement)        |             NDIS)          providers)
    |              |                |                |               |
 gives you:     gives you:      gives you:       gives you:      gives you:
 design         what residual   validated task   dollar value    actual RP
 methods, AR    vision can      courses (MLMT/   of independence patients, the
 prototypes,    actually use;   LDNA), PROs      gained; govt-   ethics +
 user-study     which           (IVI, PIADS),    spend framing   recruitment
 practice with  enhancements    pilot templates                  route in AU
 VI people      help vs annoy
```

**Reading:** the work splits into two ecosystems that barely cite each
other. The HCI venues (CHI/UIST/ASSETS/UbiComp) carry the
cue-highlighting / scene-augmentation frontier, now shifting from lab
studies to multi-day in-the-wild deployments on consumer hardware.
The clinical vision-science venues (Optometry & Vision Science,
TVST/IOVS, Am J Ophthalmol) carry field expansion and mobility
outcomes; prisms remain the only field-expansion approach robust
enough for multisite RCTs. Hot: commodity AR hardware (XREAL, Vision
Pro, Rokid) + phone compute + AI object recognition; selective
per-task cues over whole-scene enhancement; low-light assist. Cooled:
bespoke-hardware startups (OxSight quiet, eSight survived only via
acquisition) and Microsoft's SeeingVR line (ended 2019).
[my-synthesis over agent 1's verified entries]

## 2 Global actors, ranked by similarity × frontier

### Tier 1 — doing almost exactly this, active now

- **Yuhang Zhao — MadAbility Lab, U Wisconsin–Madison.** Single
  closest match. AR that recognizes objects and paints task-specific
  cues onto residual vision: CookAR (kitchen affordances, UIST 2024),
  VisiMark (indoor landmarks, CHI 2025), NavSight (outdoor
  curb/vehicle augmentation, 7-day real-world diary study, n=12 low
  vision, 2026); earlier ForeSee/CueSee/SeeingVR. Explicitly "low
  vision, not blindness", daily tasks, commodity hardware.
  [verified-fetch] https://www.yuhangz.com/projects/ ;
  https://arxiv.org/abs/2608.12759
- **Eli Peli lab — Schepens/Mass Eye and Ear, Harvard.** "Vision
  multiplexing": prism/HMD overlays of shrunken peripheral content
  onto intact central vision for tunnel vision. 20+ years, still
  running NIH trials (NCT06024668); the theory of what you can
  overlay without destroying residual vision comes from here.
  [verified-fetch] https://clinicaltrials.gov/study/NCT06024668
- **Milan/Siena group (Colombo, Rossetti, Tosi).** Consumer XREAL One
  AR glasses + iPhone 15 for RP low-light mobility; 32 genetically
  confirmed RP patients; Am J Ophthalmol 2025/26. Nearly the exact
  thesis — cheap consumer AR + RP-specific software — clinically
  validated. [verified-fetch] https://pubmed.ncbi.nlm.nih.gov/41057106/
- **Retiplus (Plusindes SL, Madrid).** Shipped AR aid (Epson Moverio)
  that remaps camera view into the patient's mapped functional field;
  optometrist-tuned per-activity views; built for RP/glaucoma. 2025
  evaluation, 13 RP patients: ~61% average field increase without
  hurting ambulation safety. [verified-fetch] https://retiplus.com/en/ ;
  https://doi.org/10.3390/photonics12030262
- **Biel Glasses (Barcelona).** CE-marked MR glasses; 3D vision + AI
  detect obstacles/drop-offs and re-render the scene to residual
  vision; peripheral-loss mobility is the core use case. ~€4,900 via
  opticians. [verified-fetch] https://bielglasses.com/
- **ViXion MW10 HiKARI (HOYA spin-off, Tokyo).** Night-vision-assist
  glasses for RP nyctalopia; subsidized as a daily-living welfare
  device by dozens of Japanese local governments — existence proof
  that low-light assist alone carries a product.
  [verified-fetch] https://vixion.jp/concept/?wovn=en

### Tier 2 — very relevant, slightly off-axis

- **Mark Humayun (USC).** HoloLens depth-encoded wireframe overlay; in
  RP patients: collisions −50% mobility, −70% grasp (Sci Rep 2019,
  n=10); patents through 2025, not shipped.
  [verified-fetch] https://pubmed.ncbi.nlm.nih.gov/31375713/
- **Shiri Azenkot (Cornell Tech).** Pioneered cue-highlighting for
  low-vision search (CueSee); now broader XR accessibility.
- **Gang Luo (Schepens).** Phone-first: collision-warning app (−37%
  collisions in real-world trial, NCT03057496), SuperVision+.
- **Monash Assistive Vision group (Gamage, Marriott, Lowery; ASSETS
  2025).** Vision Pro support for cerebral visual impairment —
  same frontier, different impairment. AU-based (see §3).
  [verified-fetch] https://arxiv.org/abs/2506.19210
- **OxSight (Oxford spin-out).** Historically the flagship RP
  smart-glasses company; trading status now unclear [uncertain] —
  cautionary case study.
- **Peter Jones (Crabb Lab, City St George's London).** Gaze-contingent
  sight-loss simulation on HMDs (OpenVisSim, open-source) — directly
  relevant to rp-simulator itself.

### Tier 3 / adjacent (one-liners)

Eyedaptic (AMD, same toolbox inverted), eSight/Gentex (central-loss
incumbent), GiveVision+Sony (UK clinical pipeline, central loss),
Microsoft SeeingVR (open-source toolkit, ended 2019), Michael Beyeler
(UCSB — AI scene simplification for bionic vision; transfers), See Far
(EU H2020, ended). Excluded by scope: Envision, Meta Ray-Ban+Be My
Eyes (audio-first), retinal implants (see §3 for Melbourne's).

**Gap statement:** nobody verified combines RP-specific field mapping
+ low-light assist + daily-task cueing on consumer AR glasses. Milan
and Retiplus are the nearest points — one academic, one clinic-bound.
[my-synthesis]

## 3 Melbourne / Australia ecosystem

**Structural finding:** the AU field splits into
implants-for-end-stage-RP (CERA / Bionic Vision Technologies / Monash
Vision Group), audio-substitution-for-blindness (ARIA Research,
Sydney), and non-clinical accessible-graphics HCI (Monash MATS).
**Visual augmentation of residual vision for peripheral-field loss is
unoccupied in Australia** — it sits in the gap between the CERA
clinical world and the Monash HCI world. [my-synthesis over agent 2]

### Doors to knock on, ranked

1. **Lauren Ayton (UniMelb / CERA).** Best first email: runs the
   VENTURE registry (550+ genotyped Victorian IRD patients, explicitly
   built to recruit for investigator-initiated studies; contact
   IRD@groups.unimelb.edu.au), designed functional-vision outcome
   measures for camera-on-glasses devices in RP, and holds an
   innovation/enterprise mandate. One meeting covers collaborator +
   recruitment + study design.
   [verified-fetch] https://www.cera.org.au/research/venture-study/
2. **Kim Marriott / Matthew Butler — Monash MATS Centre.** Largest AT
   research centre in the southern hemisphere (launched Dec 2024,
   ~100+ researchers); already prototyping smart glasses to simplify
   visual environments; co-design methodology with the BLV community.
   The natural home for the HCI half.
   [verified-fetch] https://research.monash.edu/en/persons/kimbal-marriott/
3. **Retina Australia (Flinders Lane, Melbourne).** National RP
   patient org: ~$60k annual research grants, public IRD trial
   register, 40 years of community legitimacy. Micro-funder +
   recruitment channel + co-design legitimacy.
   [verified-fetch] https://retinaaustralia.com.au/
4. **Penny Allen's bionic eye unit (CERA / Bionics Institute).**
   Has the RP functional-vision test protocols and regulatory/trial
   experience for head-worn vision devices; their pipeline's front
   half (glasses camera + processing) overlaps yours.
5. **Vision Australia (access technology team).** Fastest route from
   prototype to real users at scale; publicly enthusiastic about
   consumer smart glasses (July 2026). Deployment/feedback door, not
   research.

Also: Royal Victorian Eye and Ear Hospital (default clinical site,
co-located with CERA); AIRDR Perth registry (9,000+ registrants,
national backstop) [uncertain on details]; Melbourne Disability
Institute seed grants ($30–35k) [uncertain]; UniMelb Optometry &
Vision Sciences + Melbourne Eyecare Clinic (low-vision recruitment).

**Home-ground fact:** the IVI questionnaire — an internationally used
vision-related QoL instrument — was developed at CERA/Melbourne
(Weih, Hassell, Keeffe, IOVS 2002), as were IVI-VLV and the VisQoL
utility instrument. The outcome-measures expertise for this exact
study lives in this city. [verified-fetch]
https://pubmed.ncbi.nlm.nih.gov/11923230/

## 4 How to prove it works (study-design orientation)

### The endpoint toolbox

- **Mobility courses:** MLMT (Multi-Luminance Mobility Test) — the
  FDA-accepted primary endpoint of the Luxturna RP gene-therapy trial;
  standardized obstacle course at nine luminance levels (1–400 lux),
  scored accuracy + speed, unit of improvement = "light levels
  passed". [verified-fetch] https://pubmed.ncbi.nlm.nih.gov/28712537/
  Successors: Ora VNC (FDA-accepted per vendor, RP variant exists);
  LDNA (Ocugen OCU400 phase 3 primary endpoint, 10 lux levels).
  Note: "LDNC" is wrong — the acronym is **LDNA**.
- **Clinical baseline measures (characterize, not outcome):** visual
  fields, FST (full-field stimulus threshold), microperimetry — an AR
  aid won't move these; they stratify participants.
- **PROs:** IVI (32 items, Melbourne-born, participation in daily
  activities); NEI-VFQ-25 (ubiquitous but psychometrically criticized
  for low vision — Pesudovs Rasch critique, PMID 20089878); PIADS (26
  items, predicts device retention/abandonment); ULV-VFQ only if
  end-stage vision included.

### The modal design, from five verified device studies

eSight 3 (n=51 within-subject, baseline → fitted → 3 months home
use); Humayun AR-in-RP (n=10, single-masked, obstacle course + grasp);
Somani RP prisms (n=16, 1-month home pre/post); Bowers/Peli prism RCT
(n=73, **double-masked sham-controlled crossover** — the rigor
ceiling; primary endpoint "wants to continue": 64% vs 36% sham);
OxSight glaucoma trial (n=30, single-group — stalled, a warning).

**Skeleton that beats the field's standard** [my-synthesis over the
five]:

```
baseline characterization (fields, acuity, contrast; FST optional)
        |
randomized-order course runs: device ON / SHAM mode / OFF
at >= 2 light levels, repeated randomized course layouts
(defeats learning; sham = placebo rendering mode — masking IS
feasible, Bowers 2014 proved it for optical aids)
        |
4-12 weeks home use (acute lab gains != daily function —
eSight explicitly separated fitting effects from 3-month effects)
        |
IVI + PIADS + "want to continue?" + resource-use diary
(care hours, services used — feeds the economics, see §5)
```

### Australian pathway (brief)

HREC ethics approval required for any clinical trial; TGA CTN scheme
only if the device counts as an "unapproved therapeutic good" —
whether an AR prototype is a medical device vs consumer tech is a
judgement to put to HREC/TGA early [my-synthesis on classification];
ANZCTR registration is standard and separate. [verified-fetch]
https://www.tga.gov.au/products/unapproved-therapeutic-goods/access-pathways/clinical-trials/clinical-trial-notification-ctn-scheme

## 5 The economic case (burden → dollars)

### Verified numbers

- **Australia, all vision loss:** $16.6B/yr, ≈$29,000/person over 40
  (Clear Focus, Access Economics 2010, 2009 data); updated to
  **$27.6B/yr, $46,950/person** (HealthConsult 2021 re-indexing, in
  Vision 2020 Australia's 2022-23 pre-budget submission).
  [verified-fetch] https://treasury.gov.au/sites/default/files/2022-03/258735_vision_2020_australia.pdf
- **Australia, IRD-specific (Schofield, MJA 2023):** lifetime cost
  **$5.2M per person with an IRD**; **87% societal / 13% healthcare**;
  biggest components: own lost income $1.4M, carer/spouse lost income
  $1.1M, government social spending excl. NDIS $1.0M. Total annual
  IRD cost to Australia **$781M–$1.56B**. [verified-fetch]
  https://www.mja.com.au/journal/2023/219/2/health-care-and-societal-costs-inherited-retinal-diseases-australia
- **US/Canada IRD (Deloitte for Retina International/FFB, 2021):**
  US$31.7B + CA$1.6B annually; wellbeing loss ≈ two-thirds.
- **NDIS (visual impairment dashboard, 30 June 2023):** 10,158
  participants; **$380M paid supports**; average **$38,600/participant
  /yr** ($40,200 for working-age adults not in supported independent
  living); Capital category (includes AT) only $13.6M.
  [verified-fetch] https://dataresearch.ndis.gov.au/media/3830/download

### The claim chain and its weak links (plain English)

```
task performance improved  →  QALY gain / support-need reduction  →  dollars saved
        (lab course)              (instruments)                       (budget impact)
             |                        |                                   |
   WEAK: no accepted          WEAK: EQ-5D is blind to           WEAK: burden is 87%
   conversion from course     vision gains [verified:           societal (income,
   scores to QALYs — MLMT     PMID 24339893]; vision-           care, wellbeing) —
   won by regulatory          specific VisQoL fixes it          modeled, not measured;
   acceptance, not            but HTA bodies prefer             and NDIS is an
   monetization               EQ-5D (one trial: 25x             entitlement — less
                              ICER spread between the           need != less spend
                              two instruments)
```

**Strongest practical path** [my-synthesis]: run the §4 skeleton with
VisQoL AND EQ-5D-5L in parallel plus a resource-use diary; that
dataset plugs directly into the Schofield/MJA cost structure for an
Australian budget-impact model. Melbourne advantage again: IVI,
IVI-VLV, and VisQoL were all built at CERA/UniMelb.

## 6 Do-not-cite-yet list (aggregated)

OxSight's current status and any peer-reviewed OxSight efficacy paper;
Stephen Hicks' current role; IrisVision as going concern; Vision Pro
low-vision clinical studies (commentary only); Clear Focus internal
component breakdown (original PDF 404s); "LDNC" (only LDNA exists);
VisQoL→AQoL-7D lineage; NDIS AT-specific vision spend (Capital $13.6M
is closest proxy); ~$50K/QALY AU threshold (commonly cited, not
verified); ANZCTR smart-glasses trials (JS interface blocked agent —
search manually at anzctr.org.au); Monash Vision Group current status;
UK EY/Retina UK cost study (not checked).

## 7 Relationship to the dossier (scoping note)

This exploration serves the **AR-assistance idea** — a solution
direction that is NOT the dossier's kept frame and not formally
framed anywhere yet. If it hardens into a real pursuit, the honest
sequence is /frame (its own dossier) → /lit-map (its own verified
corpus); this file then becomes leads, not evidence.
