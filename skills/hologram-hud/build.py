#!/usr/bin/env python3
"""/hologram-hud: spec.json -> a holographic drone wireframe with HUD and callouts (1080x1920, 30 fps, 6 s).  build.py <spec.json> [--check | --snap 0,1,3]"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

DEFAULTS = {'title': 'DRONE / HOLOGRAM STUDY', 'callouts': ['Motors', 'Camera', 'Frame'],
            'telemetry': ['ALT  012.4 m', 'BAT  86 %'], 'colors': {}, 'duration': 6}


def check(spec):
    if len(spec['callouts']) != 3:
        sys.exit('spec: "callouts" needs 3 entries: [motor, camera, frame]')
    if spec.get('telemetry') and len(spec['telemetry']) > 2:
        sys.exit('spec: keep "telemetry" to 2 short rows (they are shown as SIMULATED)')


if __name__ == '__main__':
    scene2d.build(HERE, DEFAULTS, check)
