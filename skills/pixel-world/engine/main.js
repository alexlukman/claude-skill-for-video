// ------------------------------------------------------------------------------------------------
// MAIN: turns the spec into frames. renderAt(t) draws one frame and depends only on t, so any frame can be rendered alone.
// The picture is drawn on a small pixel grid (1080/S x 1920/S) and then scaled up S times with no smoothing: that is the chunky look.
// ------------------------------------------------------------------------------------------------
const W = 1080, H = 1920, FPS = 30;
const SPEC = window.SPEC;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeInOut = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const OUTLINE = '#1c1830';
const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
const out = canvas.getContext('2d'); out.imageSmoothingEnabled = false;

const world = { sky: 'day', ground: .68, props: [], ...(SPEC.world || {}) };
const cast = {}; Object.entries(SPEC.cast || {}).forEach(([id, def]) => { cast[id] = resolveCharacter(def); });

// ---------- timeline ----------
let T = 0; const prevActor = {};
const scenes = SPEC.scenes.map((s, si) => {
  const sc = { transition: null, scale: 8, ...s, start: T }; T += sc.dur; sc.end = T;
  sc.list = Object.entries(sc.actors || {}).map(([id, a]) => {
    const p = prevActor[id] || {};
    const x0 = a.x ?? p.x ?? 60, x1 = a.to ?? x0;
    const face = a.face ?? (x1 !== x0 ? Math.sign(x1 - x0) : (p.face ?? 1));
    prevActor[id] = { x: x1, face };
    return { id, a, x0, x1, face, idx: Object.keys(cast).indexOf(id) };
  });
  sc.says = (Array.isArray(sc.say) ? sc.say : Object.entries(sc.say || {}).map(([who, text]) => ({ who, text }))).map(s => ({ at: .25, cps: 20, ...s }));
  return sc;
});
const TOTAL = T + (SPEC.hold ?? .5);
window.TOTAL = TOTAL; window.FPS = FPS;

// ---------- layers ----------
const layers = {};
const layer = S => (layers[S] ||= (() => { const c = document.createElement('canvas'); c.width = W / S; c.height = H / S; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return { c, g }; })());
const spr = document.createElement('canvas'); spr.width = spr.height = 48; const sg = spr.getContext('2d');
const sil = document.createElement('canvas'); sil.width = sil.height = 48; const ng = sil.getContext('2d');

function actorPose(sc, A, lt) {
  const a = A.a, [m0, m1] = a.move || [0, sc.dur];
  const k = clamp((lt - m0) / Math.max(.001, m1 - m0)), e = a.ease === 'linear' ? k : easeInOut(k);
  let x = A.x0 + (A.x1 - A.x0) * e, y = 0;
  const moving = A.x1 !== A.x0 && lt > m0 && lt < m1;
  const act = a.do || (moving ? 'walk' : 'idle');
  const p = { legs: 0, bob: 0, armL: 0, armR: 0, raiseL: false, raiseR: false, waveStep: 0, mouth: 0, blink: false, dizzy: false, jump: false, flash: false };
  if (moving) { const step = Math.floor(lt * (act === 'run' ? 12 : 8)) % 4; p.legs = step; p.bob = step % 2; p.armL = step === 1 ? -1 : step === 3 ? 1 : 0; p.armR = -p.armL; }
  else p.bob = Math.floor(lt * 1.6) % 2;
  if (act === 'wave') { p.raiseR = true; p.waveStep = Math.floor(lt * 5) % 2; }
  if (act === 'dance') { const s = Math.floor(lt * 4) % 2; p.bob = s; p.raiseL = s === 0; p.raiseR = s === 1; p.waveStep = s; }
  if (act === 'jump' || a.jump != null) {
    const at = a.at ?? a.jump ?? .5, d = a.jumpTime ?? .7, u = (lt - at) / d;
    if (u >= 0 && u <= 1) { y = -Math.round(4 * u * (1 - u) * (a.height ?? 24)); p.jump = true; p.raiseL = p.raiseR = true; }
  }
  if (act === 'hit') {
    const at = a.at ?? .5, u = lt - at;
    if (u >= 0 && u < 1.1) { x += -A.face * Math.round(Math.min(1, u / .25) * 10); p.dizzy = u > .12; p.flash = u < .4 && Math.floor(u * 15) % 2 === 0; y = u < .25 ? -Math.round(4 * (u / .25) * (1 - u / .25) * 6) : 0; }
  }
  const talk = sc.says.find(s => s.who === A.id && lt >= s.at && lt < s.at + String(s.text).length / s.cps + .35);
  if (talk) p.mouth = Math.floor(lt * 9) % 3 === 0 ? 0 : (Math.floor(lt * 9) % 3);
  p.blink = ((lt + A.idx * .9) % 3.4) < .12;
  return { p, x, y };
}

