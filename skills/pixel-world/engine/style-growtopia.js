// ------------------------------------------------------------------------------------------------
// STYLE "growtopia": Growtopia (the original game's 2D look, built from Alex's reference pictures).
// Block-world look: a big tan box head, wide round eyes with square pupils, a small bib body, thin limbs, saturated colours,
// grass-on-dirt platforms and a purple-mountain sky. Everything here is an ORIGINAL drawing made of rectangles (no game assets).
// This file adds a style; it does not change characters.js / world.js (the "alex" style). It reuses their helpers:
// rect, shade, hexRgb, rng32, hash2, disc, drawText/textWidth, drawSky (recoloured), PROPS (tree, bush, sign ...).
//
// (v3 extras from the parts sheet: tone, hand "thumb", sneakers colour, wings "angel"|"bat", halo, sparkles, glow colour, capeStyle "flame"; eyes small|round|slit|closed|sleepy|half; mouths dash|square|shout)
// A character is a plain object (see GT_PRESETS). Every field is optional and has a default:
//   skin, hair: "style" or {style, color, color2}, hairColor, face: {eyes, brow, mouth}, facial: "none|stubble|stache|goatee|beard|full",
//   facialColor, glasses: "none|round|square|shades|blindfold", glassesColor, hat: "none|cap|flatcap|beanie|cowl|pirate|songkok|crown",
//   hatColor, hatBand, outfit: "tee|jersey|suit|hoodie|gi|tank|hero", outfitColor, outfitColor2 (stripes / second colour), accent (tie, belt, trim),
//   number ("10", jerseys), badge (small chest emblem colour), cape (colour), pants, shoes, held: "none|cigarette"
// The sprite is 32 wide and 45 tall (head 28x24), origin in the middle of the feet, facing right.
// ------------------------------------------------------------------------------------------------

const GT = {
  outline: '#1b1216',
  skyDay:    { bands: ['#43bdea', '#4dc6ef', '#58cff2', '#65d6f4', '#74dcf6', '#86e2f8'], far: '#8f7fdc', near: '#7b6bcb', cloud: '#ffffff', cloudShade: '#d3e6fb' },
  skySunset: { bands: ['#3a2a8c', '#6234a0', '#a43f9c', '#e0587a', '#f58c5a', '#ffc269'], far: '#6a3f9e', near: '#523085', cloud: '#ffd1a8', cloudShade: '#e8908a' },
  grass: ['#8dff5a', '#52d92f', '#3aa823', '#2a7a1c'],     // highlight, main, shade, lip shadow
  dirt: ['#7d4c27', '#6b3f20', '#935c33', '#583218'],      // base, dark, light, deep
};

