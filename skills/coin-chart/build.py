#!/usr/bin/env python3
"""/coin-chart: spec.json -> a gold coin-stack bar chart (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

DEFAULTS = {'title': 'GOLD RESERVES BY COUNTRY', 'unit': 'tonnes',
            'items': [['Norland', 820], ['Eastmark', 610], ['Solvaria', 450], ['Westhaven', 290]],
            'suffix': ' t', 'colors': {}, 'duration': 6}


def check(spec):
    it = spec['items']
    if not (isinstance(it, list) and 2 <= len(it) <= 6 and all(isinstance(x, list) and len(x) == 2 and isinstance(x[1], (int, float)) and x[1] > 0 for x in it)):
        sys.exit('spec: "items" needs 2 to 6 entries like ["Name", 123] with positive values')
    if not spec.get('source'):
        print('note: no "source" given, so the chart is marked ILLUSTRATIVE DEMO DATA')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
