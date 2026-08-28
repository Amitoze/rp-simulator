// Preset engine (Q4, envelope v2 in Q5): capture pristine defaults,
// snapshot the live state, materialise preset values into detached
// configs, and apply them to the live schema.
//
// A preset is a FULL snapshot of the whole render config — the field
// { enabled, params } (degeneration included: it is a field param,
// the General slider is merely its UI) and every quale's enabled flag
// and param values — so the file reproduces this exact look no matter
// how schema defaults move later (frozen-snapshot semantics). SAFETY
// caps are not params and are never serialised. (DECISIONS
// 2026-08-28.)

import { QUALIA, FIELD, clampParams } from './config.js';
// cycle-safe: restitch and buildAdvanced are hoisted top-level
// function declarations, only called from user actions. `sliders` is
// a const and therefore NOT hoisted — it must never be read while
// this module evaluates (controls.js is still mid-evaluation then);
// applyPreset touches it only from event handlers.
import { restitch } from './renderer.js';
import { buildAdvanced, sliders } from './controls.js';

// plain-value walk of one params map (arrays copied, never aliased —
// a shared array would let later slider drags mutate any snapshot)
const snapParams = params => {
  const out = {};
  for (const [k, p] of Object.entries(params))
    out[k] = Array.isArray(p.value) ? [...p.value] : p.value;
  return out;
};

const snapQualia = () => {
  const out = {};
  for (const [qname, quale] of Object.entries(QUALIA))
    out[qname] = { enabled: quale.enabled, params: snapParams(quale.params) };
  return out;
};

// The live state as one plain envelope-v2 body — a pure schema walk
// (the General slider mirrors FIELD.params.degeneration, never the
// other way round, so no DOM read is needed).
export function snapshot() {
  return {
    field: { enabled: FIELD.enabled, params: snapParams(FIELD.params) },
    qualia: snapQualia(),
  };
}

// Factory settings, captured ONCE at page load, before any UI exists.
const BASELINE = snapshot();

// Materialise preset values into a DETACHED, schema-shaped config:
// BASELINE defaults → overlay the file's sections → warn-and-ignore
// unknown names → clamp everything into schema ranges. Every section
// is optional (a v1 file has no field/degeneration and fills from
// defaults; envelope metadata like name/saved is simply never read).
// The caller decides where the config goes: the live schema via
// applyPreset, or a reference pane (Q5). One shared core — a second
// copy of the overlay logic would drift.
export function materialise(preset) {
  // schema-shaped deep clone (plain data, JSON round-trip is exact),
  // then values reset to factory settings
  const cfg = {
    field: JSON.parse(JSON.stringify(FIELD)),
    qualia: JSON.parse(JSON.stringify(QUALIA)),
  };
  const resetParams = (params, base) => {
    for (const [k, p] of Object.entries(params))
      p.value = Array.isArray(base[k]) ? [...base[k]] : base[k];
  };
  cfg.field.enabled = BASELINE.field.enabled;
  resetParams(cfg.field.params, BASELINE.field.params);
  for (const [qname, quale] of Object.entries(cfg.qualia)) {
    quale.enabled = BASELINE.qualia[qname].enabled;
    resetParams(quale.params, BASELINE.qualia[qname].params);
  }

  // overlay one { enabled, params } section onto its config twin
  const overlay = (target, values, owner) => {
    if (values && 'enabled' in values) target.enabled = !!values.enabled;
    for (const [k, v] of Object.entries(values?.params ?? {})) {
      const p = target.params[k];
      if (!p) { console.warn(`preset: unknown param "${owner}.${k}" — ignored`); continue; }
      p.value = Array.isArray(v) ? [...v] : v;
    }
  };
  overlay(cfg.field, preset.field, 'field');
  for (const [qname, q] of Object.entries(preset.qualia ?? {})) {
    if (!cfg.qualia[qname]) { console.warn(`preset: unknown quale "${qname}" — ignored`); continue; }
    overlay(cfg.qualia[qname], q, qname);
  }
  // the same guard hand-edited config.js gets: out-of-range file
  // values warn and cap — they can never reach a uniform (SAFETY)
  clampParams('preset → field', cfg.field.params);
  for (const [qname, quale] of Object.entries(cfg.qualia))
    clampParams(`preset → ${qname}`, quale.params);
  return cfg;
}

// Apply a preset to the LIVE state (the Symptom pane): materialise,
// copy into the schema singletons, sync the General slider, restitch,
// regenerate the panel. Missing sections mean "defaults" — never
// "whatever the user last dragged" — so applyPreset({}) is a reset.
export function applyPreset(preset) {
  const cfg = materialise(preset);
  const copyParams = (live, from) => {
    for (const [k, p] of Object.entries(live))
      p.value = Array.isArray(from[k].value) ? [...from[k].value] : from[k].value;
  };
  FIELD.enabled = cfg.field.enabled;
  copyParams(FIELD.params, cfg.field.params);
  for (const [qname, quale] of Object.entries(QUALIA)) {
    quale.enabled = cfg.qualia[qname].enabled;
    copyParams(quale.params, cfg.qualia[qname].params);
  }
  // the General slider mirrors the schema's degeneration param
  sliders.degen.value = FIELD.params.degeneration.value;
  restitch(QUALIA, FIELD);
  buildAdvanced();
}

// Export the live state as a downloadable envelope-v2 preset file.
export function exportPreset(name) {
  const preset = {
    name,
    saved: new Date().toISOString().slice(0, 10),
    ...snapshot(),
  };
  const blob = new Blob([JSON.stringify(preset, null, 2) + '\n'],
                        { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                   .replace(/^-+|-+$/g, '');
  a.download = (slug || 'preset') + '.json';
  a.click();
  // revoke after the download has had a moment to start — an
  // immediate revoke races the click in some browsers
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Debug handle (kept: poking presets from DevTools is a feature in a
// static sim). NOTE: applyPreset now takes an envelope-shaped object —
// rpPresets.applyPreset({ qualia: {...} }), not a bare qualia map.
window.rpPresets = { BASELINE, snapshot, materialise, applyPreset };