function drawActor(g, ch, pose, x, y, face, gy) {
  sg.clearRect(0, 0, 48, 48); sg.save(); sg.translate(24, 40); drawCharacter(sg, ch, pose.p); sg.restore();
  ng.globalCompositeOperation = 'source-over'; ng.clearRect(0, 0, 48, 48); ng.drawImage(spr, 0, 0);
  ng.globalCompositeOperation = 'source-in'; ng.fillStyle = OUTLINE; ng.fillRect(0, 0, 48, 48); ng.globalCompositeOperation = 'source-over';
  const air = Math.max(0, -pose.y);                                                   // soft shadow shrinks while jumping
  g.fillStyle = 'rgba(0,0,0,.28)'; const sw = Math.max(6, 16 - Math.floor(air / 4)); g.fillRect(Math.round(x) - Math.floor(sw / 2), gy + 3, sw, 1);
  g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(face, 1);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(sil, -24 + dx, -40 + dy);
  g.drawImage(spr, -24, -40);
  if (pose.p.flash) { ng.globalCompositeOperation = 'source-in'; ng.fillStyle = '#ffffff'; ng.clearRect(0, 0, 48, 48); ng.drawImage(spr, 0, 0); ng.fillRect(0, 0, 48, 48); ng.globalCompositeOperation = 'source-over'; g.globalAlpha = .7; g.drawImage(sil, -24, -40); g.globalAlpha = 1; }
  g.restore();
}

