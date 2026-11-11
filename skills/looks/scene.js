// /looks: one short scene (a worker walks across an office carrying a stack of papers; the top sheet slips)
// rendered in one of nine looks. The scene is built as a list of shapes with a material each; every look draws
// that list its own way. renderAt(t) depends only on t.
const LOOK = SPEC.look, DOCS = SPEC.docs, TS = SPEC.slip_at;       // the sheet slips at TS seconds
const FLOOR = 1380, X0 = 170, X1 = 800, STRIDE = 270;
const PI = Math.PI;
// ---------------------------------------------------------------- geometry
const circlePts = (c, r, n = 28) => Array.from({ length: n }, (_, i) => [c[0] + Math.cos(i / n * 2 * PI) * r, c[1] + Math.sin(i / n * 2 * PI) * r]);
const ellPts = (c, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [c[0] + Math.cos(i / n * 2 * PI) * rx, c[1] + Math.sin(i / n * 2 * PI) * ry]);
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function capsulePts(a, b, r) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), p = [];
  for (let i = 0; i <= 10; i++) { const t = ang + PI / 2 + i / 10 * PI; p.push([a[0] + Math.cos(t) * r, a[1] + Math.sin(t) * r]); }
  for (let i = 0; i <= 10; i++) { const t = ang - PI / 2 + i / 10 * PI; p.push([b[0] + Math.cos(t) * r, b[1] + Math.sin(t) * r]); }
  return p;
}
function rotPts(pts, c, a) { const s = Math.sin(a), k = Math.cos(a); return pts.map(([x, y]) => [c[0] + (x - c[0]) * k - (y - c[1]) * s, c[1] + (x - c[0]) * s + (y - c[1]) * k]); }
function ik(S, T, l1, l2, bend = 1) {                                   // 2-bone arm: elbow position
  const dx = T[0] - S[0], dy = T[1] - S[1], d = Math.min(l1 + l2 - .1, Math.hypot(dx, dy)), a = Math.atan2(dy, dx), c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return [S[0] + Math.cos(a + bend * c) * l1, S[1] + Math.sin(a + bend * c) * l1];
}
// the sheet's path after it slips (world space), u = 0..1
function sheetAt(t, start) {
  const u = clamp((t - TS) / 1.6), x = start[0] - 170 * u + 46 * Math.sin(u * 8), y = start[1] + (FLOOR - 6 - start[1]) * Math.pow(u, 1.35) - 40 * Math.sin(u * PI);
  return { u, p: [x, y], rot: (1 - u) * .7 * Math.sin(u * 11) + u * .05 };
}
function walkerX(t) { return lerp(X0, X1, tween(t, .2, 5.6, ease.linear)); }
function stackTopAt(t) { const A = worker(t, true); return A.stackTop; }
// the worker: returns { shapes, anchors }
function worker(t, anchorsOnly = false) {
  const x = walkerX(t), moving = t > .2 && t < 5.6, ph = (x - X0) / STRIDE * PI;
  const leg = (p) => { const a = moving ? .42 * Math.sin(p) : 0, b = moving ? .55 * Math.max(0, Math.sin(p + 1.7)) : 0;
    const k = [Math.sin(a) * 134, Math.cos(a) * 134], an = [k[0] + Math.sin(a - b) * 132, k[1] + Math.cos(a - b) * 132]; return { k, an, a: a - b }; };
  const L1 = leg(ph), L2 = leg(ph + PI), drop = Math.max(L1.an[1], L2.an[1]);
  const H = [x, FLOOR - 16 - drop], S = [x + 10, H[1] - 205], HEAD = [S[0] + 14, S[1] - 82];
  const hand = [x + 100, S[1] + 118 + (moving ? Math.sin(ph * 2) * 3 : 0)], hand2 = [x + 78, S[1] + 126];
  const stackBase = [x + 112, hand[1] - 14], sheets = DOCS;
  const stackTop = [stackBase[0], stackBase[1] - (sheets - 1) * 11];
  const A = { x, H, S, HEAD, hand, stackTop, stackBase, legs: [L1, L2], ph, moving };
  if (anchorsOnly) return A;
  const sh = [], P = (mat, pts, extra) => sh.push({ mat, pts, ...extra });
  const legShapes = (L, back) => { const K = [H[0] + L.k[0], H[1] + L.k[1]], AN = [H[0] + L.an[0], H[1] + L.an[1]];
    P(back ? 'pants2' : 'pants', capsulePts(H, K, 25), { joint: K }); P(back ? 'pants2' : 'pants', capsulePts(K, AN, 21));
    P('shoe', rotPts([[AN[0] - 22, AN[1] - 4], [AN[0] + 46, AN[1] - 4], [AN[0] + 48, AN[1] + 14], [AN[0] - 24, AN[1] + 14]], AN, Math.min(0, L.a) * .3));
    return { K, AN }; };
  const back = moving && Math.sin(ph) > 0 ? L1 : L2, front = back === L1 ? L2 : L1;
  const BL = legShapes(back, true);
  const E2 = ik(S, hand2, 104, 100, -1); P('shirt2', capsulePts(S, E2, 20)); P('shirt2', capsulePts(E2, hand2, 17)); P('skin', circlePts(hand2, 15));
  P('shirt', capsulePts(H, S, 50), { joint: H }); P('tie', [[S[0] + 30, S[1] + 4], [S[0] + 42, S[1] + 4], [S[0] + 46, S[1] + 110], [S[0] + 36, S[1] + 126], [S[0] + 28, S[1] + 110]]);
  const FL = legShapes(front, false);
  // papers: the stack, minus the top sheet once it slips (it is drawn on its own)
  const slipped = t >= TS && !(LOOK === 'hologram' && t > TS + 1.9);
  const n = slipped ? sheets - 1 : sheets;
  for (let i = 0; i < n; i++) P('paper', rectPts(stackBase[0] - 78, stackBase[1] - i * 11 - 9, 156, 9), { sheet: i });
  const E = ik(S, hand, 104, 100, -1); P('shirt', capsulePts(S, E, 21), { joint: S }); P('shirt', capsulePts(E, hand, 18), { joint: E }); P('skin', circlePts(hand, 16));
  // head
  const big = LOOK === 'anime' ? 1.18 : 1, R = 52 * big;
  P('skin', capsulePts([HEAD[0] - 8, S[1] - 18], [HEAD[0] - 2, HEAD[1] + 30], 17));                   // neck
  P('skin', ellPts(HEAD, R * .92, R, 32), { head: true });
  if (LOOK === 'anime') P('hair', [[HEAD[0] - R, HEAD[1] + 8], [HEAD[0] - R - 26, HEAD[1] - 20], [HEAD[0] - R + 4, HEAD[1] - 30], [HEAD[0] - R - 10, HEAD[1] - 60], [HEAD[0] - 20, HEAD[1] - R - 6], [HEAD[0] - 8, HEAD[1] - R - 38], [HEAD[0] + 18, HEAD[1] - R - 4], [HEAD[0] + 40, HEAD[1] - R - 22], [HEAD[0] + R * .9, HEAD[1] - 26], [HEAD[0] + R * .5, HEAD[1] - 20], [HEAD[0] + 10, HEAD[1] - 34], [HEAD[0] - R * .55, HEAD[1] - 10]]);
  else P('hair', [[HEAD[0] - R * .95, HEAD[1] + 6], [HEAD[0] - R, HEAD[1] - 26], [HEAD[0] - R * .5, HEAD[1] - R - 4], [HEAD[0] + R * .4, HEAD[1] - R - 6], [HEAD[0] + R * .92, HEAD[1] - 22], [HEAD[0] + R * .55, HEAD[1] - 30], [HEAD[0] - R * .35, HEAD[1] - 30], [HEAD[0] - R * .6, HEAD[1] - 4]]);
  const surprised = t > TS && t < TS + 1.2;
  P('eye', ellPts([HEAD[0] + R * .5, HEAD[1] - 4], 6 * big * (LOOK === 'anime' ? 2 : 1), 7 * big * (LOOK === 'anime' ? 2.3 : 1) * (surprised ? 1.25 : 1), 16), { eye: true });
  P('mouth', surprised ? ellPts([HEAD[0] + R * .55, HEAD[1] + 26], 7, 9, 12) : [[HEAD[0] + R * .3, HEAD[1] + 24], [HEAD[0] + R * .72, HEAD[1] + 22], [HEAD[0] + R * .7, HEAD[1] + 27], [HEAD[0] + R * .34, HEAD[1] + 29]]);
  return { shapes: sh, A, joints: [S, E, H, FL.K, BL.K] };
}
function office(t) {
  const sh = [], P = (mat, pts, extra) => sh.push({ mat, pts, ...extra });
  P('ceil', rectPts(0, 0, W, 380)); P('wall', rectPts(0, 380, W, FLOOR - 380)); P('floor', rectPts(0, FLOOR, W, H - FLOOR)); P('base', rectPts(0, FLOOR - 22, W, 22));
  P('frame', rectPts(110, 560, 360, 440)); P('glass', rectPts(130, 580, 320, 400), { window: true });
  P('frame', rectPts(285, 580, 10, 400)); P('frame', rectPts(130, 775, 320, 10));
  P('desk', rectPts(600, 1120, 380, 26)); P('desk', rectPts(622, 1146, 22, FLOOR - 1146 - 22)); P('desk', rectPts(936, 1146, 22, FLOOR - 1146 - 22)); P('desk', rectPts(820, 1146, 116, 120));
  P('mug', [[700, 1062], [742, 1062], [738, 1120], [704, 1120]], { mug: true }); P('mug', capsulePts([744, 1078], [748, 1100], 9));
  P('pot', [[880, 1066], [930, 1066], [924, 1120], [886, 1120]]);
  for (let i = 0; i < 5; i++) { const a = -PI / 2 + (i - 2) * .45; P('leaf', capsulePts([905, 1066], [905 + Math.cos(a) * 70, 1066 + Math.sin(a) * 70], 12)); }
  P('frame', rectPts(560, 610, 230, 150)); P('poster', rectPts(574, 624, 202, 122));                // a chart on the wall
  return sh;
}
// ---------------------------------------------------------------- drawing helpers
const pathOf = pts => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
const jitterPts = (pts, seed, a) => { const r = rng(seed); return pts.map(([x, y]) => [x + (r() - .5) * a, y + (r() - .5) * a]); };
function sceneShapes(t) {
  const off = office(t), wk = worker(t), A = wk.A;
  const top = worker(Math.min(t, TS), true).stackTop, sp = sheetAt(t, top);
  let sheet = null;
  if (t >= TS && !(LOOK === 'hologram' && t > TS + 1.9)) sheet = { mat: 'paper', pts: rotPts(rectPts(sp.p[0] - 78, sp.p[1] - 5, 156, 9), sp.p, sp.rot), sheet: 'loose' };
  return { off, wk, A, sheet, sp, top };
}
function drawSet(list, fn) { list.forEach(s => fn(s)); }
// ---------------------------------------------------------------- looks
const LOOKS = {};
// a plain flat palette, used by several looks
const FLAT = { ceil: '#cfc6b4', wall: '#d9d2c3', floor: '#a88b6a', base: '#8a6f52', frame: '#ffffff', glass: '#aed3ea', desk: '#8b5e3c', mug: '#e8e8e8', pot: '#c8664a', leaf: '#5c9a52', poster: '#f3efe4',
  skin: '#f0c49b', hair: '#3a2a20', eye: '#1b1b1b', mouth: '#9c4a3a', shirt: '#6aa6d8', shirt2: '#5a8fbd', tie: '#c8443c', pants: '#3b4660', pants2: '#323b52', shoe: '#2a2a2a', paper: '#fbfbf5' };
