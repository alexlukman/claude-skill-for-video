#!/usr/bin/env python3
"""Fit a finished 9:16 video into any frame size ("quick fit").

    python3 kit/resize.py <in.mp4> --size 1920x1080 [--fill blur|#101010] [--zoom 1.0] [--out out.mp4]

The picture is scaled to fit inside the new frame and centred. The empty sides are filled with a blurred,
zoomed copy of the same video (fill "blur", the default) or a plain colour ("#rrggbb").
--zoom > 1 enlarges the picture and crops what goes past the frame: the skills keep about 220 px of quiet
margin at the top and bottom of the 9:16 frame, so up to about 1.25 crops only that margin in landscape.
Output: H.264, yuv420p, same fps, audio copied if there is any. Sizes are rounded to even numbers.
"""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

PRESETS = {'9:16': (1080, 1920), '16:9': (1920, 1080), '1:1': (1080, 1080), '4:5': (1080, 1350), '4:3': (1440, 1080), '21:9': (2560, 1080)}


def parse_size(s):
    s = str(s).strip().lower()
    if s in PRESETS:
        return PRESETS[s]
    m = re.fullmatch(r'(\d{2,5})\s*[x×]\s*(\d{2,5})', s)
    if not m:
        sys.exit(f'size "{s}": use WIDTHxHEIGHT like 1920x1080, or one of {", ".join(PRESETS)}')
    w, h = int(m[1]), int(m[2])
    if not (64 <= w <= 7680 and 64 <= h <= 7680):
        sys.exit('size must be between 64 and 7680 pixels on each side')
    return w - w % 2, h - h % 2


def probe(video):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                        '-of', 'csv=p=0', str(video)], capture_output=True, text=True, check=True)
    w, h = r.stdout.strip().split(',')[:2]
    a = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', str(video)],
                       capture_output=True, text=True).stdout.strip()
    return int(w), int(h), bool(a)


def fit(src, out, size, fill='blur', zoom=1.0):
    W, H = parse_size(size)
    iw, ih, has_audio = probe(src)
    if (iw, ih) == (W, H) and zoom == 1.0:
        if Path(src) != Path(out):
            shutil.copy(src, out)
        return out
    s = min(W / iw, H / ih) * float(zoom)
    fw, fh = max(2, round(iw * s / 2) * 2), max(2, round(ih * s / 2) * 2)
    cw, ch = min(fw, W), min(fh, H)                      # crop the zoomed picture to the frame
    fg = f'[1:v]scale={fw}:{fh}:flags=lanczos,crop={cw}:{ch}[fg]'
    if fill == 'blur':
        bg = f'[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=40:3,eq=brightness=-0.10:saturation=0.9[bg]'
    else:
        if not re.fullmatch(r'#?[0-9a-fA-F]{6}', fill):
            sys.exit('--fill must be "blur" or a colour like #101010')
        bg = f'[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},drawbox=x=0:y=0:w=iw:h=ih:color=0x{fill.lstrip("#")}:t=fill[bg]'
    graph = f'{bg};{fg};[bg][fg]overlay=(W-w)/2:(H-h)/2:shortest=1,setsar=1,format=yuv420p[v]'
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-i', str(src), '-filter_complex', graph, '-map', '[v]']
    cmd += ['-map', '0:a', '-c:a', 'copy'] if has_audio else []
    tmp = Path(str(out) + '.part.mp4')
    subprocess.run(cmd + ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-movflags', '+faststart', str(tmp)], check=True)
    tmp.replace(out)
    return out


def from_spec(spec, video):
    """Builders call this: if the spec has "size", fit the rendered 9:16 video in place."""
    if not spec.get('size'):
        return video
    fit(video, video, spec['size'], spec.get('fill', 'blur'), spec.get('zoom', 1.0))
    print(f'fitted to {"x".join(map(str, parse_size(spec["size"])))}: {video}')
    return video


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video'); ap.add_argument('--size', required=True); ap.add_argument('--fill', default='blur')
    ap.add_argument('--zoom', type=float, default=1.0); ap.add_argument('--out')
    a = ap.parse_args()
    src = Path(a.video).resolve()
    w, h = parse_size(a.size)
    out = Path(a.out).resolve() if a.out else src.with_name(f'{src.stem}.{w}x{h}.mp4')
    print(fit(src, out, a.size, a.fill, a.zoom))
