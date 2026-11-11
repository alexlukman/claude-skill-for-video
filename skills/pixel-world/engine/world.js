// ------------------------------------------------------------------------------------------------
// WORLD: sky, sun or moon, clouds, mountains, grass and dirt, and props. All drawn as rectangles on the pixel grid.
// camX is the world x at the left edge of the screen; gy is the y of the top of the grass.
// ------------------------------------------------------------------------------------------------
const rng32 = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const hash2 = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return (((h ^ (h >>> 16)) >>> 0) % 10000) / 10000; };

const SKIES = {
  day:    { bands: ['#3b9cf0', '#4aa8f4', '#5cb5f7', '#74c3fa', '#8fd0fc', '#b0e0ff'], far: '#8a7fd8', near: '#7466c6', cloud: '#ffffff', cloudShade: '#cfe6fb' },
  sunset: { bands: ['#2a2468', '#4a2f86', '#8a3f8f', '#d65a6a', '#f2895a', '#ffc069'], far: '#5a3a8a', near: '#44286f', cloud: '#ffd1a8', cloudShade: '#e8908a' },
  night:  { bands: ['#070b22', '#0c1233', '#121a46', '#1a2459', '#233070', '#2e3d86'], far: '#24306a', near: '#1a2456', cloud: '#4a5a9a', cloudShade: '#38468a' },
};

function disc(g, cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r + r * .6 - y * y)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1); } }

const CLOUDS = (() => { const r = rng32(5); return Array.from({ length: 9 }, (_, i) => ({ x: i * 46 + r() * 20, y: 6 + r() * 60, w: 22 + Math.floor(r() * 20), v: 1.2 + r() * 1.6 })); })();
const STARS = (() => { const r = rng32(9); return Array.from({ length: 70 }, () => ({ x: r() * 400, y: r() * 130, p: r() * 6 })); })();

function drawSky(g, Lw, Lh, gy, camX, t, world) {
  const S = SKIES[world.sky] || SKIES.day;
  const bh = Math.ceil(gy / S.bands.length);
  S.bands.forEach((c, i) => rect(g, c, 0, i * bh, Lw, bh + 1));
  if (world.sky === 'night') {
    STARS.forEach(s => { const x = Math.floor(((s.x - camX * .03) % 400 + 400) % 400); if (x < Lw && s.y < gy - 6 && Math.sin(t * 2 + s.p) > -.5) rect(g, '#ffffff', x, Math.floor(s.y), 1, 1); });
    disc(g, Lw * .78, gy * .2, 8, '#f4f1d0'); disc(g, Lw * .78 + 4, gy * .2 - 2, 7, S.bands[1]); rect(g, '#d8d4a8', Lw * .78 - 4, gy * .2 + 4, 2, 1);
  } else if (world.sky === 'sunset') {
    disc(g, Lw * .55, gy * .66, 12, '#ffe28a'); disc(g, Lw * .55, gy * .66, 9, '#fff4b8');
  } else {
    disc(g, Lw * .8, gy * .2, 10, '#ffd83a'); disc(g, Lw * .8, gy * .2, 8, '#ffe96a'); rect(g, '#fff8b0', Lw * .8 - 5, gy * .2 - 5, 3, 2);
  }
  // clouds drift left to right and slide with the camera
  CLOUDS.forEach(c => {
    const span = 420, x = Math.floor((((c.x + t * c.v - camX * .12) % span) + span) % span) - 50;
    if (x > Lw || x + c.w < 0) return;
    const y = Math.floor(c.y * gy / 100), w = c.w;
    rect(g, S.cloud, x + 3, y + 4, w - 6, 5); rect(g, S.cloud, x, y + 6, w, 3); rect(g, S.cloud, x + 6, y + 2, w - 14, 3); rect(g, S.cloud, x + Math.floor(w * .3), y, Math.floor(w * .35), 3);
    rect(g, S.cloudShade, x + 1, y + 8, w - 2, 1);
  });
  // two mountain layers
  const ridge = (seed, color, amp, par, base, step) => {
    for (let x = 0; x < Lw; x++) {
      const wx = x + camX * par;
      const h = Math.floor(amp * (.55 + .3 * Math.sin(wx * .03 + seed) + .15 * Math.sin(wx * .085 + seed * 2.3)) / step) * step;
      rect(g, color, x, base - h, 1, h + 1); rect(g, shade(color, .18), x, base - h, 1, 1);
    }
  };
  ridge(1, S.far, 46, .22, gy, 2); ridge(4, S.near, 26, .42, gy, 2);
}

// a seamless dirt tile, made once
const DIRT = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const r = rng32(21);
  rect(g, '#8a5a34', 0, 0, 32, 32);
  for (let i = 0; i < 70; i++) rect(g, r() > .5 ? '#6e4526' : '#a06e42', Math.floor(r() * 32), Math.floor(r() * 32), 1 + Math.floor(r() * 2), 1);
  for (let i = 0; i < 5; i++) { const x = Math.floor(r() * 28), y = Math.floor(r() * 28); rect(g, '#8d8f98', x, y, 3, 2); rect(g, '#b3b6c0', x, y, 2, 1); }
  rect(g, '#74492b', 0, 31, 32, 1); rect(g, '#74492b', 31, 0, 1, 32);
  return c;
})();
function drawGround(g, Lw, Lh, gy, camX) {
  const off = ((camX % 32) + 32) % 32;
  for (let y = gy + 4; y < Lh; y += 32) for (let x = -off; x < Lw; x += 32) g.drawImage(DIRT, x, y);
  rect(g, '#4fbf3a', 0, gy, Lw, 4); rect(g, '#86ee62', 0, gy, Lw, 1); rect(g, '#2f8a2b', 0, gy + 3, Lw, 1); rect(g, '#2a6a24', 0, gy + 4, Lw, 1);
  for (let x = 0; x < Lw; x++) {
    const wx = x + camX;
    if (hash2(wx, 3) < .16) rect(g, '#4fbf3a', x, gy - 1, 1, 1);
    if (hash2(wx, 8) < .09) rect(g, '#2f8a2b', x, gy + 4 + Math.floor(hash2(wx, 9) * 2), 1, 2);
  }
}

