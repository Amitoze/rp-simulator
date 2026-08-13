---
name: simple
description: Re-explain the most recent thing — a concept, decision, diagram, or code — in plain language with a diagram and no jargon. Use when the user says /simple, "explain simply", "in plain terms", "avoid jargon", or "explain like I'm not technical".
---

Re-explain something in the plainest possible terms. The user learns by
understanding *why* before moving, and asks for this often — so lead with
plain language and a picture, and don't wait to be asked twice.

## What to explain

- If an argument is given (`/simple <thing>`), explain that.
- Otherwise explain the **last substantive thing** — the concept, decision,
  design, or code just discussed. If it's ambiguous, pick the most recent and
  name it in the first line ("Here's X in plain terms:").

## How to explain

1. **Plain words first.** No jargon. If a technical term is unavoidable,
   define it descriptively at first use — "a fragment shader — the little
   program that decides each pixel's colour". Reach for an everyday analogy
   (a stencil, frosted glass, a stage light) over precision.
2. **One diagram.** Include a small plain-text (ASCII) diagram whenever the
   thing has moving parts or a flow. Label every arrow with what actually
   flows, in plain words ("the slider value", "which pixels survive"), never
   a type name. Mark what is new or changed if it matters. Follow the diagram
   with a two-or-three-sentence prose reading of it, walking the path in
   order.
3. **Short.** A few tight paragraphs, not an essay. Aim for the "click", not
   completeness — depth is available on request.
4. **Ground it in their case.** Use the actual example at hand (this shader
   stage, this slider, this decision), not an abstract one.

## Rules

- Plain-language + diagram is the DEFAULT for concepts even without this
  command; this skill is for when they want the *last* thing re-explained, or
  a fresh pass that's simpler still.
- No code unless the code IS the thing being explained — describe what it
  does, not how it is written.
- If the topic is sensitive or high-stakes, keep the tone calm and the
  analogies boring; never trivialise. This project touches the user's own
  sight loss — that rule is not hypothetical here.
- End by offering the technical depth ("want the precise version?") rather
  than dumping it unprompted.
