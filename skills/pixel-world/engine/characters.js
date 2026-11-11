// ------------------------------------------------------------------------------------------------
// CHARACTERS: the one file to edit when you want a different look.
// A character is a small object (see PRESETS). It is drawn from parts: head, hair, face, outfit, accessories.
// To add a new hair style, outfit or accessory, add one function to HAIR, OUTFIT or ACCESSORY below.
// Everything is drawn as plain rectangles on a pixel grid. The origin is the middle of the feet; y goes up as negative.
//   body 12 wide x 9 tall, head 14 wide x 12 tall, legs 6 tall, so a whole character is 27 pixels tall.
// ------------------------------------------------------------------------------------------------

// original example cast (none of these is a real person or an existing game character)
const PRESETS = {
  mika:   { skin: '#f3c9a1', hair: 'spiky', hairColor: '#f07a3a', outfit: 'hoodie', outfitColor: '#25a7a1', accent: '#ffffff', pants: '#2c3a6b', shoes: '#f2f2f2', accessories: [] },
  prof:   { skin: '#e8b88a', hair: 'curly', hairColor: '#cfd3da', outfit: 'coat', outfitColor: '#f4f6f8', accent: '#3c6fd1', pants: '#4a4a58', shoes: '#2a2a33', accessories: ['glasses', 'beard'], beardColor: '#cfd3da' },
  ranger: { skin: '#c98b5c', hair: 'buzz', hairColor: '#2a1c14', outfit: 'vest', outfitColor: '#3f7d3a', accent: '#e8dcb0', pants: '#6b5a3a', shoes: '#4a3420', accessories: ['cap'], accColor: '#3f7d3a' },
  agent:  { skin: '#8d5a3b', hair: 'quiff', hairColor: '#2a1a10', outfit: 'suit', outfitColor: '#262a35', accent: '#d93b3b', pants: '#262a35', shoes: '#101014', accessories: ['sunglasses'] },
  bolt:   { skin: '#6b4429', hair: 'curly', hairColor: '#16120f', outfit: 'tee', outfitColor: '#d93a3a', accent: '#ffffff', pants: '#1d2230', shoes: '#f2f2f2', accessories: ['headband'], accColor: '#ffd23f' },
  sage:   { skin: '#f0cfb0', hair: 'long', hairColor: '#8a5bd6', outfit: 'coat', outfitColor: '#2d2f6b', accent: '#ffd23f', pants: '#23244f', shoes: '#101014', accessories: ['scarf'], accColor: '#ffd23f' },
};

function resolveCharacter(def) {
  const base = typeof def === 'string' ? PRESETS[def] : (def.preset ? { ...PRESETS[def.preset], ...def } : def);
  if (!base) throw new Error('unknown character: ' + JSON.stringify(def));
  return { skin: '#f3c9a1', hair: 'buzz', hairColor: '#3a2a20', outfit: 'tee', outfitColor: '#4a7bd8', accent: '#ffffff', pants: '#2c3a6b', shoes: '#222', accessories: [], accColor: '#d93a3a', beardColor: '#3a2a20', ...base };
}

