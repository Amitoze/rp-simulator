---
name: phase-done
description: Close out the current phase — verify the gate, sync the plan, push, and create/update the PR. Use when a phase's work is complete or the user says a phase is done.
---

Close out the current phase properly. Order matters.

## Steps

0. **Verify the tree is committed FIRST**: `git status` must be clean
   (no modified or untracked project files) BEFORE running the gate —
   otherwise the gate verifies working-tree code that may never have
   been committed, and the phase closes without the deliverables it
   claims (this bit a sibling project once: a verified file was left
   uncommitted and the PR merged without it). If the tree is dirty,
   commit the work before anything else.
1. **Verify the gate**: find the phase's GATE section in the relevant
   `plan/` file and actually check each condition. In this project most
   gate items are BY-EYE checks belonging to the user (their own visual
   field is the ground truth) — present the sim, say exactly what to
   look for, and ask them to confirm each item; **never self-certify a
   by-eye check**. Run yourself only the mechanical items (fps on
   phone, SAFETY caps unchanged, split view intact). If the gate fails,
   stop and report; the phase is not done.
2. **Run /plan-sync** (checkboxes, status table, DECISIONS.md prompts).
3. **Commit** any outstanding work — message includes the by-eye gate
   outcome and any tuned config values that produced it.
4. **Push** the branch.
5. **PR** (if the project is using branches; if working trunk-style on
   main, skip and just push): if none exists for the branch,
   `gh pr create`; otherwise update the existing PR body (`gh pr edit`)
   to reflect final state. Body format: "## What changed" bullets +
   "## For the reviewer" with the gate outcomes and anything needing
   judgement. Title: "Phase <X>: <summary>". End with the Claude Code
   attribution line.
6. **Report the PR URL** (or the pushed commit) and remind the user the
   merge is theirs to do.

## After the user merges

Run /phase-start — it verifies the merge, deletes the old branch safely,
cuts the next phase branch, and orients on the next phase's first work
item. Do not duplicate those steps here.