function flatDraw(g, s, pal = FLAT, outline = null, lw = 2) { const p = pathOf(s.pts); g.fillStyle = pal[s.mat] || '#888'; g.fill(p); if (outline) { g.strokeStyle = outline; g.lineWidth = lw; g.stroke(p); } }
function drawScene(g, sc, fn) { drawSet(sc.off, fn); drawSet(sc.wk.shapes, fn); if (sc.sheet) fn(sc.sheet); }

// 1. hologram
LOOKS.hologram = (t) => {
  const sc = sceneShapes(t), cyan = '#46e8ff';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  // grid floor in perspective and the projector disc
  ctx.save(); ctx.strokeStyle = 'rgba(70,232,255,.35)'; ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) { const y = FLOOR + Math.pow(i / 13, 1.8) * 420; ctx.globalAlpha = .25 + i / 26; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 40, FLOOR); ctx.lineTo(W / 2 + i * 150, FLOOR + 420); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.translate(W / 2, FLOOR + 90); ctx.strokeStyle = cyan; ctx.shadowColor = cyan; ctx.shadowBlur = 20;
  [[420, 0.5, 1.6], [360, -.8, 2.4], [300, 1.2, 1.2]].forEach(([r, w, len], i) => { ctx.lineWidth = 4; ctx.globalAlpha = .7; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .16, 0, t * w + i, t * w + i + len); ctx.stroke(); });
  ctx.globalAlpha = .25; ctx.fillStyle = cyan; ctx.beginPath(); ctx.ellipse(0, 0, 440, 70, 0, 0, 7); ctx.fill(); ctx.restore();
  const beam = ctx.createLinearGradient(0, FLOOR + 90, 0, 400); beam.addColorStop(0, 'rgba(70,232,255,.14)'); beam.addColorStop(1, 'rgba(70,232,255,0)');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(W / 2 - 440, FLOOR + 90); ctx.lineTo(W / 2 + 440, FLOOR + 90); ctx.lineTo(W, 420); ctx.lineTo(0, 420); ctx.fill();
  // translucent shapes with a glowing rim, additive
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const drawHolo = (s, a) => { if (['ceil', 'wall', 'floor', 'base'].includes(s.mat)) return; const p = pathOf(s.pts);
    ctx.fillStyle = `rgba(70,232,255,${a * .10})`; ctx.fill(p);
    ctx.strokeStyle = `rgba(150,245,255,${a})`; ctx.shadowColor = cyan; ctx.shadowBlur = 16; ctx.lineWidth = 2.5; ctx.stroke(p); ctx.shadowBlur = 0;
    ctx.save(); ctx.clip(p); ctx.strokeStyle = `rgba(70,232,255,${a * .18})`; ctx.lineWidth = 1; for (let y = 380; y < FLOOR + 40; y += 14) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 30); ctx.stroke(); } ctx.restore(); };
  drawSet(sc.off, s => drawHolo(s, .45)); drawSet(sc.wk.shapes, s => drawHolo(s, 1));
  // the slipped sheet: breaks into particles, then they fly back and re-form on the stack
  if (t >= TS) {
    const u = (t - TS) / 1.9, burst = tween(u, 0, .45, ease.out), back = tween(u, .45, 1, ease.inOut), top = sc.A.stackTop, r = rng(9);
    const centre = sheetAt(TS + .35, sc.top).p;
    for (let i = 0; i < 90; i++) { const a = r() * 2 * PI, d = 40 + r() * 170, o = [(r() - .5) * 156, (r() - .5) * 9];
      const sp = [centre[0] + o[0] + Math.cos(a) * d * burst, centre[1] + o[1] + Math.sin(a) * d * burst * .7 - 40 * burst];
      const dst = [top[0] + o[0], top[1] - 11 + o[1]], p = back > 0 ? [lerp(sp[0], dst[0], back), lerp(sp[1], dst[1], back)] : sp;
      if (u > 1) break; ctx.fillStyle = cyan; ctx.shadowColor = cyan; ctx.shadowBlur = 10; ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4); }
  }
  ctx.restore();
  // labels
  const mono = '"JetBrains Mono", "DejaVu Sans Mono", monospace', A = sc.A, lab = tween(t, .4, 1);
  const docs = t >= TS && t < TS + 1.9 ? DOCS - 1 : DOCS;
  const sd = A.HEAD[0] + 380 > W - 90 ? -1 : 1, lx = A.HEAD[0] + sd * 76;
  ctx.save(); ctx.strokeStyle = cyan; ctx.globalAlpha = lab; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.HEAD[0], A.HEAD[1] - 70); ctx.lineTo(A.HEAD[0] + sd * 40, A.HEAD[1] - 120); ctx.lineTo(A.HEAD[0] + sd * 70, A.HEAD[1] - 120); ctx.stroke(); ctx.restore();
  text(ctx, SPEC.name_tag, lx, A.HEAD[1] - 132, { size: 40, weight: 500, family: mono, color: '#bff6ff', align: sd > 0 ? 'left' : 'right', alpha: lab, maxW: 400 });
  text(ctx, `DOCS: ${docs}`, lx, A.HEAD[1] - 84, { size: 40, weight: 500, family: mono, color: docs < DOCS ? '#ffb547' : '#bff6ff', align: sd > 0 ? 'left' : 'right', alpha: lab, maxW: 400 });
  // moving scanlines and small glitches
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let y = Math.floor(t * 60) % 6; y < H; y += 6) ctx.fillRect(0, y, W, 2); ctx.restore();
  const gl = [1.3, 2.75, 4.4, 5.3].find(g => t >= g && t < g + .1);
  if (gl != null) { const r = rng(Math.floor(t * 30)), c2 = tmpCanvas('gl', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0);
    for (let i = 0; i < 6; i++) { const y = 400 + r() * 1000, h = 10 + r() * 40, dx = (r() - .5) * 50; ctx.drawImage(c2, 0, y, W, h, dx, y, W, h); } }
};

