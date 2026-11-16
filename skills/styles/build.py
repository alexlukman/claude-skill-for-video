#!/usr/bin/env python3
"""/styles: render the shared scene in one of 101 animation styles (1080x1920, 30 fps, 6 s).

    python3 build.py <spec.json> [--check | --snap 0,1,3]
    python3 build.py --list            all styles by category
    python3 build.py --sheet out.jpg   one still of every style on one sheet (for reviewing the whole catalogue)
    python3 build.py --thumbs DIR      one labelled still per style, DIR/<nn>-<slug>.jpg (used for the README gallery)

spec: {"style": "cel"}  (a slug, a number like 13, or a name), optional "recipe": {...} to override any recipe field,
"label": true to print the style name, "caption", "size"/"fill"/"zoom" for other frame sizes.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / 'kit' / 'scene2d'))
import scene2d  # noqa: E402

CAT = json.loads((HERE / 'catalog.json').read_text())
BY = {e['slug']: e for e in CAT['styles']}
SCRIPTS = ['world.js', 'character.js', 'render.js', 'subjects.js', 'main.js']


def find(key):
    k = str(key).strip().lower()
    for e in CAT['styles']:
        if k in (e['slug'], str(e['n']), e['name'].lower()):
            return e
    near = [e['slug'] for e in CAT['styles'] if k in e['slug'] or k in e['name'].lower()]
    sys.exit(f'unknown style "{key}".' + (f' Did you mean: {", ".join(near[:6])}?' if near else ' Run build.py --list.'))


def resolve(e):
    """follow aliases; an entry without its own recipe borrows the original's"""
    seen = set()
    while e.get('alias') and not e.get('recipe') and e['slug'] not in seen:
        seen.add(e['slug']); e = BY[e['alias']]
    return e


def check(spec):
    e = find(spec['style'])
    base = resolve(e)
    rec = dict(base.get('recipe') or {})
    if not rec and base.get('route'):
        sys.exit(f'"{e["name"]}" is made by another skill: /{base["route"]}. Use that skill.')
    rec.update(spec.get('recipe') or {})
    spec['recipe'] = rec
    spec['entry'] = {k: e[k] for k in ('n', 'slug', 'name', 'cat')}
    if e.get('note'):
        print(f'note: {e["note"]}')


def listing():
    for c, cname in CAT['categories'].items():
        print(f'\n{c}. {cname}')
        for e in CAT['styles']:
            if e['cat'] == c:
                how = f'-> /{e["route"]}' if e.get('route') and not (e.get('recipe')) else ('same as ' + e['alias'] if e.get('alias') else e['kind'])
                print(f'  {e["n"]:>3} {e["slug"]:<28} {e["name"]:<34} {how}')


def label_tile(img, num, name, w=360, h=640):
    """resize a still and print the style's number and name on a bar at the bottom"""
    from PIL import Image, ImageDraw, ImageFont
    img = img.convert('RGB').resize((w, h), Image.LANCZOS)
    d = ImageDraw.Draw(img)
    font = None
    for f in ('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf'):
        try:
            font = ImageFont.truetype(f, 24); break
        except OSError:
            continue
    font = font or ImageFont.load_default()
    label = f'{num}. {name}'
    while d.textlength(label, font=font) > w - 24 and getattr(font, 'size', 0) > 14:
        font = font.font_variant(size=font.size - 1)
    d.rectangle([0, h - 56, w, h], fill=(18, 18, 24))
    d.text((w / 2, h - 28), label, font=font, fill=(255, 255, 255), anchor='mm')
    return img


def thumbs(out_dir, t=2.2):
    """one labelled still per style, saved as <out_dir>/<nn>-<slug>.jpg (aliases are skipped)"""
    from PIL import Image
    out_dir = Path(out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    made = []
    with tempfile.TemporaryDirectory() as d:
        for e in CAT['styles']:
            if e.get('alias') or (e.get('route') and not e.get('recipe')):
                continue
            sp = Path(d) / f'{e["slug"]}.json'
            sp.write_text(json.dumps({'style': e['slug']}))
            r = subprocess.run([sys.executable, __file__, str(sp), '--snap', str(e.get('thumb_t', t))], capture_output=True, text=True)
            png = Path(d) / f'{e["slug"]}.snaps' / f't_{e.get("thumb_t", t):.2f}.png'
            if not png.exists():
                print('failed:', e['slug'], r.stderr[-400:]); continue
            dst = out_dir / f'{e["n"]:03d}-{e["slug"]}.jpg'
            label_tile(Image.open(png), e['n'], e['name']).save(dst, quality=84)
            made.append(dst); print('ok', dst.name, flush=True)
    return made


def sheet(out, t=2.2):
    from PIL import Image
    with tempfile.TemporaryDirectory() as d:
        tiles = [Image.open(p).resize((216, 384)) for p in thumbs(d, t)]
    cols = 10; rows = (len(tiles) + cols - 1) // cols
    img = Image.new('RGB', (cols * 216, rows * 384), '#111')
    for i, tl in enumerate(tiles):
        img.paste(tl, ((i % cols) * 216, (i // cols) * 384))
    img.save(out, quality=86); print('wrote', out)


if __name__ == '__main__':
    if '--list' in sys.argv:
        listing(); sys.exit()
    if '--thumbs' in sys.argv:
        thumbs(sys.argv[sys.argv.index('--thumbs') + 1]); sys.exit()
    if '--sheet' in sys.argv:
        sheet(sys.argv[sys.argv.index('--sheet') + 1]); sys.exit()
    scene2d.build(HERE, {'style': 'cel', 'recipe': {}, 'label': False, 'caption': '', 'duration': 6}, check, scripts=SCRIPTS)
