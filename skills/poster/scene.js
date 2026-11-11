// /poster: an illustrated landscape poster in two looks.
//  look "travel":     paper, layered mountains slide up with parallax (1-3), a trail draws to the summit (3-4), sun and title (4-5), hold.
//  look "watercolour": paper fades in (0-1), mountains and sky in washes (1-2.5), the river reveals along its curve (2.5-4), trees and banks bloom (4-5), slow push-in.
const LOOK = SPEC.look === 'watercolour' ? 'watercolour' : 'travel';
const PAL = LOOK === 'travel'
  ? { paper: '#f2e8d2', ink: '#1f4b4f', sky: '#f4d9a6', sun: '#e59b3a', m: ['#c9b48a', '#9fb3a1', '#5f8f8a', '#2f6b6b', '#1f4b4f'], lake: '#7fb0ae', trail: '#f2e8d2', pine: '#183c3f' }
  : { paper: '#f6f0e3', ink: '#3a4a5a', sky: '#bcd3e6', sun: '#f3c98b', m: ['#c7cfe0', '#a9b7d1', '#8fa3bf', '#7d9a8a', '#6f8f5f'], lake: '#6fa3c9', trail: '#6fa3c9', pine: '#3f6b46' };
const C = Object.assign(PAL, SPEC.colors || {});
const SERIF = 'Georgia, "DejaVu Serif", "Times New Roman", serif';
const FRAME = { x: 110, y: 470, w: W - 220, h: 1080 };              // the illustration panel
function ridge(seed, base, amp, peakX = null) {                       // a mountain line across the panel
  const r = rng(seed), f = [r() * 3, r() * 3, r() * 3], pts = [];
  for (let i = 0; i <= 60; i++) { const u = i / 60, x = FRAME.x + u * FRAME.w;
    let y = base - amp * (.45 * Math.sin(u * 3.1 + f[0]) + .3 * Math.sin(u * 7.3 + f[1]) + .15 * Math.sin(u * 15 + f[2]));
    if (peakX != null) y -= amp * 1.6 * Math.max(0, 1 - Math.abs(u - peakX) / .22);
    pts.push([x, y]); }
  return pts;
}
function fillRidge(pts, col, dy, alpha = 1, wash = false) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(0, dy);
  const draw = () => { ctx.beginPath(); ctx.moveTo(FRAME.x, FRAME.y + FRAME.h + 400); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(FRAME.x + FRAME.w, FRAME.y + FRAME.h + 400); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  if (wash) { ctx.filter = 'blur(5px)'; ctx.globalAlpha = alpha * .55; draw(); ctx.translate(3, 4); ctx.globalAlpha = alpha * .45; draw(); ctx.filter = 'blur(1px)'; ctx.globalAlpha = alpha * .3; ctx.translate(-5, -2); draw(); }
  else draw();
  ctx.restore();
}
function pine(x, y, h, k, col) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = col; const s = h * (.6 + .4 * k);
  for (let i = 0; i < 3; i++) { const yy = y - s * (.3 + i * .28), w = s * (.32 - i * .07); ctx.beginPath(); ctx.moveTo(x, yy - s * .38); ctx.lineTo(x + w, yy); ctx.lineTo(x - w, yy); ctx.closePath(); ctx.fill(); }
  ctx.fillRect(x - s * .04, y - s * .3, s * .08, s * .3); ctx.restore(); }