// ---------- reusable character kit ----------
// The base avatar (no options) is a tan block head, a light bib body, thin arms and short legs. Everything else is worn on top.
const GT_DEFAULTS = {
  skin: '#c9b8a0', body: '#f2d9b8', hair: 'none', hairColor: '#4a3426', eyeColor: '#ffffff', pupil: '#101018',
  face: { eyes: 'wide', brow: 'none', mouth: 'grin' }, glasses: 'none', glassesColor: '#1c1c28', hat: 'none', hatColor: '#4a4a52',
  outfit: 'bare', outfitColor: '#3c78d8', outfitColor2: '#ffffff', accent: '#ffffff', number: '', badge: null, cape: null, pants: null, shoes: null, held: 'none', hand: 'plain', sneakers: null, wings: null, halo: false, sparkles: false, glow: null, capeStyle: null,
};
// presets are just examples: copy one with {"preset": "...", ...changes}
const GT_TONES = { light: '#e8c9a6', peach: '#e8bf98', tan: '#c9b8a0', brown: '#a88c78', dark: '#8a6a52' };   // head and limb colours ("tone")
const GT_PRESETS = {
  base:    {},
  surprised: { face: { mouth: 'o' }, eyeColor: '#7dff7d' },
  toothy:  { face: { eyes: 'small', mouth: 'toothy' } },
  thumbs:  { hand: 'thumb', face: { mouth: 'grin' } },
  angel:   { halo: true, wings: 'angel', sparkles: true, sneakers: '#58b8f0', face: { mouth: 'dash' }, glow: '#9dff7d' },
  demon:   { wings: 'bat', face: { eyes: 'slit', brow: 'angry', mouth: 'shout' }, sneakers: '#2a2a34' },
  flame:   { capeStyle: 'flame', cape: '#c8302c', sneakers: '#e03a3a', face: { mouth: 'open' } },
  farmer:  { hat: 'cap', hatColor: '#d8402c', outfit: 'tee', outfitColor: '#2f9e44', pants: '#3a5aa8', shoes: '#5a3a20', face: { mouth: 'smile' } },
  hero:    { hair: 'spiky', hairColor: '#e8c63a', outfit: 'hero', outfitColor: '#3c5ad8', outfitColor2: '#d83c3c', accent: '#ffd23a', badge: '#ffd23a', cape: '#d83c3c', pants: '#3c5ad8', shoes: '#d83c3c', face: { mouth: 'smile' } },
  boss:    { hair: 'sidepart', hairColor: '#f2c24a', outfit: 'suit', outfitColor: '#1d2a5a', outfitColor2: '#ffffff', accent: '#d42a2a', pants: '#1d2a5a', shoes: '#16161e', face: { brow: 'angry', mouth: 'flat' } },
  cool:    { hair: 'slick', hairColor: '#17120f', glasses: 'shades', outfit: 'hoodie', outfitColor: '#8a2be2', accent: '#ffffff', pants: '#2a3350', shoes: '#f4f4f4', face: { mouth: 'smirk' } },
  pirate:  { hat: 'pirate', hatColor: '#3b2a22', facial: 'goatee', facialColor: '#33231a', outfit: 'suit', outfitColor: '#5a4636', outfitColor2: '#e8dcc0', accent: '#b8222a', pants: '#3a2c24', shoes: '#2a1c14', face: { brow: 'raised', mouth: 'smirk' } },
  king:    { hat: 'crown', outfit: 'suit', outfitColor: '#7a2bb8', outfitColor2: '#f4f4f8', accent: '#ffd23a', cape: '#c8302c', pants: '#7a2bb8', face: { mouth: 'smile' } },
  sporty:  { hair: 'crop', hairColor: '#2a1c14', outfit: 'jersey', outfitColor: '#c8302c', outfitColor2: '#ffffff', number: '7', pants: '#f4f4f4', face: { mouth: 'grin' } },
};
function gtResolve(def) {
  const d = typeof def === 'string' ? { preset: def } : def;
  const base = d.preset ? GT_PRESETS[d.preset] : {};
  if (d.preset && !base) throw new Error('growtopia: unknown preset "' + d.preset + '"');
  const m = { ...GT_DEFAULTS, ...base, ...d };
  if (m.tone && !d.skin && !(base && base.skin)) { m.skin = GT_TONES[m.tone]; if (!m.skin) throw new Error('growtopia: unknown tone "' + d.tone + '" (' + Object.keys(GT_TONES).join(', ') + ')'); }
  if (!m.pants) m.pants = m.skin;                                          // bare legs and feet unless clothes are given
  if (!m.shoes) m.shoes = shade(m.skin, -.08);
  m.face = { ...GT_DEFAULTS.face, ...(base || {}).face, ...(d.face || {}) };
  if (m.hair && typeof m.hair === 'object') { m.hairColor = m.hair.color || m.hairColor; m.hair = m.hair.style || 'none'; }
  if (!GT_HAIR[m.hair]) throw new Error('growtopia: unknown hair "' + m.hair + '" (see GT_HAIR)');
  if (!GT_OUTFIT[m.outfit]) throw new Error('growtopia: unknown outfit "' + m.outfit + '" (see GT_OUTFIT)');
  if (m.hat !== 'none' && !GT_HAT[m.hat]) throw new Error('growtopia: unknown hat "' + m.hat + '" (see GT_HAT)');
  return m;
}
const gtLum = h => { const [r, g, b] = hexRgb(h); return .3 * r + .59 * g + .11 * b; };

// ---------- hair ----------  the head box spans x -12..11 and starts at hy
const hl = c => shade(c, .28), dk = c => shade(c, -.3);
const GT_HAIR = {
  none:    { front() {} },
  crop:    { front(g, c, hy) { const h = c.hairColor; rect(g, h, -13, hy - 2, 26, 5); rect(g, h, -13, hy + 3, 3, 6); rect(g, hl(h), -8, hy - 1, 8, 1); rect(g, dk(h), -13, hy + 2, 26, 1); } },
  sidepart:{ front(g, c, hy) { const h = c.hairColor; rect(g, h, -13, hy - 3, 26, 7); rect(g, h, -14, hy + 4, 4, 7); rect(g, h, 10, hy + 4, 2, 2); rect(g, hl(h), -8, hy - 2, 9, 1); rect(g, hl(h), 2, hy - 1, 5, 1); rect(g, dk(h), 3, hy - 3, 1, 3); rect(g, dk(h), -13, hy + 3, 25, 1); } },
  swept:   { front(g, c, hy) { const h = c.hairColor; rect(g, h, -15, hy - 5, 29, 7); rect(g, h, -17, hy - 1, 5, 13); rect(g, h, 5, hy - 6, 10, 4); rect(g, hl(h), -9, hy - 4, 12, 1); rect(g, dk(h), -15, hy + 2, 24, 1); rect(g, dk(h), -14, hy + 5, 3, 7); } },
  spiky:   { front(g, c, hy) { const h = c.hairColor; rect(g, h, -13, hy - 2, 26, 5); rect(g, h, -14, hy + 3, 4, 6); [[-13, 5], [-9, 8], [-5, 9], [0, 8], [4, 9], [8, 7], [11, 4]].forEach(([x, t]) => { rect(g, h, x, hy - 2 - t, 3, t); rect(g, hl(h), x, hy - 2 - t, 2, 1); }); rect(g, dk(h), -13, hy + 2, 25, 1); } },
  locs:    { front(g, c, hy) { const h = c.hairColor; rect(g, h, -13, hy - 2, 26, 6); rect(g, h, -16, hy + 2, 5, 11); [[-15, 6, 2], [-11, 8, 2], [-7, 9, 2], [-2, 10, 3], [3, 9, 2], [7, 8, 2], [10, 6, 2], [13, 4, 2]].forEach(([x, t, w]) => { rect(g, h, x, hy - 2 - t, w, t); rect(g, dk(h), x + w - 1, hy - 2 - t, 1, t); }); rect(g, hl(h), -8, hy - 1, 6, 1); rect(g, dk(h), -13, hy + 3, 25, 1); } },
  slick:   { front(g, c, hy) { const h = c.hairColor; rect(g, h, -12, hy - 1, 25, 5); rect(g, h, -13, hy + 4, 2, 6); rect(g, hl(h), -7, hy, 12, 1); rect(g, hl(h), -4, hy + 1, 8, 1); rect(g, dk(h), -12, hy + 3, 24, 1); } },
  afro:    { front(g, c, hy) { const h = c.hairColor; rect(g, h, -16, hy - 5, 32, 12); rect(g, h, -14, hy - 8, 28, 4); rect(g, h, -17, hy - 1, 3, 10); rect(g, hl(h), -9, hy - 7, 8, 1); rect(g, dk(h), -15, hy + 6, 28, 1); } },
  long:    { back(g, c, hy) { rect(g, c.hairColor, -16, hy + 2, 32, 26); rect(g, dk(c.hairColor), 12, hy + 3, 4, 22); }, front(g, c, hy) { const h = c.hairColor; rect(g, h, -14, hy - 2, 27, 6); rect(g, h, -15, hy + 4, 4, 12); rect(g, h, 10, hy + 4, 2, 9); rect(g, hl(h), -8, hy - 1, 10, 1); rect(g, dk(h), -13, hy + 3, 25, 1); } },
};

