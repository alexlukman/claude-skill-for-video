#!/usr/bin/env python3
"""/blueprint: spec.json -> a dimensioned robot-arm blueprint (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

DEFAULTS = {'title': 'ROBOT ARM / CONCEPT STUDY', 'labels': ['Base', 'Shoulder', 'Elbow', 'Gripper'],
            'dims': ['240 mm', '180 mm', '190 mm'], 'note': 'ILLUSTRATIVE, NOT FOR FABRICATION', 'colors': {}, 'duration': 6}


def check(spec):
    if len(spec['labels']) != 4 or len(spec['dims']) != 3:
        sys.exit('spec: "labels" needs 4 entries (base, shoulder, elbow, gripper) and "dims" 3 (upper arm, forearm, base height)')
    if not spec.get('note'):
        sys.exit('spec: keep a "note" such as "ILLUSTRATIVE, NOT FOR FABRICATION": the dimensions are not engineering data')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
