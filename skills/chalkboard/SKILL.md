---
name: chalkboard
description: Makes a 6 s chalkboard teaching animation of a simple neural network (Input, Hidden, Output): chalk nodes and lines draw themselves, a yellow signal goes forward, prediction and target appear, a pink error flows backwards, weights shift, with Predict, Compare, Adjust captions. Use when the user runs /chalkboard or asks for a chalk or blackboard explainer of how a model learns.
---

# /chalkboard

```
┌──────────────────────┐
│    HOW AI LEARNS     │
│ Predict→Compare→Adjust│
│   ○    ○             │
│   ○ ╳╳ ○ ╳╳ ○        │  chalk network, yellow forward,
│   ○    ○    ○        │  pink error backward
│ Input Hidden Output  │
│ Guess: 0.3 ≠ Target: 1.0 │
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
2. **Spec.** Write `<name>.chalk.json` (below). Anything left out uses the defaults.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s to `<name>.chalk.snaps/` and prints `text overflows` for any text that would not fit. Look at the stills: no clipped text, no labels on top of each other, nothing over the safe margins (90 px at the sides, 220 px top and bottom).
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.chalk.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio) and a contact sheet.
5. **Hand over** the mp4 path and say what you checked.

## Timeline (6 s)
0-1 s title and input nodes, 1-2 s hidden and output nodes, 2-3 s a yellow signal moves forward, 3-4 s prediction and target, 4-5 s a pink error flows back, 5-6 s weights shift and the summary holds.

## Spec
```json
{ "title": "HOW AI LEARNS", "steps": ["Predict", "Compare", "Adjust"],
  "layers": [{"label": "Input", "n": 3}, {"label": "Hidden", "n": 4}, {"label": "Output", "n": 2}],
  "prediction": "Guess: 0.3", "target": "Target: 1.0", "footnote": "Simplified neural-network training diagram" }
```
- **`layers`**: 3 layers, 1 to 5 nodes each. **`steps`**: 3 short captions.
- **`prediction`** / **`target`**: short strings shown side by side.
- **`footnote`**: keep it: the diagram is a simplification, not every AI system.
- **`colors`**: `board`, `board2`, `chalk`, `yellow`, `pink`, `frame`.
- **`filter`** (optional): `"ascii"` (green characters on a CRT, `ascii_cols` sets the columns, default 80), `"thermal"` (brightness through an ironbow heat palette with noise) or `"crt"` (scanlines and a vignette). Applied to every frame after the scene is drawn. ASCII suits bold shapes; small text turns to noise.
- **`duration`** (optional): defaults to 6 s; the timeline above is written for 6. **`out`** (optional): output path.

## Changing it
`chalk(points, k, seed, colour, width)` draws a rough chalk stroke up to fraction `k`; use it for any extra arrows or doodles.


## Other screen sizes
Every skill renders 9:16 and can then fit the video into any frame. Add to the spec:
- **`size`**: `"16:9"`, `"1:1"`, `"4:5"`, `"4:3"`, `"21:9"` or any `"WIDTHxHEIGHT"` such as `"1920x1080"`.
- **`fill`** (optional): `"blur"` (default, a blurred copy of the video fills the sides) or a colour like `"#101010"`.
- **`zoom`** (optional, default 1): above 1 enlarges the picture and crops the quiet top and bottom margins; up to about 1.25 is safe in landscape. Check that nothing important at the very top or bottom is cut.
The contact sheet is made from the 9:16 render. For a video you already have: `python3 "$KIT/resize.py" <video.mp4> --size 1920x1080 [--fill blur] [--zoom 1.2]`.

## Taste
- Keep words few and big; the motion carries the explanation.
- Text is never below 40 px, and important text stays 90 px from the sides and 220 px from the top and bottom.
- No flashing: highlights fade in and out over at least a few frames.