// ---------- hats ----------
const GT_HAT = {
  cap:      (g, c, hy) => { const k = c.hatColor; rect(g, k, -13, hy - 5, 26, 8); rect(g, shade(k, .2), -8, hy - 4, 8, 1); rect(g, shade(k, -.25), -13, hy + 2, 26, 1); rect(g, shade(k, -.2), 6, hy + 2, 11, 2); },
  flatcap:  (g, c, hy) => { const k = c.hatColor; rect(g, k, -13, hy - 5, 24, 7); rect(g, k, -14, hy + 1, 30, 3); rect(g, shade(k, .22), -8, hy - 4, 10, 1); rect(g, shade(k, -.3), -14, hy + 3, 30, 1); },
  beanie:   (g, c, hy) => { const k = c.hatColor; rect(g, k, -13, hy - 5, 26, 9); rect(g, shade(k, -.22), -13, hy + 1, 26, 3); rect(g, shade(k, .22), -8, hy - 4, 8, 1); disc(g, 0, hy - 7, 2, shade(k, .15)); },
  cowl:     (g, c, hy) => { const k = c.hatColor; rect(g, k, -13, hy - 2, 26, 11); rect(g, k, -13, hy + 9, 6, 8); rect(g, k, 8, hy + 9, 4, 8); rect(g, k, -11, hy - 10, 5, 8); rect(g, k, 7, hy - 10, 5, 8); rect(g, shade(k, .2), -10, hy - 9, 2, 6); rect(g, shade(k, .2), 8, hy - 9, 2, 6); },
  pirate:   (g, c, hy) => { const k = c.hatColor, e = shade(k, .3); rect(g, k, -18, hy - 2, 36, 6); rect(g, k, -14, hy - 10, 27, 9); rect(g, k, -20, hy + 1, 6, 5); rect(g, k, 14, hy + 1, 6, 5); rect(g, e, -12, hy - 9, 12, 1); rect(g, e, -18, hy - 2, 36, 1); rect(g, shade(k, -.3), -18, hy + 3, 36, 1); rect(g, '#e8dcc0', -2, hy - 7, 3, 3); rect(g, '#e8dcc0', -3, hy - 5, 5, 1); },
  songkok:  (g, c, hy) => { const k = c.hatColor; rect(g, k, -11, hy - 7, 22, 11); rect(g, shade(k, .18), -8, hy - 6, 8, 1); rect(g, shade(k, -.25), -11, hy + 3, 22, 1); },
  crown:    (g, c, hy) => { const k = '#ffd23a'; rect(g, k, -10, hy - 5, 20, 5); [-10, -3, 3, 8].forEach(x => rect(g, k, x, hy - 9, 2, 4)); rect(g, '#fff4a0', -8, hy - 4, 3, 1); rect(g, '#d63a3a', -1, hy - 4, 2, 2); rect(g, '#c79a14', -10, hy - 1, 20, 1); },
};

