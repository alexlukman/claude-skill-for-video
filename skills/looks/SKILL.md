---
name: looks
description: Makes a 6 s character scene for a reel in one of nine visual styles: hologram, cyberpunk neon, paper cutout stop motion, technical blueprint, thermal camera, Japanese TV anime, ASCII terminal, watercolour or claymation. A worker walks across an office carrying a stack of papers and the top sheet slips. Use when the user runs /looks, asks to show the same scene in different art styles, or names one of these styles for a short character animation.
---

# /looks

```
┌──────────────────────┐
│ EMPLOYEE_042 DOCS: 6 │  labels depend on the look
│  ┌──┐    ▭           │
│  │  │   o   ▤        │  a worker carries a stack of papers
│  └──┘  /|▤▤  ┬─┬     │  the top sheet slips at 3 s
│        / \    ~      │
└──────────────────────┘
```

One scene, nine looks. Use it to show a style quickly, to compare looks side by side, or as a base for your own character beats.

## First use
This skill's folder is the "Base directory" Claude Code shows when it loads it.
```bash
SKILL_DIR="<base directory of this skill>"
KIT=$(python3 -c 'import os,sys;print(os.path.realpath(os.path.join(sys.argv[1],"..","..","kit")))' "$SKILL_DIR")
[ -s "$KIT/node_modules/playwright/package.json" ] || bash "$KIT/setup.sh"
```
Needs Node, Python 3, ffmpeg and Chrome or Chromium (`CHROME=/path/to/chrome` if needed). It is a 2D canvas: the "3D" looks (claymation, hologram) are drawn to look that way, not modelled.

## Steps
1. **Ask** which look (or several) and any words to change (name tag, sign, terminal command, temperature).
2. **Spec.** Write `<name>.looks.json`, e.g. `{ "look": "anime" }`. For several looks, write one spec per look.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s and warns about text that does not fit.
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.looks.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio). Most looks take under a minute; watercolour and claymation are slower because of blur.
5. **Hand over** the mp4 paths.

## The looks
| `look` | What it does | Words it uses |
|---|---|---|
| `hologram` | Translucent cyan shapes with glowing rims, additive light, wireframe hatching, moving scanlines, short glitches, a grid floor and a projector disc with turning rings. The sheet bursts into particles and re-forms on the stack. | `name_tag`, docs count |
| `cyberpunk` | Night office: pink and cyan neon tubes, rain and lit buildings behind the window, a neon sign that dips briefly, a pink rim light on one side and cyan on the other, a wet reflective floor, haze and bloom. | `sign` |
| `paper` | Craft paper with rough cut edges, fibre texture and drop shadows; brass split pins at the joints; animated on twos (12 fps) with a little jitter each step. | none |
| `blueprint` | White and cyan lines on a gridded blue sheet; the office draws itself; dimension lines for height, stack, speed and stride; the sheet's fall drawn as a dashed arc with a note; a title block. | `title`, `dims`, `slip_note` |
| `thermal` | Heat values mapped through an ironbow palette (face and hands hottest, the mug hot and steaming, the window cold), with blur and sensor noise; a crosshair with a temperature, a scale bar, a REC dot and a timestamp. | `temp`, `timestamp` |
| `anime` | Two-tone cel shading, thin dark outlines, spiky hair with a highlight, big eyes, a painted sky and light rays on a wooden floor. At the slip: a quick zoom on his face, speed lines, a sweat drop and a red `!?`. | `exclaim` |
| `ascii` | The scene converted to green characters on about 80 columns, with CRT scanlines and a vignette; a command types itself at the top with a blinking cursor; a warning line at the slip. | `command`, `warn` |
| `watercolor` | Soft washes with darker pooled edges, loose pencil lines slightly off the colour, paper grain and a white margin; the washes change every 6 frames so it shimmers. | none |
| `clay` | Plasticine shading with thumb-press marks, bead eyes, a soft contact shadow, a blurred background like a macro lens, animated on twos with a small wobble. | none |

## Spec
```json
{ "look": "hologram", "docs": 6, "slip_at": 3.0, "caption": "",
  "name_tag": "EMPLOYEE_042", "sign": "OPEN 24/7", "temp": "36.8°C", "timestamp": "2026-11-11 21:04",
  "command": "user@office:~$ ./walk --docs 6", "warn": "!! WARN: sheet_01 detached",
  "title": "OFFICE WALK / STUDY", "slip_note": "SHEET 01 - DETACHED",
  "dims": ["H 1.78 m", "STACK 0.30 m", "v = 1.32 m/s", "STRIDE 1.39 m"], "exclaim": "!?" }
```
- **`look`**: one of the nine above. **`docs`**: sheets in the stack (2-10). **`slip_at`**: when the top sheet slips (0.5-4 s).
- **`caption`** (optional): a short line near the top, for any look.
- The other words only show up in the looks listed in the table.

## Changing it
- The scene is a list of shapes with a material name (`skin`, `shirt`, `paper`, `desk`, ...). `office()` builds the room and `worker(t)` the person (walk cycle, 2-bone arms, the paper stack). Each look in `LOOKS` maps materials to its own colours or heat values and draws the list its own way, so a new prop is one line in `office()` plus a colour in each palette.
- To add a look, add a function to `LOOKS` and its name to `LOOKS` in `build.py`.
- The isometric office idea from the same prompt set is better done with `/isometric`.

## Taste
- One small story beat (the slip) per clip. Let the style carry it.
- No strobing: the neon dip, the REC dot (1 Hz) and the glitches are short and spaced out.
- Text never below 40 px, inside 90 px at the sides and 220 px top and bottom.
