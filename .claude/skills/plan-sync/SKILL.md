---
name: plan-sync
description: Sync plan/ docs to the actual state of the repo — tick checkboxes, update the status table, prompt for DECISIONS.md entries. Use after completing work, or when the user says "update the plan".
---

Bring `plan/` back in line with reality. This is mechanical except the
final step, which needs the user's judgement.

## Steps

1. **Establish what changed**: `git log --oneline` since the last plan
   update, plus `git status`, plus the current session's work.
2. **Tick checkboxes** in the relevant `plan/*.md` files — `[ ]` → `[x]`
   only for items genuinely done and verified (a gate is done when its
   condition was checked, not assumed — and this project's gates are
   by-eye judgements by the user, so a gate is done only when the user
   said so). Add a dated note where helpful (e.g. "(2026-08-13)").
3. **Update the status table** in `plan/00-context.md`: mark completed
   phases `✅ done <date>`, set the next phase to "next up", and update
   the deferred row's markers (e.g. "FF3 pulled forward").
4. **Capture discussion insights**: if the session produced a design
   discussion worth keeping, add or extend an "In plain terms" section in
   the relevant plan file — simple language, jargon defined descriptively,
   placed above the terse checklist it explains.
5. **Prompt for DECISIONS.md**: list the session's judgement calls
   (tuned config values with the look they produced, approaches tried and
   rejected, renames, safety-cap verifications), and propose a dated entry
   for each. Ask the user which to record — the judgement of what is
   decision-worthy is theirs. Then append the approved entries.
6. **Report**: summarise what was ticked, what was updated, and what was
   recorded, with file links. Offer to commit (do not commit unasked).

## Rules

- Never tick an unverified item to make the plan look tidy.
- Never self-certify a by-eye gate — those belong to the user.
- Plan wording follows project terminology (e.g. "islands", "the dead
  ring", "fill-in" — not generic scotoma jargon the plan doesn't use).
- Keep original checklist/intent text intact — plain-language additions
  sit alongside, never replace.
