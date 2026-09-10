// 12-nyctalopia — quale: night blindness (rod death, the first RP
// symptom). Below the cone threshold there is no rod handoff: dim
// regions are ABSENT — black, not gray, not noisy. Numbered before
// 15: the compositor crushes the WORLD sample, then the glance panel
// composites over it — the display is emissive and must stay visible
// exactly when the world goes void. Steady by construction: the
// time-varying part of the symptom (adaptation lag) is stage B
// (backlog), never a flicker term here.
vec3 nyctalopiaQuale(vec3 scene) {
  float luma = dot(scene, vec3(0.299, 0.587, 0.114));
  // visibility: 0 at/below the threshold, 1 above threshold + knee
  float vis = smoothstep(uNightThresh, uNightThresh + uNightKnee, luma);
  return scene * vis;
}
