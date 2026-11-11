#!/usr/bin/env python3
"""Builder for the 2D canvas scene skills (isometric, coin-chart, neon-flight, blueprint, hologram-hud, chalkboard, poster).

A skill's build.py calls:  scene2d.build(skill_dir, DEFAULTS, check=None)
    python3 build.py <spec.json>                 -> <spec>.mp4 (1080x1920, 30 fps, H.264 yuv420p) + <spec>.sheet.jpg
    python3 build.py <spec.json> --snap 0,1,3    -> PNG stills in <spec>.snaps/
    python3 build.py <spec.json> --check         -> stills at 0, 1, 3, 5, 5.9 s plus text-overflow warnings
Playwright comes from kit/node_modules. CHROME=/path/to/chrome uses an installed Chrome.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent
sys.path.insert(0, str(KIT))
import anim  # noqa: E402


def merge(a, b):
    out = dict(a)
    for k, v in b.items():
        out[k] = merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def build(skill_dir, defaults, check=None):
    args = sys.argv[1:]
    if not args or args[0] in ('-h', '--help'):
        sys.exit(__doc__)
    spec_path = Path(args[0]).resolve()
    spec = merge(defaults, json.loads(spec_path.read_text()))
    if check:
        check(spec)
    if spec.get('size'):
        import resize
        resize.parse_size(spec['size'])
    for tool in ('node', 'ffmpeg'):
        if not shutil.which(tool):
            sys.exit(f'{tool} is missing. Mac: brew install ffmpeg node')
    if not (KIT / 'node_modules' / 'playwright').exists():
        sys.exit(f'Playwright not found: run  bash "{KIT}/setup.sh"  once, then build again')
    work = spec_path.parent / '.work' / spec_path.stem
    if work.exists():
        shutil.rmtree(work)
    (work / 'fonts').mkdir(parents=True)
    for f in (KIT / 'fonts').glob('*.woff2'):
        shutil.copy(f, work / 'fonts' / f.name)
    shutil.copy(HERE / 'page.html', work / 'index.html')
    shutil.copy(HERE / 'lib.js', work / 'lib.js')
    shutil.copy(Path(skill_dir) / 'scene.js', work / 'scene.js')
    (work / 'spec.js').write_text('window.SPEC = ' + json.dumps(spec, ensure_ascii=False) + ';')
    render = [shutil.which('node'), str(HERE / 'render.mjs'), str(work)]
    if '--snap' in args or '--check' in args:
        times = args[args.index('--snap') + 1] if '--snap' in args else '0,1,3,5,5.9'
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
    import resize
    resize.from_spec(spec, out)
    print(f'done: {out}\ncheck: {sheet}')