// ---------- tiny colour helpers ----------
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function shade(hex, k) {                               // k < 0 darker, k > 0 lighter
  const c = hexRgb(hex).map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ---------- hair ----------   back() is drawn behind the head, front() on top of it; hy is the top of the head
const HAIR = {
  bald:  { front() {} },
  buzz:  { front(g, ch, hy) { rect(g, ch.hairColor, -7, hy, 14, 3); rect(g, ch.hairColor, -7, hy + 3, 1, 2); rect(g, ch.hairColor, 6, hy + 3, 1, 2); } },
  spiky: { front(g, ch, hy) {
    rect(g, ch.hairColor, -7, hy - 1, 14, 4); rect(g, ch.hairColor, -7, hy + 3, 2, 3); rect(g, ch.hairColor, 5, hy + 3, 2, 3);
    [[-6, 3], [-3, 4], [0, 5], [3, 4], [5, 3]].forEach(([x, h]) => rect(g, ch.hairColor, x, hy - 1 - h, 2, h));
    rect(g, shade(ch.hairColor, .25), -3, hy - 5, 1, 3);
  } },
  bowl:  { front(g, ch, hy) { rect(g, ch.hairColor, -8, hy - 1, 16, 5); rect(g, ch.hairColor, -8, hy + 4, 2, 4); rect(g, ch.hairColor, 6, hy + 4, 2, 4); rect(g, shade(ch.hairColor, .2), -5, hy, 4, 1); } },
  curly: { front(g, ch, hy) {
    rect(g, ch.hairColor, -7, hy, 14, 2);
    [[-7, -2], [-4, -3], [-1, -3], [2, -3], [5, -2]].forEach(([x, dy]) => rect(g, ch.hairColor, x, hy + dy, 3, 4));
    rect(g, ch.hairColor, -8, hy + 2, 2, 4); rect(g, ch.hairColor, 6, hy + 2, 2, 4);
    rect(g, shade(ch.hairColor, .3), -3, hy - 3, 1, 1); rect(g, shade(ch.hairColor, .3), 3, hy - 3, 1, 1);
  } },
  long:  { back(g, ch, hy) { rect(g, ch.hairColor, -8, hy + 1, 16, 15); }, front(g, ch, hy) { rect(g, ch.hairColor, -8, hy - 1, 16, 5); rect(g, ch.hairColor, -8, hy + 4, 2, 6); rect(g, ch.hairColor, 6, hy + 4, 2, 6); rect(g, shade(ch.hairColor, .25), -4, hy, 3, 1); } },
  mohawk: { front(g, ch, hy) { rect(g, ch.hairColor, -2, hy - 5, 4, 8); rect(g, ch.hairColor, -7, hy + 1, 14, 1); } },
  quiff: { front(g, ch, hy) { rect(g, ch.hairColor, -7, hy - 1, 14, 4); rect(g, ch.hairColor, -7, hy + 3, 2, 3); rect(g, ch.hairColor, 5, hy + 3, 2, 2); rect(g, ch.hairColor, 0, hy - 4, 9, 3); rect(g, shade(ch.hairColor, .25), 2, hy - 4, 4, 1); } },
};

// ---------- outfits ----------   by is the top of the torso
function torso(g, c, by, h = 9) { rect(g, c, -6, by, 12, h); rect(g, shade(c, -.2), 4, by, 2, h); rect(g, shade(c, -.2), -6, by + h - 1, 12, 1); }
function arms(g, ch, p, by, sleeve, sleeveRows, cuff) {
  const skinD = shade(ch.skin, -.15);
  const arm = (x, dy, raised, side) => {
    if (raised) {                                  // arm up, waving
      const wy = by - 6 + (p.waveStep ? -1 : 0);
      rect(g, sleeve, x, wy + 2, 3, 6); rect(g, ch.skin, x, wy - 1, 3, 3); rect(g, shade(sleeve, -.2), x + (side > 0 ? 2 : 0), wy + 2, 1, 6);
      return;
    }
    const y = by + 1 + dy;
    rect(g, sleeve, x, y, 3, sleeveRows); rect(g, ch.skin, x, y + sleeveRows, 3, 8 - sleeveRows);
    rect(g, shade(sleeve, -.2), x + (side > 0 ? 2 : 0), y, 1, sleeveRows); rect(g, skinD, x + (side > 0 ? 2 : 0), y + sleeveRows, 1, 8 - sleeveRows);
    if (cuff) rect(g, cuff, x, y + sleeveRows - 1, 3, 1);
  };
  arm(-9, p.armL, p.raiseL, -1); arm(6, p.armR, p.raiseR, 1);
}
const OUTFIT = {
  tee(g, ch, p, by) { arms(g, ch, p, by, ch.outfitColor, 3); torso(g, ch.outfitColor, by); rect(g, shade(ch.skin, -.15), -2, by, 4, 1); rect(g, ch.accent, -3, by + 4, 6, 1); },
  hoodie(g, ch, p, by) {
    arms(g, ch, p, by, ch.outfitColor, 6, shade(ch.outfitColor, -.25)); torso(g, ch.outfitColor, by);
    rect(g, shade(ch.outfitColor, -.18), -4, by + 5, 8, 3); rect(g, shade(ch.outfitColor, -.35), -4, by + 5, 8, 1);
    rect(g, ch.accent, -3, by + 1, 1, 3); rect(g, ch.accent, 2, by + 1, 1, 3); rect(g, shade(ch.outfitColor, -.1), -8, by - 1, 16, 2);
  },
  suit(g, ch, p, by) {
    arms(g, ch, p, by, ch.outfitColor, 6, shade(ch.outfitColor, .2)); torso(g, ch.outfitColor, by);
    rect(g, '#f4f4f4', -2, by, 4, 6); rect(g, ch.accent, -1, by + 1, 2, 7); rect(g, ch.accent, -1, by, 2, 1);
    rect(g, shade(ch.outfitColor, .18), -4, by, 2, 6); rect(g, shade(ch.outfitColor, .18), 2, by, 2, 6); rect(g, '#9aa0b0', 3, by + 7, 1, 1);
  },
  coat(g, ch, p, by) {
    arms(g, ch, p, by, ch.outfitColor, 6, shade(ch.outfitColor, -.2));
    rect(g, ch.outfitColor, -6, by, 12, 12); rect(g, shade(ch.outfitColor, -.18), 4, by, 2, 12); rect(g, shade(ch.outfitColor, -.2), -6, by + 11, 12, 1);
    rect(g, ch.accent, -2, by, 4, 12); rect(g, shade(ch.accent, -.25), 1, by, 1, 12);
    rect(g, shade(ch.outfitColor, .12), -4, by, 2, 3); rect(g, shade(ch.outfitColor, .12), 2, by, 2, 3);
    rect(g, shade(ch.outfitColor, -.15), -5, by + 6, 3, 3);
  },
  vest(g, ch, p, by) {
    arms(g, ch, p, by, ch.accent, 3); torso(g, ch.accent, by);
    rect(g, ch.outfitColor, -6, by, 4, 9); rect(g, ch.outfitColor, 2, by, 4, 9); rect(g, shade(ch.outfitColor, -.25), -6, by + 8, 4, 1); rect(g, shade(ch.outfitColor, -.25), 2, by + 8, 4, 1);
    rect(g, '#e8c14a', -3, by + 3, 1, 1); rect(g, '#e8c14a', 2, by + 3, 1, 1); rect(g, shade(ch.outfitColor, .2), -5, by + 5, 2, 2);
  },
};

// ---------- accessories ----------   hy = top of the head, by = top of the torso
const ACCESSORY = {
  sunglasses(g, ch, hy) { rect(g, '#0f0f14', -6, hy + 4, 12, 4); rect(g, '#0f0f14', -7, hy + 4, 1, 1); rect(g, '#0f0f14', 6, hy + 4, 1, 1); rect(g, '#3a3f55', -5, hy + 5, 2, 1); rect(g, '#3a3f55', 1, hy + 5, 2, 1); },
  glasses(g, ch, hy) {
    const f = '#2a2a3a';
    for (const x of [-6, 0]) { rect(g, f, x, hy + 3, 6, 1); rect(g, f, x, hy + 8, 6, 1); rect(g, f, x, hy + 3, 1, 6); rect(g, f, x + 5, hy + 3, 1, 6); }
    rect(g, f, -1, hy + 5, 2, 1);
  },
  cap(g, ch, hy) { const c = ch.accColor; rect(g, c, -7, hy - 3, 14, 5); rect(g, shade(c, -.2), -7, hy + 1, 14, 1); rect(g, shade(c, .2), -4, hy - 2, 4, 1); rect(g, shade(c, -.25), 1, hy + 1, 10, 2); rect(g, '#f4f4f4', -1, hy - 2, 2, 2); },
  headband(g, ch, hy) { rect(g, ch.accColor, -7, hy + 2, 14, 2); rect(g, shade(ch.accColor, -.2), -7, hy + 3, 14, 1); rect(g, ch.accColor, -9, hy + 3, 2, 3); },
  beard(g, ch, hy) { /* drawn with the face, see drawCharacter */ },
  earring(g, ch, hy) { rect(g, '#ffd23f', 6, hy + 7, 1, 2); },
  scarf(g, ch, hy, by) { rect(g, ch.accColor, -7, by - 1, 14, 3); rect(g, shade(ch.accColor, -.2), -7, by + 1, 14, 1); rect(g, ch.accColor, 3, by + 2, 3, 6); rect(g, shade(ch.accColor, -.25), 3, by + 7, 3, 1); },
};

// ---------- the whole character ----------
// pose: { legs 0-3 (walk step), bob 0/1, armL, armR (-1..1), raiseL, raiseR, waveStep, mouth 0/1/2, blink, dizzy, jump }
function drawCharacter(g, ch, p) {
  const bob = p.bob | 0, by = -15 + bob, hy = -27 + bob;
  const skinD = shade(ch.skin, -.16), acc = ch.accessories || [];
  const dark = '#1a1a2a';
  // legs
  const upL = p.jump ? 2 : (p.legs === 1 ? 1 : 0), upR = p.jump ? 2 : (p.legs === 3 ? 1 : 0);
  for (const [x, up] of [[-5, upL], [1, upR]]) {
    rect(g, ch.pants, x, -6, 4, 4 - up); rect(g, shade(ch.pants, -.2), x + 3, -6, 1, 4 - up);
    rect(g, ch.shoes, x, -2 - up, 5, 2); rect(g, shade(ch.shoes, -.25), x, -1 - up, 5, 1);
  }
  rect(g, ch.pants, -6, -7, 12, 2);                                          // hips
  // hair behind the head
  const hair = HAIR[ch.hair] || HAIR.buzz;
  if (hair.back) hair.back(g, ch, hy);
  // torso, arms, outfit
  (OUTFIT[ch.outfit] || OUTFIT.tee)(g, ch, p, by);
  // head
  rect(g, ch.skin, -7, hy, 14, 12); rect(g, skinD, -7, hy + 11, 14, 1); rect(g, skinD, 6, hy + 4, 1, 6);
  rect(g, skinD, -7, hy + 6, 1, 3);                                          // ear
  if (acc.includes('beard')) { rect(g, ch.beardColor, -7, hy + 8, 14, 4); rect(g, ch.beardColor, -7, hy + 4, 2, 4); rect(g, ch.beardColor, 5, hy + 4, 2, 4); rect(g, ch.beardColor, -3, hy + 7, 6, 1); rect(g, shade(ch.beardColor, -.2), -7, hy + 11, 14, 1); }
  // face: big white eyes, pupils look the way the character faces (right; the sprite is mirrored for left)
  const ey = hy + 4;
  for (const ex of [-5, 1]) {
    if (p.dizzy) { for (let i = 0; i < 4; i++) { rect(g, dark, ex + i, ey + i, 1, 1); rect(g, dark, ex + 3 - i, ey + i, 1, 1); } }
    else if (p.blink) { rect(g, dark, ex, ey + 2, 4, 1); }
    else { rect(g, '#ffffff', ex, ey, 4, 4); rect(g, '#d8deea', ex, ey + 3, 4, 1); rect(g, dark, ex + 2, ey + 1, 2, 2); }
    rect(g, acc.includes('beard') || ch.hair === 'bald' ? '#3a2a20' : ch.hairColor, ex, ey - 2, 4, 1);   // brows
  }
  rect(g, skinD, 1, hy + 7, 1, 1);                                           // nose
  const mc = '#7a3b2e';
  if (p.mouth === 2) { rect(g, '#4a1a1a', 0, hy + 8, 5, 3); rect(g, '#e0606a', 1, hy + 10, 3, 1); }
  else if (p.mouth === 1) { rect(g, '#4a1a1a', 0, hy + 9, 4, 2); rect(g, '#e0606a', 1, hy + 10, 2, 1); }
  else rect(g, mc, 0, hy + 9, 4, 1);
  if (!acc.includes('beard')) rect(g, 'rgba(255,120,120,.45)', -6, hy + 8, 2, 1);          // cheek
  // hair on top, then accessories
  hair.front(g, ch, hy);
  acc.forEach(a => ACCESSORY[a] && ACCESSORY[a](g, ch, hy, by));
}
