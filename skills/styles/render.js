// /styles renderer: draws the shared scene from a recipe. A recipe mixes independent choices:
//   palette, fill (character and background can differ), line, timing (fps, holds), texture, pixel grid, post effects,
//   camera and overlays. styles.js holds one recipe per style; a spec can override any field.
const BASE = { sky: '#8ec5ef', sky2: '#e9f4ff', sun: '#fff4c2', cloud: '#ffffff', mtn: '#9db6d6', rock: '#8a8f7e', stone: '#d8cdb8', roof: '#4a6aa8', window: '#3a3a52', flag: '#d8433a',
  hill: '#7fb565', trunk: '#7a5236', leaf: '#4f9a4a', grass: '#8cc46a', path: '#e3cf9a', flower: '#f3d34a', flower2: '#f08aa8', tuft: '#5c9a46',
  skin: '#f6d2b0', hair: '#6b3b24', eyewhite: '#ffffff', eye: '#3a2418', brow: '#4a2a1a', mouth: '#a8473a', ear: '#efc39e',
  shirt: '#f4ead2', shirt2: '#ddd0b2', belt: '#5a3a22', strap: '#7a4a2a', bag: '#9a6a3a', pants: '#3f5a8c', pants2: '#34497a', boot: '#5a3a22', boot2: '#4a2e1a', scarf: '#d8332e', glove: '#ffffff' };
