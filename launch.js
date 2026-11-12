// Launch state (Phase L): which experience this page load opens.
// Resolved ONCE from the address — sim.html?experience=<name> — into
// LAUNCH, the entry state the boot path reads instead of DEFAULTS.
// Shareable links bypass the landing page, so a typo'd name must
// still open the sim: unknown → defaults + a console warning, never
// a blank page.

import { DEFAULTS, EXPERIENCES, EXPERIENCE_PARAM, FIELD, PANEL } from './config.js';

export const LAUNCH = resolve();

function resolve() {
  const name = new URLSearchParams(location.search).get(EXPERIENCE_PARAM);
  const exp = name ? EXPERIENCES[name] : null;
  if (name && !exp)
    console.warn(`unknown experience "${name}" — opening with defaults`);
  // the experience overrides only the keys it names; DEFAULTS fills
  // the rest, so an entry can be as sparse as { panel: true }
  return { name: exp ? name : null, ...DEFAULTS, ...(exp ?? {}) };
}

// The schema writes, called from renderer main() BEFORE restitch (the
// panel chunk is compiled in, not toggled by uniform) and before
// initControls draws the degeneration fader from the schema. Called
// from main, not at module load: presets.js captures its BASELINE at
// module load, and "Defaults" in the preset dropdown must stay the
// factory portrait, not this experience's degeneration.
export function applyLaunchSchema() {
  if (LAUNCH.degeneration != null) {
    const p = FIELD.params.degeneration;
    p.value = Math.min(p.max, Math.max(p.min, LAUNCH.degeneration));
  }
  if (LAUNCH.panel != null) PANEL.enabled = !!LAUNCH.panel;
}
