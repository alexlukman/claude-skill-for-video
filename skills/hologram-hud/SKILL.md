---
name: hologram-hud
description: Makes a 6 s holographic HUD animation of an original quadcopter wireframe: luminous cyan lines on near-black, a scan line revealing the drone, a slow turn, pulsing rotor rings, orbiting HUD arcs and callouts to the motors, camera and frame. Use when the user runs /hologram-hud or asks for a hologram, sci-fi HUD or wireframe tech reveal.
---

# /hologram-hud

```
┌──────────────────────┐
│ DRONE / HOLOGRAM ... │
│ Frame ─┐   ┌─ Motors │
│   ◯───╔╗───◯         │  wireframe drone, slow turn
│   ◯───╚╝───◯         │  orbiting HUD arcs
│          └─ Camera   │
│ ALT 012.4 m SIMULATED│
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
2. **Spec.** Write `<name>.holo.json` (below). Anything left out uses the defaults.
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec.json> --check` writes stills at 0, 1, 3, 5 and 5.9 s to `<name>.holo.snaps/` and prints `text overflows` for any text that would not fit. Look at the stills: no clipped text, no labels on top of each other, nothing over the safe margins (90 px at the sides, 220 px top and bottom).
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.holo.mp4` (1080x1920, 30 fps, 180 frames, H.264 yuv420p, no audio) and a contact sheet.
5. **Hand over** the mp4 path and say what you checked.

## Timeline (6 s)
0-1 s a scan line reveals the outline, 1-3 s slow turn, 3-4 s rotor rings pulse, 4-5 s callouts connect, 5-6 s hold with a gentle scan.

## Spec
```json
{ "title": "DRONE / HOLOGRAM STUDY", "callouts": ["Motors", "Camera", "Frame"], "telemetry": ["ALT  012.4 m", "BAT  86 %"] }
```
- **`callouts`**: 3 labels for a motor, the camera and the frame.
- **`telemetry`** (optional, up to 2 rows): always shown with a SIMULATED tag. Set it to `null` to hide it. This is a design visualisation, not a flight display, so no real operational claims.
- **`colors`**: `bg`, `glow`, `dim`, `warm`, `ink`.
- **`filter`** (optional): `"ascii"` (green characters on a CRT, `ascii_cols` sets the columns, default 80), `"thermal"` (brightness through an ironbow heat palette with noise) or `"crt"` (scanlines and a vignette). Applied to every frame after the scene is drawn. ASCII suits bold shapes; small text turns to noise.
- **`duration`** (optional): defaults to 6 s; the timeline above is written for 6. **`out`** (optional): output path.

## Changing it
The drone is a list of 3D line segments in `model()` projected by `project()`; change `ROT` (rotor positions) or add segments for another object.

## Taste
- One colour plus one warm accent. Glow, not neon soup.
- Text is never below 40 px, and important text stays 90 px from the sides and 220 px from the top and bottom.
- No flashing: highlights fade in and out over at least a few frames.
