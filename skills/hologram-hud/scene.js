// /hologram-hud: an original quadcopter wireframe in luminous cyan with orbiting HUD arcs, scan lines and callouts.
// Timeline (6 s): 0-1 a scan line reveals the outline, 1-3 slow turn, 3-4 rotor rings pulse, 4-5 callouts connect, 5-6 hold.
const C = Object.assign({ bg: '#02070b', glow: '#3ef0ff', dim: 'rgba(62,240,255,.35)', warm: '#ffb547', ink: '#d8fbff' }, SPEC.colors || {});
const CX = 540, CY = 1000, SC = 128;
function project(p, yaw, pitch) {
  const [x, y, z] = p, cy = Math.cos(yaw), sy = Math.sin(yaw), x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch), y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, k = 6 / (6 + z2 * .35);
  return [CX + x1 * SC * k, CY - y2 * SC * k];
}
const ring = (c, r, n = 32) => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos(i / n * Math.PI * 2) * r, c[1], c[2] + Math.sin(i / n * Math.PI * 2) * r]);
const ROT = [[1.8, .2, 1.8], [-1.8, .2, 1.8], [1.8, .2, -1.8], [-1.8, .2, -1.8]];
function model(pulse) {
  const L = [], box = (x0, y0, z0, x1, y1, z1) => { const v = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], u = v.map(p => [p[0], y1, p[2]]); L.push([...v, v[0]], [...u, u[0]]); v.forEach((p, i) => L.push([p, u[i]])); };
  box(-.6, -.25, -.7, .6, .25, .7); box(-.35, .25, -.4, .35, .4, .3);                  // body and top shell
  ROT.forEach(r => { L.push([[Math.sign(r[0]) * .45, .05, Math.sign(r[2]) * .55], [r[0], .1, r[2]]]); L.push([[Math.sign(r[0]) * .45, -.1, Math.sign(r[2]) * .55], [r[0], .02, r[2]]]);
    L.push(ring([r[0], .05, r[2]], .16, 12)); L.push([[r[0], .05, r[2]], [r[0], .22, r[2]]]); L.push(ring([r[0], .22, r[2]], .78 * (1 + .08 * pulse), 36)); });
  [-.45, .45].forEach(x => { L.push([[x, -.25, -.35], [x * 1.4, -.9, -.6]]); L.push([[x, -.25, .35], [x * 1.4, -.9, .6]]); L.push([[x * 1.4, -.9, -.85], [x * 1.4, -.9, .85]]); });
  L.push(ring([0, -.4, .78], .16, 16)); L.push([[0, -.25, .6], [0, -.4, .78]]);       // camera pod
  return L;
}
function line(pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }
function callout(lbl, p, to, k, side) {
  if (k <= 0) return; ctx.strokeStyle = C.glow; ctx.lineWidth = 2; const mid = [to[0] - side * 60, to[1]];
  partialLine(ctx, [p, mid, to], k); ctx.fillStyle = C.glow; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.glow; ctx.beginPath(); ctx.arc(p[0], p[1], 14 + 4 * Math.sin(k * 6), 0, Math.PI * 2); ctx.stroke();
  text(ctx, lbl, to[0] + side * 12, to[1] + 14, { size: 44, min: 40, weight: 600, family: '"JetBrains Mono", "DejaVu Sans Mono", monospace', color: C.ink, align: side > 0 ? 'left' : 'right', alpha: tween(k, .5, 1), maxW: 330, track: 2 });
}
function renderAt(t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(CX, CY, 40, CX, CY, 800); bg.addColorStop(0, 'rgba(62,240,255,.10)'); bg.addColorStop(1, 'rgba(62,240,255,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // faint dashed scan lines
  ctx.save(); ctx.strokeStyle = 'rgba(62,240,255,.06)'; ctx.lineWidth = 2; for (let y = 0; y < H; y += 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore();
  // header
  const hk = tween(t, 0, .8);
  text(ctx, SPEC.title, W / 2, 330, { size: 50, min: 40, weight: 500, family: '"JetBrains Mono", "DejaVu Sans Mono", monospace', color: C.ink, alpha: hk, track: 4 });
  ctx.save(); ctx.globalAlpha = hk; ctx.strokeStyle = C.dim; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(140, 370); ctx.lineTo(W - 140, 370); ctx.stroke(); ctx.restore();
  // orbiting HUD arcs
  ctx.save(); ctx.globalAlpha = tween(t, .3, 1.3); ctx.strokeStyle = C.dim; ctx.lineWidth = 3;
  [[360, .35, 1.4], [400, -.22, .9], [440, .15, 2.1]].forEach(([r, w, len], i) => { const a = t * w + i * 2; ctx.beginPath(); ctx.ellipse(CX, CY + 20, r, r * .42, 0, a, a + len); ctx.stroke();
    for (let k = 0; k < 24; k++) { const b = a + k / 24 * len; ctx.beginPath(); ctx.moveTo(CX + Math.cos(b) * r, CY + 20 + Math.sin(b) * r * .42); ctx.lineTo(CX + Math.cos(b) * (r + 10), CY + 20 + Math.sin(b) * (r + 10) * .42); ctx.stroke(); } });
  ctx.restore();
  // the drone: revealed by the scan line, slowly turning
  const yaw = .55 + tween(t, 1, 3) * .9 + Math.sin(t * .6) * .03, pitch = .42, pulse = Math.sin(clamp((t - 3)) * Math.PI) * (t > 3 && t < 4 ? 1 : 0);
  const scanY = lerp(560, 1420, tween(t, 0, 1, ease.linear));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, scanY); ctx.clip();
  ctx.strokeStyle = C.glow; ctx.shadowColor = C.glow; ctx.shadowBlur = 14; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
  model(pulse).forEach(seg => line(seg.map(p => project(p, yaw, pitch))));
  if (pulse > 0) { ctx.globalAlpha = pulse; ctx.lineWidth = 5; ROT.forEach(r => line(ring([r[0], .22, r[2]], .78 * (1 + .25 * pulse), 36).map(p => project(p, yaw, pitch)))); }
  ctx.restore();
  if (t < 1.1) { ctx.save(); ctx.globalAlpha = 1 - tween(t, 1, 1.1); ctx.fillStyle = C.glow; ctx.shadowColor = C.glow; ctx.shadowBlur = 30; ctx.fillRect(100, scanY - 2, W - 200, 4); ctx.restore(); }
  // gentle scan in the hold
  if (t > 4.6) { const y = 560 + ((t - 4.6) / 1.4) * 860; ctx.save(); const g = ctx.createLinearGradient(0, y - 60, 0, y); g.addColorStop(0, 'rgba(62,240,255,0)'); g.addColorStop(1, 'rgba(62,240,255,.12)'); ctx.fillStyle = g; ctx.fillRect(100, y - 60, W - 200, 60); ctx.restore(); }
  // callouts
  const [lm, lc, lf] = SPEC.callouts, motor = project([ROT[0][0], .22, ROT[0][2]], yaw, pitch), cam = project([0, -.4, .78], yaw, pitch), frame = project([-.6, .25, -.7], yaw, pitch);
  const sideOf = p => p[0] > CX ? 1 : -1;
  callout(lm, motor, [sideOf(motor) > 0 ? 760 : 320, 600], tween(t, 4, 4.6), sideOf(motor));
  callout(lc, cam, [sideOf(cam) > 0 ? 760 : 320, 1390], tween(t, 4.2, 4.8), sideOf(cam));
  callout(lf, frame, [sideOf(frame) > 0 ? 760 : 320, sideOf(frame) === sideOf(motor) ? 1390 : 600], tween(t, 4.4, 5), sideOf(frame));
  // optional telemetry, always marked SIMULATED
  if (SPEC.telemetry) {
    const tk = tween(t, 4.6, 5.2), mono = '"JetBrains Mono", "DejaVu Sans Mono", monospace';
    SPEC.telemetry.forEach((row, i) => text(ctx, row, 130, 1540 + i * 54, { size: 40, weight: 500, family: mono, color: C.ink, align: 'left', alpha: tk * .9, maxW: 560 }));
    text(ctx, 'SIMULATED', W - 130, 1540, { size: 40, weight: 600, family: mono, color: C.warm, align: 'right', alpha: tk, track: 3 });
  }
}
window.renderAt = renderAt;
