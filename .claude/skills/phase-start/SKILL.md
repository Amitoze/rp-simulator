---
name: phase-start
description: Start the next phase after a merge — sync main, delete the merged branch, cut the new phase branch, and state the first work item. Use after the user merges a phase PR, or with an explicit phase (e.g. /phase-start C).
---

Transition cleanly from a merged phase to the next one. Never destroy
work: every deletion below is guarded by a merge check.

## Steps

1. **Identify the phases**: the just-finished phase from the current
   branch name (`phase-<letter>-...`); the next phase from the argument
   if given, else the plan's status table in `plan/00-context.md`
   ("next up" / the first phase not marked ✅).
2. **Verify the merge actually happened** before deleting anything:
   `gh pr view <branch> --json state,mergedAt` must show MERGED (or
   `git branch --merged main` after pulling). If the PR is still open,
   STOP and report — do not delete an unmerged branch, do not proceed.
   **This verification must be its own command, and its output must be
   READ before any deletion command is issued.** Never chain the check
   and the deletion with `&&` — a chain cannot stop on a bad answer,
   only on a bad exit code, and `gh pr view` exits 0 for OPEN too.
   (Learned the hard way in a sibling project, 2026-07-23: the check
   printed OPEN, the chain deleted the branch under the open PR anyway.
   Also beware: `gh pr view <branch>` returns the branch's MOST RECENT
   PR — after a follow-up PR exists, an earlier merged PR on the same
   branch does not mean the branch is merged.)
3. **Sync main**: `git checkout main && git pull`. Confirm the phase's
   commits are present (`git log --oneline -3`).
4. **Delete the merged branch**: locally (`git branch -d` — the
   lowercase -d refuses unmerged work by design; never force with -D)
   and on the remote (`git push origin --delete <branch>`). A remote
   branch auto-deleted by GitHub's merge setting is fine — ignore that
   error.
5. **Cut the next branch**: `phase-<letter>-<short-name>` where the
   short name comes from the phase's plan title (e.g. Phase B
   "Messy-Donut Field Geometry" → `phase-b-donut`). Push with
   `-u origin`.
6. **Orient**: read the next phase's section in its `plan/` file and
   report — the phase's goal (one line, from its "In plain terms" block
   if present), its first work item with the file it touches, any open
   DECISIONS.md entries or plan notes that phase must address, and what
   its by-eye GATE will ask the user to judge.

## Rules

- Step 2 is non-negotiable: no deletion without confirmed merge.
- One phase per branch, even if a plan file covers several phases.
- If this project is being worked trunk-style (commits straight to main,
  no PRs — as its early history was), say so and offer the lightweight
  version: skip steps 2–4, just confirm main is clean and orient on the
  next phase. Do not manufacture a branch dance the project doesn't use.
- If main has moved beyond the merge (someone else's commits), mention
  it in the report — the new branch includes those changes.
