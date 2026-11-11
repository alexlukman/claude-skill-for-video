#!/usr/bin/env python3
"""/pixel-world: spec.json -> a 2D pixel-art video, side view, chunky pixel characters in a sunny pixel world (1080x1920).

    python3 build.py <spec.json> [--snap 1.0,3.5]

Without --snap it renders the whole video to <spec>.mp4 and a contact sheet <spec>.sheet.jpg.
With --snap it only writes PNG stills of those seconds next to the spec (fast, use it to check the look).
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parents[1] / 'kit'
sys.path.insert(0, str(KIT))
import anim  # noqa: E402

SCALES = (5, 6, 8, 10, 12)            # one pixel of the picture is this many screen pixels (1080 and 1920 divide evenly)
SKIES = ('day', 'sunset', 'night')


def check(spec):
    if not isinstance(spec.get('scenes'), list) or not spec['scenes']:
        sys.exit('spec: "scenes" must be a list with at least one scene')
    if not isinstance(spec.get('cast'), dict) or not spec['cast']:
        sys.exit('spec: "cast" must name at least one character, e.g. {"mika": "mika"} (a preset name) or {"mika": {...}}')
    if spec.get('world', {}).get('sky', 'day') not in SKIES:
        sys.exit(f'spec: world.sky must be one of {", ".join(SKIES)}')
    for i, sc in enumerate(spec['scenes']):
        if not isinstance(sc.get('dur'), (int, float)) or sc['dur'] <= 0:
            sys.exit(f'spec: scene {i} needs a "dur" in seconds')
        if sc.get('scale', 6) not in SCALES:
            sys.exit(f'spec: scene {i} "scale" must be one of {SCALES}')
        for who in sc.get('actors', {}):
            if who not in spec['cast']:
                sys.exit(f'spec: scene {i} uses "{who}" who is not in "cast"')


def main():
    args = sys.argv[1:]
    if not args or args[0] in ('-h', '--help'):
        sys.exit(__doc__)
    spec_path = Path(args[0]).resolve()
    spec = json.loads(spec_path.read_text())
    check(spec)
    for tool in ('node', 'ffmpeg'):
        if not shutil.which(tool):
            sys.exit(f'{tool} is missing. Mac: brew install ffmpeg node')
    if not (KIT / 'node_modules' / 'playwright').exists():
        sys.exit(f'Playwright not found: run  bash "{KIT}/setup.sh"  once, then build again')
    work = spec_path.parent / '.work' / spec_path.stem
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    for f in (HERE / 'engine').glob('*.js'):
        shutil.copy(f, work / f.name)
    shutil.copy(HERE / 'template.html', work / 'index.html')
    (work / 'spec.js').write_text('window.SPEC = ' + json.dumps(spec, ensure_ascii=False) + ';')
    render = [shutil.which('node'), str(HERE / 'render.mjs'), str(work)]
    if '--snap' in args:
        times = args[args.index('--snap') + 1]
        out_dir = spec_path.parent / (spec_path.stem + '.snaps')
        subprocess.run(render + ['stills', times, str(out_dir)], check=True)
        print(f'wrote stills to {out_dir}')
        return
    out = Path(spec['out']) if spec.get('out') else spec_path.with_suffix('.mp4')
    if not out.is_absolute():
        out = spec_path.parent / out
    print(f'rendering {out.name} ...', flush=True)
    subprocess.run(render + ['video', str(out)], check=True)
    sheet = out.with_suffix('.sheet.jpg')
    anim.sheet(out, sheet, 6)
    print(f'done: {out}\ncheck: {sheet}')


if __name__ == '__main__':
    main()
