---
name: coin-chart
description: Makes a 6 s 3D-looking bar chart where each bar is a stack of gold coins (elliptical tops, shaded edges) on a dark navy stage: coins drop in, values appear, a slow oblique drift. Use when the user runs /coin-chart or asks for a gold-coin or money-stack chart (reserves, revenue, savings by year or by country).
---

# /coin-chart

```
┌──────────────────────┐
│ GOLD RESERVES BY ... │
│ [ILLUSTRATIVE DEMO]  │  shown when no source is given
│  820                 │
│  ▤▤  610             │  stacked gold coins
│  ▤▤  ▤▤  450  290    │
│  ▤▤  ▤▤  ▤▤   ▤▤     │
│  A   B   C    D      │
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
2. **Spec.** Write `<name>.coins.json` (below). Anything left out uses the defaults.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s to `<name>.coins.snaps/` and prints `text overflows` for any text that would not fit. Look at the stills: no clipped text, no labels on top of each other, nothing over the safe margins (90 px at the sides, 220 px top and bottom).
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.coins.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio) and a contact sheet.
5. **Hand over** the mp4 path and say what you checked.

## Timeline (6 s)
0-1 s title, axis and slots, 1-3.5 s coins fall into the stacks one bar after another (`drop_start`, `drop_end`), 3.5-4.5 s values, 4.5-6 s hold with a slight oblique drift.

## Spec
```json
{ "title": "REVENUE BY YEAR", "items": [["2021", 1.2], ["2022", 1.8], ["2023", 2.6]], "prefix": "$", "suffix": "M", "decimals": 1,
  "source": "Source: Company annual report, 2025", "unit": "USD millions" }
```
- **`items`**: 2 to 6 `["Label", value]` pairs; bar heights are proportional (the largest is `max_coins`, default 22).
- **`prefix`**, **`suffix`**, **`decimals`**: how values print (`"$"`, `"M"`, `1` gives `$1.2M`).
- **`source`**: only for real, checked numbers, shown as a footnote. **Without a source the chart says ILLUSTRATIVE DEMO DATA** (change the wording with `demo_label`, e.g. "ILLUSTRATIVE EXAMPLE DATA"). Never present made-up numbers as real.
- **`unit`**: a short line under the title or at the bottom. **`colors`**: `bg`, `bg2`, `gold`, `goldD`, `goldL`, `ink`, `dim`, `accent`.
- **`filter`** (optional): `"ascii"` (green characters on a CRT, `ascii_cols` sets the columns, default 80), `"thermal"` (brightness through an ironbow heat palette with noise) or `"crt"` (scanlines and a vignette). Applied to every frame after the scene is drawn. ASCII suits bold shapes; small text turns to noise.
- **`duration`** (optional): defaults to 6 s; the timeline above is written for 6. **`out`** (optional): output path.

## Changing it
The defaults use fictional countries and numbers. If the user wants real figures, look them up, cite the source and year in `source`, and round sensibly.


## Other screen sizes
Every skill renders 9:16 and can then fit the video into any frame. Add to the spec:
- **`size`**: `"16:9"`, `"1:1"`, `"4:5"`, `"4:3"`, `"21:9"` or any `"WIDTHxHEIGHT"` such as `"1920x1080"`.
- **`fill`** (optional): `"blur"` (default, a blurred copy of the video fills the sides) or a colour like `"#101010"`.
- **`zoom`** (optional, default 1): above 1 enlarges the picture and crops the quiet top and bottom margins; up to about 1.25 is safe in landscape. Check that nothing important at the very top or bottom is cut.
The contact sheet is made from the 9:16 render. For a video you already have: `python3 "$KIT/resize.py" <video.mp4> --size 1920x1080 [--fill blur] [--zoom 1.2]`.

## Taste
- Labels up to about 10 characters fit six bars; longer names need fewer bars.
- Text is never below 40 px, and important text stays 90 px from the sides and 220 px from the top and bottom.
- No flashing: highlights fade in and out over at least a few frames.
