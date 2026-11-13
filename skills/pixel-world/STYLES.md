# Pixel World art styles

`/pixel-world` has two independent art styles. Pick one per video with `"style"` at the top of the spec.

| `style` | Name | What it is |
|---|---|---|
| `"alex"` (default) | **Alex's Claude Pixel World** | The original look: 27 px tall characters, 14 px heads, soft sky bands, round-leaf trees. Nothing about it changed, so older specs render exactly as before (a spec without `style` is this one). |
| `"growtopia"` | **Growtopia** | The original game's 2D look, built from Alex's reference pictures: a 35 px tall block avatar with a 24x18 px tan head, big oval eyes, a bib body and short thick limbs, on grass and dirt with purple hills. All art is drawn in code. |

Both share the same spec format, scenes, camera, speech bubbles, captions, transitions and the 171 pixel effects. The styles only differ in how a character, the sky, the ground and the props are drawn.

```json
{ "style": "growtopia", "world": { "sky": "day" }, "cast": { "boss": "mogul" }, "scenes": [ ... ] }
```

## Growtopia: visual specification

Measured from Alex's reference pictures of the default avatar (the cardboard-tan block head with the thumbs-up pose, the toothy grin, the green-eyed "o" face and the Dirt Tree screenshot). Use these numbers when you add anything new, so future videos stay consistent. Reference pictures always win over the numbers: if a new picture disagrees, change the code to match the picture.

**Pixel density.** One art pixel is 1/24 of the head width. A character is 24 px wide at the head, about 28 px with arms, and 35 px tall. Squares stay visible: no anti-aliasing, 2 to 3 tones per colour, worn-wood grain marks on the head. The outline is a soft dark rim at half opacity, not a hard black line, as in the pictures.

| Part | Size and look |
|---|---|
| Head | A box 24 wide and 18 tall, 50 percent of the height, sitting straight on the body. Tan `#c9b8a0`, a darker 3 px side panel on the left, a shaded right edge and chin, small grain marks |
| Eyes | Two oval white eyes, 7 wide and 5 tall, 2 px apart, starting 4 px below the top and pushed to the right (the right eye nearly touches the head edge). Each has a 2x2 black square pupil at its right side. Optional `eyeColor` (green, for example) |
| Nose | A flat darker bar, 5x1, below the eyes |
| Mouth | A wide white band (15x2 plus a shorter row), the `grin`; `toothy` is the wide black-outlined grin with two rows of teeth (best with `"eyes": "small"`). Others: `o`, `smile`, `smirk`, `frown`, `flat`, `open` |
| Body | 14 wide and 11 tall, tan, with a cream bib (`#f2d9b8`) and two thin straps |
| Arms | 4 wide, hanging at the sides, with 5x3 square hands |
| Legs | 6 wide, 4 tall, with 8x2 flat feet pointing right; bare tan unless `pants` and `shoes` are given |

**Palette.** Sky `#43bdea` to `#86e2f8`, hills `#8f7fdc` and `#7b6bcb`, grass `#8dff5a` / `#52d92f` / `#3aa823`, dirt `#7d4c27` / `#6b3f20` / `#935c33`, wood `#b87a3c` / `#7a4a22`.

**Environment.** A bright 4 px grass strip with a jagged lower edge on brown dirt with diagonal streaks, a cyan sky with soft clouds, two lavender-purple hill layers, a distant pagoda, Dirt Trees (brown blocks with grass tufts), bushes, signs, crates, wooden floors, floating grass platforms and single blocks.

## Characters (Growtopia style)

The layers are drawn in the order of Alex's parts sheet: back items (wings, cape), legs and feet, body, arms, head, eyes, mouth, then hair, hats and halo. Part variants from that sheet (skin tones, eye and mouth shapes, hand poses, sneaker colours, wings, halo, sparkles, flame cape) are all original drawings made in code. The game's own art files are deliberately not used or copied into this repo.

