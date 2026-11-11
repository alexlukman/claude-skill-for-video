// /neon-flight: a forward flight through a neon wireframe canyon toward a ringed planet. Constant speed and a
// periodic world, so the 6 s clip loops. Timeline: 0-1 title in, 1-5 flight, 5-6 title fades (flight keeps going).
const C = Object.assign({ sky0: '#07021a', sky1: '#2a0b52', sky2: '#7a1d7e', grid: '#2ee6ff', left: '#ff3df2', right: '#2ee6ff', fill: '#0d0420', planet: '#ffb35c', ring: '#ff7ad9', title: '#f4f0ff' }, SPEC.colors || {});
const HZ = 960, CX = W / 2, F = 900, CAM = 3.2;           // horizon y, centre x, focal length, camera height
const DUR = SPEC.duration || 6, GAP = 6, NR = 14;          // ridge spacing (world units), ridges on screen
const SPEED = GAP * (SPEC.loops || 4) / DUR;               // whole number of ridge gaps per clip -> seamless loop
const proj = (x, y, z) => [CX + x * F / z, HZ + (CAM - y) * F / z];
const n1 = (i, s) => hash(i * 1.7 + s * 13.1, s * 3.3);
function ridge(z, idx, side) {                              // one canyon wall slice: a jagged silhouette rising away from the path
  const pts = [], inner = 3.4 + n1(idx, side + 4) * 1.2;
  for (let j = 0; j <= 12; j++) {
    const x = side * (inner + j * j * .45), h = j === 0 ? 0 : (2.2 + j * 1.1) * (.55 + n1(idx * 13 + j, side + 9) * .8);
    pts.push(proj(x, h, z));
  }
  const last = pts[pts.length - 1]; pts.push([last[0], proj(0, 0, z)[1]]); pts.push(proj(side * inner, 0, z));
  return pts;
}
function renderAt(t) {
  const d = SPEED * (t % DUR);
  // sky and stars
  const sky = ctx.createLinearGradient(0, 0, 0, HZ); sky.addColorStop(0, C.sky0); sky.addColorStop(.7, C.sky1); sky.addColorStop(1, C.sky2);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HZ + 2);
  const r = rng(7); for (let i = 0; i < 140; i++) { const x = r() * W, y = r() * (HZ - 120), s = r(); ctx.fillStyle = `rgba(255,255,255,${.25 + s * .6})`; ctx.fillRect(x, y, 1 + s * 2.4, 1 + s * 2.4); }
  // the planet stays distant
  const px = CX + 150, py = 660, pr = 120;
  ctx.save(); ctx.strokeStyle = C.ring; ctx.lineWidth = 6; ctx.globalAlpha = .9;
  ctx.beginPath(); ctx.ellipse(px, py, pr * 2.1, pr * .42, -.22, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();
  const pg = ctx.createLinearGradient(px, py - pr, px, py + pr); pg.addColorStop(0, C.planet); pg.addColorStop(1, '#a2266e');
  ctx.save(); ctx.shadowColor = C.ring; ctx.shadowBlur = 60; ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.clip(); ctx.strokeStyle = 'rgba(80,10,60,.35)'; ctx.lineWidth = 9;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(px - pr, py + i * 30); ctx.lineTo(px + pr, py + i * 30 - 12); ctx.stroke(); } ctx.restore();
  ctx.save(); ctx.strokeStyle = C.ring; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(px, py, pr * 2.1, pr * .42, -.22, 0, Math.PI); ctx.stroke(); ctx.restore();
  // the ground: dark, with a grid that rushes toward the camera
  const gg = ctx.createLinearGradient(0, HZ, 0, H); gg.addColorStop(0, '#1a0638'); gg.addColorStop(1, C.fill); ctx.fillStyle = gg; ctx.fillRect(0, HZ, W, H - HZ);
  ctx.save(); ctx.strokeStyle = C.grid; ctx.shadowColor = C.grid; ctx.shadowBlur = 12;
  for (let k = 0; k < 40; k++) { const z = 1.2 + k * 1.5 - (d % 1.5); if (z < 1) continue; const y = proj(0, 0, z)[1]; ctx.globalAlpha = clamp(1.4 - z / 40); ctx.lineWidth = Math.max(1, 5 / z * 2); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.globalAlpha = .8; ctx.lineWidth = 2;
  for (let x = -60; x <= 60; x += 1.5) { const a = proj(x, 0, 60), b = proj(x, 0, .6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  ctx.restore();
  // horizon glow
  const hg = ctx.createLinearGradient(0, HZ - 40, 0, HZ + 40); hg.addColorStop(0, 'rgba(255,61,242,0)'); hg.addColorStop(.5, 'rgba(255,61,242,.45)'); hg.addColorStop(1, 'rgba(255,61,242,0)');
  ctx.fillStyle = hg; ctx.fillRect(0, HZ - 40, W, 80);
  // canyon ridges, far to near, both sides; their world index keeps them identical across the loop
  const first = Math.floor(d / GAP);
  for (let k = NR; k >= 0; k--) {
    const idx = first + k, z = idx * GAP - d + 1.5; if (z < .9) continue;
    const fade = clamp(1.3 - z / (NR * GAP));
    [-1, 1].forEach(side => {
      const pts = ridge(z, ((idx % 64) + 64) % 64, side), col = side < 0 ? C.left : C.right;
      poly(ctx, pts, C.fill, null);
      ctx.save(); ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.lineWidth = Math.max(1.5, 7 / z * 3);
      ctx.beginPath(); pts.slice(0, 13).forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
      ctx.globalAlpha = fade * .45; ctx.lineWidth *= .6; const base = pts[pts.length - 2][1]; ctx.beginPath(); pts.slice(1, 13).forEach(p => { ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], base); }); ctx.stroke(); ctx.restore();
    });
  }
  // title: small, near the top, clear of the flight path
  const ta = tween(t, .1, 1) * (1 - tween(t, 5, 6));
  if (ta > 0) {
    ctx.save(); ctx.shadowColor = C.left; ctx.shadowBlur = 24;
    text(ctx, SPEC.title, W / 2, 320 + (1 - tween(t, .1, 1)) * 16, { size: 54, min: 40, weight: 800, family: '"Inter Tight", Inter, sans-serif', color: C.title, alpha: ta, track: 10 });
    ctx.restore();
  }
}
window.renderAt = renderAt;
