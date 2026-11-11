// Shared helpers for the 2D scene skills. A scene.js defines renderAt(t) (pure function of t) and may set window.TOTAL.
const W = 1080, H = 1920, FPS = 30;
const SPEC = window.SPEC || {};
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const SAFE = { side: 90, top: 220, bottom: 220 };                    // keep text inside these margins
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = {
  linear: x => x, inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  out: x => 1 - Math.pow(1 - x, 3), in: x => x * x * x,
  back: x => { const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
};
// 0 before a, 1 after b, eased in between
const tween = (t, a, b, e = ease.inOut) => e(clamp((t - a) / Math.max(1e-6, b - a)));
// seeded random (mulberry32): rng(seed)() -> [0, 1)
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = (x, y = 0) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
// draw the first k (0..1) of a polyline [[x,y],...]; returns the end point
function partialLine(g, pts, k) {
  if (k <= 0 || pts.length < 2) return pts[0];
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let left = L * clamp(k); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); let end = pts[0];
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i - 1]); end = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    g.lineTo(end[0], end[1]); left -= seg[i - 1];
  }
  g.stroke(); return end;
}
// point at fraction k along a polyline
function pointAt(pts, k) {
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let left = L * clamp(k);
  for (let i = 1; i < pts.length; i++) { if (left <= seg[i - 1]) { const f = left / seg[i - 1]; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; } left -= seg[i - 1]; }
  return pts[pts.length - 1];
}
// sample a cubic bezier into points
function bez(p0, p1, p2, p3, n = 40) { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; o.push([v*v*v*p0[0] + 3*v*v*u*p1[0] + 3*v*u*u*p2[0] + u*u*u*p3[0], v*v*v*p0[1] + 3*v*v*u*p1[1] + 3*v*u*u*p2[1] + u*u*u*p3[1]]); } return o; }
// text that shrinks to fit maxW but never below min px (warns in the console if it still overflows)
function text(g, str, x, y, { size = 48, min = 40, weight = 700, family = 'Inter, "DejaVu Sans", sans-serif', color = '#fff', align = 'center', base = 'alphabetic', maxW = W - 2 * SAFE.side, track = 0, alpha = 1 } = {}) {
  let s = size; g.font = `${weight} ${s}px ${family}`;
  const wOf = () => g.measureText(str).width + track * Math.max(0, str.length - 1);
  while (wOf() > maxW && s > min) { s -= 2; g.font = `${weight} ${s}px ${family}`; }
  if (wOf() > maxW) console.warn('text overflows:', str);
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color; g.textBaseline = base;
  if ('letterSpacing' in g) { g.letterSpacing = track + 'px'; g.textAlign = align; g.fillText(str, x + (align === 'center' ? track / 2 : 0), y); }
  else { g.textAlign = align; g.fillText(str, x, y); }
  g.restore(); return { size: s, width: wOf() };
}
// isometric projection: world (x, y, z) with z up, origin at (ox, oy), tile size s
const iso = (x, y, z, ox, oy, s) => [ox + (x - y) * s * .866, oy + (x + y) * s * .5 - z * s];
function poly(g, pts, fill, stroke, lw = 2) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
// shade a hex colour: k < 0 darker, k > 0 lighter
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = n >> 8 & 255, b = n & 255; const f = c => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k); return `rgb(${f(r)},${f(gg)},${f(b)})`; }
window.TOTAL = SPEC.duration || 6; window.FPS = FPS;

// ---------- post filters: any 2D skill can set "filter": "ascii" | "thermal" | "crt" in its spec ----------
const IRONBOW = [[0, 0, 0], [30, 0, 70], [90, 0, 140], [170, 10, 120], [225, 50, 40], [250, 120, 0], [255, 190, 30], [255, 240, 140], [255, 255, 255]];
function ironbow(v) { v = clamp(v) * (IRONBOW.length - 1); const i = Math.min(IRONBOW.length - 2, Math.floor(v)), f = v - i, a = IRONBOW[i], b = IRONBOW[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
const _tmp = {}; function tmpCanvas(name, w, h) { const c = _tmp[name] ||= document.createElement('canvas'); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return c; }
// map brightness (or a heat render) through the ironbow palette, with blur and sensor noise
function thermalFilter(t, src = cv) {
  const w = 540, h = 960, c = tmpCanvas('th', w, h), g = c.getContext('2d', { willReadFrequently: true });
  g.filter = 'blur(3px)'; g.drawImage(src, 0, 0, w, h); g.filter = 'none';
  const im = g.getImageData(0, 0, w, h), d = im.data, r = rng(Math.floor(t * 30) + 1);
  for (let i = 0; i < d.length; i += 4) { const v = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255 + (r() - .5) * .05; const [R, G, B] = ironbow(v); d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = 255; }
  g.putImageData(im, 0, 0); ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(c, 0, 0, W, H); ctx.restore();
}
// brightness to characters on a ~80-column grid, green on black with glow
const RAMP = ' .:-=+*#%@';
function asciiFilter(t, { cols = 80, color = '#45ff7a', top = 0 } = {}) {
  const cw = W / cols, ch = cw * 1.8, rows = Math.floor((H - top) / ch), c = tmpCanvas('as', cols, rows), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(cv, 0, top, W, rows * ch, 0, 0, cols, rows); const d = g.getImageData(0, 0, cols, rows).data;
  ctx.fillStyle = '#000'; ctx.fillRect(0, top, W, H - top);
  ctx.save(); ctx.font = `500 ${Math.round(ch * .95)}px "JetBrains Mono", "DejaVu Sans Mono", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
  // auto-levels: the most common brightness (the background) becomes blank, the brightest 1% becomes '@'
  const lum = new Float32Array(cols * rows); for (let j = 0; j < lum.length; j++) lum[j] = (d[j * 4] * .3 + d[j * 4 + 1] * .59 + d[j * 4 + 2] * .11) / 255;
  const sorted = Array.from(lum).sort((a, b) => a - b), med = sorted[Math.floor(sorted.length * .5)], hi = Math.max(med + .08, sorted[Math.floor(sorted.length * .99)]);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const v = clamp((Math.abs(lum[y * cols + x] - med)) / (hi - med)), k = Math.min(RAMP.length - 1, Math.floor(Math.pow(v, .8) * RAMP.length)); if (k) { ctx.globalAlpha = .35 + v * .65; ctx.fillText(RAMP[k], (x + .5) * cw, top + (y + .5) * ch); } }
  ctx.restore();
}
// scanlines, a moving bright band and a vignette
function crtFilter(t) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
  const by = ((t * 260) % (H + 300)) - 150, bg = ctx.createLinearGradient(0, by - 150, 0, by + 150); bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(.5, 'rgba(255,255,255,.05)'); bg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = bg; ctx.fillRect(0, by - 150, W, 300);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.75)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function postFilter(name, t) {
  if (!name) return;
  if (name === 'thermal') thermalFilter(t);
  else if (name === 'ascii') { asciiFilter(t, { cols: SPEC.ascii_cols || 80 }); crtFilter(t); }
  else if (name === 'crt') crtFilter(t);
}
