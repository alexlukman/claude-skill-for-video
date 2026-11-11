#!/usr/bin/env python3
"""/breakdown: spec.json -> a 3D phone that comes apart into 9 layers, then the view turns around it, every part labelled (1080x1920, 9.5 s).

    python3 build.py <spec.json> [--snap 1.0,3.6]
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit'))
import anim  # noqa: E402

DEFAULTS = {
    'title': 'Phone', 'subtitle': 'Exploded view',
    'labels': [['Cover glass', 'toughened · 0.6 mm'], ['OLED display', '6.3 in · 120 Hz'], ['Mid plate', 'steel · 10 screws'],
               ['Titanium frame', 'grade 5 · 7.8 mm'], ['Camera module', '3 lenses · flash'], ['Logic board', '3 nm chip · 8 GB'],
               ['Haptics', 'taptic + speaker'], ['Battery', '3,582 mAh'], ['Back glass', 'matte · magnet ring']],
    'time': '9:41', 'date': 'Saturday 1 November', 'accent': '#F08A5D',
}


def check(spec):
    lb = spec['labels']
    if not isinstance(lb, list) or len(lb) != 9 or not all(isinstance(x, list) and 1 <= len(x) <= 2 for x in lb):
        sys.exit('spec: "labels" needs 9 entries, top layer first, each ["Name", "short note"] (use ["", ""] to hide one)')
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', spec['accent']):
        sys.exit('spec: "accent" must be a hex colour like "#F08A5D"')
    for name, *note in lb:
        if len(name) > 16 or (note and len(note[0]) > 22):
            print(f'note: "{name}" is long for the label column (names ~16, notes ~22 characters)')


if __name__ == '__main__':
    anim.build(HERE / 'template.html', DEFAULTS, duration=lambda s: 9.5, three=True, check=check)