// 2. cyberpunk neon
LOOKS.cyberpunk = (t) => {
  const sc = sceneShapes(t), pink = '#ff3fa4', cyan = '#35e7ff';
  const DARK = { ceil: '#0d0718', wall: '#150b22', floor: '#0b0612', base: '#25103a', frame: '#2a1840', glass: '#0b1430', desk: '#1d1430', mug: '#2b2440', pot: '#2b1830', leaf: '#123a2e', poster: '#0f2440',
    skin: '#3a2430', hair: '#120a14', eye: '#e8f8ff', mouth: '#5a2030', shirt: '#22203a', shirt2: '#1a1830', tie: '#4a1030', pants: '#14121f', pants2: '#100e1a', shoe: '#0a0a10', paper: '#d8d0f0' };
  drawSet(sc.off, s => { flatDraw(ctx, s, DARK);
    if (s.window) { // city and rain behind the window
      ctx.save(); ctx.clip(pathOf(s.pts)); const r = rng(4);
      for (let i = 0; i < 9; i++) { const bx = 130 + i * 38, bh = 120 + r() * 250; ctx.fillStyle = '#120d2a'; ctx.fillRect(bx, 980 - bh, 34, bh); for (let k = 0; k < 14; k++) if (r() > .5) { ctx.fillStyle = r() > .5 ? 'rgba(255,200,120,.7)' : 'rgba(120,220,255,.6)'; ctx.fillRect(bx + 4 + (k % 3) * 10, 980 - bh + 10 + Math.floor(k / 3) * 22, 5, 8); } }
      [[160, 700, pink], [330, 640, cyan]].forEach(([x, y, c]) => { ctx.save(); ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 30; ctx.globalAlpha = .85; ctx.fillRect(x, y, 90, 50); ctx.restore(); });
      ctx.strokeStyle = 'rgba(180,200,255,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 70; i++) { const x = 130 + r() * 320, y = 580 + ((r() * 400 + t * 900) % 400); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 26); ctx.stroke(); }
      ctx.restore(); } });
  // neon tubes and the sign
  const tube = (x1, y1, x2, y2, c) => { ctx.save(); ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 40; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); };
  tube(80, 420, 1000, 420, pink); tube(1010, 470, 1010, 1100, cyan); tube(60, 1060, 60, 1300, pink);
  const fl = (t > 2.1 && t < 2.18) || (t > 4.62 && t < 4.7) ? .45 : 1;                          // short dips, not a strobe
  ctx.save(); ctx.globalAlpha = fl; ctx.shadowColor = pink; ctx.shadowBlur = 30; text(ctx, SPEC.sign, 790, 900, { size: 56, weight: 800, family: '"Inter Tight", Inter, sans-serif', color: '#ffd1ea', maxW: 400, track: 3 }); ctx.restore();
  // the worker with a pink rim on one side and cyan on the other
  const rim = s => { const p = pathOf(s.pts); ctx.save(); ctx.clip(p); ctx.fillStyle = pink; ctx.fill(p); ctx.translate(6, 0); ctx.fillStyle = cyan; ctx.fill(p); ctx.translate(-12, 0); ctx.clip(p); ctx.translate(6, 0); ctx.fillStyle = DARK[s.mat] || '#222'; ctx.fill(p); ctx.restore(); };
  drawSet(sc.wk.shapes, s => s.mat === 'eye' || s.mat === 'mouth' ? flatDraw(ctx, s, DARK) : rim(s)); if (sc.sheet) rim(sc.sheet);
  // wet floor reflection, haze and bloom
  const c2 = tmpCanvas('cp', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0);
  ctx.save(); ctx.beginPath(); ctx.rect(0, FLOOR, W, H - FLOOR); ctx.clip(); ctx.globalAlpha = .4; ctx.filter = 'blur(4px)'; ctx.translate(0, FLOOR * 2); ctx.scale(1, -1); ctx.drawImage(c2, 0, 0); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35; ctx.filter = 'blur(18px)'; ctx.drawImage(c2, 0, 0); ctx.restore();
  const hz = ctx.createLinearGradient(0, 380, 0, H); hz.addColorStop(0, 'rgba(255,63,164,.08)'); hz.addColorStop(1, 'rgba(53,231,255,.06)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
};