function wrapText(text, maxChars) {
  const words = String(text).toUpperCase().split(/\s+/), lines = []; let cur = '';
  words.forEach(w => { if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
  if (cur) lines.push(cur); return lines;
}
function drawBubble(g, s, lt, x, headY, Lw) {
  const n = Math.min(String(s.text).length, Math.floor((lt - s.at) * s.cps) + 1);
  const maxChars = Math.max(8, Math.min(16, Math.floor((Lw - 24) / 6)));
  const lines = wrapText(s.text, maxChars), full = lines.join('');
  const w = Math.max(...lines.map(l => textWidth(l))) + 8, h = lines.length * 9 + 6;
  let bx = Math.round(x - w / 2); bx = clamp(bx, 3, Lw - w - 3); const by = Math.round(headY - h - 6);
  rect(g, OUTLINE, bx - 1, by, w + 2, h); rect(g, OUTLINE, bx, by - 1, w, h + 2); rect(g, '#ffffff', bx, by, w, h);
  const tx = clamp(Math.round(x), bx + 4, bx + w - 5);
  rect(g, OUTLINE, tx - 2, by + h, 5, 1); rect(g, OUTLINE, tx - 1, by + h + 1, 3, 1); rect(g, OUTLINE, tx, by + h + 2, 1, 1);
  rect(g, '#ffffff', tx - 1, by + h, 3, 1); rect(g, '#ffffff', tx, by + h + 1, 1, 1);
  let shown = 0;
  lines.forEach((l, i) => { const part = l.slice(0, Math.max(0, n - shown)); shown += l.length; drawText(g, part, bx + 4, by + 3 + i * 9, '#231c3a', 1); });
}

function captionText(str) {
  str = String(str).toUpperCase();
  const px = Math.max(4, Math.min(14, Math.floor(940 / (str.length * 6 - 1))));
  const w = textWidth(str, px), x = Math.round((W - w) / 2), y = Math.round(H * .8);
  out.save(); out.imageSmoothingEnabled = false;
  drawText(out, str, x, y + px, '#000000', px, '#000000');           // chunky dark drop
  drawText(out, str, x, y, '#ffffff', px, '#1c1830');
  out.restore();
}

function sceneAt(t) { let i = scenes.findIndex(s => t >= s.start && t < s.end); return i < 0 ? scenes.length - 1 : i; }

function drawScene(i, t) {
  const sc = scenes[i], lt = Math.min(t, sc.end) - sc.start, S = sc.scale, { c: lc, g } = layer(S);
  const Lw = W / S, Lh = H / S, gy = Math.round(Lh * (sc.ground ?? world.ground));
  // camera: a fixed x, a slow move, or follow an actor
  const cam = sc.cam || {}; let cx;
  const A = cam.follow ? sc.list.find(l => l.id === cam.follow) : null;
  if (A) { const pp = actorPose(sc, A, lt); cx = pp.x + (cam.lead ?? 0); }
  else { const c0 = cam.x ?? (sc.list.length ? sc.list.reduce((s, l) => s + l.x0, 0) / sc.list.length : 90), c1 = cam.to ?? c0; cx = c0 + (c1 - c0) * easeInOut(clamp(lt / sc.dur)); }
  let camX = Math.round(cx - Lw / 2);
  // hits shake the camera
  const hitter = sc.list.find(l => (l.a.do === 'hit') && lt >= (l.a.at ?? .5) && lt < (l.a.at ?? .5) + .35);
  const shake = hitter ? (Math.floor(lt * 30) % 2 ? 2 : -2) : 0;
  g.save(); g.setTransform(1, 0, 0, 1, shake, 0);
  drawSky(g, Lw, Lh, gy, camX, t, world);
  drawProps(g, camX, gy, world, false);
  drawGround(g, Lw, Lh, gy, camX);
  drawFx(g, sc, i, lt, camX, gy, Lw, Lh, 'back');
  const poses = sc.list.map(l => ({ l, ...actorPose(sc, l, lt) })).sort((a, b) => a.x - b.x);
  poses.forEach(({ l, p, x, y }) => drawActor(g, cast[l.id], { p, y }, x - camX, gy + 2 + y, l.face, gy));
  drawProps(g, camX, gy, world, true);
  drawFx(g, sc, i, lt, camX, gy, Lw, Lh, 'front');
  sc.says.forEach(s => {
    const o = poses.find(q => q.l.id === s.who); if (!o || lt < s.at || lt > (s.until ?? sc.dur)) return;
    drawBubble(g, s, lt, o.x - camX, gy + 2 + o.y - 31, Lw);
  });
  g.restore();
  out.imageSmoothingEnabled = false; out.drawImage(lc, 0, 0, Lw, Lh, 0, 0, W, H);
  if (sc.caption) captionText(typeof sc.caption === 'string' ? sc.caption : (sc.caption.find(c => lt >= c.at && lt < (c.until ?? 1e9)) || { text: '' }).text);
}

// pixel dissolve between scenes marked "transition": "pixel"
function dissolve(p) {
  if (p <= 0) return; const B = 60; out.fillStyle = '#0d0a1c';
  for (let by = 0; by < H / B; by++) for (let bx = 0; bx < W / B; bx++) if (hash2(bx, by) < p) out.fillRect(bx * B, by * B, B, B);
}
function renderAt(t) {
  t = clamp(t, 0, TOTAL - 1e-4);
  const i = sceneAt(t);
  drawScene(i, t);
  const sc = scenes[i], next = scenes[i + 1], TD = .3;
  if (sc.transition === 'pixel' && t - sc.start < TD) dissolve(1 - (t - sc.start) / TD);
  if (next && next.transition === 'pixel' && sc.end - t < TD) dissolve(1 - (sc.end - t) / TD);
}
window.renderAt = renderAt;
window.ready = true;
