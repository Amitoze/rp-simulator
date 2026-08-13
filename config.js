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