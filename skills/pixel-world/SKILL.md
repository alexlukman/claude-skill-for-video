---
name: pixel-world
description: Makes a 2D pixel-art explainer reel (9:16) in code. Chunky pixel characters with big heads, outlined sprites, a side-view pixel world (sky, clouds, mountains, grass, houses, trees, signs), speech bubbles, a pixel-dissolve transition and 1 to 2 word captions. Use when the user runs /pixel-world or asks for a 2D pixel, Growtopia-like, or retro block-world animation.
---

# /pixel-world

```
┌──────────────────────┐
│  ☁     ☀     ☁       │  pixel sky, mountains, grass and dirt
│      ┌──────────┐    │
│      │ Hi prof! │    │  speech bubble in a bitmap font
│      └─▾────────┘    │
│     ▛▜   ▛▜    🌳    │  chunky pixel characters with outlines
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│       what if        │  1-2 word caption
└──────────────────────┘
```

A side-view 2D world made of big square pixels, in the spirit of block-building sandbox games. The characters and look are original; they are not copies of any game's artwork.

## First use
This skill's folder is the "Base directory" Claude Code shows when it loads it.
```bash
SKILL_DIR="<base directory of this skill>"
KIT=$(python3 -c 'import os,sys;print(os.path.realpath(os.path.join(sys.argv[1],"..","..","kit")))' "$SKILL_DIR")
[ -s "$KIT/node_modules/playwright/package.json" ] || bash "$KIT/setup.sh"
```
Needs ffmpeg, Node and Chrome or Chromium. Set `CHROME=/path/to/chrome` if Playwright's own browser is not installed. No WebGL is needed: it is plain 2D canvas.

## Steps
1. **Idea and cast.** Ask for the topic, then who is in it. Each character is a preset name or a custom spec (below).
2. **Script.** Write `<name>.pixel.json`: a few scenes, each 2 to 4 seconds, one beat per scene (setup, twist, payoff). Speech is short, under about 30 characters per line.
3. **Check the look.** `python3 "$SKILL_DIR/build.py" <spec.json> --snap 0.5,3.5` writes PNG stills next to the spec. Look at them before rendering.
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec.json>` writes `<name>.pixel.mp4` and a contact sheet `<name>.pixel.sheet.jpg` (about 1.2x real time).
5. **Hand over** the mp4 path.

## Turning a reference picture into a character
When the user sends a picture or describes a character, translate it into the character spec instead of tracing it. Pick: skin tone, `hair` style, hair colour, `outfit`, outfit colour, an `accent` colour, pants, shoes and up to a few `accessories`. Keep it original: take the idea (chunky body, big head, simple face, bold colours), never a real person's likeness or a game's exact character.

```json
"cast": {
  "mika": "mika",
  "hero": { "preset": "bolt", "hair": "mohawk", "hairColor": "#38c172", "outfit": "hoodie", "outfitColor": "#6b3fd1",
            "accessories": ["glasses", "scarf"], "accColor": "#ffd23f" }
}
```
- Presets: `mika`, `prof`, `ranger`, `agent`, `bolt`, `sage`. `"preset"` copies one and overrides the fields you give.
- `hair`: bald, buzz, spiky, bowl, curly, long, mohawk, quiff.
- `outfit`: tee, hoodie, coat, suit, vest, and the others in `engine/characters.js`.
- `accessories`: glasses, sunglasses, cap, headband, beard, earring, scarf. `accColor` and `beardColor` colour them.
- A style that does not exist yet (a new hat, hair, outfit) is one small function in `engine/characters.js` (`HAIR`, `OUTFIT`, `ACCESSORY`), drawn with `rect(g, colour, x, y, w, h)` on the pixel grid.

## Spec
```json
{
  "world": { "sky": "day", "ground": 0.68, "props": [ { "type": "tree", "x": 20 }, { "type": "sign", "x": 150, "text": "HELLO" } ] },
  "cast": { "mika": "mika", "prof": "prof" },
  "scenes": [
    { "dur": 3.2, "scale": 8, "caption": "what if", "cam": { "x": 90 },
      "actors": { "mika": { "x": 60, "to": 105, "move": [0.2, 2.2] }, "prof": { "x": 150, "face": -1 } },
      "say": [ { "who": "mika", "text": "Hi professor!", "at": 0.3, "until": 2.4 } ] }
  ]
}
```
- **`world.sky`**: `day`, `sunset` or `night`. **`ground`**: where the grass line sits (0 to 1 down the screen). **`props`**: `tree`, `bush`, `flower`, `sign` (`text`), `crate`, `fence` (`n`), `rock`, `lamp`, `house`. `x` is a world position; `"front": true` draws it in front of the actors.
- **`scale`**: how big one picture pixel is on screen: 5, 6, 8, 10 or 12. Bigger is chunkier and closer, so use 10 or 12 for close-ups and 6 for wide shots.
- **`cam`**: `x` is the camera position, `to` moves it during the scene, `follow` keeps an actor in frame.
- **`actors`**: `x` start, `to` end, `move` `[start, end]` seconds of the walk, `face` is 1 or -1, `do` is `idle`, `walk`, `run`, `wave`, `dance`, `jump` or `hit`, `at` is when the action starts.
- **`say`**: speech bubbles, `who`, `text`, `at`, optional `until`.
- **`transition`**: `"pixel"` dissolves into the next scene in blocks.
- A scene's `caption` is one or two lowercase words.
A finished example is in `examples/demo.pixel.json`.

## Taste
- Big heads, few colours per character, strong outline. Let the pixels be chunky.
- One idea per scene, a bubble per beat, and a pixel transition only on the big turn.
- Keep text short enough to read in under two seconds.
