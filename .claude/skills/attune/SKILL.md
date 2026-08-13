---
name: attune
description: Step back and review the WORKING RELATIONSHIP — how the user frames questions, what they focus on, their blind spots, how critically they respond — then recommend tweaks to existing skills and new skills. Invoke deliberately (/attune) after a substantial stretch of work, never mid-task.
---

This is not a review of the work product (that is /code-review and friends).
It is a review of *the collaboration itself*: how this user thinks and works,
where the partnership is strong, where it leaks, and how the skill toolchain
should evolve to fit them better. The user invokes it periodically, after a
meaningful chunk of work, to keep the tooling attuned to how they actually
operate.

## Step 1 — Gather the window (recent weighted most)

- Analyse the current conversation, **weighting the most recent exchanges
  most heavily** — recent patterns reflect the working relationship as it is
  now; early ones may be stale or from before habits settled.
- If session-history tools are available (e.g.
  `mcp__ccd_session_mgmt__search_session_transcripts`, `list_sessions`,
  `get_session`), optionally widen to recent prior sessions to separate
  durable habits from one-conversation noise. The live conversation is
  primary; cross-session is corroboration.

## Step 2 — Study the user (specific, evidence-cited)

Analyse along the dimensions below. For **each observation, cite at least one
concrete moment** from the conversation — quote or paraphrase the actual
exchange. No ungrounded claims.

- **How they frame questions** — what they open with, at what granularity,
  what they are optimising for (correctness? cost? clarity? reversibility?).
- **Recurring strengths** — what they reliably probe well and catch.
- **Blind spots / under-asked areas** — what they tend NOT to ask that later
  bites; topics where *you* have had to volunteer things they did not
  request; questions a rigorous version of them would have asked earlier.
- **How critically they respond to answers** — do they accept responses on
  faith, or push back? On WHICH topics do they push back hard, and on which
  do they take things uncritically? **Flag specifically any area where
  uncritical acceptance is a risk** — this is often the highest-value output.
- **Decision & follow-through** — how they reach decisions, whether decisions
  get recorded, revisited, or silently drift; how they handle being wrong or
  changing course.
- **What lands vs what gets corrected** — which of your outputs they adopt
  as-is versus send back; what format, depth, and tone work for them.

## Step 3 — Honesty rules (the review is worthless without these)

- **Evidence over flattery.** Every observation ties to a specific moment:
  "you tend to X — e.g. when you Y" — never "you're great at X". Praise with
  no evidence is noise.
- **Name the uncomfortable ones.** Blind spots and uncritical-acceptance
  risks are the *point*. A review that only compliments has failed. If the
  user accepted something they should have challenged, say so and name it.
- **Pattern, not one-off.** Distinguish a habit (recurred several times, cite
  them) from a single instance. Label which it is; do not inflate one moment
  into a trait.
- **Weight recent.** A pattern from the last stretch of work outranks one
  from the opening.
- **Do not manufacture findings to fill a section.** If there is no evidence
  for, say, a blind spot, say that plainly rather than inventing one.

## Step 4 — Probing questions

Where a recommendation depends on context you do not have — goals,
constraints, preferences, why they made a call — **ask before recommending**.
Keep it to 2–4 sharp questions that would actually change the recommendations.

## Step 5 — Recommend, each tied to evidence

Three grouped outputs:

- **Tweaks to existing skills** — name the skill, the observed trigger (the
  moment that revealed the gap), and the specific change.
- **New skills worth creating** — name, one-line purpose, and the recurring
  need it serves (cite where that need showed up more than once).
- **Interaction adjustments** — how *you* (the assistant) should adapt to
  work better with this user, and, separately, any habits the user might
  adopt. Frame the user-facing ones as offers, not instructions.

## Step 6 — Output and (optionally) persist

- Output everything to the **chat**, grouped and skimmable — not to files.
- Then **offer** to persist the confirmed, durable observations to memory
  (`user` / `feedback` type) so future sessions start attuned. Persist only
  what the user confirms — interaction observations are personal, and a wrong
  one saved is worse than none.

## Rules

- Scope is the collaboration and the toolchain, not the work product.
- Respectful and constructive. The user asked for this scrutiny, but it still
  lands on a real person: frame blind spots as "here is where I can add the
  most value" / "worth watching", never as a verdict on them.
- Recent over old; pattern over instance; evidence over impression — every
  time.