// ---------- body, arms, outfits ----------
// torso x -7..6 (14 wide), top at by, 11 rows. Arms 4 wide hang at x -11 and 7, ending in 5x3 hands.
function gtArm(g, c, p, by, x, side, sleeve, rows, _u, cuff) {
  const raised = side > 0 ? p.raiseR : p.raiseL, sk = c.skin, skD = shade(sk, -.18);
  if (raised) { const wy = by - 7 + (p.waveStep ? -2 : 0); rect(g, sleeve, x, wy + 4, 4, 7); rect(g, sk, x - 1, wy - 1, 6, 6); rect(g, skD, x + (side > 0 ? 5 : -1), wy, 1, 5); rect(g, shade(sleeve, -.22), x + (side > 0 ? 3 : 0), wy + 4, 1, 7); return; }
  const y = by + 1 + (side > 0 ? p.armR : p.armL);
  rect(g, sk, x, y, 4, 9); rect(g, skD, x + (side > 0 ? 3 : 0), y, 1, 9); rect(g, shade(sk, .14), x + 1, y + 1, 1, 3);
  if (rows) { rect(g, sleeve, x, y, 4, rows); rect(g, shade(sleeve, -.22), x + (side > 0 ? 3 : 0), y, 1, rows); if (cuff) rect(g, cuff, x, y + rows - 1, 4, 1); }
  rect(g, sk, x - (side > 0 ? 0 : 1), y + 8, 5, 3); rect(g, skD, x - (side > 0 ? 0 : 1), y + 10, 5, 1);
  if (c.hand === 'thumb' && side > 0) { rect(g, sk, x + 2, y + 5, 2, 4); rect(g, skD, x + 3, y + 5, 1, 4); }       // thumbs-up hand
}
function gtTorso(g, col, by, h = 11, w = 14) { rect(g, col, -7, by, w, h); rect(g, shade(col, -.2), -7 + w - 2, by, 2, h); rect(g, shade(col, -.3), -7, by + h - 1, w, 1); rect(g, shade(col, .16), -5, by + 1, 4, 1); }
const GT_OUTFIT = {
  bare(g, c, p, by) { gtArm(g, c, p, by, -11, -1, c.skin, 0); gtArm(g, c, p, by, 7, 1, c.skin, 0); gtTorso(g, c.skin, by); rect(g, c.body, -5, by + 3, 10, 8); rect(g, shade(c.body, -.12), -5, by + 9, 10, 2); rect(g, c.body, -4, by, 1, 3); rect(g, c.body, 3, by, 1, 3); rect(g, shade(c.body, .2), -4, by + 4, 3, 1); },
  tee(g, c, p, by) { gtArm(g, c, p, by, -11, -1, c.outfitColor, 4); gtArm(g, c, p, by, 7, 1, c.outfitColor, 4); gtTorso(g, c.outfitColor, by); rect(g, c.skin, -3, by, 6, 1); rect(g, c.accent, -5, by + 6, 10, 2); },
  tank(g, c, p, by) { gtArm(g, c, p, by, -11, -1, c.skin, 0); gtArm(g, c, p, by, 7, 1, c.skin, 0); gtTorso(g, c.outfitColor, by); rect(g, c.skin, -4, by, 8, 2); rect(g, c.accent, -2, by + 5, 4, 3); },
  jersey(g, c, p, by) {
    const a = c.outfitColor, b = c.outfitColor2; gtArm(g, c, p, by, -11, -1, a, 4, false, b); gtArm(g, c, p, by, 7, 1, a, 4, false, b); gtTorso(g, a, by);
    if (b !== '#ffffff' || a === '#ffffff') for (let x = -6; x < 6; x += 6) rect(g, b, x + 1, by, 3, 11);
    rect(g, c.skin, -3, by, 6, 1); rect(g, shade(a, -.25), -4, by, 8, 1);
    if (c.number) { const w = textWidth(c.number), x = -Math.floor(w / 2), light = gtLum(a) > 150; rect(g, light ? '#ffffff' : a, x - 1, by + 2, w + 2, 9); drawText(g, c.number, x, by + 3, light ? '#15151c' : '#ffffff', 1); }
  },
  suit(g, c, p, by) {
    gtArm(g, c, p, by, -11, -1, c.outfitColor, 9, false, shade(c.outfitColor, .22)); gtArm(g, c, p, by, 7, 1, c.outfitColor, 9, false, shade(c.outfitColor, .22)); gtTorso(g, c.outfitColor, by);
    rect(g, c.outfitColor2, -2, by, 5, 7); for (let i = 0; i < 3; i++) rect(g, c.outfitColor2, -2 + i, by + 4 + i, Math.max(1, 5 - i * 2), 1);
    rect(g, shade(c.outfitColor, .2), -6, by, 2, 6); rect(g, shade(c.outfitColor, .2), 4, by, 2, 6);
    rect(g, c.accent, 0, by, 2, 1); rect(g, c.accent, 0, by + 1, 2, 5); rect(g, shade(c.accent, -.3), 1, by + 1, 1, 5);
  },
  hoodie(g, c, p, by) {
    gtArm(g, c, p, by, -11, -1, c.outfitColor, 9, false, shade(c.outfitColor, -.2)); gtArm(g, c, p, by, 7, 1, c.outfitColor, 9, false, shade(c.outfitColor, -.2)); gtTorso(g, c.outfitColor, by);
    rect(g, shade(c.outfitColor, -.14), -5, by + 6, 10, 4); rect(g, shade(c.outfitColor, -.32), -5, by + 6, 10, 1); rect(g, shade(c.outfitColor, -.2), -8, by - 1, 16, 2); rect(g, c.accent, 0, by + 1, 1, 9);
  },
  gi(g, c, p, by) {
    gtArm(g, c, p, by, -11, -1, c.outfitColor, 9, false, shade(c.outfitColor, -.12)); gtArm(g, c, p, by, 7, 1, c.outfitColor, 9, false, shade(c.outfitColor, -.12)); gtTorso(g, c.outfitColor, by);
    for (let i = 0; i < 6; i++) { rect(g, c.accent, -5 + i, by + i, 2, 1); rect(g, c.accent, 3 - i, by + i, 2, 1); }
    rect(g, c.accent, -7, by + 8, 14, 2);
  },
  hero(g, c, p, by) {
    const a = c.outfitColor, b = c.outfitColor2; gtArm(g, c, p, by, -11, -1, b, 6, false, c.accent); gtArm(g, c, p, by, 7, 1, b, 6, false, c.accent); gtTorso(g, a, by);
    rect(g, b, -7, by + 8, 14, 3); rect(g, c.accent, -7, by + 8, 14, 1);
    if (c.badge) { rect(g, c.badge, -3, by + 2, 6, 4); rect(g, shade(c.badge, -.3), -2, by + 3, 4, 2); rect(g, c.badge, -1, by + 2, 2, 4); }
  },
};