// 3. paper cutout, stop motion on twos
LOOKS.paper = (t) => {
  const step = Math.floor(t * 12), tq = step / 12, sc = sceneShapes(tq);
  const PAP = { ceil: '#e0bd8c', wall: '#e9c99a', floor: '#b7835a', base: '#8f5f3e', frame: '#f6efe0', glass: '#9cc7c7', desk: '#9a5b3a', mug: '#f4e5c8', pot: '#d0603c', leaf: '#6e9a4a', poster: '#f6efe0',
    skin: '#f2c39a', hair: '#5a3524', eye: '#2a1a14', mouth: '#a8483a', shirt: '#d9874a', shirt2: '#c4743c', tie: '#3f6b78', pants: '#4f5f7a', pants2: '#43516a', shoe: '#3a2a22', paper: '#fbf6ea' };
  const fibre = tmpCanvas('fb', 256, 256); if (!fibre._done) { const g = fibre.getContext('2d'), r = rng(2); for (let i = 0; i < 1400; i++) { g.strokeStyle = r() > .5 ? 'rgba(255,255,255,.18)' : 'rgba(80,50,20,.10)'; g.lineWidth = .8; const x = r() * 256, y = r() * 256, a = r() * PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); g.stroke(); } fibre._done = 1; }
  const pat = ctx.createPattern(fibre, 'repeat');
  ctx.fillStyle = '#3a2a22'; ctx.fillRect(0, 0, W, H);
  let k = 0; const cut = s => { const r = rng(step * 31 + k++), dx = (r() - .5) * 3, dy = (r() - .5) * 3;
    const pts = jitterPts(s.pts.flatMap((p, i, a) => { const q = a[(i + 1) % a.length]; return [p, [lerp(p[0], q[0], .5), lerp(p[1], q[1], .5)]]; }), 1000 + k * 7, 4).map(([x, y]) => [x + dx, y + dy]);
    const p = pathOf(pts); ctx.save(); ctx.shadowColor = 'rgba(40,20,5,.38)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6; ctx.fillStyle = PAP[s.mat] || '#999'; ctx.fill(p); ctx.restore();
    ctx.save(); ctx.clip(p); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.restore(); };
  drawScene(ctx, sc, cut);
  // brass split pins at the joints
  sc.wk.joints.forEach(j => { const g = ctx.createRadialGradient(j[0] - 2, j[1] - 2, 1, j[0], j[1], 8); g.addColorStop(0, '#ffe7a0'); g.addColorStop(1, '#a8781e'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(j[0], j[1], 7, 0, 7); ctx.fill(); });
};

