---
name: isometric
description: Makes a 6 s isometric explainer for a reel: a small power station on the left, cables on poles, pulses travelling to a house on the right whose windows light up, with a title and three horizontal labels. Cream ground, blue and warm yellow. Use when the user runs /isometric or asks for an isometric diagram of something flowing from a source to a home (power, water, internet, deliveries).
---

# /isometric

```
┌──────────────────────┐
│  POWER TO YOUR HOME  │
│      Transmission    │
│  ▟▙  ┼──•──┼──•─⌂    │  pulses run along the cable
│  ░░░░░░░░░░░░░░░░    │  isometric cream ground, trees
│ Power station   Home │
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
2. **Spec.** Write `<name>.iso.json` (below). Anything left out uses the defaults.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s to `<name>.iso.snaps/` and prints `text overflows` for any text that would not fit. Look at the stills: no clipped text, no labels on top of each other, nothing over the safe margins (90 px at the sides, 220 px top and bottom).
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.iso.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio) and a contact sheet.
5. **Hand over** the mp4 path and say what you checked.

## Timeline (6 s)
0-1 s ground and station build up, 1-2 s poles and house, 2-4 s yellow pulses run along the cable, 4-5.5 s windows light and labels appear, 5.5-6 s hold.

## Spec
```json
{ "title": "POWER TO YOUR HOME", "labels": ["Power station", "Transmission", "Home"], "colors": { "yellow": "#f2b632" } }
```
- **`title`**: one line, in capitals.
- **`labels`**: exactly 3: `[source, the line between, destination]`, each under about 18 characters.
- **`colors`** (optional): override `bg`, `ground`, `blue`, `yellow`, `ink`, `wall`, `roof`, `leaf`.
- **`filter`** (optional): `"ascii"` (green characters on a CRT, `ascii_cols` sets the columns, default 80), `"thermal"` (brightness through an ironbow heat palette with noise) or `"crt"` (scanlines and a vignette). Applied to every frame after the scene is drawn. ASCII suits bold shapes; small text turns to noise.
- **`duration`** (optional): defaults to 6 s; the timeline above is written for 6. **`out`** (optional): output path.

## Changing it
The shapes are drawn in `scene.js` with `box(x, y, z, dx, dy, dz, colour)` on an isometric grid (`P(x, y, z)` projects a point). To show water or data instead of power, change the labels and colours first; for a new building, add a function next to `station()` and `house()`.


## Other screen sizes
Every skill renders 9:16 and can then fit the video into any frame. Add to the spec:
- **`size`**: `"16:9"`, `"1:1"`, `"4:5"`, `"4:3"`, `"21:9"` or any `"WIDTHxHEIGHT"` such as `"1920x1080"`.
- **`fill`** (optional): `"blur"` (default, a blurred copy of the video fills the sides) or a colour like `"#101010"`.
- **`zoom`** (optional, default 1): above 1 enlarges the picture and crops the quiet top and bottom margins; up to about 1.25 is safe in landscape. Check that nothing important at the very top or bottom is cut.
The contact sheet is made from the 9:16 render. For a video you already have: `python3 "$KIT/resize.py" <video.mp4> --size 1920x1080 [--fill blur] [--zoom 1.2]`.

## Taste
- Keep it calm: one cable, one direction of flow, three labels.
- Text is never below 40 px, and important text stays 90 px from the sides and 220 px from the top and bottom.
- No flashing: highlights fade in and out over at least a few frames.
