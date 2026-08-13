# 03 — Fill-In Replaces Transparency (Phase C)

*Half a day. Goal: the dead ring stops being dark see-through smoke and
becomes what a scotoma actually is — an absence the brain papers over. The
flashes live inside it and cannot be localised.*

Depends on Phase B's combined `survival` mask.

## In plain terms

The transparency concept ("the blind region lets some scene through") is
wrong, per the user's own report and the literature. Scotomas are not
perceived as dark or smoky objects in the scene: patients pick "blurred
patches" and "missing patches", never black tunnels (Crabb 2013), because
the brain **fills in** the hole with a fabricated continuation of the
surround — texture, colour, motion (Ramachandran & Gregory 1991). Regions
are either seeing (real scene, degraded per Phase D) or blind (filled-in
nothing). "Partial" vision is carried by the *spatial patchiness* of Phase
B's islands, not by alpha-blending.

The sighted-viewer paradox (00-context) applies here in full: perfect
fill-in is invisible, so the default keeps a washed-out low-contrast fill —
Crabb's most-chosen image — with faithfulness recoverable via the slider.

## C1. Remove the murk path (`shader.frag`)

```
[ ] Delete the uSeeThru murky see-through blend (warp/murky/seeThru block)
[ ] Delete the uSeeThru uniform end-to-end (shader, renderer, controls)
```

## C2. The fill-in field

```
[ ] Replace the dark smoke colours with a fill-in sample of the scene:
      [ ] wide multi-tap Poisson blur of uTex (radius ~0.15–0.25 of screen)
      [ ] contrast flattened toward the local mean
      [ ] slightly desaturated
[ ] Keep a subtle slow churn (existing fbm swirl, much lower amplitude) so
    the fill isn't a frozen smear — the percept is nondescript, not static
```

**Intent.** "You can't point at where the hole is" — the fill must read as
*continuation*, not as an object. Dark values are the one thing it must
never produce.

## C3. Slider rename: transparency → fill-in vividness

```
[ ] config.js DEFAULTS: transparency → fillIn (0 = washed-out blur patch,
    1 = near-perfect fill)
[ ] controls.js + menu label + any help text updated
[ ] Default chosen for communication (visible loss), noted in config comment
```

## C4. Confine the photopsias to the scotoma

```
[ ] netGlow *= (1.0 - survival) — flashes only in the dead ring/patches,
    NEVER over preserved islands (matches "I can't see where the flashes
    are": they arise from dead retina, floating in the filled-in zone)
[ ] ringGlow hugs BOTH boundaries: inner-island edge and the inner edges of
    the outer islands (band off the combined survival gradient, or two bands)
[ ] SAFETY caps re-verified after both changes
```

## GATE C (by-eye)

```
[ ] Nothing in the dead ring reads as "dark smoke object"; it reads as
    absence/continuation
[ ] Flashes never appear over seeing regions (centre or islands)
[ ] Split view still communicates the loss to a sighted viewer at default
    fill-in
[ ] User judges it closer to their experience than the transparency version
```
