// Default values applied when the page first loads.
// Edit this file to change the initial state of the simulator.

export const DEFAULTS = {
  // 'camera' | 'video'
  background: 'camera',

  // 'immersive' | 'sideBySide'
  view: 'immersive',

  // start with the menu collapsed to the hamburger button?
  menuCollapsed: false,
};

// Gaze simulation (Phase G): holding Option/Alt and moving the mouse
// points the eye somewhere else — the field mask travels, the scene
// stays put. Tunables only, no toggle: no input means no offset.
export const GAZE = {
  // how far the eye can be dragged from straight ahead, in screen
  // fractions — keeps the island from being pulled half off the bezel
  maxExcursion: 0.4,

  // release behaviour: spring back to centre (a glance is transient);
  // false = the gaze stays where it was left
  springBack: true,

  // easing time constant, ms — the saccade-ish snap toward the target
  // (applies to both the follow and the spring back)
  easeMs: 200,
};

// Geometry of the visual field. Quale-shaped ({ enabled, params })
// since Q5 so the generated panel gives it a toggle like any symptom
// (user's call, DECISIONS 2026-08-28 — reverses the earlier
// tier-1-not-toggleable rule). Still TIER 1 in one respect: the
// 10-field chunk is ALWAYS stitched — toggling off compiles a
// short-circuit (full survival, edges parked off-screen), it never
// removes the chunk, because its outputs feed sparkle, transition,
// and photopsia.
// Radii are degrees of eccentricity, mapped so the screen edge ≈ 90°
// (see DECISIONS.md). [mild, late] pair-values are the value at
// degeneration slider 0 and 1; in between is a straight blend.
export const FIELD = {
  enabled: true,
  params: {
    // how far the degeneration has advanced, 0..1 — picks the point
    // on every [mild, late] pair below. A field param like any other
    // (it IS the field's progression), but its UI is the headline
    // General-tab slider, deliberately not duplicated in the
    // generated group (DECISIONS 2026-08-20, reaffirmed 2026-08-28)
    degeneration: { value: 0.75, min: 0, max: 1, label: 'Degeneration of central field' },

    // radius of the surviving central island, [mild, late]
    inner: { value: [81, 13], min: 0, max: 90, label: 'Central island radius' },

    // radius where far-peripheral islands can begin — the dead ring's
    // far side, [mild, late]. Widens outward as degeneration advances.
    outer: { value: [65, 85], min: 0, max: 90, label: 'Far islands begin' },

    // how much of the beyond-the-ring field survives when mild
    outerCoverage: { value: 0.65, min: 0, max: 1, label: 'Far island coverage' },

    // how strongly the slider erodes the islands (1 = all gone at full)
    erosion: { value: 0.9, min: 0, max: 1, label: 'Island erosion' },

    // picks the personal geography of the islands — change it and every
    // island moves somewhere else. Fixed = islands are places.
    islandSeed: { value: 7.0, min: 0, max: 20, label: 'Island layout seed' },
  },
};

// Which preset file the comparison view's reference pane boots with.
// The reference pane renders this honestly through the full pipeline —
// "none" (field off, all qualia off) IS the unfiltered view (Q5).
export const REFERENCE_PRESET = 'presets/none.json';

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

// Clamp every param value into its schema range, naming each clamp in
// the console rather than silently trusting the number. Runs once here
// at load, in place — a hand-edited (or, later, preset-supplied) value
// outside [min, max] can never reach a uniform. FIELD and every
// quale's params share the param shape, so one clamp covers all.
export function clampParams(owner, params) {
  for (const [pname, p] of Object.entries(params)) {
    const vals = Array.isArray(p.value) ? p.value : [p.value];
    const clamped = vals.map(v => Math.min(p.max, Math.max(p.min, v)));
    if (clamped.some((v, i) => v !== vals[i])) {
      console.warn(`${owner}.${pname}: ${JSON.stringify(p.value)} ` +
                   `outside [${p.min}, ${p.max}] — clamped`);
      p.value = Array.isArray(p.value) ? clamped : clamped[0];
    }
  }
}
clampParams('FIELD', FIELD.params);
for (const [qname, quale] of Object.entries(QUALIA))
  clampParams(`QUALIA.${qname}`, quale.params);