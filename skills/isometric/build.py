#!/usr/bin/env python3
"""/isometric: spec.json -> an isometric power-to-home diagram (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

DEFAULTS = {'title': 'POWER TO YOUR HOME', 'labels': ['Power station', 'Transmission', 'Home'], 'colors': {}, 'duration': 6}


def check(spec):
    if not (isinstance(spec['labels'], list) and len(spec['labels']) == 3):
        sys.exit('spec: "labels" needs 3 entries: [source, line, destination]')
    for l in spec['labels']:
        if len(l) > 18:
            print(f'note: label "{l}" is long; keep labels under about 18 characters')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
