# claude-skill-for-video

Seven [Claude Code](https://claude.com/claude-code) skills that make animated reels with no footage. Describe the idea, Claude writes a small spec, and the video is rendered on your own computer.

| Skill | What it makes |
|---|---|
| `/cartoon-3d` | A 3D cartoon "what if" explainer (three.js): cartoon people, props, slow-motion impacts |
| `/stick-figure` | A bright stick-figure explainer with captions, whip transitions and sound effects |
| `/pixel-world` | **New.** A 2D pixel-art world with chunky outlined characters, speech bubbles and pixel transitions |
| `/minimalistic-graphics` | Black-and-white line-art animation |
| `/map-route` | A 3D map with an animated route |
| `/breakdown` | A 3D exploded view: a phone comes apart into 9 layers, then the view orbits around it, every part labelled |
| `/graph` | A minimal animated line graph |

![pixel-world demo](docs/pixel-world-demo.jpg)

## Install
```bash
git clone https://github.com/alexlukman/claude-skill-for-video
cd claude-skill-for-video
bash install.sh
```
`install.sh` links each skill into `~/.claude/skills/` and installs the render kit (three.js, GSAP, Playwright, all pinned in `kit/package-lock.json`). You need Node, Python 3 and ffmpeg, plus Chrome or Chromium (set `CHROME=/path/to/chrome` if needed). Then in Claude Code, run for example `/pixel-world`.

## What changed from the original
This project started from [claude-animation-skills](https://github.com/artemnovitckii/claude-animation-skills) by Artem Novitckii (MIT). Changes:
- **`/cartoon-3d`** (was `/zach-d-films`): the faces no longer wobble. The head is one smooth surface, features are placed on it by ray-casting, the jaw stays still and the mouth only opens and closes.
- **`/breakdown`**: 9 layers instead of 6, and after the parts separate the view turns around the stack, with label dots tracking each part.
- **`/pixel-world`**: new skill, with its own pixel engine, bitmap font, characters, world and renderer.
- The kit pins GSAP through npm instead of downloading it from a CDN, and uses a patched Playwright.

## Safety notes
Everything runs locally. The skills make no network calls at render time. `kit/setup.sh` downloads npm packages (pinned) and, only for `/stick-figure` voice-over, speech model files from GitHub releases. Review `kit/setup.sh` and `install.sh` before running them, as you would with any script.

## License
MIT. The original code is © Artem Novitckii; additions are © Alexander Valentino Lukman. Characters and worlds are original designs and are not affiliated with any game or studio.