// ---------- props (x is a world position, the base sits on the grass) ----------
const PROPS = {
  tree(g, x, gy) {
    rect(g, '#6b4423', x - 2, gy - 24, 5, 25); rect(g, '#4f3018', x + 1, gy - 24, 2, 25); rect(g, '#86592e', x - 2, gy - 22, 1, 20);
    [[0, -34, 11, '#2f9e3a'], [-9, -27, 8, '#2f9e3a'], [9, -27, 8, '#2f9e3a'], [0, -28, 9, '#37b043']].forEach(([dx, dy, r, c]) => disc(g, x + dx, gy + dy, r, c));
    [[-4, -38, 3], [5, -33, 2], [-11, -30, 2], [8, -24, 2]].forEach(([dx, dy, r]) => disc(g, x + dx, gy + dy, r, '#5ed955'));
    [[-3, -30], [6, -36], [-9, -24], [10, -30]].forEach(([dx, dy]) => rect(g, '#23802e', x + dx, gy + dy, 2, 2));
  },
  bush(g, x, gy) { disc(g, x - 4, gy - 3, 5, '#2f9e3a'); disc(g, x + 4, gy - 3, 5, '#2f9e3a'); disc(g, x, gy - 5, 5, '#37b043'); rect(g, '#5ed955', x - 3, gy - 8, 2, 1); },
  flower(g, x, gy, o) { const c = o.color || '#ff5a7a'; rect(g, '#2f9e3a', x, gy - 6, 1, 7); rect(g, '#2f9e3a', x - 2, gy - 3, 2, 1); rect(g, c, x - 1, gy - 9, 3, 3); rect(g, c, x - 2, gy - 8, 5, 1); rect(g, '#ffe45c', x, gy - 8, 1, 1); },
  sign(g, x, gy, o) {
    const text = String(o.text || 'HI').toUpperCase(), w = textWidth(text) + 6;
    rect(g, '#6b4423', x - 1, gy - 14, 3, 15);
    rect(g, '#6b4423', x - Math.floor(w / 2), gy - 27, w, 14); rect(g, '#c58b4c', x - Math.floor(w / 2) + 1, gy - 26, w - 2, 12); rect(g, '#e0a965', x - Math.floor(w / 2) + 1, gy - 26, w - 2, 1);
    drawText(g, text, x - Math.floor(w / 2) + 3, gy - 23, '#3a2410', 1);
  },
  crate(g, x, gy) { rect(g, '#6b4423', x - 7, gy - 14, 14, 15); rect(g, '#b8793b', x - 6, gy - 13, 12, 13); rect(g, '#d09250', x - 6, gy - 13, 12, 1); for (let i = 0; i < 10; i++) { rect(g, '#8a5a2a', x - 5 + i, gy - 12 + i, 1, 1); rect(g, '#8a5a2a', x + 4 - i, gy - 12 + i, 1, 1); } },
  fence(g, x, gy, o) { const n = o.n || 3; rect(g, '#c58b4c', x, gy - 9, n * 10 + 2, 2); rect(g, '#c58b4c', x, gy - 5, n * 10 + 2, 2); for (let i = 0; i <= n; i++) { rect(g, '#8a5a2a', x + i * 10, gy - 12, 3, 13); rect(g, '#d09250', x + i * 10, gy - 12, 1, 13); } },
  rock(g, x, gy) { disc(g, x, gy - 3, 5, '#7c8190'); disc(g, x - 1, gy - 4, 3, '#a0a5b4'); rect(g, '#5a5f6e', x - 5, gy - 1, 11, 2); },
  lamp(g, x, gy) { rect(g, '#3a3f55', x - 1, gy - 26, 3, 27); rect(g, '#3a3f55', x - 4, gy - 30, 9, 4); rect(g, '#ffe96a', x - 3, gy - 29, 7, 2); rect(g, '#fff6b0', x - 2, gy - 29, 3, 1); rect(g, '#3a3f55', x - 1, gy - 32, 3, 2); },
  house(g, x, gy) {
    rect(g, '#6b4423', x - 21, gy - 30, 42, 31); rect(g, '#c9915a', x - 20, gy - 29, 40, 29);
    for (let i = 0; i < 6; i++) rect(g, '#b17d48', x - 20, gy - 29 + i * 5, 40, 1);
    for (let i = 0; i < 12; i++) rect(g, '#c0392b', x - 24 + i * 2, gy - 32 - Math.min(i, 11 - i) * 2, 48 - i * 4, 2);
    rect(g, '#6b4423', x - 5, gy - 16, 10, 16); rect(g, '#8a5a2a', x - 4, gy - 15, 8, 15); rect(g, '#ffe45c', x + 2, gy - 8, 1, 1);
    rect(g, '#6b4423', x + 8, gy - 22, 9, 9); rect(g, '#8fd0fc', x + 9, gy - 21, 7, 7); rect(g, '#fff', x + 9, gy - 21, 2, 1);
  },
};
function drawProps(g, camX, gy, world, front) {
  (world.props || []).forEach(p => { if (!!p.front === !!front && PROPS[p.type]) PROPS[p.type](g, Math.round(p.x - camX), gy, p); });
}
