// /isometric: a small isometric diagram, power station on the left, cables on poles, a house on the right.
// Timeline (6 s): 0-1 ground and station, 1-2 poles and house, 2-4 pulses along the cable, 4-5.5 windows light and labels, 5.5-6 hold.
const C = Object.assign({ bg: '#f4ecdc', ground: '#e9dcc0', edge: '#cdbb95', blue: '#3f6fa8', yellow: '#f2b632', ink: '#2b2a33', wall: '#f7f1e3', roof: '#c8553d', leaf: '#6f9a5b' }, SPEC.colors || {});
const S = 46, OX = 540, OY = 770;
const P = (x, y, z = 0) => iso(x, y, z, OX, OY, S);
function box(x, y, z, dx, dy, dz, col, k = 1) {               // k grows the box from the ground
  dz *= k; if (dz <= 0.001) return;
  const top = [P(x, y, z + dz), P(x + dx, y, z + dz), P(x + dx, y + dy, z + dz), P(x, y + dy, z + dz)];
  poly(ctx, [P(x + dx, y, z), P(x + dx, y + dy, z), P(x + dx, y + dy, z + dz), P(x + dx, y, z + dz)], shade(col, -.18), C.ink, 2);
  poly(ctx, [P(x, y + dy, z), P(x + dx, y + dy, z), P(x + dx, y + dy, z + dz), P(x, y + dy, z + dz)], shade(col, -.32), C.ink, 2);
  poly(ctx, top, col, C.ink, 2);
}
function tree(x, y, k) {
  if (k <= 0) return; box(x - .12, y - .12, 0, .24, .24, .5, '#8a6a48', k);
  const [cx, cy] = P(x, y, .5 + .7 * k); ctx.fillStyle = C.leaf; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, cy, 30 * k, 36 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = shade(C.leaf, .25); ctx.beginPath(); ctx.ellipse(cx - 9 * k, cy - 12 * k, 10 * k, 12 * k, 0, 0, Math.PI * 2); ctx.fill();
}
function pole(x, y, k) {
  if (k <= 0) return; box(x - .08, y - .08, 0, .16, .16, 4, '#7a6a5a', k);
  if (k >= 1) { const a = P(x - .45, y + .45, 3.8), b = P(x + .45, y - .45, 3.8); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
}
// the cable: station roof -> pole tops -> house, sagging between supports
const POLES = [[4.3, 6.2], [5.7, 4.8], [7.1, 3.4]];
function cablePts() {
  const sup = [P(3.0, 7.6, 2.6), ...POLES.map(([x, y]) => P(x, y, 3.8)), P(8.4, 2.5, 2.4)];
  const pts = [];
  for (let i = 1; i < sup.length; i++) for (let j = 0; j <= 20; j++) { const u = j / 20; pts.push([lerp(sup[i - 1][0], sup[i][0], u), lerp(sup[i - 1][1], sup[i][1], u) + Math.sin(u * Math.PI) * 22]); }
  return pts;
}
function station(k) {
  box(0.8, 7.2, 0, 2.4, 2.2, 1.6, C.blue, k);                        // generator hall
  box(1.2, 7.6, 1.6 * k, 0.5, 0.5, 2.2, '#dcd3c2', k);              // chimney
  box(2.3, 7.5, 1.6 * k, 0.9, 0.9, 0.6, C.yellow, k);               // generator block
  box(3.4, 8.2, 0, 0.8, 0.8, 1.0, '#9aa6b5', k);                     // transformer
  if (k >= 1) { const [x, y] = P(2.75, 7.95, 2.2 + .06); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 10, y + 4); ctx.lineTo(x, y - 8); ctx.lineTo(x - 2, y + 2); ctx.lineTo(x + 10, y - 6); ctx.stroke(); }
}
function house(k, glow) {
  if (k <= 0) return; const dz = (1 - k) * 3;                         // drops in from above
  box(7.8, 1.4, dz, 2.2, 2.0, 1.5, C.wall, 1);
  const r = 1.5 + dz, a = P(7.8, 1.4, r), b = P(10, 1.4, r), c = P(10, 3.4, r), d = P(7.8, 3.4, r), ridgeA = P(8.9, 1.4, r + 1.1), ridgeB = P(8.9, 3.4, r + 1.1);
  poly(ctx, [d, c, ridgeB], shade(C.roof, -.25), C.ink, 2); poly(ctx, [b, c, ridgeB, ridgeA], C.roof, C.ink, 2); poly(ctx, [a, d, ridgeB, ridgeA], shade(C.roof, -.1), C.ink, 2);
  // windows on the right (+x) face and the left (+y) face
  const win = (pts) => { if (glow > 0) { ctx.save(); ctx.shadowColor = C.yellow; ctx.shadowBlur = 40 * glow; poly(ctx, pts, `rgba(242,182,50,${.25 + .75 * glow})`, null); ctx.restore(); } poly(ctx, pts, glow > 0 ? `rgba(255,214,110,${glow})` : '#59667a', C.ink, 2); };
  const wx = (y0, y1, z0, z1) => [P(10, y0, z0 + dz), P(10, y1, z0 + dz), P(10, y1, z1 + dz), P(10, y0, z1 + dz)];
  const wy = (x0, x1, z0, z1) => [P(x0, 3.4, z0 + dz), P(x1, 3.4, z0 + dz), P(x1, 3.4, z1 + dz), P(x0, 3.4, z1 + dz)];
  win(wx(1.8, 2.5, .6, 1.15)); win(wx(2.8, 3.1, 0, .9)); win(wy(8.2, 8.8, .6, 1.15)); win(wy(9.1, 9.7, .6, 1.15));
}
function label(str, x, y, k) { if (k <= 0) return; text(ctx, str, x, y + (1 - k) * 18, { size: 44, min: 40, weight: 600, color: C.ink, alpha: k, maxW: 420 }); }
function renderAt(t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // title
  const tt = tween(t, .2, 1);
  text(ctx, SPEC.title, W / 2, 500 - (1 - tt) * 20, { size: 72, min: 48, weight: 800, family: '"Inter Tight", Inter, sans-serif', color: C.ink, alpha: tt, track: 2 });
  ctx.fillStyle = C.yellow; ctx.globalAlpha = tt; ctx.fillRect(W / 2 - 60 * tt, 535, 120 * tt, 8); ctx.globalAlpha = 1;
  // the diagram, scaled up a little and centred
  const K = 1.08, T = p => [(p[0] - 540) * K + 540, (p[1] - 1013) * K + 1093];
  ctx.save(); ctx.translate(540, 1093); ctx.scale(K, K); ctx.translate(-540, -1013);
  // ground plate rises
  const g = tween(t, 0, .7, ease.out), th = .5 * g;
  if (g > 0) {
    ctx.save(); ctx.globalAlpha = g;
    poly(ctx, [P(0, 11, -th), P(11, 11, -th), P(11, 11, 0), P(0, 11, 0)], shade(C.ground, -.22), C.ink, 2);
    poly(ctx, [P(11, 0, -th), P(11, 11, -th), P(11, 11, 0), P(11, 0, 0)], shade(C.ground, -.12), C.ink, 2);
    poly(ctx, [P(0, 0), P(11, 0), P(11, 11), P(0, 11)], C.ground, C.ink, 2);
    ctx.strokeStyle = C.edge; ctx.lineWidth = 1.5; for (let i = 1; i < 11; i++) { let a = P(i, 0), b = P(i, 11); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); a = P(0, i); b = P(11, i); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    ctx.restore();
  }
  // back to front: trees behind, station, poles, cable, house, front trees
  tree(0.5, 5.6, tween(t, 1.3, 1.9, ease.back)); tree(6.4, 0.5, tween(t, 1.4, 2, ease.back)); tree(0.6, 0.6, tween(t, 1.5, 2.1, ease.back));
  house(tween(t, 1.2, 1.9, ease.out), tween(t, 4, 4.8));
  station(tween(t, .3, 1, ease.back));
  POLES.forEach(([x, y], i) => pole(x, y, tween(t, 1 + i * .15, 1.5 + i * .15, ease.back)));
  const pts = cablePts(), ck = tween(t, 1.5, 2.1);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; partialLine(ctx, pts, ck);
  ctx.strokeStyle = C.blue; ctx.lineWidth = 2; partialLine(ctx, pts, ck);
  // pulses: from 2 s, five yellow pulses travel the cable; they arrive by 4.3 s
  for (let i = 0; i < 5; i++) {
    const u = (t - 2 - i * .32) / 1.4; if (u < 0 || u > 1) continue;
    const [x, y] = pointAt(pts, ease.inOut(u)); ctx.save(); ctx.shadowColor = C.yellow; ctx.shadowBlur = 24; ctx.fillStyle = C.yellow;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  tree(6.6, 9.6, tween(t, 1.6, 2.2, ease.back)); tree(9.6, 8.4, tween(t, 1.7, 2.3, ease.back)); tree(10.2, 6, tween(t, 1.8, 2.4, ease.back));
  ctx.restore();
  // labels: horizontal, outside the cable path
  const [L0, L1, L2] = SPEC.labels;
  label(L0, 290, 1490, tween(t, 4.3, 4.9)); label(L2, 800, 1490, tween(t, 4.6, 5.2)); label(L1, 560, 740, tween(t, 4.9, 5.5));
  if (tween(t, 4.9, 5.5) > 0) { ctx.save(); ctx.globalAlpha = tween(t, 4.9, 5.5); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.beginPath(); const p = T(P(5.7, 4.8, 4.3)); ctx.moveTo(560, 760); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.restore(); }
}
window.renderAt = renderAt;