// the wide black-outlined grin with two rows of teeth (20 x 9): X black, W white
const GT_TOOTHY = ['XX..................', 'XXX..............XXX', 'XXXXXXXXXXXXXXXXXXXX', 'XWWXWWXWWXWWXWWXWWXX', 'XWWXWWXWWXWWXWWXWWXX', 'XXXXXXXXXXXXXXXXXXXX', '.XWWXWWXWWXWWXWWXWX.', '..XWWXWWXWWXWWXWWX..', '....XXXXXXXXXXXX....'];
// ---------- face ----------
function gtFace(g, c, p, hy) {
  const sk = c.skin, skD = shade(sk, -.14), skL = shade(sk, .12), F = c.face, hide = c.glasses === 'shades' || c.glasses === 'blindfold';
  rect(g, sk, -12, hy, 24, 18); rect(g, skD, -12, hy, 3, 18); rect(g, shade(sk, -.06), -9, hy, 1, 18); rect(g, skD, -12, hy + 17, 24, 1); rect(g, shade(sk, -.08), 10, hy + 1, 2, 16);   // box head: darker left side panel, shaded right edge and chin
  rect(g, skL, -6, hy + 1, 4, 1); rect(g, skL, 1, hy + 1, 9, 1); rect(g, shade(sk, -.2), -11, hy + 3, 2, 1); rect(g, shade(sk, -.2), -11, hy + 7, 2, 2); rect(g, shade(sk, -.2), -12, hy + 12, 2, 1); rect(g, shade(sk, -.12), 4, hy + 2, 3, 1);   // worn-wood grain
  if (c.glow) { rect(g, c.glow, -13, hy - 1, 26, 1); rect(g, c.glow, -13, hy + 18, 26, 1); rect(g, c.glow, -13, hy, 1, 18); rect(g, c.glow, 12, hy, 1, 18); }
  const ey = hy + 4, eyeX = [-5, 4], dark = c.pupil, rowsFull = [[1, 5], [0, 7], [0, 7], [0, 7], [1, 5]];
  eyeX.forEach(ex => {
    if (!hide) {
      if (p.dizzy) { for (let i = 0; i < 5; i++) { rect(g, dark, ex + 1 + i, ey + i, 1, 1); rect(g, dark, ex + 5 - i, ey + i, 1, 1); } }
      else if (p.blink) { rect(g, dark, ex, ey + 2, 7, 1); }
      else if (F.eyes === 'small') { rect(g, c.eyeColor, ex + 1, hy + 3, 5, 3); rect(g, shade(c.eyeColor, -.12), ex + 1, hy + 5, 5, 1); rect(g, dark, ex + 1, hy + 3, 2, 2); }
      else if (F.eyes === 'round') { rect(g, c.eyeColor, ex + 1, ey + 1, 4, 4); rect(g, dark, ex + 2, ey + 2, 2, 2); }
      else if (F.eyes === 'slit') { rect(g, c.eyeColor, ex, ey + 2, 7, 2); rect(g, dark, ex + 4, ey + 2, 2, 2); rect(g, dark, ex, ey + 1, 7, 1); }
      else if (F.eyes === 'closed') { rect(g, dark, ex + 1, ey + 3, 5, 1); rect(g, dark, ex, ey + 2, 1, 1); rect(g, dark, ex + 6, ey + 2, 1, 1); }
      else if (F.eyes === 'sleepy') { rect(g, c.eyeColor, ex, ey + 2, 7, 3); rect(g, dark, ex + 3, ey + 3, 2, 2); rect(g, dark, ex, ey + 1, 7, 1); }
      else {
        const rows = F.eyes === 'half' ? rowsFull.slice(1, 4) : rowsFull, y0 = F.eyes === 'half' ? ey + 1 : ey;
        rows.forEach(([dx, w], i) => rect(g, c.eyeColor, ex + dx, y0 + i, w, 1)); rect(g, shade(c.eyeColor, -.12), ex + 1, y0 + rows.length - 1, 5, 1);
        rect(g, dark, ex + 4, y0 + (F.eyes === 'half' ? 0 : 1), 2, 2);
      }
    }
    const b = c.hair === 'none' ? shade(sk, -.5) : c.hairColor;
    if (F.brow === 'angry') { rect(g, b, ex - 1, ey - 2, 3, 1); rect(g, b, ex + 2, ey - 1, 5, 1); }
    else if (F.brow === 'raised') { rect(g, b, ex, ey - 3, 3, 1); rect(g, b, ex + 3, ey - 2, 4, 1); }
    else if (F.brow === 'flat') rect(g, b, ex, ey - 2, 7, 1);
  });
  if ((p.mood || F.mouth) !== 'toothy') { rect(g, skD, 1, hy + 11, 5, 1); rect(g, skL, 1, hy + 10, 3, 1); }                                         // flat dark nose bar
  const fc = c.facialColor || '#3a2a22', my = hy + 13;
  if (c.facial === 'stubble') rect(g, 'rgba(40,25,20,.35)', -8, hy + 10, 19, 7);
  if (c.facial === 'beard' || c.facial === 'full') { rect(g, fc, -12, hy + 8, 3, 10); rect(g, fc, -12, hy + 13, 24, 5); rect(g, fc, 9, hy + 9, 3, 8); rect(g, sk, -3, my - 1, 13, 3); }
  if (c.facial === 'stache' || c.facial === 'full' || c.facial === 'beard') rect(g, fc, -2, hy + 12, 12, 1);
  if (c.facial === 'goatee') { rect(g, fc, -2, hy + 12, 12, 1); rect(g, fc, 1, hy + 15, 6, 3); }
  const m = p.mood || (p.mouth === 2 ? 'open' : p.mouth === 1 ? 'talk' : F.mouth), mc = shade(sk, -.6);
  if (m === 'grin') { rect(g, '#ffffff', -4, my, 15, 2); rect(g, '#ffffff', -3, my + 2, 13, 1); rect(g, '#dcd6d0', -3, my + 2, 13, 1); }
  else if (m === 'toothy') GT_TOOTHY.forEach((row, j) => { for (let i = 0; i < 20; i++) { const ch = row[i]; if (ch !== '.') rect(g, ch === 'X' ? '#101018' : '#ffffff', -9 + i, hy + 7 + j, 1, 1); } });
  else if (m === 'dash') { rect(g, '#ffffff', 2, my + 1, 5, 1); }
  else if (m === 'square') { rect(g, '#101018', 2, my - 1, 5, 5); rect(g, shade(sk, .1), 3, my, 3, 3); rect(g, '#101018', 4, my + 1, 1, 1); }
  else if (m === 'shout') { rect(g, '#101018', 0, my - 1, 11, 4); rect(g, '#d83030', 2, my + 2, 7, 1); rect(g, '#ffffff', 1, my - 1, 9, 1); }
  else if (m === 'o') { rect(g, '#101018', 2, my - 1, 5, 5); rect(g, sk, 2, my - 1, 1, 1); rect(g, sk, 6, my - 1, 1, 1); rect(g, sk, 2, my + 3, 1, 1); rect(g, sk, 6, my + 3, 1, 1); }
  else if (m === 'open') { rect(g, '#3a1216', 0, my - 1, 9, 5); rect(g, '#e0606a', 2, my + 2, 5, 2); }
  else if (m === 'talk') { rect(g, '#3a1216', 1, my, 7, 3); rect(g, '#e0606a', 2, my + 2, 4, 1); }
  else if (m === 'smile') { rect(g, mc, 0, my + 1, 9, 1); rect(g, mc, -1, my, 1, 1); rect(g, mc, 9, my, 1, 1); }
  else if (m === 'frown') { rect(g, mc, 1, my, 7, 1); rect(g, mc, 0, my + 1, 1, 1); rect(g, mc, 8, my + 1, 1, 1); }
  else if (m === 'smirk') { rect(g, mc, 0, my + 1, 5, 1); rect(g, mc, 5, my, 5, 1); }
  else rect(g, mc, 0, my, 9, 1);
  if (c.held === 'cigarette') { rect(g, '#f2f2f2', 6, my, 7, 1); rect(g, '#e0903a', 11, my, 2, 1); rect(g, '#9a9aa4', 12, my - 2, 1, 2); }
  const gc = c.glassesColor;
  if (c.glasses === 'round' || c.glasses === 'square') { eyeX.forEach(ex => { rect(g, gc, ex - 1, ey - 1, 9, 1); rect(g, gc, ex - 1, ey + 5, 9, 1); rect(g, gc, ex - 1, ey, 1, 5); rect(g, gc, ex + 7, ey, 1, 5); }); rect(g, gc, -12, ey + 2, 6, 1); }
  if (c.glasses === 'shades') { rect(g, gc, -12, ey, 3, 1); rect(g, gc, -8, ey - 1, 20, 7); rect(g, '#3a3f5a', -6, ey + 1, 3, 1); rect(g, '#3a3f5a', 3, ey + 1, 3, 1); }
  if (c.glasses === 'blindfold') { rect(g, gc, -12, ey - 1, 24, 7); rect(g, '#2e2e40', -9, ey, 7, 1); }
}

