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
// the hero lives in character.js (heroPose, hero)
// the whole scene for one moment: ordered back to front
function sceneAt(t) {
  const cam = (R.camera === 'still' ? 0 : t * (R.speed ?? 260));
  const land = landscape(t, cam), H0 = hero(t), fg = R.foreground === false ? [] : foreground(t, cam);
  return { shapes: [...land, ...H0.shapes, ...fg], hero: H0, cam };
}
