// /coin-chart: bars made of stacked gold coins on a dark navy stage.
// Timeline (6 s): 0-1 axis and slots, 1-3.5 coins drop in (staggered), 3.5-4.5 values, 4.5-6 hold with a slow oblique drift.
const C = Object.assign({ bg: '#0c1630', bg2: '#16264d', gold: '#e8b443', goldD: '#9c6a17', goldL: '#ffe39a', ink: '#eef1f8', dim: '#8c97b5', accent: '#ffcf5a' }, SPEC.colors || {});
const items = SPEC.items, n = items.length, maxV = Math.max(...items.map(i => i[1]));
const BASE = 1440, TOP = 690, MAXC = SPEC.max_coins || 22;
const slot = (W - 2 * 90) / n, rx = Math.min(78, slot * .33), ry = rx * .3, thick = Math.min(26, (BASE - TOP - 2 * ry) / MAXC);
const counts = items.map(i => Math.max(1, Math.round(i[1] / maxV * MAXC)));
const fmt = v => (SPEC.prefix || '') + (SPEC.decimals != null ? Number(v).toFixed(SPEC.decimals) : Number(v).toLocaleString('en-US')) + (SPEC.suffix || '');
const T0 = SPEC.drop_start ?? 1, T1 = SPEC.drop_end ?? 3.5;
function coin(x, y, k) {                                   // y = top face centre; k fades a falling coin's glow
  ctx.fillStyle = C.goldD; ctx.beginPath(); ctx.ellipse(x, y + thick, rx, ry, 0, 0, Math.PI); ctx.lineTo(x - rx, y); ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(x - rx, 0, x + rx, 0); g.addColorStop(0, C.goldD); g.addColorStop(.35, C.gold); g.addColorStop(.6, C.goldL); g.addColorStop(1, C.goldD);
  ctx.fillStyle = g; ctx.fillRect(x - rx, y, rx * 2, thick * .82);
  ctx.strokeStyle = 'rgba(80,45,5,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y + thick * .82, rx, ry, 0, 0, Math.PI); ctx.stroke();
  const t2 = ctx.createRadialGradient(x - rx * .3, y - ry * .3, 2, x, y, rx); t2.addColorStop(0, C.goldL); t2.addColorStop(1, C.gold);
  ctx.fillStyle = t2; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.goldD; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, rx * .72, ry * .72, 0, 0, Math.PI * 2); ctx.stroke();
}
function renderAt(t) {
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, C.bg2); bg.addColorStop(1, C.bg); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const spot = ctx.createRadialGradient(W / 2, BASE, 50, W / 2, BASE, 700); spot.addColorStop(0, 'rgba(255,207,90,.12)'); spot.addColorStop(1, 'rgba(255,207,90,0)'); ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H);
  const a0 = tween(t, 0, .8);
  text(ctx, SPEC.title, W / 2, 400, { size: 64, min: 44, weight: 800, family: '"Inter Tight", Inter, sans-serif', color: C.ink, alpha: a0, track: 2 });
  if (SPEC.source) {
    text(ctx, SPEC.unit || '', W / 2, 470, { size: 40, weight: 500, color: C.dim, alpha: a0 });
    text(ctx, SPEC.source, W / 2, 1640, { size: 40, min: 40, weight: 500, color: C.dim, alpha: tween(t, 3.5, 4.5) });
  } else {                                                  // no verified source: say so, prominently
    ctx.save(); ctx.globalAlpha = a0; ctx.fillStyle = 'rgba(255,207,90,.14)'; ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(W / 2 - 400, 440, 800, 76, 38); ctx.fill(); ctx.stroke(); ctx.restore();
    text(ctx, SPEC.demo_label || 'ILLUSTRATIVE DEMO DATA', W / 2, 492, { size: 40, weight: 700, color: C.accent, alpha: a0, maxW: 760, track: 1 });
    if (SPEC.unit) text(ctx, SPEC.unit, W / 2, 1640, { size: 40, weight: 500, color: C.dim, alpha: a0 });
  }
  // axis line and slot plates
  ctx.save(); ctx.globalAlpha = a0; ctx.strokeStyle = C.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(110, BASE + thick + ry + 26); ctx.lineTo(110 + (W - 220) * tween(t, 0, .9), BASE + thick + ry + 26); ctx.stroke(); ctx.restore();
  const drift = tween(t, 4.5, 6, ease.inOut) * .05;      // a subtle oblique drift in the hold
  items.forEach(([name, v], i) => {
    const cx = 90 + slot * (i + .5), ap = tween(t, .2 + i * .1, .8 + i * .1);
    ctx.save(); ctx.globalAlpha = ap * .5; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx, BASE + thick, rx * 1.25, ry * 1.25, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    text(ctx, name, cx, BASE + thick + ry + 84, { size: 42, min: 40, weight: 800, family: '"Inter Tight", Inter, sans-serif', color: C.ink, alpha: ap, maxW: slot - 4 });
    const per = (T1 - T0) / (counts[i] + 8);
    let topY = null;
    for (let c = 0; c < counts[i]; c++) {
      const start = T0 + i * .18 + c * per * .85, u = tween(t, start, start + .35, ease.in);
      if (u <= 0) break;
      const y = BASE - c * thick, yy = lerp(TOP - 110, y, u), x = cx + (BASE - y) * drift;
      ctx.globalAlpha = Math.min(1, u * 3); coin(x, yy, u); ctx.globalAlpha = 1;
      if (u >= 1) topY = [x, y];
    }
    const vk = tween(t, 3.5 + i * .12, 4.1 + i * .12, ease.out);
    if (vk > 0) {
      const y0 = BASE - (counts[i] - 1) * thick, x = cx + (BASE - y0) * drift;
      text(ctx, fmt(v), x, y0 - ry - 26 - (1 - vk) * 18, { size: 44, min: 40, weight: 700, color: C.accent, alpha: vk, maxW: slot - 8 });
    }
  });
}
window.renderAt = renderAt;
