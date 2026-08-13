---
name: walkthrough
description: Produce a guided, copy-paste walkthrough for a plan item (e.g. /walkthrough B2). Use when the user wants to build a plan step themselves with explanations, or says "guide me through X" / "as we did previously".
---

Guide the user through building the requested plan item themselves. They
learn by doing — the explanation quality matters as much as the artifact.

## Hand off — do not run the steps yourself

The walkthrough is the USER's to execute; running it IS the learning. You
write the copy-paste blocks and edit snippets, the user applies them and
reports results. This holds for EVERY step, including the payoff /
verification at the end.

Do not run these yourself, even if the user says "run step 4" mid-walkthrough
— here that means *give me the command*, so hand it over and wait for their
report. Only when the user explicitly says *you* run it ("you run it", "go
ahead and run it for me") is that a stated exception — otherwise default to
handing off.

## Before writing

1. Read the relevant `plan/` file section for the item (and its "In plain
   terms" block if present). Honour every intent note — especially the
   SAFETY-cap rule from `plan/00-context.md`.
2. Check `config.js` — anything tunable must come from config, never be
   hardcoded in what you guide them to write.
3. Check what already exists in `shader.frag`, `renderer.js`, and
   `controls.js` so steps build on real current state (uniform names, the
   existing noise/wobble idioms, slider wiring).

## Open with a trace (the shape before the code)

Before the first build step, open the walkthrough with a **data-flow trace
of the artifact you're about to build** — the `trace` skill's format, run in
its before-it's-built mode. Map, from the plan and the surrounding pipeline:
what values flow in (config → renderer → uniforms), how the shader
transforms them, what appears on screen, and where each new value is born.

Why at the top: the user's benchmark is understanding, not code shipped.
Seeing the whole data path first gives them the mental model to build
*into*, turns each later step from "type this" into "fill in this known
slot", and catches design risks (a uniform with no source, a config knob
nothing reads) before any code hardens them. Then proceed to the build
steps; the per-step flow diagrams show each piece joining the map.

1. `## Step N — <what this step achieves>`
2. The exact edit — a fenced code block of the new/changed code, with
   enough surrounding context to place it unambiguously, or a fenced `bash`
   block when it's a command. Fully copy-paste-ready.
3. `**Simple:**` one sentence, plain words, what the change does.
4. A detailed explanation ("Slow walkthrough" when the user asked for
   extra-simple): why this design, where each parameter value flows, what
   would break without it. Define every jargon term descriptively at first
   use — "fbm — layered noise, like stacking ripples of different sizes".
   Never use an unexplained term. Prefer everyday analogies.
5. **A flow diagram** whenever the step creates or changes something other
   code touches (a new uniform, a config field, a mask other stages read).
   See below.

## Flow diagrams — required in slow walkthroughs

When a step adds or changes anything other parts of the project touch, draw
the flow as plain text. The reader should be able to answer "what feeds
this, what does it feed, and what information moves between them?" without
opening a single file.

Rules:

- **Label every arrow with what is actually flowing**, in plain words —
  "the island radius", "which pixels count as seeing", "this frame's video
  image" — never a type name or an internal term.
- **Show the reach beyond the step**: which existing module, config field,
  or shader stage each end connects to. New code in isolation is not the
  point; how it joins the pipeline is.
- **Mark what is new or changed** in this step (e.g. `← NEW`), so the reader
  can see their own work inside the wider picture.
- **Follow the diagram with a short prose reading of it** — two or three
  sentences walking the path in order, in the same plain language.
- Keep it small. One diagram per step at most, only the parts that matter.

## Writing the bash blocks

- **Before closing any fenced block containing shell, check its final
  line.** Stray `</parameter>` tags have leaked into fenced blocks before —
  the tool-call syntax shares its shape with a fenced block, and it has
  always happened in the LAST, LONGEST block of a long walkthrough. Nothing
  but an explicit check catches it; the user finds out as a shell parse
  error.
- **Prefer several short blocks over one long `&&` chain.** When one link
  fails, the later links never run, so the diagnostic output the user needs
  is exactly what they lose. Chain only when a later command is genuinely
  meaningless if an earlier one failed, and keep it to two.

## Finish with

- A **payoff step**: run the local server (`python3 serve.py` or
  `python3 -m http.server 8000`), open the sim, and a stated list of what
  to look for — expected visual result, what the relevant slider should now
  do, what the split view should show. Phrase expectations concretely
  ("islands should sit still when you re-open the page; the flashes should
  never cross into them").
- Ask the user to report what they actually saw — the by-eye observations
  feed config tuning and belong in commit messages and DECISIONS.md. For
  phases with a by-eye GATE, remind them the gate is their call.
- A suggested `git commit` command including the observed results.

## Calibration notes

- The user once asked for a redo because explanations were too
  jargon-heavy. When in doubt, simpler.
- If a step's visual result surprises, diagnose it WITH the user — show a
  quick isolating tweak (e.g. temporarily exaggerate the parameter) before
  presenting the fix, and record the finding in DECISIONS.md.