// ---------- the whole character ----------
// pose (same fields as the alex style): legs 0-3, bob 0/1, armL, armR (-1..1), raiseL, raiseR, waveStep, mouth 0-2, mood, blink, dizzy, jump
function gtDraw(g, c, p) {
  const bob = p.bob | 0, hy = -35 + bob, by = hy + 18;
  const upL = p.jump ? 3 : (p.legs === 1 ? 2 : 0), upR = p.jump ? 3 : (p.legs === 3 ? 2 : 0);
  if (c.wings) {
    const A = c.wings === 'bat', w1 = A ? '#8a1c24' : '#f4f8ff', w2 = A ? '#5a1018' : '#bcd4f0', w3 = A ? '#c83a3a' : '#ffffff';
    for (const sd of [-1, 1]) { const x0 = sd < 0 ? -22 : 11; rect(g, w1, x0, by - 8, 11, 10); rect(g, w2, x0 + (sd < 0 ? 0 : 6), by - 8, 5, 10); rect(g, w1, x0 + (sd < 0 ? 1 : 2), by - 12, 8, 4); rect(g, w3, x0 + 2, by - 7, 7, 1);
      if (A) { for (let i = 0; i < 3; i++) rect(g, w1, x0 + i * 4, by + 2, 3, 3 - (i % 2)); rect(g, '#2a0a10', x0 + (sd < 0 ? 10 : 0), by - 8, 1, 10); } else { rect(g, w2, x0 + 1, by + 2, 9, 2); rect(g, w1, x0 + 3, by + 4, 5, 1); } }
  }
  if (c.cape) { rect(g, c.cape, -13, by - 1, 27, 17 - bob);
    if (c.capeStyle === 'flame') ['#2a4ad8', '#4a3ad0', '#a03a98', '#d83a30', '#f06a20', '#ffb030'].forEach((k, i) => { rect(g, k, -13, by - 1 + i * 3, 27, 3); }); rect(g, shade(c.cape, -.3), 9, by + 3, 5, 13 - bob); rect(g, shade(c.cape, .18), -11, by + 1, 2, 13); rect(g, shade(c.cape, -.2), -13, by + 15 - bob, 27, 1); }
  for (const [x, up] of [[-7, upL], [1, upR]]) {                                         // short thick legs, flat feet pointing right
    rect(g, c.pants, x, -6 + bob, 6, 4 - up - bob); rect(g, shade(c.pants, -.2), x + 5, -6 + bob, 1, 4 - up - bob); rect(g, shade(c.pants, .14), x + 1, -6 + bob, 1, 3);
    if (c.sneakers) { rect(g, c.sneakers, x, -2 - up, 8, 1); rect(g, shade(c.sneakers, .3), x + 1, -2 - up, 2, 1); rect(g, '#f4f4f8', x, -1 - up, 8, 1); rect(g, shade(c.sneakers, -.4), x + 5, -2 - up, 2, 1); }
    else { rect(g, c.shoes, x, -2 - up, 8, 2); rect(g, shade(c.shoes, .18), x, -2 - up, 4, 1); rect(g, shade(c.shoes, -.3), x, -1 - up, 8, 1); }
  }
  rect(g, c.pants, -7, -7 + bob, 14, 2);
  const hair = GT_HAIR[c.hair]; if (hair.back) hair.back(g, c, hy);
  GT_OUTFIT[c.outfit](g, c, p, by);
  gtFace(g, c, p, hy);
  hair.front(g, c, hy);
  if (c.hat && c.hat !== 'none') GT_HAT[c.hat](g, c, hy);
  if (c.halo) { const y = hy - 6; rect(g, '#fff27a', -6, y, 12, 1); rect(g, '#fff27a', -6, y + 3, 12, 1); rect(g, '#fff27a', -8, y + 1, 2, 2); rect(g, '#fff27a', 6, y + 1, 2, 2); rect(g, '#c8a818', -6, y + 4, 12, 1); }
  if (c.sparkles) [[-16, by + 2, 2], [13, hy + 8, 2], [11, by + 8, 1], [-14, hy + 4, 1]].forEach(([x, y, r]) => { rect(g, '#fff6b0', x, y - r, 1, 2 * r + 1); rect(g, '#fff6b0', x - r, y, 2 * r + 1, 1); rect(g, '#ffffff', x, y, 1, 1); });
}