function paperNoise(a) { const r = rng(11); ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 9000; i++) { const v = r(); ctx.fillStyle = v > .5 ? 'rgba(90,70,40,.07)' : 'rgba(255,255,255,.12)'; ctx.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); } ctx.restore(); }
const RIVER = bez([FRAME.x + FRAME.w * .52, FRAME.y + 640], [FRAME.x + FRAME.w * .25, FRAME.y + 760], [FRAME.x + FRAME.w * .9, FRAME.y + 860], [FRAME.x + FRAME.w * .4, FRAME.y + FRAME.h + 20], 60);
function renderAt(t) {
  const travel = LOOK === 'travel';
  ctx.fillStyle = travel ? C.paper : '#000'; ctx.fillRect(0, 0, W, H);
  if (!travel) { ctx.save(); ctx.globalAlpha = tween(t, 0, 1); ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  paperNoise(travel ? tween(t, 0, 1) : tween(t, 0, 1) * 1.3);
  // the panel (push-in for watercolour)
  const zoom = travel ? 1 : 1 + tween(t, 4.5, 6, ease.linear) * .035;
  ctx.save(); ctx.beginPath(); ctx.roundRect(FRAME.x, FRAME.y, FRAME.w, FRAME.h, travel ? 0 : 20); ctx.clip();
  ctx.translate(W / 2, FRAME.y + FRAME.h / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -(FRAME.y + FRAME.h / 2));
  const sk = travel ? tween(t, .6, 1.2) : tween(t, 1, 1.8);
  const sg = ctx.createLinearGradient(0, FRAME.y, 0, FRAME.y + 700); sg.addColorStop(0, C.sky); sg.addColorStop(1, C.paper);
  ctx.save(); ctx.globalAlpha = sk; ctx.fillStyle = sg; ctx.fillRect(FRAME.x, FRAME.y, FRAME.w, FRAME.h); ctx.restore();
  // sun
  const sun = travel ? tween(t, 4, 4.8, ease.out) : tween(t, 1.2, 2.2);
  if (sun > 0) { ctx.save(); ctx.globalAlpha = sun; ctx.fillStyle = C.sun; if (!travel) ctx.filter = 'blur(4px)';
    ctx.beginPath(); ctx.arc(FRAME.x + FRAME.w * .7, FRAME.y + (travel ? 260 : 330) + (1 - sun) * 60, 92, 0, 7); ctx.fill(); ctx.restore(); }
  // mountain layers, back to front
  const peaks = [null, .55, null, null, null];
  C.m.forEach((col, i) => {
    const base = FRAME.y + 420 + i * 130, amp = 120 - i * 15, pts = ridge(20 + i, base, amp, peaks[i]);
    const k = travel ? tween(t, 1 + i * .25, 2 + i * .25, ease.out) : tween(t, 1 + i * .25, 2.2 + i * .2);
    if (k <= 0) return;
    if (travel) fillRidge(pts, col, (1 - k) * (220 + i * 90), 1);
    else fillRidge(pts, col, (1 - k) * 30, k, true);
    if (i === 1) {                                                      // the trail (travel) climbs this layer to the summit
      const summit = pts[Math.round(.55 * 60)];
      window._summit = [summit[0], summit[1] + (1 - k) * 310];
    }
  });
  if (travel && window._summit) { const tk = tween(t, 3, 4, ease.linear); ctx.save(); ctx.strokeStyle = C.trail; ctx.lineWidth = 7; ctx.setLineDash([16, 12]); ctx.lineCap = 'round';
    partialLine(ctx, bez([FRAME.x + 150, FRAME.y + FRAME.h - 30], [FRAME.x + 620, FRAME.y + 940], [FRAME.x + 200, FRAME.y + 660], window._summit, 60), tk); ctx.restore(); }
  // lake (travel) or river (watercolour)
  if (travel) { const lk = tween(t, 2.2, 3); ctx.save(); ctx.globalAlpha = lk; ctx.fillStyle = C.lake; ctx.beginPath(); ctx.ellipse(FRAME.x + FRAME.w * .62, FRAME.y + 900, 210 * lk, 46, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(FRAME.x + FRAME.w * .55 + i * 50, FRAME.y + 890 + i * 12); ctx.lineTo(FRAME.x + FRAME.w * .55 + i * 50 + 60, FRAME.y + 890 + i * 12); ctx.stroke(); } ctx.restore(); }
  else { const rk = tween(t, 2.5, 4, ease.inOut); if (rk > 0) { ctx.save(); ctx.lineCap = 'round'; ctx.filter = 'blur(2px)'; const n = Math.floor((RIVER.length - 1) * rk);
    [[1, .45, C.lake], [.55, .35, shade(C.lake, .35)]].forEach(([wk, a, col]) => { ctx.strokeStyle = col; ctx.globalAlpha = a;
      for (let i = 1; i <= n; i++) { const u = i / (RIVER.length - 1); ctx.lineWidth = wk * (10 + 120 * u * u); ctx.beginPath(); ctx.moveTo(...RIVER[i - 1]); ctx.lineTo(...RIVER[i]); ctx.stroke(); } }); ctx.restore(); } }
  // pines / trees and banks
  const r = rng(5);
  for (let i = 0; i < 16; i++) { const x = FRAME.x + 30 + r() * (FRAME.w - 60), y = FRAME.y + 820 + r() * 240, h = 70 + r() * 90;
    if (!travel && Math.abs(x - pointAt(RIVER, clamp((y - FRAME.y - 640) / 460))[0]) < 70) continue;
    const k = travel ? tween(t, 1.8 + i * .05, 2.4 + i * .05, ease.back) : tween(t, 4 + i * .05, 4.6 + i * .05);
    if (!travel && k > 0) { ctx.save(); ctx.filter = 'blur(2px)'; pine(x, y, h, k * .85, C.pine); ctx.restore(); } else pine(x, y, h, k, C.pine); }
  ctx.restore();
  if (travel) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.globalAlpha = tween(t, .3, 1); ctx.strokeRect(FRAME.x, FRAME.y, FRAME.w, FRAME.h); ctx.restore(); }
  // title and footer
  const tk = travel ? tween(t, 4, 5) : tween(t, 1.5, 2.5);
  text(ctx, SPEC.title, W / 2, (travel ? 400 : FRAME.y + 170) - (1 - tk) * 20, { size: travel ? 84 : 62, min: 44, weight: 400, family: SERIF, color: C.ink, alpha: tk, track: travel ? 8 : 3, maxW: travel ? W - 180 : FRAME.w - 100 });
  if (SPEC.footer) text(ctx, SPEC.footer, W / 2, 1650, { size: 40, min: 40, weight: 500, color: C.ink, alpha: travel ? tween(t, 4.4, 5.2) : tween(t, 4.5, 5.5), track: 6 });
}
window.renderAt = renderAt;