// 4. technical blueprint
LOOKS.blueprint = (t) => {
  const sc = sceneShapes(t), line = '#e8f6ff', cy = '#7fd6ff', mono = '"JetBrains Mono", "DejaVu Sans Mono", monospace';
  ctx.fillStyle = '#0d2f6b'; ctx.fillRect(0, 0, W, H);
  for (let x = 0; x <= W; x += 30) { ctx.fillStyle = x % 150 ? 'rgba(170,215,255,.10)' : 'rgba(170,215,255,.22)'; ctx.fillRect(x, 0, 1, H); }
  for (let y = 0; y <= H; y += 30) { ctx.fillStyle = y % 150 ? 'rgba(170,215,255,.10)' : 'rgba(170,215,255,.22)'; ctx.fillRect(0, y, W, 1); }
  // the office draws itself line by line (0-2 s), the worker is traced and then walks
  ctx.strokeStyle = line; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  sc.off.forEach((s, i) => { if (s.mat === 'wall' || s.mat === 'ceil') return; partialLine(ctx, [...s.pts, s.pts[0]], tween(t, i * .1, .5 + i * .1, ease.linear)); });
  const wk = tween(t, 1, 2); ctx.strokeStyle = cy; sc.wk.shapes.forEach(s => partialLine(ctx, [...s.pts, s.pts[0]], wk));
  if (sc.sheet) { ctx.strokeStyle = '#ffd27a'; partialLine(ctx, [...sc.sheet.pts, sc.sheet.pts[0]], 1); }
  // dimensions
  const A = sc.A, dk = tween(t, 2, 2.8), [dh, ds, dv, dst] = SPEC.dims;
  const dimV = (x, y1, y2, label, k, side = -1) => { if (k <= 0) return; ctx.strokeStyle = cy; ctx.lineWidth = 2; partialLine(ctx, [[x, y2], [x, lerp(y2, y1, k)]], 1); [y1, y2].forEach(y => { ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.stroke(); });
    ctx.font = `500 40px ${mono}`; const tw = ctx.measureText(label).width, tx = side < 0 ? Math.max(x - 14, 90 + tw) : Math.min(x + 14, W - 90 - tw);
    text(ctx, label, tx, (y1 + y2) / 2 + 12, { size: 40, weight: 500, family: mono, color: cy, align: side < 0 ? 'right' : 'left', alpha: k, maxW: 420 }); };
  dimV(A.x - 90, A.HEAD[1] - 52, FLOOR, dh, dk);
  dimV(A.stackBase[0] + 100, A.stackTop[1] - 9, A.stackBase[1], ds, tween(t, 2.3, 3), 1);
  const vk = tween(t, 2.6, 3.2); if (vk > 0) { const y = A.HEAD[1] - 150; ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 3; partialLine(ctx, [[A.x - 40, y], [A.x + 120, y]], vk); ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.moveTo(A.x + 132, y); ctx.lineTo(A.x + 112, y - 9); ctx.lineTo(A.x + 112, y + 9); ctx.fill();
    text(ctx, dv, Math.min(A.x + 40, W - 250), y - 18, { size: 40, weight: 500, family: mono, color: '#ffd27a', alpha: vk, maxW: 400 }); }
  const sk = tween(t, 1.6, 2.4); if (sk > 0) { const fx = A.x - STRIDE / 2, y = FLOOR + 60; ctx.strokeStyle = cy; ctx.lineWidth = 2; ctx.setLineDash([]); partialLine(ctx, [[fx, y], [fx + STRIDE * sk, y]], 1); ctx.beginPath(); ctx.moveTo(fx, y - 12); ctx.lineTo(fx, y + 12); ctx.moveTo(fx + STRIDE, y - 12); ctx.lineTo(fx + STRIDE, y + 12); ctx.stroke();
    text(ctx, dst, Math.max(260, fx + STRIDE / 2), y + 56, { size: 40, weight: 500, family: mono, color: cy, alpha: sk, maxW: 400 }); }
  // the sheet's path as a dashed arc with a note
  if (t >= TS) { const pts = []; for (let k = 0; k <= 40; k++) { const tt = TS + k / 40 * 1.6; if (tt > t) break; pts.push(sheetAt(tt, sc.top).p); }
    ctx.save(); ctx.strokeStyle = '#ffd27a'; ctx.setLineDash([12, 10]); ctx.lineWidth = 2.5; if (pts.length > 1) partialLine(ctx, pts, 1); ctx.restore();
    text(ctx, SPEC.slip_note, 120, 1180, { size: 40, weight: 500, family: mono, color: '#ffd27a', align: 'left', alpha: tween(t, TS + .3, TS + .8), maxW: 520 }); }
  // title block
  const tb = tween(t, .2, .8); ctx.save(); ctx.globalAlpha = tb; ctx.strokeStyle = line; ctx.lineWidth = 2.5; ctx.strokeRect(470, 1560, 520, 140); ctx.beginPath(); ctx.moveTo(470, 1630); ctx.lineTo(990, 1630); ctx.stroke(); ctx.restore();
  text(ctx, SPEC.title, 490, 1612, { size: 40, weight: 500, family: mono, color: line, align: 'left', alpha: tb, maxW: 480 });
  text(ctx, 'SCALE 1:20', 490, 1682, { size: 40, weight: 500, family: mono, color: cy, align: 'left', alpha: tb, maxW: 480 });
};

