#!/usr/bin/env python3
"""/neon-flight: spec.json -> a looping flight through a neon wireframe canyon (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

DEFAULTS = {'title': 'NEON CANYON', 'loops': 4, 'colors': {}, 'duration': 6}


def check(spec):
    if not isinstance(spec.get('loops'), int) or not 1 <= spec['loops'] <= 12:
        sys.exit('spec: "loops" (ridges passed per clip, keeps the loop seamless) must be a whole number 1-12')
    if len(spec['title']) > 22:
        print('note: the title is long for a small top title; keep it under about 22 characters')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
