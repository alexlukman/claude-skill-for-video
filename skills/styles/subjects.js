// /styles subjects and overlays. A subject replaces the hero scene (for graphic, simulation and technology styles);
// an overlay is drawn on top of the styled hero scene. Both are pure functions of time t.
const SUBJECT = {}, OVERLAY = {};
const MONO_FONT = '"JetBrains Mono", "DejaVu Sans Mono", monospace', BOLD = '"Inter Tight", Inter, sans-serif';
function sceneTo(name, t, w = W, h = H) { const c = tmpCanvas(name, W, H), g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); drawStyledScene(g, t); return c; }
function bgFill(c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2 || c1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
// ---------------------------------------------------------------- character overlays
OVERLAY.panels = (t, sc) => {               // motion comic / comic strip: the frame split into inked panels with captions
  const src = tmpCanvas('pn', W, H), g = src.getContext('2d'); g.drawImage(cv, 0, 0);
  ctx.fillStyle = '#f6f0e2'; ctx.fillRect(0, 0, W, H);
  const P = [[60, 240, 960, 560, 1.7, [560, 1050]], [60, 830, 460, 620, 2.4, [470, 860]], [550, 830, 470, 620, 1.2, [520, 1300]], [60, 1480, 960, 220, 1.0, [540, 1500]]];
  P.forEach(([x, y, w, h, z, f], i) => { const k = tween(t, i * .5, i * .5 + .5); if (k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const zz = z * (1 + .06 * Math.sin(t * .8 + i)), sw = w / zz, sh = h / zz; ctx.globalAlpha = k; ctx.drawImage(src, f[0] - sw / 2, f[1] - sh / 2, sw, sh, x, y, w, h); ctx.restore();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.globalAlpha = k; ctx.strokeRect(x, y, w, h); ctx.globalAlpha = 1; });
  const say = R.say || ['THE CASTLE!', 'Run!']; if (t > 1.3) { ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(780, 330, 210, 70, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    text(ctx, say[0], 780, 348, { size: 44, weight: 800, family: BOLD, color: '#111', maxW: 380 }); }
  if (t > 2.4) { ctx.fillStyle = '#ffe14a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.fillRect(90, 1500, 380, 70); ctx.strokeRect(90, 1500, 380, 70); text(ctx, R.caption2 || 'MEANWHILE...', 280, 1548, { size: 40, weight: 800, family: BOLD, color: '#111', maxW: 360 }); }
};
OVERLAY.gamehud = (t) => {                  // game-based animation: an in-game HUD over the scene
  const hp = .82 - .25 * tween(t, 2, 2.6);
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(90, 230, 420, 44); ctx.fillStyle = '#e8303a'; ctx.fillRect(96, 236, 408 * hp, 32); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(90, 230, 420, 44);
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(90, 286, 300, 22); ctx.fillStyle = '#35b4ff'; ctx.fillRect(94, 290, 292 * (.5 + .3 * Math.sin(t)), 14);
  ctx.beginPath(); ctx.arc(890, 330, 100, 0, TAU); ctx.fillStyle = 'rgba(10,20,30,.6)'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.arc(890, 330, 9, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8303a'; ctx.beginPath(); ctx.arc(890 + 50 * Math.cos(t), 330 - 40, 7, 0, TAU); ctx.fill(); ctx.restore();
  text(ctx, R.quest || 'QUEST: Reach the castle', 90, 1690, { size: 40, weight: 700, family: BOLD, color: '#fff', align: 'left', maxW: 900 });
};
OVERLAY.bones = (t, sc) => {                // skeletal animation: the rig drawn over the character
  const Q = sc.hero.pose, j = Q, lines = [[j.hip, j.sh], [j.sh, j.head]];
  j.legs.forEach(L => { lines.push([j.hip, add(j.hip, L.knee)], [add(j.hip, L.knee), add(j.hip, L.ankle)]); });
  j.arms.forEach(A => lines.push([j.shoulder, A.el], [A.el, A.hand]));
  ctx.save(); ctx.strokeStyle = '#3ef0ff'; ctx.fillStyle = '#3ef0ff'; ctx.shadowColor = '#3ef0ff'; ctx.shadowBlur = 12; ctx.lineWidth = 6; ctx.globalAlpha = .9;
  lines.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.beginPath(); ctx.arc(a[0], a[1], 11, 0, TAU); ctx.fill(); }); ctx.restore();
  const names = ['Root', ' Spine', '  Chest', '   Neck', '    Head', ' L_Arm', ' R_Arm', ' L_Leg', ' R_Leg'];
  ctx.save(); ctx.fillStyle = 'rgba(8,16,28,.75)'; ctx.fillRect(80, 240, 330, names.length * 50 + 30); ctx.restore();
  names.forEach((n, i) => text(ctx, n, 100, 290 + i * 50, { size: 40, weight: 500, family: MONO_FONT, color: '#bff6ff', align: 'left', maxW: 300 }));
};
OVERLAY.notebook = () => {                   // doodle: blue ruled lines and a red margin on top of a paper page
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = 'rgba(80,130,220,.35)'; ctx.lineWidth = 2; for (let y = 260; y < H; y += 56) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(220,60,60,.5)'; ctx.beginPath(); ctx.moveTo(130, 0); ctx.lineTo(130, H); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = '#d8d0c0'; for (let y = 300; y < H; y += 220) { ctx.beginPath(); ctx.arc(60, y, 18, 0, TAU); ctx.fill(); } ctx.restore();
};
OVERLAY.flipbook = (t) => {                 // flipbook: the frame is a page held in a small book; the corner lifts each flip
  const src = tmpCanvas('fb', W, H), g = src.getContext('2d'); g.drawImage(cv, 0, 0);
  ctx.fillStyle = '#5a4636'; ctx.fillRect(0, 0, W, H);
  for (let i = 6; i > 0; i--) { ctx.fillStyle = shade('#f4efe4', -i * .03); ctx.fillRect(120 + i * 6, 380 + i * 8, 840, 1180); }
  ctx.drawImage(src, 0, 260, W, 1500, 120, 380, 840, 1180);
  const flip = (t * 12) % 1; ctx.save(); ctx.fillStyle = '#ece6d8'; ctx.beginPath(); ctx.moveTo(960, 1560); ctx.lineTo(960 - 140 * flip, 1560); ctx.lineTo(960, 1560 - 160 * flip); ctx.fill(); ctx.restore();
};
OVERLAY.collage = (t) => {                  // mixed media: torn paper, a halftone photo scrap, tape and a stamp over the scene
  const r = rng(4);
  for (let i = 0; i < 5; i++) { const x = 90 + r() * 800, y = 260 + r() * 1300, w = 160 + r() * 160, h = 110 + r() * 120, a = (r() - .5) * .4 + Math.sin(t + i) * .02;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 10; ctx.fillStyle = ['#efe4cc', '#d8c8a8', '#f4f0e8', '#c8b090', '#e8dcc0'][i];
    ctx.beginPath(); for (let k = 0; k <= 12; k++) { const u = k / 12; ctx.lineTo(u * w, (r() - .5) * 8); } for (let k = 0; k <= 12; k++) { const u = 1 - k / 12; ctx.lineTo(u * w, h + (r() - .5) * 8); } ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    if (i % 2 === 0) { ctx.fillStyle = 'rgba(40,30,20,.55)'; for (let yy = 10; yy < h - 10; yy += 9) for (let xx = 10; xx < w - 10; xx += 9) { const v = .5 + .5 * Math.sin(xx * .05 + yy * .07 + i); ctx.beginPath(); ctx.arc(xx, yy, v * 3.6, 0, TAU); ctx.fill(); } }
    else { ctx.strokeStyle = 'rgba(60,40,30,.5)'; ctx.lineWidth = 2; for (let yy = 20; yy < h - 10; yy += 16) { ctx.beginPath(); ctx.moveTo(14, yy); ctx.lineTo(w - 14, yy); ctx.stroke(); } }
    ctx.fillStyle = 'rgba(240,220,140,.6)'; ctx.fillRect(w / 2 - 40, -12, 80, 26); ctx.restore(); }
};
OVERLAY.surreal = (t) => {                  // surreal: floating islands, a staircase to nowhere and a drooping clock in the sky
  const r = rng(8);
  for (let i = 0; i < 4; i++) { const x = 150 + i * 240 + Math.sin(t * .6 + i) * 20, y = 360 + r() * 380 + Math.sin(t * .9 + i * 2) * 25, w = 90 + r() * 90;
    ctx.fillStyle = '#7a5a6a'; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x + w, y); ctx.lineTo(x, y + w * 1.2); ctx.fill(); ctx.fillStyle = '#8fc070'; ctx.fillRect(x - w, y - 14, w * 2, 16); }
  ctx.save(); ctx.translate(700, 520); ctx.fillStyle = '#c8b8e8'; for (let i = 0; i < 8; i++) { ctx.fillRect(i * 34, -i * 34, 60, 22); } ctx.restore();
  ctx.save(); ctx.translate(250, 560); ctx.rotate(-.2); const k = .3 + .1 * Math.sin(t); ctx.fillStyle = '#f2d27a'; ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 70, 70 * (1 + k), 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -45); ctx.moveTo(0, 0); ctx.lineTo(30 * Math.cos(t), 30 * Math.sin(t)); ctx.stroke(); ctx.restore();
};
OVERLAY.psychedelic = (t) => {              // swirling saturated bands behind everything, blended over the sky
  ctx.save(); ctx.globalCompositeOperation = 'color'; for (let i = 0; i < 18; i++) { ctx.strokeStyle = `hsl(${(i * 40 + t * 90) % 360},90%,60%)`; ctx.lineWidth = 40; ctx.beginPath();
    for (let a = 0; a < 14; a += .1) { const rr = 40 + a * 70 + i * 10, x = W / 2 + Math.cos(a + t * .8 + i) * rr, y = 700 + Math.sin(a + t * .8 + i) * rr * .8; a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore();
};
OVERLAY.meme = (t, sc) => {                 // meme: hard punch-in zooms on the face with impact text (an original reaction, no existing meme)
  const src = tmpCanvas('mm', W, H), g = src.getContext('2d'); g.drawImage(cv, 0, 0); const hd = sc.hero.pose.head;
  const z = t < 2 ? 1 : t < 3.5 ? 2.2 : 3.6, sh = t >= 3.5 ? (Math.sin(t * 60) * 6) : 0;
  ctx.drawImage(src, hd[0] - W / z / 2 + sh, hd[1] - H / z / 2.2, W / z, H / z, 0, 0, W, H);
  if (t >= 3.5) { ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#ff2a2a'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const top = R.top || 'ME SEEING THE CASTLE', bot = t < 2 ? '' : t < 3.5 ? (R.bottom || 'WAIT') : (R.bottom2 || 'IT\'S UPHILL');
  ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = '#000'; ctx.font = `800 72px ${BOLD}`; ctx.textAlign = 'center';
  [[top, 330], [bot, 1680]].forEach(([s, y]) => { if (!s) return; ctx.strokeText(s, W / 2, y); ctx.fillStyle = '#fff'; ctx.fillText(s, W / 2, y); }); ctx.restore();
};
// ---------------------------------------------------------------- graphic subjects
SUBJECT.stick = (t) => {                    // stick figure on paper (the full skill is /stick-figure)
  ctx.fillStyle = '#fbf8f0'; ctx.fillRect(0, 0, W, H); const Q = heroPose(t); ctx.save(); ctx.strokeStyle = '#151515'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  const L = (a, b) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
  L(Q.hip, Q.sh); Q.legs.forEach(l => { L(Q.hip, add(Q.hip, l.knee)); L(add(Q.hip, l.knee), add(Q.hip, l.ankle)); }); Q.arms.forEach(a => { L(Q.shoulder, a.el); L(a.el, a.hand); });
  ctx.fillStyle = '#fbf8f0'; ctx.beginPath(); ctx.arc(Q.head[0], Q.head[1], 58, 0, TAU); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#d8332e'; ctx.lineWidth = 14; L(add(Q.sh, [10, 10]), add(Q.sh, [-120, 40 + Math.sin(t * 9) * 20]));
  ctx.strokeStyle = '#151515'; ctx.lineWidth = 6; L([0, GROUND + 2], [W, GROUND + 2]); const r = rng(Math.floor(t * 6)); ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { const x = ((300 - t * 260 + i * 260) % 1300 + 1300) % 1300 - 100; L([x, GROUND + 30], [x - 40, GROUND + 30]); }
  ctx.restore();
};
SUBJECT.type = (t) => {                     // kinetic typography
  bgFill('#16213e', '#0f3460'); const words = R.words || ['MOTION', 'TYPE', 'MOVES'];
  ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = '#e94560'; ctx.beginPath(); ctx.moveTo(0, 1500); ctx.lineTo(W, 900 + 200 * Math.sin(t)); ctx.lineTo(W, 1100 + 200 * Math.sin(t)); ctx.lineTo(0, 1700); ctx.fill(); ctx.restore();
  words.forEach((w, i) => { const a = tween(t, .3 + i * .7, .9 + i * .7, ease.back), y = 640 + i * 300; if (a <= 0) return; ctx.save(); ctx.translate(W / 2 + (1 - a) * 600 * (i % 2 ? -1 : 1), y); ctx.rotate(-.12 + (i % 2) * .06); ctx.scale(a, a);
    ctx.font = `800 ${220 - i * 20}px ${BOLD}`; ctx.textAlign = 'center'; ctx.lineWidth = 14; ctx.strokeStyle = '#0b0b14'; ctx.strokeText(w, 10, 10); ctx.fillStyle = i === 1 ? '#ffd24a' : '#ffffff'; ctx.fillText(w, 0, 0); ctx.restore(); });
  if (t > 3.2) { const k = (t - 3.2) * 3; ctx.save(); ctx.translate(W / 2, 1240); ctx.rotate(k); ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 8; for (let i = 0; i < 8; i++) { ctx.rotate(TAU / 8); ctx.beginPath(); ctx.moveTo(260, 0); ctx.lineTo(320, 0); ctx.stroke(); } ctx.restore(); }
};
SUBJECT.logo = (t) => {                     // logo animation: an original mark builds, gets a light sweep, then the wordmark
  bgFill('#0d1024', '#1c1440'); const k1 = tween(t, .2, 1.8), k2 = tween(t, 1.6, 2.6), k3 = tween(t, 2.8, 3.8);
  ctx.save(); ctx.translate(W / 2, 860); ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 16; ctx.lineJoin = 'round'; partialLine(ctx, [[-180, 200], [0, -220], [180, 200]], k1); partialLine(ctx, [[-90, 60], [90, 60]], tween(t, 1.2, 1.8));
  if (k2 > 0) { const g = ctx.createLinearGradient(-200, -220, 200, 200); g.addColorStop(0, '#ff7a3c'); g.addColorStop(1, '#ffd36e'); ctx.globalAlpha = k2; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-180, 200); ctx.lineTo(0, -220); ctx.lineTo(180, 200); ctx.lineTo(110, 200); ctx.lineTo(0, -50); ctx.lineTo(-110, 200); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,200,120,.8)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 40, 300 * k2, 70 * k2, -.25, PI * (1 - k2), PI * 2); ctx.stroke(); ctx.restore();
  const sw = tween(t, 3.6, 4.6); if (sw > 0 && sw < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const x = lerp(200, 880, sw), g = ctx.createLinearGradient(x - 80, 0, x + 80, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 80, 600, 160, 520); ctx.restore(); }
  text(ctx, R.wordmark || 'A U R O R A', W / 2, 1300, { size: 72, weight: 500, color: '#ffffff', alpha: k3, track: 14 });
};
SUBJECT.mograph = (t) => {                  // motion graphics: interface card, play button, bars and shapes flying in
  bgFill('#2a3fd6', '#4a2ad6'); const pop = (a, b) => tween(t, a, b, ease.back);
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(W / 2 + 200 * Math.sin(t * .5), 1500, 700, 200, -.3, 0, TAU); ctx.fill(); ctx.restore();
  const k = pop(.2, 1); ctx.save(); ctx.translate(W / 2, 900); ctx.scale(k, k); ctx.fillStyle = '#eef2ff'; ctx.beginPath(); ctx.roundRect(-360, -260, 720, 520, 34); ctx.fill(); ctx.fillStyle = '#c8d4ff'; ctx.fillRect(-360, -260, 720, 60);
  [-320, -290, -260].forEach((x, i) => { ctx.fillStyle = ['#ff6a6a', '#ffd24a', '#4ae08a'][i]; ctx.beginPath(); ctx.arc(x, -230, 10, 0, TAU); ctx.fill(); });
  const pk = pop(.9, 1.5); ctx.fillStyle = '#ff5a5a'; ctx.beginPath(); ctx.moveTo(-60 * pk, -80 * pk); ctx.lineTo(90 * pk, 0); ctx.lineTo(-60 * pk, 80 * pk); ctx.fill();
  [80, 140, 200, 260].forEach((h, i) => { const b = tween(t, 1.4 + i * .2, 2 + i * .2, ease.out); ctx.fillStyle = '#ffb02e'; ctx.fillRect(170 + i * 42, 200 - h * b, 30, h * b); }); ctx.restore();
  [[160, 520, '#ffd24a', 'c'], [930, 600, '#4ae0ff', 's'], [200, 1380, '#ff6aa8', 't'], [880, 1400, '#ffffff', 'c']].forEach(([x, y, c, s], i) => { const a = pop(.5 + i * .3, 1.1 + i * .3); ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 14); ctx.rotate(t * (i % 2 ? .8 : -.6)); ctx.scale(a, a); ctx.fillStyle = c;
    if (s === 'c') { ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.fill(); } else if (s === 's') ctx.fillRect(-45, -45, 90, 90); else { ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(50, 40); ctx.lineTo(-50, 40); ctx.fill(); } ctx.restore(); });
};
SUBJECT.infographic = (t) => {               // infographic: bars, a donut and a big number count up
  ctx.fillStyle = '#f7f4ec'; ctx.fillRect(0, 0, W, H); text(ctx, R.headline || 'HOW WE TRAVEL', W / 2, 330, { size: 64, weight: 800, family: BOLD, color: '#1f2a44', track: 2 });
  const vals = R.values || [32, 48, 61, 72, 85]; vals.forEach((v, i) => { const k = tween(t, .6 + i * .25, 1.4 + i * .25, ease.out), x = 150 + i * 160, h = v * 6 * k; ctx.fillStyle = ['#4a7bd0', '#5aa0e0', '#f0a030', '#e8603a', '#3aa070'][i]; ctx.fillRect(x, 1020 - h, 110, h);
    text(ctx, String(Math.round(v * k)), x + 55, 1000 - h, { size: 40, weight: 700, color: '#1f2a44', alpha: k }); });
  ctx.strokeStyle = '#1f2a44'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(120, 1022); ctx.lineTo(960, 1022); ctx.stroke();
  const dk = tween(t, 2.6, 3.8); let a0 = -PI / 2; [[.45, '#4a7bd0'], [.3, '#f0a030'], [.25, '#3aa070']].forEach(([f, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 60; ctx.beginPath(); ctx.arc(330, 1340, 140, a0, a0 + f * TAU * dk); ctx.stroke(); a0 += f * TAU * dk; });
  const n = Math.round(72 * tween(t, 3, 4.4)); text(ctx, n + '%', 760, 1380, { size: 150, weight: 800, family: BOLD, color: '#e8603a' }); text(ctx, R.note || 'ILLUSTRATIVE DATA', W / 2, 1680, { size: 40, weight: 600, color: '#7a7a7a', track: 3 });
};
SUBJECT.whiteboard = (t) => {               // whiteboard: the hero and a few ideas are drawn line by line with a marker
  ctx.fillStyle = '#fbfbf8'; ctx.fillRect(0, 0, W, H); const sc = { shapes: hero(.4).shapes.filter(s => s.mat !== 'skin' || s.head || s.hand) };
  ctx.save(); ctx.strokeStyle = '#1b1b22'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  sc.shapes.forEach((s, i) => { const k = tween(t, .2 + i * .1, .6 + i * .1, ease.linear); partialLine(ctx, [...s.pts, s.pts[0]], k); });
  const bulb = circ([820, 520], 80, 30); partialLine(ctx, [...bulb, bulb[0]], tween(t, 3, 3.6)); ctx.strokeStyle = '#2a6be0'; partialLine(ctx, [[650, 900], [740, 820], [820, 860], [930, 700]], tween(t, 3.6, 4.2)); ctx.restore();
  if (t > 3.2) { const k = tween(t, 3.2, 3.8); ctx.save(); ctx.strokeStyle = '#f0b020'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { const a = -PI / 2 + (i - 2.5) * .45; ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(820 + Math.cos(a) * 100, 520 + Math.sin(a) * 100); ctx.lineTo(820 + Math.cos(a) * 140, 520 + Math.sin(a) * 140); ctx.stroke(); } ctx.restore(); }
  const pen = t < 3 ? (() => { const i = Math.floor((t - .2) / .1); const s = sc.shapes[Math.max(0, Math.min(sc.shapes.length - 1, i))]; return pointAt([...s.pts, s.pts[0]], ((t - .2) % .1) / .1 * 2.5 % 1); })() : [930, 700];
  ctx.save(); ctx.translate(pen[0], pen[1]); ctx.rotate(.5); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-8, -8, 18, 40); ctx.fillStyle = '#f6c8a8'; ctx.beginPath(); ctx.ellipse(18, 70, 46, 60, .3, 0, TAU); ctx.fill(); ctx.restore();
};
SUBJECT.liquid = (t) => {                   // liquid motion: blobs that stretch, merge and split
  bgFill('#1b1240', '#2b1660'); const blobs = [[0, '#4a8cff'], [1.7, '#ff5aa8'], [3.4, '#ffc23a'], [5.1, '#5ae0c0']];
  ctx.save(); ctx.filter = 'blur(28px) contrast(1)'; blobs.forEach(([o, c], i) => { ctx.fillStyle = c; for (let k = 0; k < 4; k++) { const a = t * .9 + o + k * 1.3, x = W / 2 + Math.cos(a) * 260 + Math.cos(a * 2.3) * 80, y = 960 + Math.sin(a * 1.4) * 420; ctx.beginPath(); ctx.arc(x, y, 110 + 30 * Math.sin(a * 3), 0, TAU); ctx.fill(); } }); ctx.restore();
  const c2 = tmpCanvas('lq', W, H), g2 = c2.getContext('2d'); g2.clearRect(0, 0, W, H); g2.drawImage(cv, 0, 0); ctx.save(); ctx.filter = 'contrast(2.2) saturate(1.3)'; ctx.drawImage(c2, 0, 0); ctx.restore();
};
SUBJECT.geometric = (t) => {                // geometric: squares, circles and triangles rotating in a grid
  ctx.fillStyle = '#1d2a44'; ctx.fillRect(0, 0, W, H); const C = ['#ff8a3a', '#ffd24a', '#f4efe4', '#3aa0c8'];
  for (let y = 0; y < 9; y++) for (let x = 0; x < 5; x++) { const cx = 108 + x * 216, cy = 270 + y * 172, ph = t * 1.2 - (x + y) * .25, s = .6 + .3 * Math.sin(ph); ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.round(ph / (PI / 2)) * PI / 2 * .5 + Math.sin(ph) * .4); ctx.fillStyle = C[(x + y) % 4];
    const kind = (x * 3 + y) % 3; if (kind === 0) ctx.fillRect(-60 * s, -60 * s, 120 * s, 120 * s); else if (kind === 1) { ctx.beginPath(); ctx.arc(0, 0, 62 * s, 0, TAU); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(0, -70 * s); ctx.lineTo(62 * s, 50 * s); ctx.lineTo(-62 * s, 50 * s); ctx.fill(); } ctx.restore(); }
};
SUBJECT.abstract = (t) => {                 // abstract: circles, lines and colour fields moving to a rhythm
  ctx.fillStyle = '#f4ecd8'; ctx.fillRect(0, 0, W, H); const beat = Math.abs(Math.sin(t * PI));
  ctx.fillStyle = '#e04a2a'; ctx.beginPath(); ctx.arc(320, 620, 170 + beat * 30, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a5ab0'; ctx.beginPath(); ctx.arc(760, 1180, 120 + (1 - beat) * 30, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f2c230'; ctx.save(); ctx.translate(600, 860); ctx.rotate(t * .6); ctx.beginPath(); ctx.moveTo(0, -210); ctx.lineTo(160, 130); ctx.lineTo(-160, 130); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(100, 1500); ctx.quadraticCurveTo(540, 900 + 300 * Math.sin(t), 980, 1300); ctx.stroke();
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = (i + j) % 2 ? '#141414' : '#f4ecd8'; ctx.fillRect(110 + i * 40, 1560 + j * 40, 40, 40); }
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 6; [[700, 300, 980, 520], [640, 380, 900, 640]].forEach(([a, b, c, d], i) => { ctx.beginPath(); ctx.moveTo(a, b + Math.sin(t * 2 + i) * 30); ctx.lineTo(c, d); ctx.stroke(); });
};
// ---------------------------------------------------------------- simulation, science and technology subjects
SUBJECT.sand = (t) => {                     // sand on a lightbox: the hero's silhouette is drawn in sand, then swept into a tree
  const g = ctx.createRadialGradient(W / 2, 960, 100, W / 2, 960, 1100); g.addColorStop(0, '#fff3cf'); g.addColorStop(1, '#d8a860'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const src = tmpCanvas('sd', W, H), s2 = src.getContext('2d'); s2.clearRect(0, 0, W, H); s2.fillStyle = '#000';
  const m = tween(t, 2.6, 4.2); hero(.3).shapes.forEach(s => { s2.globalAlpha = 1 - m; s2.fill(pathOf(s.pts)); });
  s2.globalAlpha = m; s2.strokeStyle = '#000'; s2.lineCap = 'round'; const tree = (x, y, a, l, d) => { if (d === 0) return; const x2 = x + Math.sin(a) * l, y2 = y - Math.cos(a) * l; s2.lineWidth = d * 6; s2.beginPath(); s2.moveTo(x, y); s2.lineTo(x2, y2); s2.stroke(); tree(x2, y2, a - .45, l * .72, d - 1); tree(x2, y2, a + .4, l * .7, d - 1); }; tree(540, 1600, 0, 280, 7);
  const w = 216, h = 384, c = tmpCanvas('sd2', w, h), g2 = c.getContext('2d', { willReadFrequently: true }); g2.clearRect(0, 0, w, h); g2.drawImage(src, 0, 0, w, h); const d = g2.getImageData(0, 0, w, h).data, r = rng(frameIndex(t) % 3 + 1);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const a = d[(y * w + x) * 4 + 3] / 255; if (a < .05) continue; for (let k = 0; k < 7 * a; k++) { ctx.fillStyle = `rgba(${70 + r() * 40},${42 + r() * 20},${16},${.5 + r() * .4})`; ctx.fillRect(x * 5 + r() * 5, y * 5 + r() * 5, 2.2, 2.2); } }
  const hk = tween(t, 2.2, 3); if (hk > 0 && hk < 1) { ctx.save(); ctx.fillStyle = '#e8c0a0'; ctx.globalAlpha = .9; ctx.beginPath(); ctx.ellipse(lerp(100, 980, hk), 1000, 80, 120, .3, 0, TAU); ctx.fill(); ctx.restore(); }
};
SUBJECT.object = (t) => {                   // object animation: a mug walks across a desk on twos
  const tq = Math.floor(t * 12) / 12; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a4636'); g.addColorStop(1, '#2a2018'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#8a5a36'; ctx.fillRect(0, 1300, W, 620); ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 9; i++) ctx.fillRect(0, 1320 + i * 66, W, 3);
  [[120, 1020, 260, 280, '#a0402e'], [140, 860, 230, 160, '#3a5a8a'], [130, 760, 250, 100, '#e0c060']].forEach(([x, y, w, h, c]) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x, y + 10, w, 8); });
  ctx.save(); ctx.translate(870, 1110); ctx.fillStyle = '#d8d0c0'; ctx.beginPath(); ctx.arc(0, 0, 110, 0, TAU); ctx.fill(); ctx.fillStyle = '#fbf6ea'; ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -60); ctx.moveTo(0, 0); ctx.lineTo(45, 20); ctx.stroke(); ctx.restore();
  const x = lerp(300, 720, tween(tq, .2, 5.6, ease.linear)), hop = Math.abs(Math.sin(tq * 8)) * 34, lean = Math.sin(tq * 8) * .12;
  ctx.save(); ctx.translate(x, 1300 - hop); ctx.rotate(lean); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, hop + 6, 110, 20, 0, 0, TAU); ctx.fill();
  const mg = ctx.createLinearGradient(-110, 0, 110, 0); mg.addColorStop(0, '#d8cbb4'); mg.addColorStop(.4, '#f6efe0'); mg.addColorStop(1, '#bfae92'); ctx.fillStyle = mg; ctx.beginPath(); ctx.roundRect(-100, -260, 200, 260, 26); ctx.fill();
  ctx.strokeStyle = '#d8cbb4'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(110, -140, 60, -1.2, 1.2); ctx.stroke(); ctx.fillStyle = '#2a1e18'; ctx.beginPath(); ctx.arc(-30, -160, 10, 0, TAU); ctx.arc(30, -160, 10, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2a1e18'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -125, 26, .2, PI - .2); ctx.stroke(); ctx.restore();
};
SUBJECT.documentary = (t) => {              // documentary: an archival map, a spreading region, a route and dated captions
  ctx.fillStyle = '#e8d8b4'; ctx.fillRect(0, 0, W, H); POST.paper(); const r = rng(6);
  ctx.save(); ctx.fillStyle = '#c8a878'; ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, rr = 330 + 60 * Math.sin(a * 3) + 40 * Math.sin(a * 7); ctx.lineTo(540 + Math.cos(a) * rr, 960 + Math.sin(a) * rr * 1.25); } ctx.closePath(); ctx.fill(); ctx.stroke();
  const k = tween(t, .8, 3.5); ctx.clip(); ctx.fillStyle = 'rgba(170,40,30,.55)'; ctx.beginPath(); ctx.arc(420, 860, 600 * k, 0, TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.strokeStyle = '#2a1a10'; ctx.setLineDash([16, 12]); ctx.lineWidth = 6; partialLine(ctx, bez([300, 1300], [500, 1200], [440, 800], [760, 640]), tween(t, 1.5, 4)); ctx.restore();
  [[300, 1300, '1702'], [760, 640, '1716']].forEach(([x, y, yr], i) => { const a = tween(t, 1.5 + i * 2.4, 2 + i * 2.4); ctx.fillStyle = '#2a1a10'; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; text(ctx, yr, x + 30, y + 14, { size: 48, weight: 700, family: 'Georgia, serif', color: '#2a1a10', align: 'left', alpha: a }); });
  text(ctx, R.headline || 'THE OLD ROAD', W / 2, 330, { size: 68, weight: 400, family: 'Georgia, "DejaVu Serif", serif', color: '#2a1a10', track: 6, alpha: tween(t, 0, .8) });
  text(ctx, R.note || 'Illustrative reconstruction', W / 2, 1690, { size: 40, weight: 400, family: 'Georgia, serif', color: '#4a3020', alpha: tween(t, 3.5, 4.2) });
  POST.sepia(); POST.grain(t, .05); POST.vignette(t, .5);
};
SUBJECT.mocap = (t) => {                    // motion capture: a marker suit on a capture stage drives a digital character beside it
  bgFill('#0c0f18', '#1a2030'); ctx.save(); ctx.strokeStyle = 'rgba(80,140,255,.25)'; ctx.lineWidth = 2; for (let i = 0; i < 16; i++) { const y = 1500 + i * i * 2.4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 50, 1500); ctx.lineTo(W / 2 + i * 160, H); ctx.stroke(); } ctx.restore();
  const Q = heroPose(t), shift = (p, dx) => [p[0] + dx - HERO_X + 300, p[1] - 80], segs = Q2 => [[Q2.hip, Q2.sh], ...Q2.legs.flatMap(l => [[Q2.hip, add(Q2.hip, l.knee)], [add(Q2.hip, l.knee), add(Q2.hip, l.ankle)]]), ...Q2.arms.flatMap(a => [[Q2.shoulder, a.el], [a.el, a.hand]])];
  [-20, 470].forEach((dx, side) => { segs(Q).forEach(([a, b]) => { const A = shift(a, dx), B = shift(b, dx); ctx.save(); ctx.strokeStyle = side ? '#8fa8d8' : '#14161c'; ctx.lineCap = 'round'; ctx.lineWidth = side ? 40 : 46; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.stroke();
    if (side) { ctx.strokeStyle = 'rgba(200,220,255,.5)'; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = '#f0f0f0'; [A, B].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, TAU); ctx.fill(); }); } ctx.restore(); });
    const hd = shift(Q.head, dx); ctx.fillStyle = side ? '#8fa8d8' : '#14161c'; ctx.beginPath(); ctx.arc(hd[0], hd[1], 56, 0, TAU); ctx.fill(); if (!side) { ctx.fillStyle = '#f0f0f0'; [[-20, -40], [20, -46], [40, -10]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(hd[0] + x, hd[1] + y, 8, 0, TAU); ctx.fill(); }); } });
  text(ctx, R.face ? 'FACE + BODY CAPTURE' : 'MOTION CAPTURE', W / 2, 330, { size: 52, weight: 600, family: MONO_FONT, color: '#bfd4ff', track: 4 });
  text(ctx, 'PERFORMER   →   RIG', W / 2, 1700, { size: 40, weight: 500, family: MONO_FONT, color: '#8fa8d8' });
  if (R.face) { ctx.save(); ctx.strokeStyle = '#3ef0ff'; ctx.lineWidth = 3; ctx.strokeRect(90, 420, 300, 300); ctx.restore(); const r = rng(3); for (let i = 0; i < 40; i++) { const x = 240 + (r() - .5) * 200, y = 570 + (r() - .5) * 240 + Math.sin(t * 6 + i) * 3; ctx.fillStyle = '#3ef0ff'; ctx.fillRect(x, y, 5, 5); } }
};
SUBJECT.flock = (t) => {                    // procedural: a flock follows simple rules (cohesion around a moving target, a swirl, a little noise)
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a2a6a'); g.addColorStop(.6, '#f08a7a'); g.addColorStop(1, '#ffd08a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2a1e3a'; ctx.beginPath(); ctx.moveTo(0, 1600); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 1520 - 80 * Math.sin(x * .006) - 40 * Math.sin(x * .02)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  const r = rng(5), cx = 540 + Math.sin(t * .7) * 220, cy = 900 + Math.cos(t * .9) * 260; ctx.fillStyle = '#1a1226';
  for (let i = 0; i < 260; i++) { const a = r() * TAU, d = 40 + r() * 330, sp = .6 + r() * .8, ph = a + t * sp, x = cx + Math.cos(ph) * d * (1 + .3 * Math.sin(t + i)), y = cy + Math.sin(ph) * d * .55 + Math.sin(i + t * 3) * 10, flap = Math.sin(t * 14 + i) * 6;
    ctx.beginPath(); ctx.moveTo(x - 10, y - flap); ctx.lineTo(x, y); ctx.lineTo(x + 10, y - flap); ctx.lineWidth = 3; ctx.strokeStyle = '#1a1226'; ctx.stroke(); }
};
SUBJECT.physics = (t) => {                  // physics-based: cubes fall under gravity, bounce with restitution and slide with friction
  bgFill('#1c1f2a', '#2c3040'); ctx.strokeStyle = 'rgba(255,255,255,.1)'; for (let i = 0; i < 14; i++) { const y = 1400 + i * i * 2.8; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const floor = 1400, g = 2200, cubes = [[200, 300, 0, 260, '#d84a3a', .62], [480, 150, .4, 160, '#3a6ad8', .5], [760, 420, .9, 120, '#e8e8e8', .7]];
  cubes.forEach(([x0, y0, t0, vx, c, e]) => { let tt = Math.max(0, t - t0), y = y0, vy = 0, x = x0, rot = 0, tl = tt; const dt = 1 / 120; for (let s = 0; s < tl / dt; s++) { vy += g * dt; y += vy * dt; x += vx * dt; rot += vx * dt * .01; if (y > floor - 60) { y = floor - 60; vy = -vy * e; vx *= .82; } }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = c; ctx.fillRect(-60, -60, 120, 120); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-60, -60, 120, 22); ctx.restore(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, floor + 4, 70, 12, 0, 0, TAU); ctx.fill(); });
  text(ctx, 'g = 9.8 m/s²', 120, 330, { size: 48, weight: 500, family: MONO_FONT, color: '#ffffff', align: 'left' }); text(ctx, 'mass · friction · bounce', 120, 400, { size: 40, weight: 500, family: MONO_FONT, color: '#a8b0c8', align: 'left' });
};
SUBJECT.morph = (t) => {                    // morph: a head silhouette smoothly turns into a wolf's by interpolating matched outline points
  bgFill('#141a3a', '#2a2050'); const N = 80, A = [], B = [];
  for (let i = 0; i < N; i++) { const a = i / N * TAU; A.push([Math.cos(a) * (230 + 20 * Math.sin(a * 5)), Math.sin(a) * 270 - (Math.sin(a) < -.6 ? 40 * Math.sin(a * 12) : 0)]);
    const ear = (Math.abs(a - 4.2) < .25 || Math.abs(a - 5.2) < .25) ? 170 : 0, snout = Math.abs(a - .2) < .6 ? 160 * Math.cos((a - .2) * 2.6) : 0; B.push([Math.cos(a) * (210 + snout), Math.sin(a) * (230 + ear)]); }
  const k = tween(t, 1, 4.5, ease.inOut), P = A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)]);
  ctx.save(); ctx.translate(540, 980); const col = mix('#f2c8a0', '#9a9aa8', k); ctx.fillStyle = col; ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#20140e'; ctx.beginPath(); ctx.ellipse(lerp(90, 120, k), -30, 16, lerp(22, 12, k), 0, 0, TAU); ctx.fill(); ctx.restore();
  for (let i = 0; i < 5; i++) { const kk = i / 4; ctx.save(); ctx.globalAlpha = .6; ctx.translate(140 + i * 200, 1560); ctx.scale(.25, .25); ctx.fillStyle = mix('#f2c8a0', '#9a9aa8', kk); ctx.beginPath(); A.forEach((p, j) => { const q = [lerp(p[0], B[j][0], kk), lerp(p[1], B[j][1], kk)]; j ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.fill(); ctx.restore(); }
};
SUBJECT.particles = (t) => {                // particles: a swirl of sparks gathers into the hero's silhouette, then streams away
  bgFill('#0a0a1e', '#1a1040'); const src = tmpCanvas('pt', 216, 384), g = src.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, 216, 384); g.scale(.2, .2); hero(.3).shapes.forEach(s => { g.fill(pathOf(s.pts)); }); g.setTransform(1, 0, 0, 1, 0, 0);
  const d = g.getImageData(0, 0, 216, 384).data, pts = []; for (let y = 0; y < 384; y += 2) for (let x = 0; x < 216; x += 2) if (d[(y * 216 + x) * 4 + 3] > 100) pts.push([x * 5, y * 5]);
  const k = tween(t, .3, 2.6, ease.inOut) * (1 - tween(t, 4.3, 5.8, ease.in)), r = rng(2); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  pts.forEach(([x, y], i) => { const a = r() * TAU + t * (1 + r()), rr = 300 + r() * 500, sx = 540 + Math.cos(a) * rr, sy = 960 + Math.sin(a) * rr * .8, px = lerp(sx, x, k) + (t > 4.3 ? (t - 4.3) * 300 * r() : 0), py = lerp(sy, y, k);
    ctx.fillStyle = `hsla(${30 + r() * 30},100%,${55 + r() * 30}%,.8)`; ctx.fillRect(px, py, 4, 4); }); ctx.restore(); POST.bloom(t, .5);
};
SUBJECT.wave = (t) => {                     // fluid: a breaking wave built from layered sine surfaces with foam and spray
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f4a86a'); g.addColorStop(.45, '#f8d8a8'); g.addColorStop(.46, '#2a6aa0'); g.addColorStop(1, '#0c2a48'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let L = 0; L < 5; L++) { const base = 900 + L * 170, amp = 30 + L * 12; ctx.fillStyle = mix('#3a8ac0', '#0e3a60', L / 4); ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 12) { const y = base + Math.sin(x * .008 + t * (1.2 + L * .3) + L) * amp + Math.sin(x * .021 - t * 2) * amp * .3; ctx.lineTo(x, y); } ctx.lineTo(W, H); ctx.fill(); }
  const k = tween(t, .5, 4.5, ease.inOut), cx = lerp(1200, 300, k); ctx.save(); ctx.fillStyle = '#2f80b8'; ctx.beginPath(); ctx.moveTo(cx + 500, 1500); ctx.quadraticCurveTo(cx + 200, 700, cx - 100, 760); ctx.quadraticCurveTo(cx - 260, 790, cx - 200, 900); ctx.quadraticCurveTo(cx - 120, 840, cx - 40, 900); ctx.quadraticCurveTo(cx + 60, 1200, cx + 500, 1500); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + 200, 840); ctx.quadraticCurveTo(cx - 100, 740, cx - 220, 880); ctx.stroke(); ctx.restore();
  const r = rng(Math.floor(t * 15)); for (let i = 0; i < 70; i++) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(cx - 200 + r() * 260, 760 + r() * 160, 3 + r() * 7, 0, TAU); ctx.fill(); }
};
SUBJECT.gears = (t) => {                    // mechanical: meshing gears turn at matched speeds and drive a piston through a crank
  bgFill('#1e232b', '#2a3038'); const gear = (x, y, r, teeth, a, c) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = c; ctx.beginPath(); for (let i = 0; i < teeth * 2; i++) { const rr = i % 2 ? r : r + 26, aa = i / (teeth * 2) * TAU; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(c, -.35); ctx.beginPath(); ctx.arc(0, 0, r * .35, 0, TAU); ctx.fill(); ctx.strokeStyle = shade(c, .3); ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { ctx.rotate(TAU / 5); ctx.beginPath(); ctx.moveTo(r * .4, 0); ctx.lineTo(r * .8, 0); ctx.stroke(); } ctx.restore(); };
  const w = t * 1.4; gear(360, 760, 180, 16, w, '#c8a040'); gear(360 + 180 + 26 + 110, 760, 110, 10, -w * 16 / 10 + .16, '#9aa4b0'); gear(360, 760 + 180 + 26 + 90, 90, 8, -w * 16 / 8 + .2, '#b07a40');
  const crank = [690 + Math.cos(-w * 1.6) * 70, 760 + Math.sin(-w * 1.6) * 70], py = crank[1] + 380; ctx.save(); ctx.strokeStyle = '#d0d4da'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...crank); ctx.lineTo(690, py); ctx.stroke(); ctx.restore();
  ctx.fillStyle = '#5a6068'; ctx.fillRect(610, 1060, 160, 520); ctx.fillStyle = '#c8ccd2'; ctx.fillRect(624, py - 30, 132, 110); ctx.fillStyle = '#888e96'; for (let i = 0; i < 3; i++) ctx.fillRect(624, py - 20 + i * 18, 132, 6);
  text(ctx, R.headline || 'GEAR TRAIN · CRANK · PISTON', W / 2, 330, { size: 44, weight: 500, family: MONO_FONT, color: '#d0d4da', track: 2 });
};
SUBJECT.architecture = (t) => {             // architectural: a dusk camera dolly past a glass house with warm interior light and a pool
  const k = tween(t, 0, 6, ease.inOut), cam = k * 260; bgFill('#5a7ab0', '#f2c49a'); ctx.save(); ctx.translate(-cam, 0);
  ctx.fillStyle = '#3a4a66'; for (let i = 0; i < 8; i++) ctx.fillRect(i * 220 - 40, 820 - (i % 3) * 120, 160, 700); ctx.fillStyle = 'rgba(255,220,150,.5)'; for (let i = 0; i < 60; i++) ctx.fillRect((i * 37) % 1700, 860 + (i * 53) % 500, 10, 14);
  ctx.fillStyle = '#4a7a4a'; ctx.fillRect(-100, 1380, 1700, 600); ctx.fillStyle = '#e8e4dc'; ctx.fillRect(150, 1010, 900, 40); ctx.fillRect(220, 1050, 760, 300);
  const glass = ctx.createLinearGradient(0, 1050, 0, 1350); glass.addColorStop(0, '#ffd890'); glass.addColorStop(1, '#f0a050'); ctx.fillStyle = glass; ctx.fillRect(250, 1070, 700, 260); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 6; for (let x = 250; x <= 950; x += 140) { ctx.beginPath(); ctx.moveTo(x, 1070); ctx.lineTo(x, 1330); ctx.stroke(); }
  ctx.fillStyle = '#3a8ac8'; ctx.fillRect(300, 1400, 640, 120); ctx.fillStyle = 'rgba(255,220,150,.35)'; ctx.fillRect(300, 1400, 640, 30); ctx.fillStyle = '#e8a0b8'; [[1150, 1250], [100, 1290]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 110, 0, TAU); ctx.fill(); }); ctx.restore();
  text(ctx, R.headline || 'GLASS HOUSE · CONCEPT', W / 2, 330, { size: 52, weight: 600, color: '#ffffff', track: 4 });
};
SUBJECT.heart = (t) => {                    // medical: a stylised heart beats and blood cells flow through the vessels, with labels
  bgFill('#0b1a33', '#102a4a'); const beat = Math.pow(Math.abs(Math.sin(t * PI * 1.2)), 6), s = 1 + beat * .07;
  ctx.save(); ctx.strokeStyle = '#c8303a'; ctx.lineWidth = 34; ctx.lineCap = 'round'; [[[540, 820], [540, 380]], [[470, 900], [200, 1500]], [[610, 900], [880, 1500]]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); });
  ctx.strokeStyle = '#3a6ad8'; ctx.lineWidth = 26; [[[420, 760], [160, 420]], [[660, 760], [920, 420]]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }); ctx.restore();
  [[[540, 820], [540, 380]], [[470, 900], [200, 1500]], [[610, 900], [880, 1500]]].forEach(([a, b], j) => { for (let i = 0; i < 6; i++) { const u = ((t * .6 + i / 6 + j * .3) % 1), p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; ctx.fillStyle = '#ff6a6a'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 12, 8, 0, 0, TAU); ctx.fill(); } });
  ctx.save(); ctx.translate(540, 960); ctx.scale(s, s); const g = ctx.createRadialGradient(-60, -60, 20, 0, 0, 260); g.addColorStop(0, '#ff7a7a'); g.addColorStop(1, '#a01a2a'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 220); ctx.bezierCurveTo(-320, 20, -200, -230, 0, -110); ctx.bezierCurveTo(200, -230, 320, 20, 0, 220); ctx.fill(); ctx.restore();
  text(ctx, 'Aorta', 600, 470, { size: 40, weight: 600, color: '#ffd0d0', align: 'left' }); text(ctx, 'Veins', 110, 400, { size: 40, weight: 600, color: '#c0d0ff', align: 'left' });
  ctx.save(); ctx.strokeStyle = '#4ae08a'; ctx.lineWidth = 4; ctx.beginPath(); for (let x = 100; x <= 980; x += 6) { const ph = (x / 300 - t * 1.2) % 1, y = 1680 - (ph > .45 && ph < .5 ? 120 : ph > .5 && ph < .53 ? -50 : 0); x === 100 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.restore();
  text(ctx, R.note || 'SIMPLIFIED, NOT MEDICAL ADVICE', W / 2, 300, { size: 40, weight: 600, color: '#8fa8d8', track: 2 });
};
SUBJECT.science = (t) => {                  // scientific: a bar magnet's field lines draw in and a compass needle follows them
  bgFill('#0b0e22', '#1a1440'); const r = rng(9); for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(255,255,255,${r() * .6})`; ctx.fillRect(r() * W, r() * H, 2, 2); }
  ctx.save(); ctx.translate(540, 1000); ctx.strokeStyle = '#5aa8ff'; ctx.lineWidth = 3; const k = tween(t, .3, 3);
  for (let i = 1; i <= 7; i++) { const a = i * 70; ctx.globalAlpha = .9 - i * .08; [1, -1].forEach(sg => { ctx.beginPath(); for (let u = 0; u <= k * PI; u += .05) { const x = Math.sin(u) * a * 1.4 * sg, y = -Math.cos(u) * (160 + a * .6); u === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }); }
  ctx.globalAlpha = 1; ctx.fillStyle = '#e8403a'; ctx.fillRect(-60, -160, 120, 160); ctx.fillStyle = '#3a6ad8'; ctx.fillRect(-60, 0, 120, 160); text(ctx, 'N', 0, -60, { size: 64, weight: 800, color: '#fff' }); text(ctx, 'S', 0, 100, { size: 64, weight: 800, color: '#fff' });
  const ca = t * .8, cp = [Math.cos(ca) * 330, Math.sin(ca) * 380], needle = Math.atan2(-cp[1], -cp[0]) + (cp[1] < 0 ? PI : 0); ctx.translate(cp[0], cp[1]); ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.fill(); ctx.rotate(needle); ctx.fillStyle = '#e8403a'; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.fill(); ctx.fillStyle = '#3a6ad8'; ctx.beginPath(); ctx.moveTo(0, 38); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.fill(); ctx.restore();
  text(ctx, R.headline || 'MAGNETIC FIELD', W / 2, 330, { size: 60, weight: 700, family: BOLD, color: '#dfe8ff', track: 4 });
};
SUBJECT.vr = (t) => {                       // VR: the scene seen as a headset's two lens views (stereo, slight offset, lens vignette)
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const src = sceneTo('vr', t);
  [[30, -14], [560, 14]].forEach(([x, off]) => { ctx.save(); ctx.beginPath(); ctx.ellipse(x + 245, 960, 245, 360, 0, 0, TAU); ctx.clip(); ctx.drawImage(src, 180 + off, 500, 720, 1060, x, 600, 490, 720);
    const v = ctx.createRadialGradient(x + 245, 960, 150, x + 245, 960, 370); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.85)'); ctx.fillStyle = v; ctx.fillRect(x, 600, 490, 720); ctx.restore(); });
  text(ctx, 'VR · LEFT EYE / RIGHT EYE', W / 2, 330, { size: 44, weight: 500, family: MONO_FONT, color: '#bfd4ff', track: 2 }); text(ctx, 'Simulated headset view', W / 2, 1690, { size: 40, weight: 500, color: '#8a94b0' });
};
SUBJECT.ar = (t) => {                       // AR: a phone held over a desk; the hero appears on the table through the screen, on a tracked ring
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#d8d0c4'); g.addColorStop(1, '#8a7a68'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#6a5442'; ctx.fillRect(0, 1250, W, 700); ctx.fillStyle = '#f2ece2'; ctx.fillRect(760, 1050, 160, 220); ctx.fillStyle = '#4a7a4a'; ctx.beginPath(); ctx.arc(840, 1000, 90, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(540, 980); ctx.rotate(-.04); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(-300, -560, 600, 1120, 60); ctx.fill(); ctx.beginPath(); ctx.roundRect(-280, -540, 560, 1080, 44); ctx.clip();
  ctx.fillStyle = '#9a8a76'; ctx.fillRect(-280, -540, 560, 1080); ctx.fillStyle = '#5a4636'; ctx.fillRect(-280, 140, 560, 400);
  const k = tween(t, .5, 1.5); ctx.strokeStyle = `rgba(80,220,255,${k})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 330, 200 * k, 50 * k, 0, 0, TAU); ctx.stroke();
  if (t > 1.2) { ctx.save(); ctx.translate(0, 330); ctx.scale(.42 * tween(t, 1.2, 1.8, ease.back), .42 * tween(t, 1.2, 1.8, ease.back)); ctx.translate(-HERO_X, -GROUND); const sc = hero(t); sc.shapes.forEach(s => { ctx.fillStyle = colorOf(s.mat, s.col); ctx.fill(pathOf(s.pts)); ctx.strokeStyle = '#2a2026'; ctx.lineWidth = 4; ctx.stroke(pathOf(s.pts)); }); ctx.restore(); }
  ctx.restore(); text(ctx, 'AR · PLACED ON THE TABLE', W / 2, 330, { size: 44, weight: 600, family: MONO_FONT, color: '#2a2026', track: 2 });
};
SUBJECT.realtime = (t) => {                 // real-time: the scene inside an engine editor with a hierarchy, gizmo and live FPS counter
  ctx.fillStyle = '#23262e'; ctx.fillRect(0, 0, W, H); const src = sceneTo('rt', t); ctx.drawImage(src, 100, 380, 880, 1300, 60, 420, 960, 1040);
  ctx.strokeStyle = '#4a90ff'; ctx.lineWidth = 3; ctx.strokeRect(60, 420, 960, 1040); const hd = [60 + (HERO_X - 100) * 960 / 880, 420 + (1150 - 380) * 1040 / 1300];
  ctx.save(); ctx.lineWidth = 6; [['#e84a4a', [90, 0]], ['#4ae06a', [0, -90]], ['#4a7aff', [-55, 55]]].forEach(([c, d]) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(...hd); ctx.lineTo(hd[0] + d[0], hd[1] + d[1]); ctx.stroke(); }); ctx.restore();
  ctx.fillStyle = '#1a1c22'; ctx.fillRect(60, 220, 960, 180); ['Scene', ' ├ Hero (Animator)', ' ├ Castle', ' └ Light'].forEach((s, i) => text(ctx, s, 80, 262 + i * 40, { size: 32, min: 30, weight: 500, family: MONO_FONT, color: '#c8ccd8', align: 'left', maxW: 600 }));
  const fps = 58 + Math.round(4 * Math.sin(t * 7)); text(ctx, `FPS ${fps}`, 990, 300, { size: 48, weight: 700, family: MONO_FONT, color: '#4ae06a', align: 'right' });
  ['☑ Animation', '☑ Physics', '☑ IK'].forEach((s, i) => text(ctx, s, 80 + i * 320, 1540, { size: 40, weight: 500, family: MONO_FONT, color: '#c8ccd8', align: 'left', maxW: 300 }));
};
SUBJECT.projection = (t) => {               // projection mapping: animated light mapped onto a building facade at night, edges and windows respected
  ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, W, H); const fac = [[140, 1560], [140, 760], [300, 620], [540, 420], [780, 620], [940, 760], [940, 1560]];
  ctx.fillStyle = '#20222c'; ctx.beginPath(); fac.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.beginPath(); fac.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) { ctx.fillStyle = `hsla(${(i * 26 + t * 70) % 360},90%,55%,.55)`; const y = 400 + ((i * 90 + t * 160) % 1200); ctx.fillRect(140, y, 800, 60); }
  const wx = lerp(100, 980, (t / 6) % 1); ctx.fillStyle = 'rgba(80,180,255,.9)'; ctx.beginPath(); ctx.ellipse(wx, 1100, 220, 80, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(wx - 210, 1100); ctx.lineTo(wx - 330, 1030); ctx.lineTo(wx - 320, 1170); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#05060c'; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { ctx.beginPath(); ctx.roundRect(210 + c * 190, 820 + r * 180, 90, 120, [45, 45, 0, 0]); ctx.fill(); }
  ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.roundRect(470, 1380, 140, 180, [70, 70, 0, 0]); ctx.fill(); ctx.fillStyle = '#0d0e16'; ctx.fillRect(0, 1560, W, 360);
  const r = rng(4); ctx.fillStyle = '#000'; for (let i = 0; i < 30; i++) { const x = r() * W, h = 70 + r() * 40; ctx.beginPath(); ctx.arc(x, 1700 - h, 22, 0, TAU); ctx.fill(); ctx.fillRect(x - 26, 1700 - h + 16, 52, h + 100); }
};
