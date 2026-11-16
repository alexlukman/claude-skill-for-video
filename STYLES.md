# Animation style catalogue

101 entries: Alex's 88 style sheets (numbers 1-88) plus 13 styles from his written guide (89-101). Render any of them with `/styles` (`{"style": "<slug>"}`); entries marked with a skill are made by that skill. Generated from `skills/styles/catalog.json` by `tools/styles_doc.py`.

Pictures of every style are in the gallery in [README.md](README.md#style-gallery).

## A. Traditional 2D

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 1 | **Traditional Hand-Drawn** `traditional-hand-drawn` | technique | Hand-drawn lines that wobble slightly and vary in weight, soft painterly colour, paper grain, detailed painted backgrounds. | Full animation on 2s; every drawing slightly different (line boil), follow-through in hair and scarf. | `/styles` |
| 2 | **Cel Animation** `cel` | technique | Clean uniform outlines, flat opaque fills with one hard shadow tone, a crisp character layer over a softer painted background. | Smooth, consistent motion; no line boil. | `/styles` |
| 3 | **Limited Animation** `limited` | technique | Same clean cel drawing, simpler background, high contrast. | Few drawings (about 8 a second), held poses, short cycles, slow camera pans over still art. | `/styles` |
| 4 | **Rotoscope** `rotoscope` | technique | Realistic proportions and grounded anatomy, painterly cel shading, real-place backgrounds. *No live footage is used; the realistic motion is a hand-tuned walk/run cycle.* | Natural, weighty movement as if traced from footage. | `/styles` |
| 5 | **Cutout Animation** `cutout` | technique | Flat rigid pieces (head, torso, limbs) with card or paper texture and small drop shadows; bold flat colours, simple shapes. | Pieces rotate at joints, about 12 drawings a second, little squash. | `/styles` |
| 7 | **Digital 2D Animation** `digital-2d` | technique | Clean digital lines, flat or gradient colour, polished painted backgrounds, soft glow. | Smooth keyframed or rigged motion. | `/styles` |
| 8 | **Cel Animation (Traditional)** `cel-traditional` | technique | Same as Cel Animation (2). Vintage cel: bold outlines, flat colours, hand-painted gouache backgrounds, film grain and soft vignette. | Smooth full animation on cels. | `/styles` |
| 12 | **Silhouette Animation** `silhouette` | look | Solid black shapes with no inner lines against a glowing gradient sky. | Clear poses read through outline alone. | `/styles` |
| 19 | **Limited Animation (TV)** `limited-tv` | technique | Same as Limited Animation (3). TV anime cel art with muted palette. | Even fewer drawings (6 fps), long holds. | `/styles` |
| 20 | **Full Animation** `full-animation` | technique | Rich cel art with detailed movement. | Every frame drawn (30 fps), smooth arcs, speed lines on fast action. | `/styles` |
| 21 | **Cutout Animation (Digital)** `digital-cutout` | technique | Same as Cutout Animation (5). Digital cutout: clean flat pieces, no texture. | Pieces rotate at joints on 12s. | `/styles` |
| 22 | **Silhouette Animation (Sunset)** `silhouette-sunset` | look | Same as Silhouette Animation (12). Black silhouette against an orange sunset. | Fluid pose-driven motion. | `/styles` |
| 24 | **Flipbook Animation** `flipbook` | format | Pencil drawings on the pages of a small book. | Drawings flip at 12 per second; the page corner lifts. | `/styles` |
| 89 | **Frame-by-Frame Animation** `frame-by-frame` | technique | Each frame drawn separately; organic shape changes. | Line boil and loose drawing on 12s. | `/styles` |
| 90 | **Sketch Animation** `sketch` | look | Rough pencil construction lines, little colour. | Loose redrawn strokes. | `/styles` |

## B. Anime and Japanese-inspired

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 6 | **Anime-Style Animation** `anime-style` | look | Pencil-and-colour anime: varied lineweight, detailed eyes with highlights, light cel shading, airy sky. | Fluid key poses, hair and ribbons trailing. | `/styles` |
| 13 | **Manga Style** `manga` | look | Black and white ink, screentone dots for grey, speed lines, strong contrast. | Dramatic poses, panel-like framing. | `/styles` |
| 14 | **Watercolor Anime** `watercolor-anime` | look | Anime design in translucent watercolour washes, soft edges, pastel palette, paper grain. | Gentle keyframes; washes shimmer between drawings. | `/styles` |
| 15 | **Anime Pixel Art** `anime-pixel` | look | Anime design built from visible pixels, limited palette, stair-step contours. | Sprite-like stepped motion. | `/styles` (or `/pixel-world`) |
| 16 | **Anime Rotoscope** `anime-rotoscope` | technique | Anime faces on realistic body proportions, cel or painterly colour. *Motion is a tuned cycle, not traced footage.* | Grounded live-action-like motion. | `/styles` |
| 92 | **Traditional Anime** `traditional-anime` | look | Clean anime cel art, big expressive eyes, detailed sky. | Mix of held poses and fluid action. | `/styles` |
| 93 | **90s Retro Anime** `90s-anime` | look | Cel-era anime: muted palette, film grain, soft glow, hand-drawn lines. | Strong key poses, dramatic framing. | `/styles` |
| 94 | **Sakuga** `sakuga` | technique | High-energy anime action drawing. | Every frame drawn, smears and speed lines, camera push. | `/styles` |
| 95 | **Chibi Animation** `chibi` | look | Oversized head, tiny body, huge eyes. | Bouncy comedic motion. | `/styles` |

## C. Western cartoon

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 17 | **Classic American Cartoon** `classic-american` | look | Golden-age theatrical cartoon: rubber-hose limbs, gloves, big shoes, round shapes, bold flat colour. | Bouncy squash and stretch, rhythmic run. | `/styles` |
| 18 | **Modern Television Cartoon** `modern-tv` | look | Clean vector lines, simple shapes, flat colour, readable silhouettes. | Reusable cycles, controlled pose changes. | `/styles` |
| 91 | **Rubber Hose Animation** `rubber-hose` | look | Black and white 1930s cartoon: tube limbs, white gloves, film scratches. | Bouncy rhythmic loop. | `/styles` |
| 96 | **Adult Sitcom Cartoon** `adult-sitcom` | format | Flat colours, simple dot eyes, everyday setting. | Limited: holds, mouth flaps, walk cycles. | `/styles` |
| 97 | **Exaggerated Cartoon** `exaggerated` | look | Wild proportions, extreme squash and stretch. | Fast, elastic, over the top. | `/styles` |
| 98 | **Minimalist Cartoon** `minimalist` | look | Very few shapes and colours, lots of space. | Economical motion. | `/styles` |
| 99 | **Comic Strip Animation** `comic-strip` | format | Newspaper-strip panels, bold outlines, speech bubbles. | Small movements inside panels. | `/styles` |
| 100 | **Storybook Cartoon** `storybook` | look | Watercolour and pencil like a picture book, warm pastel colour. | Gentle, slow movement. | `/styles` |
| 101 | **Gothic Cartoon** `gothic` | look | Dark purples and greens, pale skin, spiky silhouettes, moonlit castle. | Theatrical, slightly jerky. | `/styles` |

## D. 3D

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 25 | **Stylized 3D** `stylized-3d` | look | 3D-looking forms with soft gradients, rim light, appealing exaggerated proportions. *Drawn in 2D to look 3D; for real 3D use /cartoon-3d.* | Smooth, appealing motion. | `/styles` |
| 26 | **Photorealistic CGI** `photorealistic` | look | Aims at photographic realism. *Not achievable in this 2D engine: this is the closest soft-shaded cinematic look.* | Natural physically plausible motion. | `/styles` |
| 27 | **Low Poly Animation** `low-poly` | look | Faceted triangles with flat shading, angular silhouettes. | Smooth motion over simple geometry. | `/styles` |
| 28 | **Cel-Shaded 3D** `cel-shaded-3d` | look | 3D forms with two-tone hard shading and bold toon outlines. | 3D-like turns with a flat drawn look. | `/styles` |
| 29 | **Voxel Animation** `voxel` | look | Everything built from cubes; blocky, grid-aligned forms. | Blocky stepped movement. | `/styles` |
| 30 | **Isometric 3D** `isometric-3d` | look | Angled top-down view with no perspective, clean diorama. | Diagonal grid movement. | `/isometric` |
| 31 | **Digital Clay** `digital-clay` | look | Clay-like rounded forms with fingerprints, made digitally. | Smooth (not stepped) clay-like motion. | `/styles` |
| 32 | **2.5D Animation** `2-5d` | look | Flat 2D art arranged in deep layers. | Camera moves through the layers with strong parallax and a slow push. | `/styles` |

## E. Stop motion

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 9 | **Stop Motion Animation** `stop-motion` | technique | Real-looking physical models and sets, soft studio light, shallow depth of field. | Captured frame by frame (12 fps) with a slight wobble between frames. | `/styles` |
| 10 | **Claymation** `claymation` | technique | Plasticine figures with thumb marks, rounded forms, bead-like eyes, warm miniature set, macro blur. | On twos with a small wobble, like real stop motion. | `/styles` (or `/looks (look: clay)`) |
| 11 | **Puppet Animation** `puppet` | technique | Articulated puppets in fabric and wood, rich materials, dramatic film-like lighting. | Stop motion on 12s with a slight jitter. | `/styles` |
| 33 | **Claymation** `claymation-2` | technique | Same as Claymation (10). | - | `/styles` |
| 34 | **Puppet Animation** `puppet-2` | technique | Same as Puppet Animation (11). | - | `/styles` |
| 35 | **Paper Cutout Stop Motion** `paper-cutout-stop-motion` | technique | Torn and cut paper with fibre texture and drop shadows, layered sets. | On twos with a small jitter each step. | `/styles` (or `/looks (look: paper)`) |
| 36 | **Brick Toy Animation** `brick-toy` | technique | Glossy plastic toy bricks and blocky figures, bright primaries. *A generic toy-brick look; no brand names, logos or official figures.* | Stepped stop-motion on 12s. | `/styles` |
| 37 | **Pixilation** `pixilation` | technique | Real people photographed pose by pose. *Uses an illustrated figure, not real performers; the stepped timing is the imitated part.* | Jerky, stepped, sometimes impossible movement. | `/styles` |
| 38 | **Sand Animation** `sand` | technique | Grains of sand on a lightbox, warm backlight, soft grainy shapes. | Images are swept and redrawn into new shapes. | `/styles` |
| 39 | **Paint-on-Glass Animation** `paint-on-glass` | technique | Thick wet paint with visible brushstrokes, glowing colours. | Shapes are repainted every frame and flow into each other. | `/styles` |
| 40 | **Object Animation** `object` | technique | Everyday objects on a real-looking set. | An object comes alive on twos. | `/styles` |

## F. Motion graphics

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 41 | **Motion Graphics** `motion-graphics` | graphic | Flat design shapes, icons and interface cards in bold colour. | Pops, slides, scales and rotations with easing. | `/styles` |
| 42 | **Kinetic Typography** `kinetic-typography` | graphic | Text is the subject: bold type, strong colour. | Words fly, rotate and scale in rhythm. | `/styles` |
| 43 | **Infographic Animation** `infographic` | graphic | Charts, icons and numbers in a clean layout. | Bars grow, numbers count up, a donut fills. | `/styles` (or `/coin-chart / graph also fit`) |
| 44 | **Logo Animation** `logo` | graphic | A brand mark and wordmark on a dark backdrop. | The mark builds, a light sweeps, the name fades in. | `/styles` |
| 45 | **Whiteboard Animation** `whiteboard` | format | Black marker lines on white, simple drawings, a hand with a pen. | Drawings appear stroke by stroke. | `/styles` (or `/chalkboard is a related look`) |
| 46 | **HUD Animation** `hud` | graphic | Cyan interface rings, grids, reticles and labels on dark. | Scanning sweeps, rotating rings, pulsing indicators. | `/hologram-hud` |
| 47 | **Liquid Motion** `liquid` | graphic | Glossy coloured blobs on a dark backdrop. | Shapes stretch, merge and split like liquid. | `/styles` |
| 48 | **Geometric Animation** `geometric` | graphic | Squares, circles and triangles in a grid, a few strong colours. | Rotate, scale and swap in a wave. | `/styles` |

## G. Experimental and artistic

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 49 | **Rotoscope** `rotoscope-2` | technique | Same as Rotoscope (4). | - | `/styles` |
| 50 | **Mixed Media Animation** `mixed-media` | look | Drawing combined with torn paper, halftone photo scraps and tape. | Animated figure inside a moving collage. | `/styles` |
| 51 | **Surreal Animation** `surreal` | look | Dreamlike sky with floating islands, stairs to nowhere and a drooping clock. | Impossible things drift and bend. | `/styles` |
| 52 | **Abstract Animation** `abstract` | look | Pure shapes, lines and colour fields, no figures. | Pulses and rotations to a rhythm. | `/styles` |
| 53 | **Glitch Animation** `glitch` | look | Digital corruption: RGB split, displaced blocks, tearing. | Calm frames broken by bursts of glitch. | `/styles` |
| 54 | **Psychedelic Animation** `psychedelic` | look | Saturated swirling colour, patterns everywhere. | Colours cycle and patterns spin continuously. | `/styles` |
| 55 | **Ink Animation** `ink` | look | Sumi-e ink: bold black brush contours, grey washes, a red accent. | Flowing strokes that settle. | `/styles` |
| 56 | **Charcoal Animation** `charcoal` | look | Charcoal on paper: dark smudged tones, rough grainy lines. | Contours shift and smudge between drawings. | `/styles` |

## H. Pixel and retro digital

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 57 | **8-Bit Pixel Art** `8-bit` | look | Large pixels, tiny palette, simple sprites. | Short stepped sprite cycles. | `/styles` (or `/pixel-world`) |
| 58 | **16-Bit Pixel Art** `16-bit` | look | Finer pixels, richer palette, dithered shading. | Detailed sprite animation. | `/styles` (or `/pixel-world`) |
| 59 | **High-Resolution Pixel Art** `hi-res-pixel` | look | Many small pixels, careful shading, rich palette. | Smooth detailed sprite motion. | `/styles` |
| 60 | **VHS Animation** `vhs` | look | Soft analogue video: colour bleed, scan lines, tracking noise, on-screen date. | Normal animation with tape wobble and glitches. | `/styles` |
| 61 | **Retro CGI** `retro-cgi` | look | Early 3D: low-poly faceted models, low-resolution textures, flat lighting. | Smooth but stiff. | `/styles` |
| 62 | **Dither Animation** `dither` | look | Patterned pixels (checkerboard/Bayer) standing in for gradients, limited palette. | Stepped pixel motion. | `/styles` |

## I. Internet and social media

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 23 | **Stick Figure Animation** `stick-figure` | look | Lines and a circle on paper, one accent colour. | Clear, dynamic poses. | `/styles` (or `/stick-figure`) |
| 63 | **Stickman Animation** `stickman` | look | Same as Stick Figure Animation (23). | - | `/styles` (or `/stick-figure`) |
| 64 | **Doodle Animation** `doodle` | look | Ballpoint and marker doodles on ruled notebook paper. | Wobbly lines that re-draw a few times a second. | `/styles` |
| 65 | **Faceless Storytelling** `faceless` | format | Characters without faces; mood from silhouette, colour and setting. | Body language carries the story. | `/styles` |
| 66 | **Comic Book Animation** `comic-book` | look | Bold inks, halftone dots, flat bright colour, speed lines. | Punchy poses and impact. | `/styles` |
| 67 | **Motion Comic** `motion-comic` | format | Comic panels with inked borders, captions and speech bubbles. | Pans and zooms inside panels, small movements. | `/styles` |
| 68 | **Documentary Animation** `documentary` | format | Archival look: sepia map, routes, dates. | A region spreads, a route draws, captions appear. | `/styles` |
| 69 | **Game-Based Animation** `game-based` | format | A game scene with health bar, minimap and quest text. | Gameplay-style run with HUD updates. | `/styles` |
| 70 | **Meme Animation** `meme` | format | Impact-style caption text, hard zooms, an original reaction. *Original reactions only; no existing meme characters.* | Sudden punch-ins and shakes. | `/styles` |
| 71 | **AI-Generated Animation** `ai-generated` | technique | Painterly, glossy, slightly unstable detail. *Imitates the look; nothing is AI-generated.* | Details shimmer and drift between frames (temporal instability). | `/styles` |
| 72 | **Parallax Storytelling** `parallax` | technique | Layered illustrated scenery, soft depth. | Near layers move fast, far layers slow. | `/styles` |

## J. Specialized

| # | Style | Kind | Looks like | Moves like | Made by |
|---|---|---|---|---|---|
| 73 | **Motion Capture** `motion-capture` | technology | A marker suit on a capture stage next to the digital rig it drives. *A simulated capture; no real data.* | Recorded-looking natural motion transferred to the rig. | `/styles` |
| 74 | **Performance Capture** `performance-capture` | technology | Body and face markers driving a digital character. *A simulated capture; no real data.* | Face points move with the performance. | `/styles` |
| 75 | **Procedural Animation** `procedural` | technique | A flock at sunset. | Motion comes from rules (cohesion, swirl, noise), not keyframes. | `/styles` |
| 76 | **Physics-Based Animation** `physics` | technique | Simple cubes on a grid floor. | Gravity, bounce and friction are simulated. | `/styles` |
| 77 | **Skeletal Animation** `skeletal` | technique | The character with its bone rig shown on top. | Joints rotate in a hierarchy (FK). | `/styles` |
| 78 | **Morph Animation** `morph` | technique | A head silhouette and a wolf's. | One outline interpolates smoothly into the other. | `/styles` |
| 79 | **Particle Animation** `particles` | technique | Thousands of glowing sparks. | Particles swirl, gather into a figure and stream away. | `/styles` |
| 80 | **Fluid Simulation** `fluid` | technique | Ocean waves at sunset with foam and spray. *A stylised wave, not a real fluid solver.* | A wave builds and breaks. | `/styles` |
| 81 | **Mechanical Animation** `mechanical` | visualization | Metal gears, a crank and a piston. | Gears mesh at matched speeds and drive the piston. | `/styles` (or `/blueprint / breakdown also fit`) |
| 82 | **Architectural Animation** `architectural` | visualization | A glass house at dusk with warm interior light. | A slow camera dolly past the building. | `/styles` |
| 83 | **Medical Animation** `medical` | visualization | A stylised heart, vessels and blood cells with labels. *Simplified and illustrative, not medical advice.* | The heart beats; cells flow; an ECG line runs. | `/styles` |
| 84 | **Scientific Animation** `scientific` | visualization | A bar magnet with field lines in space. | Field lines draw in; a compass follows them. | `/styles` |
| 85 | **VR Animation** `vr` | technology | The scene as two headset lens views. *A flat video can only show what VR looks like; it is not an immersive VR experience.* | Viewer-centred stereo view. | `/styles` |
| 86 | **AR Animation** `ar` | technology | A phone over a real desk shows the character standing on the table. *A simulated AR view inside a video.* | Placement ring appears, the character pops in. | `/styles` |
| 87 | **Real-Time Animation** `real-time` | technology | The scene inside a game-engine editor with an FPS counter. *A pre-rendered video that shows the look of a real-time editor.* | Live playback with gizmos. | `/styles` |
| 88 | **Projection Mapping** `projection-mapping` | technology | Coloured light mapped onto a building facade at night, crowd in front. *A simulated projection on a drawn building.* | Bands of light flow; a whale swims across the facade. | `/styles` |
