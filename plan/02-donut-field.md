# 02 — Messy-Donut Field Geometry (Phase B)

*Half a day. Goal: the dead zone becomes a ragged mid-peripheral ring —
central vision preserved, AND messy islands of vision at the far edge.*

See [research/peripheral-perception.md](research/peripheral-perception.md)
for the full evidence base and citations.

## In plain terms

Iteration 1 modelled a tunnel: one radius, seeing inside, dead outside. The
lived experience — and the classic natural history of RP — is a **donut**:
the rods are densest 20–40° out, so that ring dies first, leaving the centre
*and* the far periphery working, separated by a dead ring that widens both
ways. The far-peripheral survivors are not a clean outer ring but patchy
arcs and blob islands, most durable in the **inferotemporal** field
(lower-outer). Quantitatively: preserved peripheral loci cluster between the
50° and 80° eccentricity rings; ~26% of patients hold both a central island
and peripheral islands at once (IOVS 2022; Grover & Fishman 1998 Pattern III).

## B1. Two-zone survival mask (`shader.frag`)

```
[x] central = 1.0 - smoothstep(innerEdge - w, innerEdge + w, r)
      — exactly the existing mask (uEdgeBase + wobble)
[x] outer = smoothstep(outerEdge - w, outerEdge + w, r) * patchGate
      — vision returns beyond a second, larger radius, where the gate allows
[x] survival = max(central, outer)
[x] outerEdge gets its own boundary wobble (reuse the noise-wobble idiom)
[x] transition band (desaturate + dim) on BOTH boundaries of the dead ring
```

## B2. The patch gate — what makes the donut messy

```
[x] patchGate = smoothstep(threshold - s, threshold + s,
                           fbm(vec2(ang * k, r * m) + islandSeed))
      (built: noise sampled in position space, fbm(centered*3 + seed), to
      avoid the wrap-around seam at the left horizontal)
[x] FIXED seed, NO uTime — islands are places, not weather
[x] Directional bias folded into the threshold: survival more likely in the
    lower-lateral parts of the screen (inferotemporal field; lateral means
    BOTH left and right edges — single binocular view)
```

**Intent.** Real islands are stable on the timescale of a session and have a
personal geography. A drifting gate would read as fog; a seeded static gate
reads as *my* field. `islandSeed` exists so the user can tune the geography
to match their own (FF6 is the interactive version).

## B3. Progression wiring (`renderer.js`)

```
[x] Degeneration slider drives BOTH ends:
      [x] inner island shrinks (existing mapping, now via FIELD.inner)
      [x] patchGate threshold rises + outerEdge pushes outward — outer
          islands erode and vanish
[x] Erosion order: inferotemporal islands die LAST, matching the
    longitudinal data (built with a fixed bias + rising threshold — same
    effect as a slider-scaled bias: biased pixels clear the rising bar
    longest; verified by eye at the gate, 2026-08-18)
```

## B4. Config (`config.js`)

```
[x] FIELD block, same pattern as NET:
      [x] innerRadius        (degrees, per the screen-edge≈90° convention)
                             (built as inner: {mild, late} — value at
                             slider 0 and 1, straight blend between)
      [x] outerRadius        (built as outer: {mild, late}, same pattern)
      [x] outerCoverage      0..1 — how much of the beyond-ring survives
                             (plus erosion: how strongly the slider erodes)
      [x] islandSeed         change it, get a different personal geography
[x] Document the eccentricity convention in a comment
[x] Nothing hardcoded in the shader
```

## GATE B (by-eye, the user's own field is ground truth)

```
[x] The user judges it a better match to their field than iteration 1
    (confirmed 2026-08-18)
[x] Islands feel like stable places across a session (no drift)
    (confirmed 2026-08-18)
[x] Progression slider: centre shrinks AND outer islands erode,
    inferotemporal last (confirmed 2026-08-18)
[x] SAFETY caps unchanged (no new bright area exceeds the existing net/ring
    amplitudes) (verified 2026-08-18: diff from main touches no
    netGlow/ringGlow/SAFETY line)
[x] Runs at baseline fps on a phone (confirmed 2026-08-18)
```
