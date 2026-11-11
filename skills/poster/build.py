#!/usr/bin/env python3
"""/poster: spec.json -> an illustrated landscape poster, travel or watercolour look (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

DEFAULTS = {'look': 'travel', 'title': 'VISIT MOUNT OPUS', 'footer': 'FICTIONAL DESTINATION', 'colors': {}, 'duration': 6}


def check(spec):
    if spec['look'] not in ('travel', 'watercolour'):
        sys.exit('spec: "look" must be "travel" or "watercolour"')
    if len(spec['title']) > 20:
        print('note: the title is long for one line; keep it under about 20 characters')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
