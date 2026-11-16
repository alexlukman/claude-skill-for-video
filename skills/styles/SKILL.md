---
name: styles
description: Renders a 6 s animation in any of 101 named animation styles (Alex's 88 style sheets plus 13 from his style guide), from traditional hand-drawn, cel, anime, manga and claymation to pixel art, VHS, glitch, kinetic type, infographics, particles, motion capture, AR and projection mapping. Use when the user runs /styles, names an animation style or technique, asks to compare styles, or wants "the same scene in style X".
---

# /styles

```
┌──────────────────────┐
│     13. Manga Style  │  optional style label
│        ▲ castle      │
│   ✶╲ o  ~~~ scarf    │  one original scene: a youth with a red
│     /|\    🌳 🌳      │  scarf runs past a castle on a hill
│     / \  ═══ path ═══│  ... redrawn in the chosen style
└──────────────────────┘
```

Every character style draws the **same original scene**, so styles can be compared directly. Graphic, simulation and technology entries (kinetic type, logo, infographic, liquid, particles, gears, heart, magnet field, motion capture, VR, AR, real-time editor, projection mapping) use their own small scene. The full list with what each one looks like is in `STYLES.md` at the repo root, generated from `catalog.json`.

## First use
This skill's folder is the "Base directory" Claude Code shows when it loads it.
```bash
SKILL_DIR="<base directory of this skill>"
KIT=$(python3 -c 'import os,sys;print(os.path.realpath(os.path.join(sys.argv[1],"..","..","kit")))' "$SKILL_DIR")
[ -s "$KIT/node_modules/playwright/package.json" ] || bash "$KIT/setup.sh"
```
Needs Node, Python 3, ffmpeg and Chrome or Chromium (`CHROME=/path/to/chrome` if needed).

## Steps
1. **Pick the style.** `python3 "$SKILL_DIR/build.py" --list` prints all 101 by category. Match the user's words to a slug (e.g. "90s anime" → `90s-anime`, "Wallace and Gromit look" → `claymation`). If a style is made by another skill (`isometric-3d` → `/isometric`, `hud` → `/hologram-hud`), use that skill. Some entries say "same as": they reuse another style's recipe with small changes.
2. **Spec.** Write `<name>.styles.json`:
   ```json
   { "style": "manga", "label": false, "caption": "", "recipe": { } }
   ```
   `style` accepts a slug, a number (`13`) or a name. `label: true` prints "13. Manga Style" at the top (good for comparison reels).
3. **Check.** `python3 "$SKILL_DIR/build.py" <spec> --check` writes stills at 0, 1, 3, 5 and 5.9 s. Look at them.
4. **Render.** `python3 "$SKILL_DIR/build.py" <spec>` writes `<name>.styles.mp4` (1080x1920, 30 fps, 6 s) and a contact sheet. Most styles render in 15-60 s; blur-heavy ones (watercolour, clay, stop motion with depth of field) take longer.
5. **Hand over** the mp4, and pass on the style's `note` if the build printed one (for example, photorealism and VR can only be approximated in a 2D video).

## Recipes (what makes each style)
A style is a recipe in `catalog.json`. Any field can be overridden in the spec's `"recipe"`:

| Field | Values |
|---|---|
| `palette` | natural, cel, retro, pastel, cartoon, vivid, gothic, clay, craft, sunset, neon, lowpoly, voxel, brick; `colors` overrides single materials (`{"scarf": "#2a6be0"}`) |
| `fill`, `charFill`, `bgFill` | flat, cel (hard shadow), soft (3D-like gradient), paint (brush dabs), wash (watercolour), silhouette, clay, paper (cutout), lowpoly, white, none |
| `line` | none, clean, weighted, boil (re-drawn wobble), sketch, ink, charcoal, marker, glow; `lineW`, `lineColor`, `lineChar` (character only), `lineAfter` (ink over tone) |
| timing | `fps` (24, 12 = on twos, 8, 6), `holds` (limited animation), `jitter` (stop-motion wobble), `boilFill` |
| character | `proportions` (normal, tall, cartoon, chibi), `eyes` (normal, big, dot, none), `limbs` (`tube` = rubber hose), `hair` (`block`), `gait` (run, walk) |
| camera | `speed` (parallax scroll), `camera: "still"`, `push` (slow zoom), `panY`, `dof` (background blur) |
| look | `mono` (ink, charcoal, sepia, gb) with `monoCurve` and `keep` (materials that stay in colour), `desat`, `speedlines`, `pixel` with `levels`/`dither`/`pixPalette` |
| `post` | grain, paper, vignette, bloom, halftone, screentone, pixel, vhs, glitch, sepia, hue, smudge, crt, ascii, thermal (`["grain", 0.05]` passes a strength) |
| `overlay` | panels, gamehud, bones, notebook, flipbook, collage, surreal, psychedelic, meme |
| `subject` | stick, type, logo, mograph, infographic, whiteboard, liquid, geometric, abstract, sand, object, documentary, mocap, flock, physics, morph, particles, wave, gears, architecture, heart, science, vr, ar, realtime, projection |

Words in subjects can be changed through the recipe too: `words` (kinetic type), `wordmark` (logo), `headline`, `values`, `note`, `say`, `quest`, `top`/`bottom`.

## Adding or improving a style
Edit its entry in `catalog.json` (keep `look` and `motion` as one plain sentence each), then regenerate the catalogue page with `python3 tools/styles_doc.py`. A new kind of fill, line or post effect goes in `render.js`; a new scene in `subjects.js`. Review the whole catalogue with `python3 "$SKILL_DIR/build.py" --sheet all.jpg` (one still per style, a few minutes).

## Honesty notes
- Techniques that need real-world capture or hardware (pixilation, rotoscope, motion and performance capture, AR, VR, real-time, projection mapping) are shown as clearly labelled simulations of how they look.
- Photorealistic CGI and true 3D are approximations; `/cartoon-3d` does real 3D.
- Characters are original. The reference sheets show other studios' characters; only the style is used, never the characters, logos or names (the brick style is a generic toy look).
