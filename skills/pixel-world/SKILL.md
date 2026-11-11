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
- **`fx`**: pixel effects (from pixelfx, 171 of them). Each is `{ "type": "fire/campfire", "x": 120, "at": 0.5 }`: `x` is a world position like props, `y` lifts it (negative is up), `at` is when it starts in the scene, `until` hides it after that, `"front": true` draws it over the actors, and `palette` (a dark-to-bright list of hex colours) recolours it. One-shots (explosions, hits) play once; loops (fire, rain, fireflies) keep going.

### Effects
Good first picks: `fire/campfire`, `fire/torch`, `explosions/cartoon-pow`, `explosions/big-explosion`, `impacts/hit-spark`, `lightning/zap-hit`, `pickups/coin-spin`, `ui/confetti`, `ui/level-up`, `spawn/poof`, `weather/rain`, `weather/snow`, `arcane/portal`, `water/splash`. Put a hit effect at the same `at` as an actor's `"do": "hit"`.

- **fire**: brazier, campfire, candle, fire-breath, fire-tornado, fireball, flame-pillar, flamethrower, meteor, spirit-flame, torch
- **explosions**: barrel-explosion, big-explosion, cartoon-pow, dirt-explosion, firework-burst, firework-rocket, grenade, implosion, nuke, plasma-explosion, small-explosion, smoke-bomb
- **water**: bubbles, drip, fountain, geyser, rain-splash, ripples, splash, water-jet, water-orb, waterfall, wave-crash, whirlpool
- **ice**: blizzard-vortex, frost-breath, ice-crystal, ice-lance, ice-shatter, ice-spikes, icicle-fall, snowflake-burst
- **lightning**: ball-lightning, lightning-strike, plasma-ball, spark-arc, storm-cloud, tesla-coil, zap-hit
- **scifi**: emp-blast, energy-core, hologram, jetpack, laser-grid, teleporter-pad, tractor-beam
- **impacts**: blunt-hit, bullet-impact, crit-hit, ground-slam, hit-spark, impact-frame, parry, ricochet
- **projectiles**: arrow, bullet-tracer, cannonball, energy-disc, flare, homing-missile, laser-bolt, magic-missile, muzzle-pistol, muzzle-shotgun, muzzle-smg, plasma-shot, rocket
- **spawn**: coin-drop, egg-hatch, poof, spawn-portal, summon-rise
- **arcane**: arcane-orb, magic-circle-cast, mana-burst, portal, rune-circle, star-fall, time-stop
- **holy**: feather-burst, heal-aoe, holy-pillar, smite, sunburst
- **shadow**: black-hole, dark-explosion, eclipse, grasping-hands, hex-sigil, necro-skulls, shadow-flames, shadow-tendrils, soul-drain, void-orb
- **nature**: acid-splash, boulder, earth-spike, healing-bloom, poison-cloud, quake, spore-burst, thorns, tornado, toxic-puddle, vine-whip
- **weather**: aurora, blizzard, cherry-blossoms, clouds, falling-leaves, fireflies, fog, god-rays, rain, shooting-stars, snow, storm
- **ui**: achievement, coin-collect, combo-counter, confetti, countdown, crit-number, damage-number, health-bar-hit, heart-lost, quest-complete
- **pickups**: chest-open, coin-spin, collect-burst, crystal-shard, gem-spin, heart-pickup, key-glint, loot-beam, potion, power-star, xp-orb
- **transitions**: blinds, burn-away, crt-off, diamond-wipe, glitch-wipe, iris, pixel-dissolve, shatter-wipe, slash-wipe, star-iris
- **critters**: bat, bird, butterfly, eyeball, fish-school, flying-skull, frog, ghost, jellyfish, slime, snake, wisp

Effects that bring their own fighter (the `moves/` set and some melee, projectile and impact effects) are left out because the cast plays the characters. Some weather effects (`fog`, `fireflies`, `god-rays`, `aurora`) tint a band of the sky; check a still.
- **`transition`**: `"pixel"` dissolves into the next scene in blocks.
- A scene's `caption` is one or two lowercase words.
A finished example is in `examples/demo.pixel.json`.

## Taste
- Big heads, few colours per character, strong outline. Let the pixels be chunky.
- One idea per scene, a bubble per beat, and a pixel transition only on the big turn.
- Keep text short enough to read in under two seconds.