// ---------- world ----------
function gtSky(g, Lw, Lh, gy, camX, t, world) {
  const key = world.sky === 'night' ? 'night' : (world.sky === 'sunset' ? 'sunset' : 'day');
  if (key === 'night') return drawSky(g, Lw, Lh, gy, camX, t, world);                       // night stays the shared night sky
  const S = SKIES[key], saved = { ...S };
  Object.assign(S, key === 'day' ? GT.skyDay : GT.skySunset);
  try { drawSky(g, Lw, Lh, gy, camX, t, world); } finally { Object.assign(S, saved); }
}
const GT_DIRT = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 32; const g = cv.getContext('2d'), r = rng32(77), [b, d, l, deep] = GT.dirt;
  rect(g, b, 0, 0, 32, 32);
  for (let i = 0; i < 9; i++) { const x0 = Math.floor(r() * 32), len = 6 + Math.floor(r() * 10); for (let k = 0; k < len; k++) { const x = (x0 + k) % 32, y = (Math.floor(r() * 3) + (k + i * 5) ) % 32; rect(g, k % 3 === 0 ? l : d, x, (y + k) % 32, 1, 1); } }       // diagonal streaks
  for (let i = 0; i < 20; i++) rect(g, r() > .5 ? d : l, Math.floor(r() * 32), Math.floor(r() * 32), 1, 1);
  rect(g, deep, 0, 31, 32, 1);
  return cv;
})();
function gtGrassStrip(g, x0, w, y, camX) {                                                  // bright grass with a jagged lower edge
  const [hi, mid, sh, lip] = GT.grass;
  rect(g, mid, x0, y, w, 4); rect(g, hi, x0, y, w, 1); rect(g, sh, x0, y + 3, w, 1);
  for (let x = 0; x < w; x++) { const wx = x0 + x + camX, d = hash2(Math.floor(wx / 2), 11) < .5 ? 1 : 2; rect(g, mid, x0 + x, y + 4, 1, d); rect(g, sh, x0 + x, y + 3 + d, 1, 1); }
  for (let x = 0; x < w; x++) if (hash2(x0 + x + camX, 3) < .12) rect(g, hi, x0 + x, y - 1, 1, 1);
}
function gtGround(g, Lw, Lh, gy, camX) {
  const off = ((camX % 32) + 32) % 32;
  for (let y = gy + 6; y < Lh; y += 32) for (let x = -off; x < Lw; x += 32) g.drawImage(GT_DIRT, x, y);
  rect(g, GT.dirt[0], 0, gy + 4, Lw, 3); gtGrassStrip(g, 0, Lw, gy, camX);
}
const GT_PROPS = {
  platform(g, x, gy, o) { const w = o.w || 48, h = o.h || 14, y = gy - (o.y || 24), x0 = x - Math.floor(w / 2); for (let yy = y + 5; yy < y + 5 + h; yy += 32) for (let xx = x0; xx < x0 + w; xx += 32) { g.save(); g.beginPath(); g.rect(x0, y + 5, w, h); g.clip(); g.drawImage(GT_DIRT, xx, yy); g.restore(); } rect(g, GT.dirt[3], x0, y + 5 + h, w, 1); gtGrassStrip(g, x0, w, y, 0); },
  block(g, x, gy, o) { const k = o.kind === 'grass' ? 1 : 0, s = 12; for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) rect(g, hash2(i + x, j) < .3 ? GT.dirt[1] : GT.dirt[0], x - 6 + i, gy - s + j + 1, 1, 1); rect(g, GT.dirt[3], x - 6, gy, s, 1); rect(g, GT.dirt[3], x + 5, gy - s + 1, 1, s); if (k) { rect(g, GT.grass[1], x - 6, gy - s + 1, s, 3); rect(g, GT.grass[0], x - 6, gy - s + 1, s, 1); } },
  pagoda(g, x, gy) { const c = '#6a58b8', d = '#54449a'; for (let i = 0; i < 3; i++) { const y = gy - 12 - i * 11, w = 30 - i * 6; rect(g, c, x - w / 2, y, w, 8); rect(g, d, x - w / 2 - 3, y - 2, w + 6, 3); rect(g, c, x - w / 2 - 6, y - 3, w + 12, 2); } rect(g, d, x - 1, gy - 50, 2, 8); rect(g, d, x - 12, gy - 11, 24, 12); },
  dirttree(g, x, gy) {                                                                      // brown block tree with grass tufts (like the game's Dirt Tree)
    const [d0, d1, d2, d3] = GT.dirt;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 24; j++) rect(g, hash2(i + x, j) < .28 ? d1 : (hash2(j, i) < .15 ? d2 : d0), x - 4 + i, gy - 23 + j, 1, 1);
    rect(g, d3, x - 4, gy, 9, 1); rect(g, d3, x + 4, gy - 23, 1, 24); rect(g, d1, x - 8, gy - 30, 17, 8); rect(g, d0, x - 7, gy - 29, 15, 6); rect(g, d2, x - 7, gy - 29, 15, 1);
    [[-8, 33, 6], [-1, 35, 7], [5, 33, 5]].forEach(([dx, y, w]) => { rect(g, GT.grass[1], x + dx, gy - y, w, 4); rect(g, GT.grass[0], x + dx, gy - y, w, 1); rect(g, GT.grass[2], x + dx, gy - y + 3, w, 1); });
  },
  woodfloor(g, x, gy, o) { const w = o.w || 64, x0 = x - Math.floor(w / 2), y = gy - (o.y || 0); rect(g, '#7a4a22', x0, y, w, 8); rect(g, '#b87a3c', x0, y, w, 2); rect(g, '#d9a064', x0, y, w, 1); for (let i = 0; i < w; i += 10) rect(g, '#5a3416', x0 + i, y + 2, 1, 6); rect(g, '#5a3416', x0, y + 7, w, 1); },
  bigtree(g, x, gy) { PROPS.tree(g, x, gy); },
};
function gtProps(g, camX, gy, world, front) {
  (world.props || []).forEach(p => { if (!!p.front !== !!front) return; const x = Math.round(p.x - camX), f = GT_PROPS[p.type] || PROPS[p.type]; if (f) f(g, x, gy, p); });
}

STYLES.growtopia = {
  id: 'growtopia', label: 'Growtopia',
  resolveCharacter: gtResolve, drawCharacter: gtDraw, drawSky: gtSky, drawGround: gtGround, drawProps: gtProps,
  sprite: { w: 64, h: 64, ox: 32, oy: 54 }, headY: 38, outline: GT.outline, spriteOutline: 'rgba(38,26,20,.5)', defaultGround: .7,
};