const PALETTES = {
  natural: {},
  cel: { sky: '#6fb3ea', hill: '#6aaa4e', leaf: '#3f8f3c', grass: '#7cbc58' },
  retro: { sky: '#7aa0c4', sky2: '#e8d8c0', hill: '#7a9a5a', leaf: '#557a44', grass: '#8aa860', shirt: '#e8dcc0', pants: '#4a5a7a', scarf: '#c0392b', mtn: '#8a9ab0' },
  pastel: { sky: '#bfe0f5', sky2: '#fdf3e8', hill: '#b8dca0', leaf: '#93c88a', grass: '#c6e3a6', path: '#f3e3c0', mtn: '#c8d4ea', rock: '#c0bfb0', stone: '#efe6d8', roof: '#8fa6d8', scarf: '#f07a74', pants: '#7f9cc8', hair: '#a07050' },
  cartoon: { sky: '#5ec3ff', hill: '#55c24a', leaf: '#2fa83a', grass: '#6ad24e', path: '#f6d27a', shirt: '#ffffff', pants: '#2f6fd6', scarf: '#ff2d2d', hair: '#5a2c12', mtn: '#7fa6e6' },
  vivid: { sky: '#3f8ff0', sky2: '#ffe0b0', scarf: '#ff3030', hill: '#3fae4a', leaf: '#1f8a3a', grass: '#5ccc4a', pants: '#2a4aa8', shirt: '#fff0d0' },
  gothic: { sky: '#2a2140', sky2: '#6a4a7a', sun: '#e8e0d0', cloud: '#5a4a6a', mtn: '#3a3050', rock: '#2a2430', stone: '#5a5468', roof: '#2a1e3a', window: '#f0c060', hill: '#2e3a34', leaf: '#1e2a24', trunk: '#2a1e1e', grass: '#2a3a2e', path: '#5a5060', flower: '#a03050', flower2: '#6a3a8a', skin: '#e8e0ea', hair: '#1a1420', shirt: '#3a2a4a', shirt2: '#2a1e3a', pants: '#1e1a2a', pants2: '#16121e', scarf: '#8a1a2a', tuft: '#1a2a1e' },
  clay: { sky: '#a8cde0', hill: '#8ab870', leaf: '#6ea05a', grass: '#9cc47e', skin: '#f4b890', hair: '#7a4a2e', shirt: '#f0d8b0', pants: '#5a74a0', scarf: '#d8503c', stone: '#d8c8b0', roof: '#5a74a0' },
  craft: { sky: '#9cc7d8', sky2: '#f2e6cc', mtn: '#a8b8c8', hill: '#8aa86a', leaf: '#6e9a4a', grass: '#a8c070', path: '#e8d0a0', shirt: '#f2e2c0', pants: '#4f5f7a', scarf: '#d8503c', roof: '#3f6b78' },
  sunset: { sky: '#f38a3a', sky2: '#ffd27a', sun: '#fff0b0', cloud: '#f8b070', mtn: '#c86a4a' },
  neon: { sky: '#0b0620', sky2: '#3a1060', sun: '#ff4fd8', cloud: '#2a1550', mtn: '#1a0d3a', rock: '#140a2a', stone: '#22184a', roof: '#ff3fa4', window: '#35e7ff', hill: '#120a28', leaf: '#1a1040', trunk: '#120a20', grass: '#0e0820', path: '#2a1a50', flower: '#35e7ff', flower2: '#ff3fa4',
    skin: '#ffb0d8', hair: '#2a1040', shirt: '#2a2050', shirt2: '#201840', pants: '#141030', pants2: '#100c26', scarf: '#ff3fa4', boot: '#100820', tuft: '#1a0d3a', flag: '#35e7ff' },
  lowpoly: { sky: '#7ec0ee', hill: '#5fae5a', leaf: '#3f9a4a', grass: '#7cc06a', scarf: '#e0402e', shirt: '#e8c890', pants: '#6a4a3a', hair: '#7a4628', roof: '#c0503a' },
  voxel: { sky: '#6fb0f0', hill: '#5aa848', leaf: '#3a8a34', grass: '#6fbf4a', path: '#c8a870', stone: '#a8a8a0', roof: '#8a5a3a', skin: '#e8b890', hair: '#6a3a1e', shirt: '#b84a3a', pants: '#3a4a7a', scarf: '#c0392b' },
  brick: { sky: '#6cb4ee', hill: '#4bb04b', leaf: '#237f3a', grass: '#4bb04b', path: '#e0c060', stone: '#a0a5a9', roof: '#c4281b', skin: '#ffcc33', hair: '#6a3a1a', shirt: '#c4281b', shirt2: '#a8200f', pants: '#1e5aa8', pants2: '#184a8c', scarf: '#f2cd37', boot: '#1e5aa8' },
};
const MONO = { ink: ['#ffffff', '#111111'], charcoal: ['#efeae0', '#1a1714'], sepia: ['#f3e6c8', '#3a2414'], gb: ['#9bbc0f', '#0f380f'] };
function lum(hex) { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11) / 255; }
function mix(a, b, k) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), f = (s) => Math.round(lerp((A >> s) & 255, (B >> s) & 255, k)); return '#' + [16, 8, 0].map(s => f(s).toString(16).padStart(2, '0')).join(''); }
function colorOf(mat) {
  const pal = { ...BASE, ...(PALETTES[R.palette] || {}), ...(R.colors || {}) };
  let c = pal[mat] || '#888888';
  if (R.mono && !(R.keep || []).includes(mat)) { const [light, dark] = MONO[R.mono] || MONO.ink, l = lum(c); c = mix(dark, light, R.monoCurve ? Math.pow(l, R.monoCurve) : l); }
  if (R.desat) { const l = lum(c); c = mix(c, mix('#000000', '#ffffff', l), R.desat); }
  return c;
}
const pathOf = pts => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
function jitter(pts, seed, a) { const r = rng(seed); return pts.map(([x, y]) => [x + (r() - .5) * a, y + (r() - .5) * a]); }
function bbox(pts) { return pts.reduce((m, q) => [Math.min(m[0], q[0]), Math.min(m[1], q[1]), Math.max(m[2], q[0]), Math.max(m[3], q[1])], [1e9, 1e9, -1e9, -1e9]); }
// ---------------------------------------------------------------- fills
const FILL = {
  flat: (g, s, p, c) => { g.fillStyle = c; g.fill(p); },
  none: (g, s, p, c) => { if (s.mat === 'sky') { g.fillStyle = R.paper || '#fbf8f0'; g.fill(p); } },
  white: (g, s, p, c) => { g.fillStyle = s.mat === 'sky' ? (R.paper || '#ffffff') : (R.paper || '#ffffff'); g.fill(p); },
  cel: (g, s, p, c) => { g.fillStyle = c; g.fill(p); if (s.layer === 'sky' && s.mat === 'sky') return;
    g.save(); g.clip(p); g.fillStyle = shade(c, -(R.shadow ?? .22)); g.fill(p); g.translate(-(R.shadowOff ?? 10), -(R.shadowOff ?? 8) * .8); g.fillStyle = c; g.fill(p);
    if (R.highlight && (s.part === 'hair' || s.part === 'head')) { g.translate(-10, -8); g.globalAlpha = .35; g.fillStyle = '#ffffff'; g.fill(p); } g.restore(); },
  soft: (g, s, p, c) => { const b = bbox(s.pts), w = b[2] - b[0], h = b[3] - b[1];
    if (s.mat === 'sky') { const gr = g.createLinearGradient(0, 0, 0, GROUND); gr.addColorStop(0, c); gr.addColorStop(1, colorOf('sky2')); g.fillStyle = gr; g.fill(p); return; }
    const gr = g.createRadialGradient(b[0] + w * .32, b[1] + h * .28, 1, b[0] + w * .5, b[1] + h * .5, Math.max(w, h) * .75);
    gr.addColorStop(0, shade(c, R.spec ?? .38)); gr.addColorStop(.5, c); gr.addColorStop(1, shade(c, -(R.shadow ?? .42))); g.fillStyle = gr; g.fill(p);
    if (R.rim && s.layer === 'char') { g.save(); g.clip(p); g.strokeStyle = shade(c, .5); g.globalAlpha = .5; g.lineWidth = 5; g.translate(3, -2); g.stroke(p); g.restore(); } },
  paint: (g, s, p, c, f) => { FILL.soft(g, s, p, c); if (s.mat === 'sky' && !R.paintSky) return; const b = bbox(s.pts), r = rng((s.seed || 1) + (R.boilPaint ? f * 7 : 0));
    g.save(); g.clip(p); const n = Math.min(60, 6 + ((b[2] - b[0]) * (b[3] - b[1])) / 2500);
    for (let i = 0; i < n; i++) { g.fillStyle = shade(c, (r() - .5) * (R.paintVar ?? .45)); g.globalAlpha = R.paintAlpha ?? .5; g.beginPath(); g.ellipse(b[0] + r() * (b[2] - b[0]), b[1] + r() * (b[3] - b[1]), 6 + r() * (R.brush || 22), 3 + r() * 8, r() * PI, 0, TAU); g.fill(); }
    g.restore(); },
  wash: (g, s, p, c, f) => { const pts = jitter(s.pts, (s.seed || 1) + Math.floor(f / 6) * 13, 7), pp = pathOf(pts);
    g.save(); g.globalAlpha = R.washAlpha ?? .8; g.filter = 'blur(3px)'; g.fillStyle = c; g.fill(pp); g.restore();
    if (s.mat !== 'sky') { g.save(); g.globalAlpha = .4; g.filter = 'blur(1.5px)'; g.strokeStyle = shade(c, -.3); g.lineWidth = 3; g.stroke(pp); g.restore(); } },
  silhouette: (g, s, p, c) => { if (s.layer === 'sky') { if (s.mat === 'sky') { const gr = g.createLinearGradient(0, 0, 0, GROUND); gr.addColorStop(0, colorOf('sky')); gr.addColorStop(1, colorOf('sky2')); g.fillStyle = gr; } else g.fillStyle = c; g.fill(p); return; }
    const depth = { far: .55, mid: .3, ground: .08, char: 0, fg: 0 }[s.layer] ?? 0; g.fillStyle = mix(R.ink || '#140c10', colorOf('sky2'), depth * .6); g.fill(p); },
  clay: (g, s, p, c, f) => { FILL.soft(g, s, p, c); if (s.mat === 'sky') return; const b = bbox(s.pts), r = rng(Math.round(b[0] * 3 + b[1]));
    g.save(); g.clip(p); g.strokeStyle = 'rgba(80,40,20,.12)'; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { const cx = b[0] + r() * (b[2] - b[0]), cy = b[1] + r() * (b[3] - b[1]); for (let j = 1; j < 4; j++) { g.beginPath(); g.ellipse(cx, cy, j * 5, j * 3.5, r() * 3, 0, 5); g.stroke(); } } g.restore(); },
  paper: (g, s, p, c, f) => { g.save(); if (s.mat !== 'sky') { g.shadowColor = 'rgba(40,20,5,.35)'; g.shadowBlur = 9; g.shadowOffsetX = 4; g.shadowOffsetY = 6; } g.fillStyle = c; g.fill(p); g.restore();
    g.save(); g.clip(p); g.fillStyle = paperPattern(g); g.fillRect(0, 0, W, H); g.restore(); },
  lowpoly: (g, s, p, c) => { if (s.mat === 'sky') { FILL.soft(g, s, p, c); return; } const pts = s.pts, n = pts.length, cx = pts.reduce((a, q) => a + q[0], 0) / n, cy = pts.reduce((a, q) => a + q[1], 0) / n, step = Math.max(1, Math.floor(n / 7));
    for (let i = 0; i < n; i += step) { const a = pts[i], b = pts[(i + step) % n], nx = (a[1] + b[1]) / 2 - cy, ny = -((a[0] + b[0]) / 2 - cx), lk = (nx * -.6 + ny * -.8) / (Math.hypot(nx, ny) || 1);
      g.fillStyle = shade(c, lk * .22 + (hash(i, s.seed || 0) - .5) * .1); g.beginPath(); g.moveTo(cx, cy); g.lineTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill(); g.strokeStyle = g.fillStyle; g.lineWidth = 1; g.stroke(); } },
  glow: (g, s, p, c) => { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = c; g.globalAlpha = s.layer === 'char' ? .22 : .1; g.fill(p); g.restore(); },
};
let _paper; function paperPattern(g) { if (!_paper) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), r = rng(2); for (let i = 0; i < 1400; i++) { x.strokeStyle = r() > .5 ? 'rgba(255,255,255,.16)' : 'rgba(80,50,20,.09)'; x.lineWidth = .8; const a = r() * PI, px = r() * 256, py = r() * 256; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 9, py + Math.sin(a) * 9); x.stroke(); } _paper = c; } return g.createPattern(_paper, 'repeat'); }
// ---------------------------------------------------------------- lines
function strokeShape(g, s, pts, f, late) {
  const L = R.line; if (R.lineAfter && !late && !LINEPASS) return; if (!L || L === 'none' || s.mat === 'sky' || s.mat === 'grass' || (s.layer === 'sky' && !R.lineSky)) return;
  if (R.lineChar && s.layer !== 'char') return;
  const w = (R.lineW || 3) * (s.layer === 'char' ? 1 : s.layer === 'far' ? .55 : .8), col = R.lineColor || '#2a2026';
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = col;
  const draw = (q, lw, a = 1) => { g.globalAlpha = a; g.lineWidth = lw; g.stroke(pathOf(q)); };
  if (L === 'clean') draw(pts, w);
  else if (L === 'weighted') { draw(pts, w * .7); g.save(); g.translate(1.6, 1.6); draw(pts, w * 1.1, .85); g.restore(); }
  else if (L === 'boil') draw(jitter(pts, (s.seed || 1) * 31 + Math.floor(f / 2), R.boil || 3), w);
  else if (L === 'sketch') { for (let i = 0; i < 3; i++) draw(jitter(pts, (s.seed || 1) * 17 + i * 101 + Math.floor(f / 3), 5), w * (.4 + i * .15), .45); }
  else if (L === 'ink') { draw(jitter(pts, (s.seed || 1) * 7 + Math.floor(f / 4), 2.5), w * 1.6); draw(jitter(pts, (s.seed || 1) * 9, 4), w * .5, .6); }
  else if (L === 'charcoal') { g.filter = 'blur(.8px)'; for (let i = 0; i < 4; i++) draw(jitter(pts, (s.seed || 1) * 13 + i * 57 + Math.floor(f / 2), 6), w * (.6 + i * .25), .35); }
  else if (L === 'marker') { draw(jitter(pts, (s.seed || 1) * 5 + Math.floor(f / 3), 3.5), w); }
  else if (L === 'glow') { g.shadowColor = col; g.shadowBlur = 14; draw(pts, w); }
  else if (L === 'stick') { /* handled by the stick-figure subject */ }
  g.restore();
}
// ---------------------------------------------------------------- the scene, styled
function frameIndex(t) { return Math.floor(t * 30 + 1e-6); }
function quantTime(t) {
  const fps = R.fps || 30; let tq = Math.floor(t * fps + 1e-6) / fps;
  if (R.holds) { const seg = R.holds; const k = Math.floor(tq / seg), local = tq - k * seg; tq = k * seg + Math.min(local, seg * .35); }   // limited animation: move briefly, then hold
  return tq;
}
function drawStyledScene(g, t) {
  const tq = quantTime(t), f = frameIndex(tq), sc = sceneAt(tq);
  sc.shapes.forEach((s, i) => { s.seed = i * 7 + 3; });
  const step = R.fps ? Math.floor(t * R.fps) : 0;
  const zoom = R.push ? 1 + tween(t, 0, 6, ease.linear) * R.push : 1;
  g.save(); g.translate(W / 2, H * .6); g.scale(zoom, zoom); g.translate(-W / 2, -H * .6);
  if (R.panY) g.translate(0, -tween(t, 0, 6, ease.inOut) * R.panY);
  const groups = { sky: [], far: [], mid: [], ground: [], char: [], fg: [] };
  sc.shapes.forEach(s => groups[s.layer].push(s));
  const drawGroup = (list, fill, blur) => {
    if (blur) { const c2 = tmpCanvas('dof' + blur, W, H), g2 = c2.getContext('2d'); g2.setTransform(g.getTransform()); g2.clearRect(-W, -H, W * 3, H * 3); list.forEach(s => drawOne(g2, s, fill)); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${blur}px)`; g.drawImage(c2, 0, 0); g.restore(); return; }
    list.forEach(s => drawOne(g, s, fill));
  };
  const drawOne = (gg, s, fill) => {
    let pts = s.pts;
    if (R.jitter) pts = jitter(pts, s.seed * 13 + step * 7, R.jitter);                     // stop-motion wobble
    if (R.boilFill && s.layer === 'char') pts = jitter(pts, s.seed * 31 + Math.floor(f / 2), R.boilFill);
    const p = pathOf(pts), c = colorOf(s.mat);
    if (LINEPASS) { gg.fillStyle = '#ffffff'; gg.fill(p); strokeShape(gg, s, pts, f, true); return; }
    (FILL[fill] || FILL.flat)(gg, { ...s, pts }, p, c, f);
    if (s.glow && R.sunGlow !== false) { gg.save(); gg.globalAlpha = .35; gg.filter = 'blur(30px)'; gg.fillStyle = c; gg.fill(p); gg.restore(); }
    strokeShape(gg, s, pts, f);
  };
  const bgFill = R.bgFill || R.fill || 'flat', chFill = R.charFill || R.fill || 'flat';
  if ([bgFill, chFill].some(f => f === 'wash' || f === 'none' || f === 'white')) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = R.paper || '#f6efe0'; g.fillRect(0, 0, W, H); g.restore(); }
  drawGroup(groups.sky, bgFill); drawGroup(groups.far, bgFill, R.dof ? R.dof * 1.6 : 0); drawGroup(groups.mid, bgFill, R.dof || 0);
  drawGroup(groups.ground, bgFill); drawGroup(groups.char, chFill); drawGroup(groups.fg, chFill, R.dof ? R.dof * 1.4 : 0);
  if (R.speedlines) speedLines(g, t);
  g.restore();
  return sc;
}
function speedLines(g, t) { const r = rng(Math.floor(t * 12)); g.save(); g.strokeStyle = R.speedColor || 'rgba(255,255,255,.7)'; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const y = 900 + r() * 700, x = r() * W, l = 120 + r() * 260; g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x - l, y); g.stroke(); } g.restore(); }
// ---------------------------------------------------------------- textures and post effects
const POST = {
  grain: (t, a = .06) => { const r = rng(frameIndex(t) + 5); ctx.save(); for (let i = 0; i < 7000; i++) { ctx.fillStyle = r() > .5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; ctx.fillRect(r() * W, r() * H, 2, 2); } ctx.restore(); },
  paper: () => { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = paperPattern(ctx); ctx.globalAlpha = .9; ctx.fillRect(0, 0, W, H); ctx.restore(); },
  vignette: (t, a = .55) => { const v = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); },
  bloom: (t, a = .35) => { const c2 = tmpCanvas('bl', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.filter = 'blur(16px)'; ctx.drawImage(c2, 0, 0); ctx.restore(); },
  halftone: (t, cell = 12) => { const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell), c = tmpCanvas('ht', cols, rows), g2 = c.getContext('2d', { willReadFrequently: true }); g2.drawImage(cv, 0, 0, cols, rows); const d = g2.getImageData(0, 0, cols, rows).data;
    ctx.save(); ctx.fillStyle = R.dotColor || 'rgba(20,10,30,.42)'; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const i = (y * cols + x) * 4, l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, r0 = (1 - l) * cell * .55; if (r0 > 1) { ctx.beginPath(); ctx.arc((x + .5) * cell + (y % 2 ? cell / 2 : 0), (y + .5) * cell, r0, 0, TAU); ctx.fill(); } } ctx.restore(); },
  screentone: (t, cell = 9) => { // manga: pure black and white, mid tones become dot screens
    const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell), c = tmpCanvas('st', cols, rows), g2 = c.getContext('2d', { willReadFrequently: true }); g2.drawImage(cv, 0, 0, cols, rows); const d = g2.getImageData(0, 0, cols, rows).data;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#111111';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const i = (y * cols + x) * 4, l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
      if (l < .22) ctx.fillRect(x * cell, y * cell, cell, cell); else if (l < .78) { ctx.beginPath(); ctx.arc((x + .5) * cell, (y + .5) * cell, (1 - l) * cell * .48, 0, TAU); ctx.fill(); } } },
  pixel: (t) => { // draw at low resolution, limited palette, optional ordered dithering, scale up with hard edges
    const px = R.pixel || 6, w = Math.ceil(W / px), h = Math.ceil(H / px), c = tmpCanvas('px', w, h), g2 = c.getContext('2d', { willReadFrequently: true });
    g2.imageSmoothingEnabled = true; g2.drawImage(cv, 0, 0, w, h); const im = g2.getImageData(0, 0, w, h), d = im.data, levels = R.levels || 6;
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const pal = R.pixPalette ? R.pixPalette.map(hx => { const n = parseInt(hx.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }) : null;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, th = R.dither ? (BAYER[(y % 4) * 4 + (x % 4)] / 16 - .5) * (R.dither) : 0;
      if (pal) { const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255 + th * .35, k = Math.max(0, Math.min(pal.length - 1, Math.round(l * (pal.length - 1)))); d[i] = pal[k][0]; d[i + 1] = pal[k][1]; d[i + 2] = pal[k][2]; }
      else for (let ch = 0; ch < 3; ch++) { const v = d[i + ch] / 255 + th / levels; d[i + ch] = Math.round(clamp(Math.round(v * (levels - 1)) / (levels - 1)) * 255); } }
    g2.putImageData(im, 0, 0); ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, w * px, h * px); ctx.restore(); },
  vhs: (t) => { const c2 = tmpCanvas('vh', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0);
    ctx.save(); ctx.filter = 'blur(1.4px) saturate(1.25)'; ctx.drawImage(c2, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .28; ctx.drawImage(c2, 6, 0); ctx.globalAlpha = .22; ctx.drawImage(c2, -5, 0); ctx.restore();
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2); const ty = ((t * 380) % (H + 200)) - 100; ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, ty, W, 40);
    const r = rng(frameIndex(t)); for (let i = 0; i < 6; i++) { const y = r() * H; ctx.drawImage(c2, 0, y, W, 6, (r() - .5) * 18, y, W, 6); } ctx.restore();
    const mono = '"JetBrains Mono", "DejaVu Sans Mono", monospace'; text(ctx, R.vhsTop || 'PLAY ▶', 110, 300, { size: 52, weight: 500, family: mono, color: '#ffffff', align: 'left' });
    text(ctx, R.vhsDate || 'JAN. 23 1998', 110, 1690, { size: 48, weight: 500, family: mono, color: '#ffffff', align: 'left' }); },
  glitch: (t) => { const c2 = tmpCanvas('gl', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0); const r = rng(Math.floor(t * 10));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .45; ctx.filter = 'hue-rotate(160deg)'; ctx.drawImage(c2, 10, 0); ctx.restore();
    const hit = (t % 1.3) < .35; for (let i = 0; i < (hit ? 14 : 4); i++) { const y = r() * H, h = 8 + r() * 70, dx = (r() - .5) * (hit ? 140 : 30); ctx.drawImage(c2, 0, y, W, h, dx, y, W, h); }
    if (hit) { ctx.save(); ctx.globalAlpha = .5; for (let i = 0; i < 18; i++) { ctx.fillStyle = ['#ff2fd0', '#2ff0ff', '#ffffff', '#000000'][i % 4]; ctx.fillRect(r() * W, r() * H, 20 + r() * 120, 8 + r() * 20); } ctx.restore(); } },
  sepia: () => { const c2 = tmpCanvas('se', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0); ctx.save(); ctx.filter = 'sepia(.75) contrast(1.05)'; ctx.drawImage(c2, 0, 0); ctx.restore(); },
  hue: (t) => { const c2 = tmpCanvas('hu', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0); ctx.save(); ctx.filter = `hue-rotate(${Math.round(t * 60)}deg) saturate(2.2)`; ctx.drawImage(c2, 0, 0); ctx.restore(); },
  smudge: () => { const c2 = tmpCanvas('sm', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0); ctx.save(); ctx.globalAlpha = .35; ctx.filter = 'blur(5px)'; ctx.drawImage(c2, 4, 3); ctx.restore(); },
  crt: (t) => crtFilter(t), ascii: (t) => { asciiFilter(t); crtFilter(t); }, thermal: (t) => thermalFilter(t),
};
function applyPost(t) { (R.post || []).forEach(p => { const [name, arg] = Array.isArray(p) ? p : [p]; POST[name] && POST[name](t, arg); }); }

// inks drawn after the post effects (manga, comics): a second pass draws every shape white with its ink line, so
// shapes in front still hide the lines behind them, and that layer is multiplied over the toned image.
let LINEPASS = false;
function redrawLines(t, sc) {
  if (!R.lineAfter || R.subject) return;
  const c = tmpCanvas('ink', W, H), g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  LINEPASS = true; try { drawStyledScene(g, t); } finally { LINEPASS = false; }
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(c, 0, 0); ctx.restore();
}
