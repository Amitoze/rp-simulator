// Default values applied when the page first loads.
// Edit this file to change the initial state of the simulator.

export const DEFAULTS = {
  // main slider, 0..1 — tier 1 (field geometry), so it lives here,
  // not in QUALIA. Quale-owned slider defaults live in their schema.
  degeneration: 0.75,   // degeneration of central field

  // 'camera' | 'video'
  background: 'camera',

  // 'immersive' | 'sideBySide'
  view: 'immersive',

  // start with the menu collapsed to the hamburger button?
  menuCollapsed: false,
};

// Geometry of the visual field (no UI sliders — edit here).
// All values marked "deg" are degrees of eccentricity, mapped so the
// screen edge ≈ 90° (see DECISIONS.md). {mild, late} pairs are the value
// at degeneration slider 0 and 1; in between is a straight blend.
export const FIELD = {
  // radius of the surviving central island
  inner: { mild: 81, late: 13 },

  // radius where far-peripheral islands can begin — the dead ring's far
  // side. Widens outward as degeneration advances.
  outer: { mild: 65, late: 85 },

  // 0..1 — how much of the beyond-the-ring field survives when mild
  outerCoverage: 0.65,

  // how strongly the slider erodes the islands (1 = all gone at full)
  erosion: 0.9,

  // picks the personal geography of the islands — any number; change it
  // and every island moves somewhere else. Fixed = islands are places.
  islandSeed: 7.0,
};

// The qualia schema: which qualia are stitched into the shader, and
// every tunable each one owns. Tier 1 (FIELD) is not here and never
// will be: geometry is not a quale and cannot be toggled. All-on at
// these values reproduces the pre-refactor look.
//
// Structure, ranges, and labels live HERE, in code — preset files (Q4)
// may only override values, never structure, ranges, or caps. SAFETY
// amplitude caps are not params: they stay hardcoded in the shader
// chunks (see DECISIONS.md 2026-08-19).
// Each param: { value, min, max, label }; pair-valued params carry
// [a, b] as value, with min/max applying to each element.
export const QUALIA = {
  smoke: { enabled: true, params: {} },   // toggle only — no tunables yet

  // dies in Phase C (fill-in replaces it) — do not grow this
  murk: {
    enabled: true,
    params: {
      // 0..1 patchy see-through vision in the dead ring
      transparency: { value: 0.3, min: 0, max: 1, label: 'See-through patches' },
    },
  },

  photopsia: {
    enabled: true,
    params: {
      // 0..1 density of the flashing net
      density: { value: 0.4, min: 0, max: 1, label: 'Net density' },

      // overall fineness: 1 = coarse, higher = smaller, tighter structures
      scale: { value: 2, min: 1, max: 4, label: 'Net fineness' },

      // how much the strands wander: 0 = straight grid-like lines,
      // ~0.5 = curvy, tangled filaments (values much above 1 turn to mush)
      messiness: { value: 0.75, min: 0, max: 1, label: 'Strand messiness' },

      // flicker rate of the strands, in flashes per second (max kept
      // modest — faster flicker is harsher on photosensitive viewers)
      flickerHz: { value: 9, min: 0, max: 12, label: 'Flicker rate' },
    },
  },

  sparkle: {
    enabled: true,
    params: {
      // flashes per second. 60 / (2*pi) ≈ 9.55 reproduces the
      // pre-refactor hardcoded rate (sin(uTime * 60.0)) exactly — see
      // DECISIONS.md 2026-08-19.
      flickerHz: { value: 60 / (2 * Math.PI), min: 0, max: 12, label: 'Sparkle rate' },

      // the flashing band straddles the wobbly surviving edge:
      // [start, end] distances from the edge, in screen-radius units,
      // on the inside and outside of the boundary
      bandIn:  { value: [0.08, 0.01], min: 0, max: 0.2, label: 'Band, inner side' },
      bandOut: { value: [0.03, 0.10], min: 0, max: 0.2, label: 'Band, outer side' },
    },
  },

  transition: { enabled: true, params: {} },  // toggle only — no tunables yet
};