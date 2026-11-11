// /blueprint: an original robot arm drawn as pale cyan outlines on a blueprint grid, with construction circles,
// centre lines and dimensions. Timeline (6 s): 0-1 grid, 1-3 trace the parts, 3-4 elbow turns a little, 4-5 dimensions, 5-6 hold.
const C = Object.assign({ bg: '#0b2a5b', bg2: '#0e3470', minor: 'rgba(160,210,255,.10)', major: 'rgba(160,210,255,.22)', line: '#cfeeff', dim: '#8fd3ff', note: '#ffd27a' }, SPEC.colors || {});
const SH = [400, 1180], L1 = 300, L2 = 225;                     // shoulder pivot, upper arm and forearm length (px)
const rad = d => d * Math.PI / 180, dirv = a => [Math.cos(rad(a)), Math.sin(rad(a))];
const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
function capsule(a, b, r) {                                     // outline of a rounded bar from a to b
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), pts = [];
  for (let i = 0; i <= 12; i++) { const t = ang + Math.PI / 2 + i / 12 * Math.PI; pts.push([a[0] + Math.cos(t) * r, a[1] + Math.sin(t) * r]); }
  for (let i = 0; i <= 12; i++) { const t = ang - Math.PI / 2 + i / 12 * Math.PI; pts.push([b[0] + Math.cos(t) * r, b[1] + Math.sin(t) * r]); }
  pts.push(pts[0]); return pts;
}
const circle = (c, r, n = 48) => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos(i / n * Math.PI * 2) * r, c[1] + Math.sin(i / n * Math.PI * 2) * r]);
function geometry(t) {
  const a1 = -62, a2 = lerp(8, 20, tween(t, 3, 4)), EL = add(SH, dirv(a1), L1), WR = add(EL, dirv(a2), L2);
  const g = dirv(a2), nrm = [-g[1], g[0]];
  const f1 = [add(add(WR, nrm, -26), g, 8), add(add(WR, nrm, -30), g, 70), add(add(WR, nrm, -14), g, 86)];
  const f2 = [add(add(WR, nrm, 26), g, 8), add(add(WR, nrm, 30), g, 70), add(add(WR, nrm, 14), g, 86)];
  return { EL, WR, parts: [
    [[SH[0] - 150, 1420], [SH[0] + 150, 1420], [SH[0] + 150, 1380], [SH[0] - 150, 1380], [SH[0] - 150, 1420]],     // base plate
    [[SH[0] - 95, 1380], [SH[0] - 60, 1230], [SH[0] + 60, 1230], [SH[0] + 95, 1380]],                                 // pedestal
    circle(SH, 52), capsule(SH, EL, 34), circle(EL, 40), capsule(EL, WR, 26), circle(WR, 22),
    [add(WR, nrm, -34), add(WR, nrm, 34)], f1, f2,
  ] };
}
function arrowDim(a, b, off, label, k, dx = 0, dy = 0) {         // dimension line parallel to a-b, pushed out by off
  if (k <= 0) return; const v = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(...v), u = [v[0] / L, v[1] / L], n = [-u[1] * off, u[0] * off];
  const A = add(a, n), B = add(a, n), E = add(b, n);
  ctx.strokeStyle = C.dim; ctx.lineWidth = 2; ctx.setLineDash([]);
  partialLine(ctx, [a, add(a, n, 1.15)], k); partialLine(ctx, [b, add(b, n, 1.15)], k);
  const m = [lerp(A[0], E[0], .5), lerp(A[1], E[1], .5)], s = clamp(k * 1.4);
  partialLine(ctx, [m, [lerp(m[0], B[0], 1), lerp(m[1], B[1], 1)]].map((p, i) => i ? [lerp(m[0], A[0], s), lerp(m[1], A[1], s)] : p), 1);
  partialLine(ctx, [m, [lerp(m[0], E[0], s), lerp(m[1], E[1], s)]], 1);
  if (s >= 1) [[A, u], [E, [-u[0], -u[1]]]].forEach(([p, d]) => { const q = [-d[1], d[0]]; ctx.fillStyle = C.dim; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...add(add(p, d, 18), q, 7)); ctx.lineTo(...add(add(p, d, 18), q, -7)); ctx.fill(); });
  const tk = tween(k, .6, 1);
  if (tk > 0) { ctx.save(); ctx.fillStyle = C.bg; const tw = 170; ctx.globalAlpha = tk; ctx.fillRect(m[0] + dx - tw / 2, m[1] + dy - 34, tw, 46); ctx.restore();
    text(ctx, label, m[0] + dx, m[1] + dy, { size: 40, weight: 500, family: '"JetBrains Mono", "DejaVu Sans Mono", monospace', color: C.dim, alpha: tk, maxW: 260 }); }
}
function callout(lbl, from, to, k) {
  if (k <= 0) return; ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.setLineDash([]); partialLine(ctx, [from, to], k);
  ctx.fillStyle = C.line; ctx.beginPath(); ctx.arc(from[0], from[1], 6, 0, Math.PI * 2); ctx.fill();
  text(ctx, lbl, to[0], to[1] + (to[1] < from[1] ? -16 : 44), { size: 44, min: 40, weight: 600, family: '"JetBrains Mono", "DejaVu Sans Mono", monospace', color: C.line, alpha: tween(k, .5, 1), maxW: 360 });
}
const K = 1.3, TR = p => [(p[0] - 550) * K + 540, (p[1] - 1060) * K + 1060];
function renderAt(t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); vg.addColorStop(0, C.bg2); vg.addColorStop(1, C.bg); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const gk = tween(t, 0, 1); ctx.save(); ctx.globalAlpha = gk;
  for (let x = 0; x <= W; x += 30) { ctx.strokeStyle = x % 150 ? C.minor : C.major; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 30) { ctx.strokeStyle = y % 150 ? C.minor : C.major; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
  ctx.strokeStyle = C.major; ctx.lineWidth = 3; ctx.strokeRect(60, 150, W - 120, H - 300); ctx.restore();
  // title block
  text(ctx, SPEC.title, 90, 290, { size: 52, min: 40, weight: 500, family: '"JetBrains Mono", "DejaVu Sans Mono", monospace', color: C.line, align: 'left', alpha: gk, track: 2 });
  ctx.save(); ctx.globalAlpha = gk; ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(90, 320); ctx.lineTo(W - 90, 320); ctx.stroke(); ctx.restore();
  const { EL, WR, parts } = geometry(t);
  ctx.save(); ctx.translate(540, 1060); ctx.scale(K, K); ctx.translate(-550, -1060);
  // construction circles and centre lines (dashed)
  const ck = tween(t, .8, 1.6); ctx.save(); ctx.globalAlpha = .7; ctx.strokeStyle = C.dim; ctx.lineWidth = 1.5; ctx.setLineDash([14, 8, 3, 8]);
  partialLine(ctx, circle(SH, 120, 96), ck); partialLine(ctx, circle(EL, 86, 96), tween(t, 1.6, 2.4)); partialLine(ctx, circle(WR, 60, 96), tween(t, 2.2, 3));
  partialLine(ctx, [add(SH, [-1, 0], 200), add(SH, [1, 0], 200)], ck); partialLine(ctx, [add(SH, [0, 1], 260), add(SH, [0, -1], 140)], ck);
  partialLine(ctx, [SH, EL], tween(t, 1.6, 2.2)); partialLine(ctx, [EL, WR], tween(t, 2.2, 2.8)); ctx.restore();
  // the arm traced part by part
  ctx.setLineDash([]); ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.save(); ctx.shadowColor = C.line; ctx.shadowBlur = 8;
  parts.forEach((p, i) => partialLine(ctx, p, tween(t, 1 + i * .18, 1.5 + i * .18, ease.linear)));
  ctx.restore();
  [SH, EL, WR].forEach((c, i) => { if (t > 1.4 + i * .5) { ctx.fillStyle = C.line; ctx.beginPath(); ctx.arc(c[0], c[1], 7, 0, Math.PI * 2); ctx.fill(); } });
  // rotation arc while the elbow turns
  if (t > 3 && t < 4.6) { ctx.save(); ctx.globalAlpha = 1 - tween(t, 4, 4.6); ctx.strokeStyle = C.note; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(EL[0], EL[1], 120, rad(4), rad(lerp(8, 20, tween(t, 3, 4)) + 2)); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  // dimensions
  const [d1, d2, d3] = SPEC.dims;
  arrowDim(TR(SH), TR(EL), 110, d1, tween(t, 4, 4.6), 60, 10);
  arrowDim(TR(EL), TR(WR), -100, d2, tween(t, 4.2, 4.8), 0, -10);
  arrowDim(TR([SH[0] + 150, 1420]), TR([SH[0] + 150, SH[1]]), -80, d3, tween(t, 4.4, 5), 90, 20);
  // callouts
  const [lb, ls, le, lg] = SPEC.labels;
  callout(lb, TR([SH[0] - 120, 1400]), [210, 1560], tween(t, 2.4, 3));
  callout(ls, TR([SH[0] - 45, SH[1] - 25]), [215, 1060], tween(t, 2.5, 3.1));
  callout(le, TR(add(EL, [-30, -25])), [330, 690], tween(t, 2.6, 3.2));
  callout(lg, TR(add(WR, dirv(20), 80)), [820, 1210], tween(t, 2.7, 3.3));
  // note
  const nk = tween(t, 4.6, 5.2);
  text(ctx, SPEC.note, W / 2, 1690, { size: 40, min: 40, weight: 500, family: '"JetBrains Mono", "DejaVu Sans Mono", monospace', color: C.note, alpha: nk, maxW: W - 200 });
}
window.renderAt = renderAt;
