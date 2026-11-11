#!/usr/bin/env python3
"""/looks: spec.json -> one short character scene in a chosen look (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

LOOKS = ('hologram', 'cyberpunk', 'paper', 'blueprint', 'thermal', 'anime', 'ascii', 'watercolor', 'clay')
DEFAULTS = {'look': 'paper', 'docs': 6, 'slip_at': 3.0, 'caption': '',
            'name_tag': 'EMPLOYEE_042', 'sign': 'OPEN 24/7', 'temp': '36.8°C', 'timestamp': '2026-11-11 21:04',
            'exclaim': '!?', 'command': 'user@office:~$ ./walk --docs 6', 'warn': '!! WARN: sheet_01 detached',
            'title': 'OFFICE WALK / STUDY', 'slip_note': 'SHEET 01 - DETACHED',
            'dims': ['H 1.78 m', 'STACK 0.30 m', 'v = 1.32 m/s', 'STRIDE 1.39 m'], 'duration': 6}


def check(spec):
    if spec['look'] not in LOOKS:
        sys.exit(f'spec: "look" must be one of {", ".join(LOOKS)}')
    if not (isinstance(spec['docs'], int) and 2 <= spec['docs'] <= 10):
        sys.exit('spec: "docs" (sheets in the stack) must be 2-10')
    if not 0.5 <= spec['slip_at'] <= 4.0:
        sys.exit('spec: "slip_at" must be between 0.5 and 4.0 s so the sheet lands before the end')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
