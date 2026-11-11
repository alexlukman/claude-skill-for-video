---
name: poster
description: Makes a 6 s illustrated landscape poster animation in two looks: "travel" (layered mountains sliding up with parallax, a trail drawing to the summit, sun and an elegant title, muted teal, ochre and cream) or "watercolour" (paper, soft washes, a river revealing along its curve, trees blooming, slow push-in). Use when the user runs /poster or asks for a travel poster, a watercolour landscape or a scenic title card.
---

# /poster

```
┌──────────────────────┐
│   VISIT MOUNT OPUS   │  elegant serif title
│ ┌──────────────────┐ │
│ │        ●         │ │  sun
│ │    /\ ⋰ /\       │ │  trail to the summit
│ │ ~~~/  \~~~ ▲▲    │ │  layered hills, pines, lake
│ └──────────────────┘ │
│ FICTIONAL DESTINATION│
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
2. **Spec.** Write `<name>.poster.json` (below). Anything left out uses the defaults.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s to `<name>.poster.snaps/` and prints `text overflows` for any text that would not fit. Look at the stills: no clipped text, no labels on top of each other, nothing over the safe margins (90 px at the sides, 220 px top and bottom).
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.poster.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio) and a contact sheet.
5. **Hand over** the mp4 path and say what you checked.

## Timeline (6 s)
Travel: 0-1 s paper, 1-3 s mountain layers slide up with parallax, 3-4 s the trail draws to the summit, 4-5 s sun and title, 5-6 s hold. Watercolour: 0-1 s paper fades in, 1-2.5 s sky and mountain washes, 2.5-4 s the river reveals, 4-5 s trees and banks bloom, 5-6 s slow push-in.

## Spec
```json
{ "look": "travel", "title": "VISIT MOUNT OPUS", "footer": "FICTIONAL DESTINATION" }
{ "look": "watercolour", "title": "FOLLOW THE RIVER", "footer": "" }
```
- **`look`**: `travel` or `watercolour`.
- **`title`**: under about 20 characters. **`footer`**: a small line at the bottom; for a made-up place keep "FICTIONAL DESTINATION".
- **`colors`**: `paper`, `ink`, `sky`, `sun`, `m` (5 mountain colours, back to front), `lake`, `trail`, `pine`.
- **`filter`** (optional): `"ascii"` (green characters on a CRT, `ascii_cols` sets the columns, default 80), `"thermal"` (brightness through an ironbow heat palette with noise) or `"crt"` (scanlines and a vignette). Applied to every frame after the scene is drawn. ASCII suits bold shapes; small text turns to noise.
- **`duration`** (optional): defaults to 6 s; the timeline above is written for 6. **`out`** (optional): output path.

## Changing it
Mountain lines come from `ridge(seed, base, amp, peakX)`; change the seeds for a different range. Real places are fine as titles, but do not copy a real poster or tourism brand.


## Other screen sizes
Every skill renders 9:16 and can then fit the video into any frame. Add to the spec:
- **`size`**: `"16:9"`, `"1:1"`, `"4:5"`, `"4:3"`, `"21:9"` or any `"WIDTHxHEIGHT"` such as `"1920x1080"`.
- **`fill`** (optional): `"blur"` (default, a blurred copy of the video fills the sides) or a colour like `"#101010"`.
- **`zoom`** (optional, default 1): above 1 enlarges the picture and crops the quiet top and bottom margins; up to about 1.25 is safe in landscape. Check that nothing important at the very top or bottom is cut.
The contact sheet is made from the 9:16 render. For a video you already have: `python3 "$KIT/resize.py" <video.mp4> --size 1920x1080 [--fill blur] [--zoom 1.2]`.

## Taste
- Generous margins, few colours, one title.
- Text is never below 40 px, and important text stays 90 px from the sides and 220 px from the top and bottom.
- No flashing: highlights fade in and out over at least a few frames.
