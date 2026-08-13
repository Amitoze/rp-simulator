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
