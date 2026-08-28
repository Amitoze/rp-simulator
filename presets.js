// Preset engine (Q4): capture pristine defaults, snapshot the live
// schema, and apply full-value presets onto it.
//
// A preset is a FULL snapshot of everything preset-reachable — every
// quale's enabled flag and param values. FIELD, DEFAULTS, and SAFETY
// caps are outside its reach by construction: this file never touches
// them. (DECISIONS 2026-08-28 "Q4 planned".)

import { QUALIA, clampParams } from './config.js';
// cycle-safe: restitch is a hoisted top-level function declaration in
// renderer.js, and it is only called from user actions, never at load
import { restitch } from './renderer.js';

// The live schema as one plain object: { <quale>: { enabled, params:
// { <name>: value } } }. Pair params are copied ([...]), never
// aliased — a shared array would let later slider drags silently
// mutate any snapshot that holds it.
export function snapshot() {
  const out = {};
  for (const [qname, quale] of Object.entries(QUALIA)) {
    const params = {};
    for (const [pname, p] of Object.entries(quale.params))
      params[pname] = Array.isArray(p.value) ? [...p.value] : p.value;
    out[qname] = { enabled: quale.enabled, params };
  }
  return out;
}

// Factory settings: the schema's defaults, captured ONCE at page
// load, before any UI exists. Q3 made the schema the live, mutable
// state — the first slider drag overwrites a default in place — so
// "reset to defaults" needs this copy, not the schema itself.
const BASELINE = snapshot();

// Apply preset values onto the live schema. The loading rule
// (DECISIONS 2026-08-28): start from defaults, overlay the given
// values, warn-and-ignore unknown names, clamp everything into schema
// ranges. A missing name therefore means "schema default" — never
// "whatever the user last dragged" — so a full snapshot reproduces
// its look exactly, and applyPreset({}) is a clean reset.
export function applyPreset(values) {
  // 1. reset to factory settings (deep-copied, same aliasing rule)
  for (const [qname, quale] of Object.entries(QUALIA)) {
    quale.enabled = BASELINE[qname].enabled;
    for (const [pname, p] of Object.entries(quale.params)) {
      const v = BASELINE[qname].params[pname];
      p.value = Array.isArray(v) ? [...v] : v;
    }
  }
  // 2. overlay; unknown names warn + skip (old presets survive schema
  // evolution, and typos surface instead of vanishing)
  for (const [qname, q] of Object.entries(values ?? {})) {
    const quale = QUALIA[qname];
    if (!quale) { console.warn(`preset: unknown quale "${qname}" — ignored`); continue; }
    if ('enabled' in q) quale.enabled = !!q.enabled;
    for (const [pname, v] of Object.entries(q.params ?? {})) {
      const p = quale.params[pname];
      if (!p) { console.warn(`preset: unknown param "${qname}.${pname}" — ignored`); continue; }
      p.value = Array.isArray(v) ? [...v] : v;
    }
  }
  // 3. the same guard hand-edited config.js gets: out-of-range file
  // values warn and cap — they can never reach a uniform (SAFETY)
  for (const [qname, quale] of Object.entries(QUALIA))
    clampParams(`preset → ${qname}`, quale.params);
  // 4. enabled flags may have changed what is stitched into the shader
  restitch(QUALIA);
}

// Debug handle for the console checks in this step (kept afterwards:
// poking presets from DevTools is a feature in a static sim)
window.rpPresets = { BASELINE, snapshot, applyPreset };
