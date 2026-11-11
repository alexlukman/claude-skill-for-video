---
name: blueprint
description: Makes a 6 s blueprint animation of an original industrial robot arm: a cyan grid on dark blue, the base, shoulder, elbow and gripper traced as outlines with construction circles and dashed centre lines, the elbow turning slightly, then arrow-ended dimensions and labels. Use when the user runs /blueprint or asks for a technical-drawing, schematic or blueprint-style animation.
---

# /blueprint

```
┌──────────────────────┐
│ ROBOT ARM / CONCEPT  │
│        Elbow ◎──◎<   │  180 mm
│  Shoulder ╱  240 mm  │  dimensions with arrows
│         ◎     Gripper│
│        /_\   190 mm  │
│ Base  ▔▔▔▔           │
│ ILLUSTRATIVE, NOT FOR FABRICATION │
└──────────────────────┘
```

## First use
This skill's folder is the "Base directory" Claude Code shows when it loads it.
```bash
SKILL_DIR="<base directory of this skill>"
KIT=$(python3 -c 'import os,sys;print(os.path.realpath(os.path.join(sys.argv[1],"..","..","kit")))' "$SKILL_DIR")
[ -s "$KIT/node_modules/playwright/package.json" ] || bash "$KIT/setup.sh"
```
Needs Node, Python 3, ffmpeg and Chrome or Chromium (set `CHROME=/path/to/chrome` if Playwright's browser is not installed). It is a plain 2D canvas page with a `renderAt(t)` that depends only on time, so every frame is reproducible.

## Steps
1. **Ask** for the subject and any words or numbers that should appear.
2. **Spec.** Write `<name>.blueprint.json` (below). Anything left out uses the defaults.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s to `<name>.blueprint.snaps/` and prints `text overflows` for any text that would not fit. Look at the stills: no clipped text, no labels on top of each other, nothing over the safe margins (90 px at the sides, 220 px top and bottom).
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.blueprint.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio) and a contact sheet.
5. **Hand over** the mp4 path and say what you checked.

## Timeline (6 s)
0-1 s grid fades in, 1-3 s base and arm segments are traced, 3-4 s the elbow turns a little, 4-5 s dimensions draw, 5-6 s hold.

## Spec
```json
{ "title": "ROBOT ARM / CONCEPT STUDY", "labels": ["Base", "Shoulder", "Elbow", "Gripper"], "dims": ["240 mm", "180 mm", "190 mm"],
  "note": "ILLUSTRATIVE, NOT FOR FABRICATION" }
```
- **`labels`**: 4 part names. **`dims`**: 3 strings for the upper arm, forearm and base height.
- **`note`**: required. The numbers are design annotations, not engineering specifications, and the note says so.
- **`colors`**: `bg`, `bg2`, `minor`, `major`, `line`, `dim`, `note`.
- **`filter`** (optional): `"ascii"` (green characters on a CRT, `ascii_cols` sets the columns, default 80), `"thermal"` (brightness through an ironbow heat palette with noise) or `"crt"` (scanlines and a vignette). Applied to every frame after the scene is drawn. ASCII suits bold shapes; small text turns to noise.
- **`duration`** (optional): defaults to 6 s; the timeline above is written for 6. **`out`** (optional): output path.

## Changing it
The arm is built in `geometry(t)` from `capsule()` and `circle()` outlines; lengths `L1`, `L2` and the angles are at the top of `scene.js`.

## Taste
- Monospace text, thin lines, no fills: it should look drawn, not rendered.
- Text is never below 40 px, and important text stays 90 px from the sides and 220 px from the top and bottom.
- No flashing: highlights fade in and out over at least a few frames.
