# Backlog

Captured by /backlog, prioritised by /review-backlog.
Inbox = raw, unreviewed. Prioritised is ordered: P1 = raise at next
/roadmap · P2 = agreed valuable, sequenced behind current cards ·
P3 = keep, revisit when the named condition triggers.

## Inbox

### Night vision enhancement in panel
`feature` · added 2026-08-28 · effort M? — shader work on the panel
feed (gain boost, edge/contrast highlights); scope depends on how
far "extra context" goes
Enhance the panel's camera feed for dim light: boost brightness and
add highlights of features (edges, contrast) so the view gives extra
context that the naked eye can't get in the dark. Builds on the
day/night insight from the glance-panel entry — the display is most
visible exactly when RP vision is worst.
Impact: turns the aid from "second view" into a night-vision
augmentation; serves the AR-aid product horizon in 00-context.
Needs: glance panel with AR-glasses optics (below).

### Glance panel with AR-glasses optics
`feature` · added 2026-08-28 · effort M? — a `15-glance-panel.frag`
chunk in the compositor's scene-modifying slot plus panel-rect/zoom/
gain uniforms and an ambient slider; known territory, but the first
feature to draw a second view of the feed
A small side frame showing the same camera feed, cropped and zoomed,
rendered as an optical see-through display would show it: additive
light (`scene + panelFeed × gain`), never opaque — black is
transparent, dark feed pixels vanish, and an ambient slider sets
gain = display ÷ ambient so the panel washes out in daylight and
glows in the dark. Includes an "ideal panel vs glasses panel"
toggle (opaque-replace vs additive) for demos. Panel composites
before the field mask, so blindspots travel over it when glancing.
Deliberate exclusions: waveguide colour fringing, focus rivalry.
Decide at build time whether panel light stays outside ADD_CAP
(it doesn't flicker) — record in DECISIONS.md.
Impact: the core of the "glance experience" — serves the AR-aid
product horizon in 00-context; also surfaces the day/night tension
(RP night blindness vs display visibility peaking in the dark),
a dossier-grade product argument.
Needs: gaze simulation (below) for the glance-to-frame moment;
panel renders standalone without it.

### Gaze simulation via Option+mouse
`feature` · added 2026-08-28 · effort S? — one `uGaze` uniform, a
modifier-key mouse listener, and `cuv - 0.5` → `cuv - uGaze` in the
compositor; all field geometry already derives from `centered`
Holding Option and moving the mouse moves the field-mask centre,
simulating the gaze shifting (mirrors the emulator's Option+mouse
camera control). Scene stays put; island, sparkle, smoke, and outer
islands travel rigidly with the gaze point. Config decisions: release
behaviour (spring back to centre vs stay), optional saccade-style
snap easing, and a max-excursion clamp so the island isn't dragged
half off the bezel.
Impact: groundwork for the "glance experience" (fullscreen feed +
zoomed side frame) — serves the AR-aid product horizon in 00-context;
also lets the portrait demonstrate eye-scanning, which sighted
viewers won't otherwise intuit.
Blocks: glance panel with AR-glasses optics (above).

## Prioritised

## Dropped
