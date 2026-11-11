#!/usr/bin/env python3
"""/chalkboard: spec.json -> a chalk neural-network teaching diagram (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

DEFAULTS = {'title': 'HOW AI LEARNS', 'steps': ['Predict', 'Compare', 'Adjust'],
            'layers': [{'label': 'Input', 'n': 3}, {'label': 'Hidden', 'n': 4}, {'label': 'Output', 'n': 2}],
            'prediction': 'Guess: 0.3', 'target': 'Target: 1.0',
            'footnote': 'Simplified neural-network training diagram', 'colors': {}, 'duration': 6}


def check(spec):
    if len(spec['layers']) != 3 or not all(1 <= l.get('n', 0) <= 5 for l in spec['layers']):
        sys.exit('spec: "layers" needs 3 layers, each {"label": "...", "n": 1-5}')
    if len(spec['steps']) != 3:
        sys.exit('spec: "steps" needs 3 short captions, e.g. ["Predict", "Compare", "Adjust"]')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