**Using reference pictures.** When Alex sends a new Growtopia picture, measure it before touching the code: head width in art pixels (head width divided by 24 gives the picture's pixel size), eye size and position, mouth shape, body and leg size. Then change the numbers in `gtFace`, `gtDraw` and `GT_OUTFIT` and render `--snap` stills next to the picture. Clothes and hair are drawn as extra pixel shapes on the same grid.

With no fields at all (`"base"`) you get the bare avatar from the pictures. Everything else is worn on top. A character is a preset name or an object. Copy a preset and change fields with `{ "preset": "farmer", "hatColor": "#2a6cd8" }`. Every field is optional.

```json
"cast": {
  "me": "base",
  "friend": { "preset": "surprised", "eyeColor": "#7dff7d" },
  "boss": { "preset": "boss", "hair": { "style": "swept", "color": "#f2c24a" }, "glasses": "round", "face": { "brow": "angry", "mouth": "smirk" } }
}
```

| Field | Values |
|---|---|
| `tone` | head and limb colour by name: `light`, `peach`, `tan` (default), `brown`, `dark`; or set `skin` to any hex colour. `body` is the bib colour (default cream) |
| `hair` | `none`, `crop`, `sidepart`, `swept`, `spiky`, `locs`, `slick`, `afro`, `long`; or `{ "style": "...", "color": "#hex" }`; `hairColor` also works |
| `facial` | `none`, `stubble`, `stache`, `goatee`, `beard`, `full`; colour with `facialColor` |
| `glasses` | `none`, `round`, `square`, `shades`, `blindfold`; colour with `glassesColor` |
| `hat` | `none`, `cap`, `flatcap`, `beanie`, `cowl`, `pirate`, `songkok`, `crown`; colour with `hatColor` |
| `outfit` | `bare` (default), `tee`, `tank`, `jersey`, `suit`, `hoodie`, `gi`, `hero` |
| `outfitColor`, `outfitColor2`, `accent` | main colour, second colour (jersey stripes, suit shirt, hero sleeves), trim (tie, belt, cuffs) |
| `number` | text on a jersey, such as `"10"` |
| `badge` | small chest emblem colour (`hero`) |
| `cape` | cape colour, drawn behind the body |
| `pants`, `shoes` | hex colours (bare tan legs and feet when left out) |
| `eyeColor`, `pupil` | eye fill (white by default) and pupil colour |
| `held` | `none`, `cigarette` |
| `hand` | `plain` or `thumb` (thumbs-up right hand) |
| `sneakers` | colour of sneakers (white sole, coloured top) instead of bare feet or `shoes` |
| `wings` | `angel` or `bat`, drawn behind the body |
| `halo`, `sparkles` | `true` for a gold halo over the head, or sparkles around the body |
| `glow` | colour of a 1 px glow line around the head |
| `cape`, `capeStyle` | cape colour; `capeStyle: "flame"` paints it blue to purple to red to orange to yellow |
| `face` | `{ "eyes": "wide", "half", "small", "round", "slit", "closed" or "sleepy", "brow": "none", "flat", "angry" or "raised", "mouth": "grin", "o", "smile", "smirk", "frown", "flat", "open" }` |

Presets: `base`, `surprised`, `toothy`, `thumbs`, `angel`, `demon`, `flame`, `farmer`, `hero`, `boss`, `cool`, `pirate`, `king`, `sporty`.

A scene actor can also take `"mood": "smile"` (or `frown`, `smirk`, `o`, `grin`, `toothy`, `open`, `talk`) to change the mouth for that scene. Talking, blinking, walking, running, waving, dancing, jumping and the hit reaction work like in the other style.

New hair, hats and outfits are one function each in `engine/style-growtopia.js` (`GT_HAIR`, `GT_HAT`, `GT_OUTFIT`). Nothing about a specific character is built into the renderer, so a character always stays the same from frame to frame: it is drawn from its spec every frame with no randomness.

## World (Growtopia style)

Same `world` object as the other style, with extra props: `dirttree`, `woodfloor` (`w`, `y`), `pagoda`, `platform` (`x`, `w`, `h`, `y` height above the ground), `block` (`kind`: `"dirt"` or `"grass"`). The usual props (`tree`, `bush`, `flower`, `sign`, `crate`, `fence`, `rock`, `lamp`, `house`) work too. `sky` is `day`, `sunset` or `night`; `ground` defaults to `0.7`.

## How it is built

- `engine/styles.js` is a small registry. `"alex"` only wraps the original functions in `characters.js` and `world.js`.
- `engine/style-growtopia.js` adds the new style. It reuses the existing helpers (`rect`, `shade`, `hash2`, `rng32`, `disc`, the bitmap font, `drawSky`, the shared props, the pixel effects, camera, speech bubbles, captions, transitions and the renderer).
- `engine/main.js` picks the style with `STYLES[spec.style || 'alex']` and asks it to draw characters, sky, ground and props.