// 5. thermal camera
LOOKS.thermal = (t) => {
  const sc = sceneShapes(t);
  const HEAT = { ceil: .26, wall: .28, floor: .24, base: .26, frame: .2, glass: .04, desk: .3, mug: .9, pot: .32, leaf: .34, poster: .27, skin: .97, hair: .62, eye: .85, mouth: .9, shirt: .66, shirt2: .62, tie: .64, pants: .58, pants2: .55, shoe: .4, paper: .42 };
  const gray = v => { const c = Math.round(clamp(v) * 255); return `rgb(${c},${c},${c})`; };
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  drawScene(ctx, sc, s => { ctx.fillStyle = gray(HEAT[s.mat] ?? .3); ctx.fill(pathOf(s.pts)); });
  for (let i = 0; i < 4; i++) { const y = 1050 - ((t * 60 + i * 30) % 120), a = 1 - ((t * 60 + i * 30) % 120) / 120; ctx.fillStyle = `rgba(230,230,230,${a * .7})`; ctx.beginPath(); ctx.ellipse(720 + Math.sin(t * 3 + i) * 10, y, 16, 22, 0, 0, 7); ctx.fill(); }  // steam
  thermalFilter(t);
  // HUD
  const mono = '"JetBrains Mono", "DejaVu Sans Mono", monospace', A = sc.A, c = [A.HEAD[0], A.HEAD[1]];
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c[0], c[1], 34, 0, 7); [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => { ctx.moveTo(c[0] + dx * 22, c[1] + dy * 22); ctx.lineTo(c[0] + dx * 56, c[1] + dy * 56); }); ctx.stroke(); ctx.restore();
  text(ctx, SPEC.temp, Math.min(W - 100, c[0] + 66), c[1] - 52, { size: 44, weight: 500, family: mono, color: '#fff', align: 'left', maxW: 300 });
  const bx = 960, by = 520; for (let i = 0; i < 600; i++) { const [r, g, b] = ironbow(1 - i / 600); ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(bx, by + i, 30, 1); }
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, 30, 600);
  text(ctx, '40°', bx - 12, by + 14, { size: 40, weight: 500, family: mono, color: '#fff', align: 'right', maxW: 150 }); text(ctx, '15°', bx - 12, by + 600, { size: 40, weight: 500, family: mono, color: '#fff', align: 'right', maxW: 150 });
  const rec = Math.floor(t * 2) % 2 === 0;                                                     // 1 Hz blink, not a strobe
  ctx.fillStyle = rec ? '#ff3b30' : 'rgba(255,59,48,.3)'; ctx.beginPath(); ctx.arc(120, 300, 14, 0, 7); ctx.fill();
  text(ctx, 'REC', 148, 314, { size: 40, weight: 500, family: mono, color: '#fff', align: 'left' });
  const sec = Math.floor(t) + 12; text(ctx, `${SPEC.timestamp}:${String(sec).padStart(2, '0')}`, W - 100, 314, { size: 40, weight: 500, family: mono, color: '#fff', align: 'right', maxW: 520 });
};

