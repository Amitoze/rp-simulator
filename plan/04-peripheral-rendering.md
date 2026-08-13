# 04 — Peripheral Rendering of the Preserved Islands (Phase D)

*Half a day to a day. Goal: the surviving outer islands look like
far-peripheral vision — sharp-ish stuff in scrambled places, weak colour,
excellent motion — not holes punched through to full acuity.*

Depends on Phase B (the islands exist) and C (what surrounds them).

## In plain terms

Even a healthy far periphery is radically unlike central vision, in four
measured ways (citations in
[research/peripheral-perception.md](research/peripheral-perception.md)):

1. **Acuity collapses with eccentricity** — roughly halves every ~2.5°,
   ~20/200 by 30° out. Blur is the right first-order model.
2. **Crowding is the real bottleneck, not blur** — the periphery keeps
   texture statistics but scrambles arrangement (Bouma's ~0.5×eccentricity
   spacing law; Rosenholtz's texture-tiling/mongrels). Blur alone says "I
   need glasses"; blur + position scramble says "something's there, can't
   tell what" — the correct phenomenology.
3. **Colour survives but degrades** (~4.5× worse thresholds at 50°,
   red-green fastest). Mild desaturation, never grayscale.
4. **Motion/flicker sensitivity holds up** — the periphery is functionally a
   motion detector, and that is the practical value of preserved RP islands.
   Degradation must be spatial only; never temporally smooth these regions.

A screen sim is viewed foveally, so all of this must be baked into the
pixels (gaze-contingent rendering is FF1).

## D1. Eccentricity-scaled blur (`shader.frag`)

```
[ ] 9–13-tap jittered Poisson blur of uTex where outer survival wins,
    radius ∝ (r - innerEdge), zero at the island's inner limit
[ ] WebGL1 constraint honoured: in-shader taps, no mipmaps/FBOs
    (WebGL2 LOD pipeline is FF3, only if taps shimmer or cost too much)
```

## D2. Position scramble (crowding)

```
[ ] Offset the sample coordinate by a noise vector, amplitude growing with
    eccentricity (≈0.5× Bouma scaling under the screen-edge≈90° mapping)
[ ] Reuse the existing warp idiom, but spatially coarse and temporally
    static/slow — texture intact, positions wrong
```

## D3. Colour and contrast

```
[ ] Mild desaturation: mix(vec3(gray), color, ~0.6–0.7)
[ ] Contrast compression toward the mean
[ ] (FF5 holds the fancier opponent-space version — red-green first)
```

## D4. Time is left alone

```
[ ] NO temporal averaging or smearing in the islands
[ ] Moving objects remain fully salient there
[ ] (FF4 holds the frame-difference motion BOOST — needs a prev-frame FBO)
```

## D5. Performance

```
[ ] Tap-count budget checked on a phone: blur taps × pixels in islands at
    capped DPR; degrade tap count before degrading resolution
```

## GATE D (by-eye)

```
[ ] An island reads as "something is there, can't tell what" — not as
    clear vision, not as mere blur
[ ] A moving object in an island is noticed immediately
[ ] Colour is weak but present (never grayscale)
[ ] Baseline fps holds on a phone
[ ] User judges the islands against their own outer-periphery experience
```
