// /styles world: one original scene shared by every style. A youth with a red scarf runs to the right past a
// castle on a cliff; the landscape scrolls behind him in layers (parallax). Everything is a list of shapes,
// each with a material name ("skin", "scarf", "hill", ...) and a layer, so each style can redraw the same scene.
const PI = Math.PI, TAU = PI * 2;
const R = Object.assign({}, SPEC.recipe || {});                 // the resolved style recipe (catalog.json + spec overrides, from build.py)
const GROUND = 1560;                                           // where the hero's feet land
const HERO_X = 440;
const circ = (c, r, n = 24) => Array.from({ length: n }, (_, i) => [c[0] + Math.cos(i / n * TAU) * r, c[1] + Math.sin(i / n * TAU) * r]);
const ell = (c, rx, ry, n = 28, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [c[0] + x * Math.cos(rot) - y * Math.sin(rot), c[1] + x * Math.sin(rot) + y * Math.cos(rot)]; });
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function capsule(a, b, r1, r2 = r1) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), p = [];
  for (let i = 0; i <= 8; i++) { const t = ang + PI / 2 + i / 8 * PI; p.push([a[0] + Math.cos(t) * r1, a[1] + Math.sin(t) * r1]); }
  for (let i = 0; i <= 8; i++) { const t = ang - PI / 2 + i / 8 * PI; p.push([b[0] + Math.cos(t) * r2, b[1] + Math.sin(t) * r2]); }
  return p;
}
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const dirA = a => [Math.sin(a), Math.cos(a)];                  // angle from straight down, positive = forward (right)
// ---------------------------------------------------------------- landscape
function ridgePts(seed, base, amp, x0, x1, n = 40) {
  const r = rng(seed), f = [r() * 6, r() * 6, r() * 6], p = [[x0, H + 400]];
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u); p.push([x, base - amp * (.5 * Math.sin(u * 5 + f[0]) + .3 * Math.sin(u * 11 + f[1]) + .2 * Math.sin(u * 23 + f[2]))]); }
  p.push([x1, H + 400]); return p;
}
function landscape(t, cam) {
  const S = [], P = (mat, pts, layer, par, extra) => S.push({ mat, pts, layer, par, ...extra });
  const sc = x => x;                                            // hook for camera zoom (applied later)
  P('sky', rect(-200, -200, W + 400, GROUND + 400), 'sky', 0);
  P('sun', circ([820, 470], 70, 32), 'sky', .02, { glow: 1 });
  // clouds drift slowly
  const cr = rng(11);
  for (let i = 0; i < 6; i++) {
    const x = ((cr() * 1500 - cam * .06 - t * 8) % 1500 + 1500) % 1500 - 210, y = 300 + cr() * 330, s = .7 + cr() * .7;
    [[0, 0, 70], [60, -25, 55], [115, 5, 60], [-55, 10, 48]].forEach(([dx, dy, rr]) => P('cloud', circ([x + dx * s, y + dy * s], rr * s, 20), 'sky', .06, { cloud: i }));
  }
  P('mtn', ridgePts(3, 980, 140, -200, W + 200), 'far', .1, { dx: -cam * .1 % 400 });
  // the castle on its cliff (moves slowly, never loops)
  const cx = 800 - cam * .16, cb = 1060;
  P('rock', [[cx - 260, H], [cx - 210, cb + 40], [cx - 150, cb - 30], [cx - 60, cb - 60], [cx + 90, cb - 70], [cx + 190, cb - 20], [cx + 260, cb + 60], [cx + 320, H]], 'far', .16, { cliff: 1 });
  const tower = (x, y, w, h, roof) => { P('stone', rect(x, y - h, w, h), 'far', .16); P('roof', [[x - 8, y - h], [x + w / 2, y - h - roof], [x + w + 8, y - h]], 'far', .16);
    P('window', rect(x + w / 2 - 6, y - h * .6, 12, 22), 'far', .16, { lit: 1 }); };
  P('stone', rect(cx - 120, cb - 150, 240, 100), 'far', .16);
  for (let i = 0; i < 6; i++) P('stone', rect(cx - 120 + i * 44, cb - 168, 26, 20), 'far', .16);
  tower(cx - 150, cb - 60, 56, 200, 80); tower(cx + 100, cb - 60, 52, 170, 70); tower(cx - 30, cb - 140, 70, 230, 120);
  P('flag', [[cx + 5, cb - 490], [cx + 55, cb - 478], [cx + 5, cb - 466]], 'far', .16, { flag: 1 });
  // rolling hills and trees
  const hd = -(cam * .35) % 900;
  P('hill', ridgePts(7, 1260, 70, -200 + hd, W + 1100 + hd, 60), 'mid', .35);
  const tr = rng(21);
  for (let i = 0; i < 14; i++) {
    const per = 1600, x = ((tr() * per - cam * .55) % per + per) % per - 150, y = 1290 + tr() * 140, s = .7 + tr() * .6;
    P('trunk', rect(x - 9 * s, y - 70 * s, 18 * s, 75 * s), 'mid', .55);
    [[0, -110, 62], [-40, -80, 46], [40, -78, 48], [0, -150, 42]].forEach(([dx, dy, rr]) => P('leaf', circ([x + dx * s, y + dy * s], rr * s, 18), 'mid', .55, { tree: i }));
  }
  // ground, path and flowers
  P('grass', rect(-200, 1380, W + 400, H), 'ground', 1);
  P('path', [[-200, GROUND - 40], [W + 200, GROUND - 60], [W + 200, GROUND + 80], [-200, GROUND + 70]], 'ground', 1);
  const fr = rng(31);
  for (let i = 0; i < 46; i++) { const per = 1400, x = ((fr() * per - cam) % per + per) % per - 150, y = 1400 + fr() * 420; if (Math.abs(y - GROUND) < 70) continue;
    P(fr() > .5 ? 'flower' : 'flower2', circ([x, y], 7 + fr() * 5, 8), 'ground', 1); }
  return S;
}
function foreground(t, cam) {
  const S = [], fr = rng(41);
  for (let i = 0; i < 10; i++) { const per = 1500, x = ((fr() * per - cam * 1.4) % per + per) % per - 150, y = 1840 + fr() * 60, h = 90 + fr() * 70;
    S.push({ mat: 'tuft', pts: [[x - 30, y], [x - 12, y - h], [x, y - 30], [x + 14, y - h * .9], [x + 30, y]], layer: 'fg', par: 1.4 }); }
  return S;
}
// ---------------------------------------------------------------- the hero
// pose(t) gives joint positions for a run (or walk) cycle; shapes() turns them into material shapes.
function heroPose(t) {
  const gait = R.gait || 'run', cyc = gait === 'walk' ? 1.0 : .62, ph = t / cyc * TAU, k = gait === 'walk' ? .55 : 1;
  const prop = R.proportions || 'normal';
  const scale = 1.4 * (prop === 'chibi' ? .82 : prop === 'tall' ? 1.06 : 1), headK = prop === 'chibi' ? 2.1 : prop === 'cartoon' ? 1.45 : prop === 'tall' ? .95 : 1.22;
  const thigh = 120 * scale * (prop === 'chibi' ? .62 : 1), shin = 118 * scale * (prop === 'chibi' ? .6 : 1);
  const leg = p => { const a = .62 * k * Math.sin(p), b = (gait === 'walk' ? .5 : 1.1) * Math.max(0, Math.sin(p + 1.9));
    const kn = dirA(a), an = dirA(a - b); return { knee: [kn[0] * thigh, kn[1] * thigh], ankle: [kn[0] * thigh + an[0] * shin, kn[1] * thigh + an[1] * shin], a: a - b }; };
  const L1 = leg(ph), L2 = leg(ph + PI), drop = Math.max(L1.ankle[1], L2.ankle[1]);
  const bob = gait === 'walk' ? 0 : Math.abs(Math.cos(ph)) * 10;
  const hip = [HERO_X, GROUND - 30 * scale - drop - bob], lean = gait === 'walk' ? .06 : .22;
  const torsoL = 172 * scale * (prop === 'chibi' ? .62 : 1), sh = add(hip, [Math.sin(lean) * torsoL, -Math.cos(lean) * torsoL]);
  const headR = 56 * scale * headK, head = add(sh, [14 + Math.sin(lean) * 30 * headK, -headR * 1.08]);
  const arm = p => { const a = -.75 * k * Math.sin(p), el = add(sh, dirA(a + .1), 95 * scale), hand = add(el, dirA(a - (gait === 'walk' ? .2 : 1.3)), 90 * scale); return { el, hand }; };
  return { ph, hip, sh, head, headR, lean, legs: [L1, L2], arms: [arm(ph + PI), arm(ph)], scale, bob, prop, t };
}
function hero(t) {
  const Q = heroPose(t), S = [], P = (mat, pts, extra) => S.push({ mat, pts, layer: 'char', par: 0, ...extra });
  const { hip, sh, head, headR, scale } = Q, tube = R.limbs === 'tube';
  const lw = tube ? 11 : 1;
  const legShapes = (L, back) => { const K = add(hip, L.knee), A = add(hip, L.ankle), m = back ? 'pants2' : 'pants';
    P(m, capsule(hip, K, tube ? lw : 30 * scale, tube ? lw : 25 * scale), { joint: K, part: 'leg' }); P(m, capsule(K, A, tube ? lw : 24 * scale, tube ? lw : 20 * scale), { part: 'leg' });
    const toe = add(A, [Math.cos(L.a * .3) * 50 * scale, Math.sin(L.a * .3) * 8]);
    P(back ? 'boot2' : 'boot', tube ? ell(add(A, [22, 6]), 34, 20) : [add(A, [-24 * scale, -14]), add(A, [26 * scale, -12]), add(toe, [12, 4]), add(toe, [10, 22]), add(A, [-26 * scale, 22])], { part: 'foot' }); return { K, A }; };
  const armShapes = (Arm, back) => { const m = back ? 'shirt2' : 'shirt';
    P(m, capsule(sh, Arm.el, tube ? lw : 24 * scale, tube ? lw : 21 * scale), { joint: Arm.el, part: 'arm' }); P(m, capsule(Arm.el, Arm.hand, tube ? lw : 20 * scale, tube ? lw : 17 * scale), { part: 'arm' });
    P(tube ? 'glove' : 'skin', circ(Arm.hand, (tube ? 26 : 17) * scale, 16), { part: 'hand', hand: 1 }); };
  // back limbs
  const backLeg = Math.sin(Q.ph) > 0 ? Q.legs[0] : Q.legs[1], frontLeg = backLeg === Q.legs[0] ? Q.legs[1] : Q.legs[0];
  armShapes(Q.arms[0], true); const BL = legShapes(backLeg, true);
  // scarf tail streams behind, waving
  const tail = [], n = 10, wave = R.scarf === 'still' ? 0 : 1;
  for (let i = 0; i <= n; i++) { const u = i / n; tail.push(add(add(sh, [-10, 26]), [-u * 300 * scale, -u * 40 + Math.sin(Q.t * 9 - u * 5) * 26 * u * wave])); }
  const tw = i => (16 - i * .7) * scale;
  P('scarf', [...tail.map((p, i) => add(p, [0, -tw(i)])), ...tail.slice().reverse().map((p, i) => add(p, [0, tw(n - i)]))], { part: 'scarf', tail: 1 });
  // torso and strap
  P('shirt', capsule(hip, sh, 46 * scale, 50 * scale), { joint: hip, part: 'torso' });
  P('belt', capsule(add(hip, [-36 * scale, -6]), add(hip, [40 * scale, -14]), 7 * scale), { part: 'torso' });
  P('strap', capsule(add(sh, [26 * scale, 6]), add(hip, [-38 * scale, 6]), 8 * scale), { part: 'torso' });
  P('bag', rect(hip[0] - 80 * scale, hip[1] - 20, 52 * scale, 60 * scale), { part: 'bag' });
  const FL = legShapes(frontLeg, false);
  // head
  P('skin', capsule(add(sh, [6, 4]), add(head, [-6, headR * .6]), 20 * scale), { part: 'neck' });
  P('skin', ell(head, headR * .92, headR, 32), { part: 'head', head: 1 });
  P('scarf', ell(add(sh, [8, 4]), 54 * scale, 28 * scale, 20, -.15), { part: 'scarf' });
  const hx = head[0], hy = head[1], hr = headR, H2 = (u, v) => [hx + u * hr, hy + v * hr];
  // hair: bangs over the forehead, spikes blown back by the wind (sways a little)
  const sway = Math.sin(Q.t * 7) * .05;
  const HAIR = R.hair === 'block' ? [[-1, -.2], [-1, -1.05], [.95, -1.05], [.95, -.25]]
    : [[1.0, -.05], [.78, -.38], [.9, -.78], [.48, -.6], [.38, -1.08], [0, -.82], [-.22, -1.28], [-.46, -.98], [-.88, -1.14], [-.82, -.72], [-1.34, -.6], [-.96, -.28], [-1.3, .08], [-.86, .22], [-.92, .62], [-.58, .42], [-.46, .06], [.06, -.34], [.62, -.12]];
  P('hair', HAIR.map(([u, v]) => H2(u - (u < 0 ? sway * -u : 0), v)), { part: 'hair', hair: 1 });
  P('ear', ell(H2(-.3, .12), .12 * hr, .17 * hr, 14), { part: 'ear' });
  P('skin', [H2(.9, .02), H2(1.06, .2), H2(.9, .26)], { part: 'nose' });
  if (R.eyes !== 'none') {
    const big = R.eyes === 'big' ? 1.35 : R.eyes === 'dot' ? .45 : 1, e = H2(.5, .02);
    if (big > .6) { P('eyewhite', ell(e, .15 * hr * big, .2 * hr * big, 18), { part: 'eye' }); P('eye', ell(add(e, [.04 * hr * big, .02 * hr]), .1 * hr * big, .16 * hr * big, 16), { part: 'eye', eye: 1 });
      P('eyewhite', circ(add(e, [.07 * hr * big, -.06 * hr * big]), .035 * hr * big, 8), { part: 'shine' }); }
    else P('eye', ell(e, .07 * hr, .09 * hr, 12), { part: 'eye', eye: 1 });
    P('brow', capsule(H2(.32, -.28 - .04 * big), H2(.66, -.24 - .04 * big), .035 * hr), { part: 'face' });
    P('mouth', ell(H2(.64, .5), .12 * hr, .09 * hr * (1 + .35 * Math.sin(Q.t * 4)), 14), { part: 'face' });
  }
  armShapes(Q.arms[1], false);
  return { shapes: S, pose: Q, joints: [sh, Q.arms[1].el, hip, FL.K, BL.K] };
}
// the whole scene for one moment: ordered back to front
function sceneAt(t) {
  const cam = (R.camera === 'still' ? 0 : t * (R.speed ?? 260));
  const land = landscape(t, cam), H0 = hero(t), fg = R.foreground === false ? [] : foreground(t, cam);
  return { shapes: [...land, ...H0.shapes, ...fg], hero: H0, cam };
}
