// Default values applied when the page first loads.
// Edit this file to change the initial state of the simulator.

export const DEFAULTS = {
  // sliders, all 0..1
  degeneration: 0.75,   // degeneration of central field
  netDensity: 0.4,     // density of flashing net
  transparency: 0.3,   // periphery transparency

  // 'camera' | 'video'
  background: 'camera',

  // 'immersive' | 'sideBySide'
  view: 'immersive',

  // start with the menu collapsed to the hamburger button?
  menuCollapsed: false,
};

// Fixed look of the flashing net (no UI slider — edit here).
export const NET = {
  // overall fineness: 1 = coarse, higher = smaller, tighter structures
  scale: 2,

  // how much the strands wander: 0 = straight grid-like lines,
  // ~0.5 = curvy, tangled filaments (values much above 1 turn to mush)
  messiness: .75,

  // flicker rate of the strands, in flashes per second
  flickerHz: 9,
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

// Fixed look of the edge sparkle (no UI slider — edit here).
export const SPARKLE = {
  // flicker rate in flashes per second. 60 / (2*pi) ≈ 9.55 reproduces
  // the pre-refactor hardcoded rate (sin(uTime * 60.0)) exactly — see
  // DECISIONS.md 2026-08-19.
  flickerHz: 60 / (2 * Math.PI),

  // the flashing band straddles the wobbly surviving edge:
  // [start, end] distances from the edge, in screen-radius units,
  // on the inside and outside of the boundary
  bandIn: [0.08, 0.01],
  bandOut: [0.03, 0.10],
};

// Which qualia are stitched into the shader. Tier 1 (FIELD) is not
// here and never will be: geometry is not a quale and cannot be
// toggled. All-on reproduces the pre-refactor look. Q2 grows each
// entry into { enabled, params } with a full schema.
export const QUALIA = {
  smoke:      { enabled: true },
  murk:       { enabled: true },   // dies in Phase C (fill-in replaces it)
  photopsia:  { enabled: true },
  sparkle:    { enabled: true },
  transition: { enabled: true },
};