// 6. Japanese TV anime
LOOKS.anime = (t) => {
  const sc = sceneShapes(t), A = sc.A, ink = '#2a2030';
  const AN = { ceil: '#ece0c8', wall: '#f3e6cf', floor: '#c8955c', base: '#a87444', frame: '#fffaf0', glass: '#8fd0f5', desk: '#9a6a44', mug: '#ffffff', pot: '#e07a4f', leaf: '#5fb36a', poster: '#fffaf0',
    skin: '#ffe0c8', hair: '#3b3f7a', eye: '#3a3f8f', mouth: '#c0504a', shirt: '#ffffff', shirt2: '#e8edf5', tie: '#e0404a', pants: '#3c4a6a', pants2: '#33405c', shoe: '#3a2a2a', paper: '#ffffff' };
  const shadowOf = c => shade(c, -.2);
  // zoom on his face right after the slip
  const z = tween(t, TS + .05, TS + .25, ease.out) * (1 - tween(t, TS + 1.05, TS + 1.35)), zs = 1 + z * 1.6;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zs, zs); ctx.translate(-lerp(W / 2, A.HEAD[0], z), -lerp(H / 2, A.HEAD[1] + 40, z));
  const cel = s => { const p = pathOf(s.pts), base = AN[s.mat] || '#999';
    if (s.window) { const g = ctx.createLinearGradient(0, 580, 0, 980); g.addColorStop(0, '#5fb4f0'); g.addColorStop(1, '#cfeeff'); ctx.fillStyle = g; ctx.fill(p);
      ctx.save(); ctx.clip(p); ctx.fillStyle = '#fff'; [[200, 680, 60], [250, 670, 46], [380, 760, 50], [420, 750, 36]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }); ctx.restore(); return; }
    ctx.fillStyle = base; ctx.fill(p);
    if (!['ceil', 'wall', 'floor', 'glass'].includes(s.mat)) { ctx.save(); ctx.clip(p); ctx.fillStyle = shadowOf(base); ctx.fill(p); ctx.translate(-9, -7); ctx.fillStyle = base; ctx.fill(p); ctx.restore(); }
    if (s.mat === 'floor') { ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(120,70,30,.35)'; ctx.lineWidth = 2; for (let x = -400; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x + 300, H); ctx.stroke(); } ctx.restore(); }
    if (s.mat === 'hair') { ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(A.HEAD[0] - 6, A.HEAD[1] - 40, 40, 18, -.2, PI * 1.1, PI * 1.6); ctx.stroke(); ctx.restore(); }
    if (s.eye) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.pts[0][0] - 9, s.pts[7][1] + 8, 4, 0, 7); ctx.fill(); }
    if (!['ceil', 'wall', 'floor', 'base'].includes(s.mat)) { ctx.strokeStyle = ink; ctx.lineWidth = 2.5 / zs + .5; ctx.stroke(p); } };
  drawScene(ctx, sc, cel);
  // light rays on the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,200,.12)'; [[140, 300], [300, 400]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a, 600); ctx.lineTo(a + 160, 600); ctx.lineTo(b + 560, FLOOR + 300); ctx.lineTo(b + 260, FLOOR + 300); ctx.fill(); }); ctx.restore();
  if (z > 0) { // sweat drop and the surprise
    const hx = A.HEAD[0] + 62, hy = A.HEAD[1] - 50; ctx.fillStyle = '#9fd8ff'; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy - 18); ctx.quadraticCurveTo(hx + 14, hy + 4, hx, hy + 10); ctx.quadraticCurveTo(hx - 14, hy + 4, hx, hy - 18); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  if (z > 0) {
    ctx.save(); ctx.globalAlpha = z; ctx.strokeStyle = 'rgba(40,30,50,.55)'; const r = rng(Math.floor(t * 15)); for (let i = 0; i < 46; i++) { const a = r() * 2 * PI, r0 = 520 + r() * 140; ctx.lineWidth = 2 + r() * 5; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * 1400, H / 2 + Math.sin(a) * 1400); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(780, 640); ctx.rotate(.12); ctx.scale(.6 + z * .4, .6 + z * .4); text(ctx, SPEC.exclaim, 0, 0, { size: 150, min: 90, weight: 800, family: '"Inter Tight", Inter, sans-serif', color: '#e8303a', alpha: z, maxW: 400 }); ctx.restore();
  }
};

// 7. ASCII terminal
LOOKS.ascii = (t) => {
  const sc = sceneShapes(t);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const B = { ...FLAT, ceil: '#000', wall: '#141414', floor: '#3a3a3a', base: '#2a2a2a', glass: '#050505', frame: '#7a7a7a', poster: '#555', desk: '#6a6a6a', paper: '#ffffff', skin: '#ffffff', hair: '#b0b0b0', shirt: '#e6e6e6', shirt2: '#c8c8c8', tie: '#9a9a9a', pants: '#a8a8a8', pants2: '#909090', shoe: '#808080', eye: '#000', mouth: '#000' };
  drawScene(ctx, sc, s => flatDraw(ctx, s, B));
  asciiFilter(t, { top: 300 });
  const mono = '"JetBrains Mono", "DejaVu Sans Mono", monospace', cmd = SPEC.command, n = Math.floor(clamp((t - .2) / 1.4) * cmd.length);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 300);
  const r = text(ctx, cmd.slice(0, n), 90, 280, { size: 40, weight: 500, family: mono, color: '#45ff7a', align: 'left', maxW: W - 180 });
  if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#45ff7a'; ctx.fillRect(90 + r.width + 6, 248, 22, 38); }
  if (t >= TS && t < TS + 2.2) { const a = tween(t, TS, TS + .2) * (1 - tween(t, TS + 1.9, TS + 2.2));
    text(ctx, SPEC.warn, 90, 1640, { size: 40, weight: 500, family: mono, color: '#ffcf4a', align: 'left', alpha: a, maxW: W - 180 }); }
  crtFilter(t);
};

