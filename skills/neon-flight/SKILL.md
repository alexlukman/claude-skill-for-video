---
name: neon-flight
description: Makes a 6 s looping synthwave flight through a neon wireframe canyon: a perspective grid rushing toward camera, magenta and cyan ridges, a ringed planet on the horizon and a small title near the top. Use when the user runs /neon-flight or asks for a synthwave, retro-wave or neon canyon flythrough.
---

# /neon-flight

```
┌──────────────────────┐
│     NEON CANYON      │  small title, fades at the end
│          ◎═          │  ringed planet, stays distant
│ /\/\_    ____/\/\    │  magenta and cyan ridges
│ ╲╲╲╲╲╲╲│╱╱╱╱╱╱╱      │  grid flows toward camera
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
2. **Spec.** Write `<name>.neon.json` (below). Anything left out uses the defaults.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s to `<name>.neon.snaps/` and prints `text overflows` for any text that would not fit. Look at the stills: no clipped text, no labels on top of each other, nothing over the safe margins (90 px at the sides, 220 px top and bottom).
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.neon.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio) and a contact sheet.
5. **Hand over** the mp4 path and say what you checked.

## Timeline (6 s)
0-1 s title fades in, 1-5 s constant-speed flight, 5-6 s title fades while the flight continues. The world repeats every clip, so the video loops seamlessly.

## Spec
```json
{ "title": "NEON CANYON", "loops": 4, "colors": { "left": "#ff3df2", "right": "#2ee6ff" } }
```
- **`title`**: short, under about 22 characters.
- **`loops`**: how many ridge gaps pass per clip (speed); a whole number keeps the loop seamless.
- **`colors`**: `sky0`, `sky1`, `sky2`, `grid`, `left`, `right`, `fill`, `planet`, `ring`, `title`.
- **`duration`** (optional): defaults to 6 s; the timeline above is written for 6. **`out`** (optional): output path.

## Changing it
Ridge shapes come from `ridge()` in `scene.js` (seeded, so they repeat identically each loop). Keep text out of the middle of the frame, where the flight path is.

## Taste
- Keep the title small and high; the canyon is the subject.
- Text is never below 40 px, and important text stays 90 px from the sides and 220 px from the top and bottom.
- No flashing: highlights fade in and out over at least a few frames.
