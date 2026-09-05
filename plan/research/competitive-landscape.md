# Research — Competitive Landscape: Shareable Vision-Loss Simulators

*Gathered 2026-09-05 (two web-research agents; liveness test-fetched same day).
Question: who else ships a convenient, shareable simulator a layperson can use
on phone/desktop to understand RP? Feeds the product-horizon section of
00-context.md.*

## Headline

The space looks crowded but is a **graveyard**. The best-known entries are
dead, broken, or frozen; what survives renders RP as a black vignette with a
severity slider. **No live product combines live camera + WebGL + phone
browser + RP focus + shareable URL** — a GitHub search for "retinitis
pigmentosa simulator" returns exactly one repo: this one. `[factual-source]`
(store listings + test fetches, 2026-09-05)

## The dead and the dying

- **See Now "Sight Simulator"** (Street View + filters, the famous campaign
  microsite, ~2017) — DNS dead. Never had RP.
- **Janssen Vision Simulator** — the one polished web sim covering XLRP;
  decommissioned with the gene-therapy program (both domains DNS-dead).
- **Novartis ViaOpta Simulator** (12 conditions incl. RP, live camera) —
  pulled from both app stores.
- **Braille Institute VisionSim** — canonical iOS app, last updated 2019,
  reviews say broken on modern iOS.
- **Aira Vision Sim** (14 conditions incl. RP) — frozen 2019. Its RP-user
  reviews *complain about missing photopsias/phenomena* — market evidence
  for the fidelity gap. `[factual-source]`
- **Thru My Eyes** (ProQR) — decaying with its sponsor's exit from
  ophthalmology. An LCA patient reviewer called it inaccurate.
- **NoCoffee** — pulled from Chrome Web Store 2021; Firefox port lingers.
- Pattern: charity/pharma funding cycles kill these tools routinely. A
  near-zero-hosting-cost web app has a structural longevity advantage.
  `[my-synthesis]`

## Live competitors (the actual set)

| Product | Delivery | RP treatment | Threat |
|---|---|---|---|
| **RNIB Eyeware + Eyeware Lite** (Zappar, Nov 2024, Postcode Lottery funded) — https://eyeware.arweb.app | iOS/Android app + **no-install mobile WebAR URL** | 10 conditions incl. RP — **verified by user hands-on 2026-09-05: tunnel with severity levels, same black-vignette treatment as everyone else** `[measured]` | **The incumbent to watch** — only other no-install browser link; institutional legitimacy. Delivery overlaps; fidelity does not |
| **Visions** (Fondation Asile des Aveugles, updated May 2025) | iOS/Android app | RP via decomposed symptoms (field, glare, acuity) | Maintained but tiny footprint |
| **Tengo Baja Visión** (Spanish assoc.) | iOS/Android + VR app | Symptom-composed; **only competitor attempting night blindness** | Niche, ES-centric |
| **Specialty Vision** hub | Static web scenes + sliders | 14-stage retinal module; RP as "ring then tunnel" — most anatomically informed live rendering | Per-practice embed, not viral |
| **BioniChaos VisionSim** | Web canvas + webcam | Glaucoma-style centre-locked vignette; gaze is roadmap-only | Rough indie demo |
| **Phoropter** (Leventhal) | Web + camera + WebGL (github.io) | CVD filters only; dormant since 2022 | Architecture twin, abandoned |
| **NEI "See What I See"** | App, pre-rendered VR scenes | **No RP** | — |
| Static galleries (ACBVI, Discovery Eye), CSS a11y overlays (e-vision, BarrierBreak), extensions (Funkify, Polypane) | Web | Pre-rendered images / page overlays | Prior art only |

## Fidelity frontier (non-web, research-grade)

- **VIP-Sim** (UIST 2025, https://github.com/Max-Raed/VIP-Sim, CC BY 4.0) —
  21 symptoms, **participatory design with 7 visually impaired people**,
  webcam gaze-contingent — but a Unity desktop overlay app, no web demo.
  Academically validates the interview-programme direction. `[peer-reviewed]`
- **OpenVisSim / VARID** — see vision-sim-libraries.md.
- arXiv:2312.02812 questions validity of naive black-tunnel simulation —
  aligns with Crabb 2013 and this project's fill-in thesis. `[peer-reviewed]`
  (unread beyond abstract — verify before citing further)

## Gaps nobody live occupies (candid)

1. **Perceptually honest RP** — fill-in instead of black, photopsias,
   islands, night blindness as a package. Nothing found attempts fill-in.
2. **Gaze/pointer-contingent field loss on a live camera feed in a browser**
   — shipped nowhere on the web.
3. **Video-upload input** — absent everywhere (Phase V already ships this).
4. **Desktop browser** — Eyeware Lite is mobile-WebAR-oriented.

## Honest counterweights

- The graveyard says the hard problem is **distribution and maintenance**,
  not rendering. Campaign microsites spike and die.
- RNIB Eyeware is fresh, funded, browser-capable, includes RP — it could
  close the delivery gap; the defensible ground is fidelity (#1) + desktop +
  video, not "web-based" alone.
- Institution-backed apps hold the legitimacy mindshare; a personal project
  competes on friction and honesty.

## Cheapest check — DONE

User opened **https://eyeware.arweb.app** on a phone (2026-09-05) and ran its
RP mode: **a tunnel with severity levels** — the standard black-vignette
treatment. Gap #1 (perceptually honest RP) is confirmed open against the
strongest live incumbent. `[measured]` (user, by eye)