// 8. watercolour
LOOKS.watercolor = (t) => {
  const sc = sceneShapes(t), seed = Math.floor(t * 30 / 6);                // washes change every 6 frames
  const WC = { ceil: '#eed8bc', wall: '#f1dcc0', floor: '#c99a6c', base: '#b07c52', frame: '#f8f1e4', glass: '#9cc6e0', desk: '#a8704a', mug: '#e8e0d4', pot: '#d5704f', leaf: '#7aa864', poster: '#f8f1e4',
    skin: '#f2bf98', hair: '#5a3a2a', eye: '#3a2a22', mouth: '#b8564a', shirt: '#7fb0d8', shirt2: '#6a9cc4', tie: '#cc5a50', pants: '#5d6b88', pants2: '#55617c', shoe: '#4a3a32', paper: '#fffdf6' };
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#f5ecd9'; ctx.fillRect(60, 260, W - 120, H - 520);
  ctx.save(); ctx.beginPath(); ctx.rect(60, 260, W - 120, H - 520); ctx.clip();
  let k = 0; const wash = s => { const r = seed * 97 + k++ * 13, pts = jitterPts(s.pts, r, 7), p = pathOf(pts), col = WC[s.mat] || '#999';
    ctx.save(); ctx.globalAlpha = .62; ctx.filter = 'blur(3px)'; ctx.fillStyle = col; ctx.fill(p); ctx.restore();
    ctx.save(); ctx.globalAlpha = .45; ctx.filter = 'blur(1.5px)'; ctx.strokeStyle = shade(col, -.3); ctx.lineWidth = 3; ctx.stroke(p); ctx.restore();
    ctx.save(); ctx.globalAlpha = .55; ctx.strokeStyle = '#4a4038'; ctx.lineWidth = 1.2; ctx.translate(4, -3); ctx.stroke(pathOf(jitterPts(s.pts, 5 + k, 2))); ctx.restore(); };
  drawScene(ctx, sc, wash);
  const gr = rng(77); for (let i = 0; i < 5000; i++) { ctx.fillStyle = gr() > .5 ? 'rgba(120,90,50,.06)' : 'rgba(255,255,255,.18)'; ctx.fillRect(60 + gr() * (W - 120), 260 + gr() * (H - 520), 2, 2); }
  ctx.restore();
};

// 9. claymation on twos
LOOKS.clay = (t) => {
  const step = Math.floor(t * 12), tq = step / 12, sc = sceneShapes(tq);
  const CL = { ceil: '#dcbc9c', wall: '#e8c8a8', floor: '#b88a64', base: '#9a6c48', frame: '#f4ead8', glass: '#a8d0e0', desk: '#9a6040', mug: '#f0e8dc', pot: '#d8704c', leaf: '#6eae5a', poster: '#f4ead8',
    skin: '#f4b890', hair: '#4a2e22', eye: '#111111', mouth: '#a83c34', shirt: '#e8a23c', shirt2: '#d08c2c', tie: '#3c7a8c', pants: '#46628c', pants2: '#3c5478', shoe: '#3a2a22', paper: '#fbf6ea' };
  // background shapes blurred like a macro lens
  const bg = tmpCanvas('clbg', W, H), g = bg.getContext('2d'); g.clearRect(0, 0, W, H);
  const lump = (gg, s, wob) => { const pts = jitterPts(s.pts, step * 13 + (s.pts.length * 7) + Math.round(s.pts[0][0]), wob), p = pathOf(pts), b = pts.reduce((m, q) => [Math.min(m[0], q[0]), Math.min(m[1], q[1]), Math.max(m[2], q[0]), Math.max(m[3], q[1])], [1e9, 1e9, -1e9, -1e9]);
    const col = CL[s.mat] || '#999', gr = gg.createRadialGradient(b[0] + (b[2] - b[0]) * .3, b[1] + (b[3] - b[1]) * .25, 2, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, Math.max(b[2] - b[0], b[3] - b[1]) * .75);
    gr.addColorStop(0, shade(col, .28)); gr.addColorStop(.6, col); gr.addColorStop(1, shade(col, -.25)); gg.fillStyle = gr; gg.fill(p);
    if (s.eye) { gg.fillStyle = '#fff'; gg.beginPath(); gg.arc(pts[0][0] - 3, pts[0][1] - 5, 3, 0, 7); gg.fill(); }
    else { gg.save(); gg.clip(p); const r = rng(Math.round(b[0] * 3 + b[1])); gg.strokeStyle = 'rgba(80,40,20,.10)'; gg.lineWidth = 1.5; for (let i = 0; i < 5; i++) { const cx = b[0] + r() * (b[2] - b[0]), cy = b[1] + r() * (b[3] - b[1]); for (let j = 1; j < 4; j++) { gg.beginPath(); gg.ellipse(cx, cy, j * 5, j * 3.5, r() * 3, 0, 5); gg.stroke(); } } gg.restore(); } };
  drawSet(sc.off, s => lump(g, s, 2));
  ctx.fillStyle = '#2a1e18'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.filter = 'blur(6px)'; ctx.drawImage(bg, 0, 0); ctx.restore();
  // soft contact shadow, then the clay figure
  ctx.save(); ctx.filter = 'blur(12px)'; ctx.fillStyle = 'rgba(40,20,10,.45)'; ctx.beginPath(); ctx.ellipse(sc.A.x + 20, FLOOR + 4, 120, 18, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(40,20,10,.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6; drawSet(sc.wk.shapes, s => lump(ctx, s, 2.5)); if (sc.sheet) lump(ctx, sc.sheet, 1.5); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H * .55, 300, W / 2, H * .55, 1100); v.addColorStop(0, 'rgba(255,220,170,.10)'); v.addColorStop(1, 'rgba(30,15,5,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
};

function renderAt(t) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  (LOOKS[LOOK] || LOOKS.paper)(t);
  if (SPEC.caption) { const a = tween(t, .2, .8); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 12; text(ctx, SPEC.caption, W / 2, LOOK === 'ascii' ? 200 : 300, { size: 56, min: 40, weight: 800, family: '"Inter Tight", Inter, sans-serif', color: '#ffffff', alpha: a }); ctx.restore(); }
}
window.renderAt = renderAt;
