---
name: breakdown
description: Makes a 3D exploded-view animation for a reel. A phone floats on a dark studio backdrop, comes apart into nine layers (glass, display, mid plate, frame, camera, logic board, haptics, battery, back), then the view turns slowly around the stack so every part can be seen from the side, each with a leader line and a label. Use when the user runs /breakdown or asks for an exploded view, a "what's inside" teardown or a labelled 3D breakdown of a device.
---

# /breakdown

```
┌──────────────────────┐
│ PHONE / EXPLODED VIEW│  mono header
│   ▱▱▱▱▱▱ ──── 01 Cover glass
│   ▱ 9:41 ▱ ── 02 OLED display
│   ▱▱▱▱▱▱ ──── ...      │  9 layers lift apart,
│   ▱▱▱▱▱▱ ──── 08 Battery│  then the camera orbits the stack
│   ▱▱▱▱▱▱ ──── 09 Back glass
└──────────────────────┘
```

## First use
This skill's folder is the "Base directory" Claude Code shows when it loads it.
```bash
SKILL_DIR="<base directory of this skill>"
KIT=$(python3 -c 'import os,sys;print(os.path.realpath(os.path.join(sys.argv[1],"..","..","kit")))' "$SKILL_DIR")
[ -s "$KIT/node_modules/three/build/three.module.js" ] || bash "$KIT/setup.sh"
```
Needs ffmpeg and Node. It renders with WebGL in headless Chrome. If HyperFrames cannot find a browser, set `HYPERFRAMES_BROWSER_PATH=/path/to/chrome`.

## Timeline (9.5 s)
0 to 0.4 s assembled, 0.4 to 2 s the layers lift apart, 1.7 s labels and leader lines draw in, 2.6 to 8.4 s the view turns around the stack (leader dots stay on their parts), then a short hold.

## Steps
1. **Labels.** Ask what the breakdown is for. The model is a phone, so the labels are the user's take on its nine layers, top first: cover glass, display, mid plate, frame, camera module, logic board, haptics, battery, back glass. Labels can be literal ("Battery / 3,582 mAh") or a joke ("Battery / never enough").
2. **Spec.** Write `<name>.breakdown.json` (below).
3. **Build.** Run `python3 "$SKILL_DIR/build.py" <spec.json>`. A 3D render takes a couple of minutes, most of it HyperFrames waiting on WebGL (a `sub_timeline_readiness_timeout` warning is normal). Run with `--snap 3.2,5.6,8.4` first to check the labels at different angles.
4. **Check** the sheet: every label sits right of the phone, inside the frame, the leader lines do not cross, and the numbers run 01 to 09 from top to bottom.
5. **Hand over** the mp4 path.

## Spec
```json
{
  "title": "Phone", "subtitle": "Exploded view",
  "labels": [["Cover glass", "toughened · 0.6 mm"], ["OLED display", "6.3 in · 120 Hz"], ["Mid plate", "steel · 10 screws"],
             ["Titanium frame", "grade 5 · 7.8 mm"], ["Camera module", "3 lenses · flash"], ["Logic board", "3 nm chip · 8 GB"],
             ["Haptics", "taptic + speaker"], ["Battery", "3,582 mAh"], ["Back glass", "matte · magnet ring"]],
  "time": "9:41", "date": "Saturday 1 November", "accent": "#F08A5D"
}
```
- **`labels`**: exactly 9, top layer first, each `["Name", "short note"]`. Names up to about 16 characters, notes about 22. `["", ""]` hides a label. The numbers are added in screen order.
- **`title`** / **`subtitle`**: the header, shown in capitals.
- **`time`** / **`date`**: what the lock screen shows.
- **`accent`**: label numbers, leader dots and the battery stripe (hex).
- **`hold`** (optional): extra seconds at the end. **`out`** (optional): the output path.

## Another object
The spec changes words, not shapes. For another flat, layered object (a tablet, a laptop lid, a card wallet, a smartwatch), copy `"$SKILL_DIR/template.html"` next to the spec and add `"template": "template.html"` to the spec. In the copy:
- `PW`, `PL`, `PR` set the outline (width, length, corner radius). `slab(w, l, r, thickness, material)` makes one rounded layer, and `tex(w, h, draw)` paints a canvas texture onto it (see the battery and the screen).
- Each `part(y0, y1)` is one layer: `y0` is its height assembled, `y1` how high it floats when exploded. Keep the parts in top-to-bottom order.
- Leader dots are computed from each part's projected bounding box, so they follow the part while the view orbits. `T_EX`, `T_O0`, `T_O1` set when the layers lift and when the orbit starts and ends.
Check with `--snap 1.0,3.2,5.6,8.4` after every change.


## Other screen sizes
Every skill renders 9:16 and can then fit the video into any frame. Add to the spec:
- **`size`**: `"16:9"`, `"1:1"`, `"4:5"`, `"4:3"`, `"21:9"` or any `"WIDTHxHEIGHT"` such as `"1920x1080"`.
- **`fill`** (optional): `"blur"` (default, a blurred copy of the video fills the sides) or a colour like `"#101010"`.
- **`zoom`** (optional, default 1): above 1 enlarges the picture and crops the quiet top and bottom margins; up to about 1.25 is safe in landscape. Check that nothing important at the very top or bottom is cut.
The contact sheet is made from the 9:16 render. For a video you already have: `python3 "$KIT/resize.py" <video.mp4> --size 1920x1080 [--fill blur] [--zoom 1.2]`.

## Taste
- Nine labels at most, short and plain. Notes are facts or one dry joke, never slogans.
- Keep the dark backdrop and the right-hand label column; the text stays clear of the phone.
