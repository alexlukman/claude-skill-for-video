// /chalkboard: a chalk neural-network teaching diagram (Input, Hidden, Output) that shows a simplified training loop.
// Timeline (6 s): 0-1 title and input nodes, 1-2 hidden and output nodes, 2-3 forward signal, 3-4 prediction vs target,
// 4-5 error flows backwards, 5-6 weights shift and the summary holds.
const C = Object.assign({ board: '#1f3a2c', board2: '#284a38', chalk: '#eef2e6', yellow: '#ffd75e', pink: '#ff8fa8', frame: '#6b4a2b' }, SPEC.colors || {});
const HAND = '"Poppins", "Comic Sans MS", "DejaVu Sans", sans-serif';
const LAYERS = SPEC.layers, COLX = [240, 540, 840], Y0 = 1040;
const nodes = LAYERS.map((L, i) => Array.from({ length: L.n }, (_, j) => [COLX[i], Y0 + (j - (L.n - 1) / 2) * 150]));
const edges = []; for (let i = 0; i < 2; i++) nodes[i].forEach((a, ai) => nodes[i + 1].forEach((b, bi) => edges.push({ i, a, b, w: .4 + hash(ai + 3, bi + i * 7) * .6, s: ai * 17 + bi * 5 + i * 31 })));
function chalk(pts, k, seed, col = C.chalk, w = 4, alpha = .9) {      // a chalk stroke: a few rough passes with gaps
  if (k <= 0) return; const r = rng(seed);
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let p = 0; p < 3; p++) {
    ctx.globalAlpha = alpha * (p ? .35 : .85); ctx.lineWidth = w * (p ? .55 : 1); ctx.setLineDash([22 + r() * 30, 2 + r() * 5]);
    const j = pts.map(q => [q[0] + (r() - .5) * 2.2, q[1] + (r() - .5) * 2.2]); partialLine(ctx, j, k);
  }
  ctx.restore();
}
const circ = (c, r, n = 28) => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos(i / n * 6.3 - 1.4) * r, c[1] + Math.sin(i / n * 6.3 - 1.4) * r]);
function chalkText(str, x, y, o) { const r = text(ctx, str, x, y, { family: HAND, weight: 400, color: C.chalk, ...o }); return r; }
function renderAt(t) {
  // board with dust
  ctx.fillStyle = C.frame; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100); g.addColorStop(0, C.board2); g.addColorStop(1, C.board);
  ctx.fillStyle = g; ctx.fillRect(36, 36, W - 72, H - 72);
  const d = rng(3); ctx.fillStyle = 'rgba(255,255,255,.035)'; for (let i = 0; i < 1600; i++) ctx.fillRect(36 + d() * (W - 72), 36 + d() * (H - 72), 2 + d() * 3, 1 + d() * 2);
  ctx.fillStyle = 'rgba(255,255,255,.022)'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(150 + d() * 800, 300 + d() * 1300, 160 + d() * 200, 30 + d() * 40, d() - .5, 0, 7); ctx.fill(); }   // old smudges
  // title
  const tk = tween(t, 0, .7); chalkText(SPEC.title, W / 2, 330, { size: 76, min: 48, alpha: tk, track: 4 });
  chalk([[W / 2 - 300, 360], [W / 2 + 300, 356]], tween(t, .4, .9), 2, C.yellow, 5);
  // steps row: Predict -> Compare -> Adjust, the current one in yellow
  const steps = SPEC.steps, act = t < 2 ? -1 : t < 3 ? 0 : t < 4.2 ? 1 : 2;
  steps.forEach((s, i) => { const a = tween(t, 2 + i * 1.1, 2.4 + i * 1.1); chalkText(s, 230 + i * 310, 500, { size: 46, min: 40, alpha: Math.max(a, t > 5 ? 1 : 0), color: i === act || (t > 5 && i === 2) ? C.yellow : C.chalk, maxW: 250 });
    if (i < 2) chalkText('→', 385 + i * 310, 500, { size: 46, alpha: tween(t, 2.6 + i * 1.1, 3 + i * 1.1) }); });
  // edges (weights shift a little at the end)
  const shift = tween(t, 5, 5.8);
  edges.forEach(e => { const k = tween(t, 1.4 + e.i * .3, 2 + e.i * .3); chalk([e.a, e.b], k, e.s, C.chalk, 1.5 + (e.w + shift * (hash(e.s) - .5) * .8) * 3, .55); });
  // forward signal (yellow) and error flowing back (pink)
  edges.forEach(e => {
    const f = tween(t, 2 + e.i * .45, 2.5 + e.i * .45, ease.linear); if (f > 0 && f < 1 || (t > 2.5 + e.i * .45 && t < 3.2)) chalk([e.a, e.b], f >= 1 ? 1 : f, e.s + 1, C.yellow, 4, f >= 1 ? 1 - tween(t, 3, 3.2) : .95);
    const b = tween(t, 4 + (1 - e.i) * .45, 4.5 + (1 - e.i) * .45, ease.linear); if (b > 0 && t < 5.3) chalk([e.b, e.a], b, e.s + 2, C.pink, 4, .95 * (1 - tween(t, 5, 5.3)));
  });
  // nodes
  nodes.forEach((col, i) => col.forEach((c, j) => { const a = i === 0 ? .3 : 1; const k = tween(t, a + j * .12 + (i === 2 ? .3 : 0), a + .4 + j * .12 + (i === 2 ? .3 : 0));
    ctx.save(); ctx.fillStyle = C.board; ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(c[0], c[1], 40, 0, 7); ctx.fill(); ctx.restore();
    const hot = (t > 2 + i * .45 && t < 3.2) ? C.yellow : (t > 4 + (2 - i) * .45 && t < 5.3 && i > 0) ? C.pink : C.chalk;
    chalk(circ(c, 40), k, i * 10 + j, hot, 5); }));
  // layer labels
  LAYERS.forEach((L, i) => chalkText(L.label, COLX[i], 1480, { size: 46, min: 40, alpha: tween(t, .4 + i * .5, .9 + i * .5), maxW: 280 }));
  // prediction and target, then the error
  const pk = tween(t, 3, 3.5), qk = tween(t, 3.4, 3.9), ek = tween(t, 3.8, 4.3);
  chalkText(SPEC.prediction, 300, 1630, { size: 44, min: 40, alpha: pk, maxW: 420 });
  chalkText(SPEC.target, 780, 1630, { size: 44, min: 40, alpha: qk, color: C.yellow, maxW: 420 });
  if (ek > 0) { chalk(circ([W / 2, 1617], 34, 20), ek, 77, C.pink, 4); chalkText('≠', W / 2, 1632, { size: 46, alpha: ek, color: C.pink }); }
  // footnote
  chalkText(SPEC.footnote, W / 2, 1720, { size: 40, min: 40, alpha: tween(t, 5, 5.6) * .8, maxW: W - 200 });
}
window.renderAt = renderAt;
