// /styles characters: every style describes its own character in its recipe as  "char": { ... }  and this file builds
// it as material shapes for one moment of a run or walk cycle. Fields (all optional):
//   build  kid | teen | adult | tall | chibi | stocky | tube (rubber hose) | block (voxel / brick / low poly)
//   head   round | oval | block | bean          skin  hex          blush, freckles  true/false
//   hair   { style: spiky | messy | short | bob | long | ponytail | twintails | curly | bun | mohawk | shaggy | bald | block, color }
//   eyes   anime | big | normal | bead | dot | pie | button | narrow | none        eyeColor  hex
//   top    { style: shirt | tank | jacket | hoodie | sailor | tunic | armor | blouse | coat | robe, color, color2, sleeves: long | short | none }
//   bottom { style: pants | shorts | skirt | dress | pinafore, color }     shoes  hex     socks  hex
//   acc    [ "scarf:#d8332e", "bow:#d82a2a", "goggles", "cape:#c0392b", "backpack:#8a5a3a", "satchel", "hat:#333", "beanie:#2a6be0",
//            "cap:#2a4ab0", "hood:#5a3a2a", "glasses", "headband:#e03030", "torch", "sword", "gloves", "wristband:#e03030", "earring" ]
//   pet    cat | dog    petColor hex           gait run | walk
const CH = Object.assign({ build: 'teen', head: 'round', skin: '#f6d2b0', hair: { style: 'spiky', color: '#6b3b24' }, eyes: R.eyes || 'normal',
  top: { style: 'shirt', color: '#f4ead2', sleeves: 'long' }, bottom: { style: 'pants', color: '#3f5a8c' }, shoes: '#5a3a22', acc: ['scarf:#d8332e', 'satchel'] }, R.char || {});
CH.hair = Object.assign({ style: 'spiky', color: '#6b3b24' }, CH.hair || {}); CH.top = Object.assign({ style: 'shirt', color: '#f4ead2', sleeves: 'long' }, CH.top || {});
CH.bottom = Object.assign({ style: 'pants', color: '#3f5a8c' }, CH.bottom || {});
const ACC = {}; (CH.acc || []).forEach(a => { const [k, v] = String(a).split(':'); ACC[k] = v || true; });
const BUILD = { kid: [1.42, .86, .8, .92], teen: [1.22, 1, 1, 1], adult: [1, 1.08, 1.12, 1.06], tall: [.92, 1.12, 1.22, .94], chibi: [2.15, .6, .55, 1.05],
  stocky: [1.1, .96, .82, 1.38], tube: [1.55, .82, .95, .62], block: [1.25, .95, .85, 1.15] }[CH.build] || [1.22, 1, 1, 1];
function hexShade(hex, k) { const n = parseInt(String(hex).slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k))); return '#' + [n >> 16, n >> 8 & 255, n & 255].map(c => f(c).toString(16).padStart(2, '0')).join(''); }
const GAIT = CH.gait || R.gait || 'run';
function heroPose(t) {
  const [headK, torK, legK, widK] = BUILD, gait = GAIT, cyc = gait === 'walk' ? 1.0 : .62, ph = t / cyc * TAU, k = gait === 'walk' ? .55 : 1, scale = 1.4;
  const thigh = 104 * scale * legK, shin = 100 * scale * legK;
  const leg = p => { const a = (gait === 'walk' ? .42 : .72) * Math.sin(p), fold = Math.max(0, Math.sin(p + 1.25)), b = gait === 'walk' ? .12 + .55 * Math.pow(fold, 2) : .22 + 1.45 * Math.pow(fold, 1.4);
    const kn = dirA(a), an = dirA(a - b); return { knee: [kn[0] * thigh, kn[1] * thigh], ankle: [kn[0] * thigh + an[0] * shin, kn[1] * thigh + an[1] * shin], a: a - b }; };
  const L1 = leg(ph), L2 = leg(ph + PI), drop = Math.max(L1.ankle[1], L2.ankle[1]);
  const bob = gait === 'walk' ? Math.abs(Math.cos(ph)) * 4 : Math.abs(Math.sin(ph)) * 16;
  const hip = [HERO_X, GROUND - 30 * scale - drop - bob], lean = gait === 'walk' ? .04 : .12;
  const torsoL = 172 * scale * torK, sh = add(hip, [Math.sin(lean) * torsoL, -Math.cos(lean) * torsoL]);
  const headR = 56 * scale * headK, head = add(sh, [14 + Math.sin(lean) * 30, -headR * 1.08]);
  const upper = 88 * scale * Math.min(1.1, legK * 1.05), fore = 80 * scale * Math.min(1.1, legK * 1.05);
  const shoulder = add(sh, [-4 * scale, 26 * scale]);
  const arm = p => { const sw = Math.sin(p), a = -(gait === 'walk' ? .5 : 1.05) * sw, bend = gait === 'walk' ? .3 + .2 * Math.max(0, -sw) : 1.35 + .6 * Math.max(0, -sw);
    const el = add(shoulder, dirA(a), upper), hand = add(el, dirA(a + bend), fore); return { el, hand }; };
  return { ph, hip, sh, shoulder, head, headR, lean, legs: [L1, L2], arms: [arm(ph + PI), arm(ph)], scale, bob, t, widK };
}
// a ribbon that streams behind an anchor in the wind (scarf, cape, long hair, ponytail)
function streamer(anchor, len, w0, w1, t, amp = 26, droop = 40, n = 10, ph = 0) {
  const c = []; for (let i = 0; i <= n; i++) { const u = i / n; c.push(add(anchor, [-u * len, -u * droop * -1 * .2 + u * u * droop + Math.sin(t * 9 - u * 5 + ph) * amp * u])); }
  const w = i => lerp(w0, w1, i / n); return [...c.map((p, i) => add(p, [0, -w(i)])), ...c.slice().reverse().map((p, i) => add(p, [0, w(n - i)]))];
}
function hero(t) {
  const Q = heroPose(t), S = [], P = (mat, col, pts, extra) => S.push({ mat, col, pts, layer: 'char', par: 0, ...extra });
  const { hip, sh, shoulder, head, headR: hr, scale, widK } = Q, block = CH.build === 'block', tube = CH.build === 'tube';
  const skin = CH.skin, top = CH.top, bot = CH.bottom, hairC = CH.hair.color, dark = c => hexShade(c, -.16);
  const limb = (a, b, r1, r2) => block ? (() => { const d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(...d), n = [-d[1] / L, d[0] / L], w = (r1 + r2) / 2; return [add(a, n, w), add(b, n, w), add(b, n, -w), add(a, n, -w)]; })() : capsule(a, b, r1, r2);
  const T = (tube ? 11 : 1), sz = v => tube ? 11 : v * scale * widK;
  const legCol = (back, upperPart) => { const c = bot.style === 'shorts' && !upperPart ? skin : (['skirt', 'dress', 'pinafore'].includes(bot.style) ? (CH.socks || skin) : bot.color); return back ? dark(c) : c; };
  const legShapes = (L, back) => { const K = add(hip, L.knee), A = add(hip, L.ankle);
    P('pants', legCol(back, true), limb(hip, K, sz(30), sz(25)), { joint: K, part: 'leg' }); P('pants', legCol(back, false), limb(K, A, sz(24), sz(20)), { part: 'leg' });
    if (CH.socks && !['skirt', 'dress', 'pinafore'].includes(bot.style)) P('pants', back ? dark(CH.socks) : CH.socks, limb(add(K, [A[0] - K[0], A[1] - K[1]], .7), A, sz(21), sz(20)), { part: 'leg' });
    const toe = add(A, [Math.cos(L.a * .3) * 50 * scale, Math.sin(L.a * .3) * 8]), shoe = back ? dark(CH.shoes) : CH.shoes;
    P('boot', shoe, tube ? ell(add(A, [24, 6]), 38, 22) : block ? rect(A[0] - 22 * scale, A[1] - 14, 70 * scale, 30) : [add(A, [-24 * scale, -14]), add(A, [26 * scale, -12]), add(toe, [12, 4]), add(toe, [10, 22]), add(A, [-26 * scale, 22])], { part: 'foot' }); return { K, A }; };
  const sleeveCol = top.sleeves === 'none' || top.style === 'tank' ? skin : top.color;
  const armShapes = (Arm, back) => { const up = top.sleeves === 'short' ? top.color : sleeveCol, lo = top.sleeves === 'long' && top.style !== 'tank' ? top.color : skin;
    P('shirt', back ? dark(up) : up, limb(shoulder, Arm.el, sz(24), sz(21)), { joint: Arm.el, part: 'arm' }); P('shirt', back ? dark(lo) : lo, limb(Arm.el, Arm.hand, sz(20), sz(17)), { part: 'arm' });
    if (ACC.wristband) P('shirt', ACC.wristband, limb(add(Arm.el, [Arm.hand[0] - Arm.el[0], Arm.hand[1] - Arm.el[1]], .72), add(Arm.el, [Arm.hand[0] - Arm.el[0], Arm.hand[1] - Arm.el[1]], .84), sz(19), sz(19)), { part: 'arm' });
    const g = ACC.gloves || tube; P(g ? 'glove' : 'skin', g ? '#ffffff' : skin, block ? rect(Arm.hand[0] - 18 * scale, Arm.hand[1] - 18 * scale, 36 * scale, 36 * scale) : circ(Arm.hand, (g ? 26 : 17) * scale * (tube ? 1 : widK), 16), { part: 'hand', hand: 1 }); };
  // pet runs beside, behind the hero
  if (CH.pet) { const pc = CH.petColor || '#1a1a22', x = HERO_X + 250, y = GROUND - 10, b = Math.abs(Math.sin(t * 14)) * 14, ph = t * 14;
    [0, 1, 2, 3].forEach(i => { const lx = x - 40 + (i % 2) * 70 + (i > 1 ? 10 : 0), sw = Math.sin(ph + i * 1.6) * 18; P('pet', i > 1 ? dark(pc) : pc, capsule([lx, y - 60 - b], [lx + sw, y], 9), { part: 'pet' }); });
    P('pet', pc, ell([x, y - 75 - b], 70, 34, 20, -.05), { part: 'pet' }); P('pet', pc, streamer([x - 64, y - 90 - b], 70, 9, 5, t, 14, -30, 6), { part: 'pet' });
    const hx = x + 70, hy = y - 118 - b; P('pet', pc, circ([hx, hy], 38, 18), { part: 'pet' });
    P('pet', pc, [[hx - 30, hy - 20], [hx - 22, hy - 64], [hx - 4, hy - 30]], { part: 'pet' }); P('pet', pc, [[hx + 2, hy - 32], [hx + 24, hy - 66], [hx + 30, hy - 20]], { part: 'pet' });
    if (CH.pet === 'cat') { P('eyewhite', '#ffffff', ell([hx + 18, hy - 2], 10, 12, 10), { part: 'pet' }); P('eye', '#1a1a1a', ell([hx + 21, hy], 5, 8, 8), { part: 'pet' }); }
    if (ACC.collar !== false) P('pet', '#d8332e', capsule([hx - 34, hy + 26], [hx + 6, hy + 34], 6), { part: 'pet' }); }
  // behind the body: cape, long hair, ponytails, scarf tail, backpack, back limbs
  if (ACC.cape) P('cape', ACC.cape === true ? '#c0392b' : ACC.cape, streamer(add(shoulder, [-6 * scale, -4]), 330 * scale * .8, 34 * scale, 90 * scale, t, 34, 260, 10), { part: 'cape' });
  const hc = (u, v) => [head[0] + u * hr, head[1] + v * hr];
  if (CH.hair.style === 'long') P('hair', hairC, streamer(hc(-.6, -.35), hr * 1.5, hr * .62, hr * .48, t, 14, hr * 2.1, 10), { part: 'hair' });
  if (CH.hair.style === 'ponytail') P('hair', hairC, streamer(hc(-.85, -.55), hr * 1.5, hr * .3, hr * .12, t, 16, hr * 1.1, 8), { part: 'hair' });
  if (CH.hair.style === 'twintails') { P('hair', dark(hairC), streamer(hc(-.75, -.3), hr * 1.0, hr * .26, hr * .1, t, 12, hr * 1.7, 8, 1), { part: 'hair' }); }
  if (ACC.scarf) P('scarf', ACC.scarf === true ? '#d8332e' : ACC.scarf, streamer(add(sh, [-10, 26]), 300 * scale * .85, 16 * scale, 9 * scale, t), { part: 'scarf', tail: 1 });
  if (ACC.backpack) P('bag', ACC.backpack === true ? '#8a5a3a' : ACC.backpack, rect(sh[0] - 100 * scale * widK, sh[1] + 10, 60 * scale, 110 * scale), { part: 'bag' });
  const backLeg = Math.sin(Q.ph) > 0 ? Q.legs[0] : Q.legs[1], frontLeg = backLeg === Q.legs[0] ? Q.legs[1] : Q.legs[0];
  armShapes(Q.arms[0], true); const BL = legShapes(backLeg, true);
  // torso: shoulders wider than the waist
  const ax = [sh[0] - hip[0], sh[1] - hip[1]], L = Math.hypot(...ax), nx = [-ax[1] / L, ax[0] / L];
  const sw = (tube ? 30 : 52) * scale * widK, ww = (tube ? 28 : 42) * scale * widK, hw = (tube ? 30 : 46) * scale * widK;
  const torso = [add(add(sh, nx, sw), ax, -.02), add(sh, nx, -sw * .9), add(add(hip, nx, -ww), ax, .45), add(hip, nx, -hw), add(add(hip, ax, -.12), nx, 0), add(hip, nx, hw), add(add(hip, nx, ww), ax, .45)];
  const topC = top.color, long = ['tunic', 'coat', 'robe'].includes(top.style);
  if (bot.style === 'dress' || bot.style === 'pinafore') { const flare = 90 * scale * widK, len = 150 * scale * BUILD[2], sway = Math.sin(Q.ph * 2) * 10;
    P('pants', bot.color, [add(hip, nx, ww * 1.05), add(hip, nx, -ww * 1.05), add(add(hip, ax, -len / L), nx, -flare + sway), add(add(hip, ax, -len / L), nx, flare + sway)], { part: 'skirt' }); }
  if (bot.style === 'skirt') { const flare = 70 * scale * widK, len = 80 * scale * BUILD[2]; P('pants', bot.color, [add(hip, nx, ww), add(hip, nx, -ww), add(add(hip, ax, -len / L), nx, -flare), add(add(hip, ax, -len / L), nx, flare)], { part: 'skirt' }); }
  if (long) { const len = (top.style === 'tunic' ? 70 : 190) * scale * BUILD[2], flare = (top.style === 'tunic' ? 60 : 85) * scale * widK, sway = Math.sin(Q.ph * 2) * 12;
    P('shirt', dark(topC), [add(hip, nx, hw), add(hip, nx, -hw), add(add(hip, ax, -len / L), nx, -flare + sway), add(add(hip, ax, -len / L), nx, flare + sway)], { part: 'coat' }); }
  P('shirt', bot.style === 'pinafore' ? (top.color2 || '#f4ead2') : topC, block ? rect(hip[0] - hw, sh[1], hw * 2, hip[1] - sh[1] + 10) : torso, { joint: hip, part: 'torso' });
  if (bot.style === 'pinafore') P('pants', bot.color, [add(add(sh, nx, sw * .55), ax, -.15), add(add(sh, nx, -sw * .55), ax, -.15), add(hip, nx, -ww * 1.02), add(hip, nx, ww * 1.02)], { part: 'torso' });
  if (top.style === 'jacket' || top.style === 'coat') { P('shirt', top.color2 || '#f4ead2', [add(sh, nx, 12 * scale), add(sh, nx, -14 * scale), add(add(hip, ax, .05), nx, -10 * scale), add(add(hip, ax, .05), nx, 16 * scale)], { part: 'torso' });
    P('shirt', dark(topC), [add(sh, nx, 22 * scale), add(sh, nx, 2 * scale), add(add(sh, ax, -.35), nx, 18 * scale)], { part: 'torso' }); }
  if (top.style === 'armor') { P('shirt', top.color2 || '#c8ccd2', ell(add(shoulder, [6, -6]), 44 * scale, 30 * scale, 16, -.2), { part: 'torso', metal: 1 }); P('belt', '#5a3a22', limb(add(hip, nx, -ww), add(hip, nx, ww), 9 * scale, 9 * scale), { part: 'torso' }); }
  if (top.style === 'sailor') { P('shirt', top.color2 || '#2a3a7a', [add(sh, nx, 40 * scale), add(sh, nx, -44 * scale), add(add(sh, ax, -.22), nx, 6 * scale)], { part: 'torso' });
    P('scarf', ACC.ribbon || '#d8332e', [add(add(sh, ax, -.2), nx, 18 * scale), add(add(sh, ax, -.38), nx, 2 * scale), add(add(sh, ax, -.2), nx, -10 * scale)], { part: 'torso' }); }
  if (top.style === 'hoodie') P('shirt', dark(topC), ell(add(sh, [-26 * scale, -4]), 40 * scale, 26 * scale, 16, .3), { part: 'torso' });
  if (ACC.satchel) { P('strap', '#7a4a2a', capsule(add(sh, [26 * scale, 6]), add(hip, [-38 * scale, 6]), 8 * scale), { part: 'torso' }); P('bag', '#9a6a3a', rect(hip[0] - 80 * scale, hip[1] - 20, 52 * scale, 60 * scale), { part: 'bag' }); }
  if (!long && !['dress', 'pinafore'].includes(bot.style)) P('belt', '#3a2a1a', limb(add(hip, nx, -ww), add(hip, nx, ww), 6 * scale, 6 * scale), { part: 'torso' });
  const FL = legShapes(frontLeg, false);
  // head
  P('skin', skin, capsule(add(sh, [6, 4]), add(head, [-6, hr * .6]), 20 * scale), { part: 'neck' });
  if (ACC.hood) P('hair', ACC.hood, ell(add(head, [-hr * .12, -hr * .02]), hr * 1.18, hr * 1.2, 30), { part: 'hood' });
  const headPts = CH.head === 'block' || block ? rect(head[0] - hr * .95, head[1] - hr, hr * 1.9, hr * 1.95) : CH.head === 'oval' ? ell(head, hr * .82, hr * 1.06, 32) : CH.head === 'bean' ? ell(head, hr * 1.02, hr * .92, 32, -.15) : ell(head, hr * .92, hr, 32);
  P('skin', skin, headPts, { part: 'head', head: 1 });
  if (ACC.scarf) P('scarf', ACC.scarf === true ? '#d8332e' : ACC.scarf, ell(add(sh, [8, 4]), 54 * scale * widK, 28 * scale, 20, -.15), { part: 'scarf' });
  if (ACC.hood) P('hair', dark(ACC.hood), [hc(-1.15, .5), hc(-1.05, -.6), hc(-.2, -1.25), hc(.75, -.95), hc(.9, -.45), hc(.35, -.75), hc(-.45, -.55), hc(-.6, .6)], { part: 'hood' });
  // hair styles in head units: (u, v) with +u toward the face
  const sway = Math.sin(t * 7) * .05, HH = (pts, c = hairC) => P('hair', c, pts.map(([u, v]) => hc(u - (u < 0 ? sway * -u : 0), v)), { part: 'hair', hair: 1 });
  const cap = [[.95, -.12], [.85, -.62], [.4, -1.0], [-.2, -1.08], [-.75, -.82], [-1.0, -.3]];
  const HAIR = {
    spiky: [[1.0, -.05], [.78, -.38], [.9, -.78], [.48, -.6], [.38, -1.08], [0, -.82], [-.22, -1.28], [-.46, -.98], [-.88, -1.14], [-.82, -.72], [-1.34, -.6], [-.96, -.28], [-1.3, .08], [-.86, .22], [-.92, .62], [-.58, .42], [-.46, .06], [.06, -.34], [.62, -.12]],
    messy: [[.98, -.1], [.95, -.55], [.6, -.95], [.1, -1.15], [-.45, -1.1], [-.95, -.75], [-1.15, -.2], [-1.0, .35], [-.75, .55], [-.6, .1], [-.3, -.25], [.2, -.32], [.55, -.18], [.75, -.35]],
    short: [...cap, [-1.0, .2], [-.72, .3], [-.55, -.1], [.0, -.42], [.6, -.3]],
    bob: [...cap, [-1.02, .3], [-.85, .78], [-.45, .78], [-.48, .2], [-.15, -.3], [.5, -.42], [.88, -.35]],
    long: [...cap, [-1.05, .2], [-.8, .4], [-.5, .1], [-.1, -.35], [.55, -.4], [.9, -.3]],
    ponytail: [...cap, [-.98, .15], [-.7, .25], [-.5, -.1], [.0, -.4], [.6, -.32]],
    twintails: [...cap, [-.98, .15], [-.7, .25], [-.5, -.1], [.0, -.4], [.6, -.32]],
    shaggy: [[1.0, -.1], [.9, -.62], [.45, -1.02], [-.2, -1.1], [-.8, -.85], [-1.1, -.3], [-1.05, .45], [-.88, .7], [-.78, .4], [-.62, .75], [-.5, .3], [-.2, -.2], [.25, -.25], [.4, .05], [.6, -.3], [.85, .0]],
    mohawk: [[.6, -.75], [.5, -1.35], [.1, -1.2], [-.1, -1.5], [-.4, -1.25], [-.6, -1.45], [-.8, -.95], [-.4, -.85], [.2, -.9]],
    block: [[-1, -.2], [-1, -1.05], [.95, -1.05], [.95, -.55], [.4, -.6], [.4, -.35], [-.5, -.35], [-.5, -.2]],
    bald: null, curly: null, bun: null,
  };
  const hs = CH.hair.style;
  if (hs === 'curly') { const r = rng(3); for (let i = 0; i < 16; i++) { const a = PI * (.95 + i / 15 * 1.15), rr = .82 + r() * .12; P('hair', i % 2 ? hairC : dark(hairC), circ(hc(Math.cos(a) * rr, Math.sin(a) * rr * .98 - .05), hr * (.26 + r() * .08), 12), { part: 'hair', hair: 1 }); } }
  else if (hs === 'bun') { P('hair', hairC, circ(hc(-.55, -.95), hr * .38, 16), { part: 'hair' }); HH(HAIR.short); }
  else if (HAIR[hs]) { if (!['block','mohawk'].includes(hs)) HH([...cap, [-1.0, .1], [-.6, .05], [0, -.4], [.7, -.35]]); HH(HAIR[hs]); }
  if (!ACC.hood) {
    if (ACC.beanie) P('hair', ACC.beanie, [hc(.9, -.35), hc(.8, -.85), hc(.2, -1.18), hc(-.5, -1.1), hc(-1.0, -.6), hc(-1.0, -.3)], { part: 'hat' });
    if (ACC.cap) { P('hair', ACC.cap, [hc(.85, -.45), hc(.6, -1.0), hc(-.2, -1.15), hc(-.9, -.8), hc(-.98, -.4)], { part: 'hat' }); P('hair', dark(ACC.cap), [hc(.6, -.5), hc(1.45, -.45), hc(1.4, -.32), hc(.6, -.36)], { part: 'hat' }); }
    if (ACC.hat) { P('hair', ACC.hat, rect(head[0] - hr * 1.3, head[1] - hr * .8, hr * 2.6, hr * .2), { part: 'hat' }); P('hair', ACC.hat, rect(head[0] - hr * .8, head[1] - hr * 1.6, hr * 1.6, hr * .85), { part: 'hat' }); }
    if (ACC.headband) P('hair', ACC.headband, [hc(.92, -.42), hc(.92, -.58), hc(-.95, -.55), hc(-.95, -.38)], { part: 'hat' });
    if (ACC.goggles) { P('hair', '#3a2a1a', [hc(.95, -.5), hc(.95, -.66), hc(-.95, -.62), hc(-.95, -.46)], { part: 'hat' }); [.25, .65].forEach(u => { P('eyewhite', '#a8c8d8', circ(hc(u, -.6), hr * .2, 14), { part: 'hat' }); }); }
    if (ACC.bow) { const bc = ACC.bow === true ? '#d82a2a' : ACC.bow, c0 = hc(-.55, -.85); P('scarf', bc, [c0, add(c0, [-hr * .55, -hr * .4]), add(c0, [-hr * .5, hr * .3])], { part: 'bow' }); P('scarf', bc, [c0, add(c0, [hr * .45, -hr * .5]), add(c0, [hr * .5, hr * .1])], { part: 'bow' }); P('scarf', dark(bc), circ(c0, hr * .13, 10), { part: 'bow' }); }
    if (ACC.ribbon && top.style !== 'sailor') P('scarf', ACC.ribbon, [hc(-.7, -.6), hc(-1.15, -.95), hc(-1.1, -.35)], { part: 'bow' });
  }
  P('ear', skin, ell(hc(-.22, .16), .15 * hr, .21 * hr, 16), { part: 'ear' }); P('ear', dark(skin), capsule(hc(-.24, .08), hc(-.2, .24), .035 * hr), { part: 'ear', noline: 1 });
  if (ACC.earring) P('eyewhite', '#f2c230', circ(hc(-.3, .34), hr * .05, 8), { part: 'ear' });
  P('skin', dark(skin), [hc(.84, .1), hc(.95, .24), hc(.82, .26)], { part: 'nose', noline: 1 });
  // eyes and mouth
  const ec = CH.eyeColor || '#3a2418', e = hc(.5, .02), ey = CH.eyes;
  if (ey === 'anime') { P('eyewhite', '#ffffff', ell(e, .19 * hr, .27 * hr, 18), { part: 'eye' }); P('eye', ec, ell(add(e, [.05 * hr, .03 * hr]), .14 * hr, .22 * hr, 16), { part: 'eye', eye: 1 });
    P('eye', '#141014', ell(add(e, [.06 * hr, .05 * hr]), .07 * hr, .12 * hr, 12), { part: 'eye' }); P('eyewhite', '#ffffff', circ(add(e, [.1 * hr, -.07 * hr]), .05 * hr, 8), { part: 'shine' });
    P('brow', '#141014', [add(e, [-.2 * hr, -.24 * hr]), add(e, [.24 * hr, -.3 * hr]), add(e, [.24 * hr, -.24 * hr]), add(e, [-.2 * hr, -.18 * hr])], { part: 'lash' }); }
  else if (ey === 'big' || ey === 'normal') { const big = ey === 'big' ? 1.35 : 1; P('eyewhite', '#ffffff', ell(e, .15 * hr * big, .2 * hr * big, 18), { part: 'eye' }); P('eye', ec, ell(add(e, [.04 * hr * big, .02 * hr]), .1 * hr * big, .16 * hr * big, 16), { part: 'eye', eye: 1 });
    P('eyewhite', '#ffffff', circ(add(e, [.07 * hr * big, -.06 * hr * big]), .035 * hr * big, 8), { part: 'shine' }); }
  else if (ey === 'bead') { P('eye', '#141014', circ(e, .1 * hr, 14), { part: 'eye', eye: 1 }); P('eyewhite', '#ffffff', circ(add(e, [.03 * hr, -.04 * hr]), .03 * hr, 6), { part: 'shine' }); }
  else if (ey === 'dot') P('eye', '#141014', ell(e, .06 * hr, .08 * hr, 12), { part: 'eye', eye: 1 });
  else if (ey === 'button') { P('eyewhite', '#ffffff', circ(add(e, [-.05 * hr, 0]), .22 * hr, 18), { part: 'eye' }); P('eye', '#141014', circ(add(e, [.04 * hr, .02 * hr]), .08 * hr, 10), { part: 'eye', eye: 1 }); }
  else if (ey === 'pie') { P('eye', '#141014', ell(e, .1 * hr, .2 * hr, 16), { part: 'eye', eye: 1 }); P('eyewhite', '#ffffff', [e, add(e, [.12 * hr, -.06 * hr]), add(e, [.12 * hr, .05 * hr])], { part: 'shine' }); }
  else if (ey === 'narrow') { P('eye', '#141014', [add(e, [-.14 * hr, 0]), add(e, [.14 * hr, -.04 * hr]), add(e, [.14 * hr, .02 * hr]), add(e, [-.14 * hr, .04 * hr])], { part: 'eye', eye: 1 }); }
  if (ey !== 'none' && ey !== 'anime') P('brow', dark(hairC), capsule(hc(.32, -.3), hc(.66, -.26), .035 * hr), { part: 'face' });
  if (ACC.glasses) { [hc(.5, .02)].forEach(c => P('glasses', '#1a1a1a', [...circ(c, .24 * hr, 16), ...circ(c, .19 * hr, 16).reverse()], { part: 'face' })); }
  if (CH.blush) P('mouth', '#f08a8a', ell(hc(.48, .3), .12 * hr, .06 * hr, 12), { part: 'blush', alpha: .5 });
  if (CH.freckles) [[.38, .22], [.48, .26], [.58, .22]].forEach(([u, v]) => P('eye', '#a0603a', circ(hc(u, v), .02 * hr, 6), { part: 'face' }));
  if (ey !== 'none') P('mouth', '#a8473a', CH.mouth === 'line' ? capsule(hc(.5, .5), hc(.72, .48), .025 * hr) : [hc(.48, .46), hc(.78, .43), hc(.72, .56 + .04 * Math.sin(Q.t * 4)), hc(.58, .6)], { part: 'face' });
  armShapes(Q.arms[1], false);
  // things held in the front hand
  const fh = Q.arms[1].hand;
  if (ACC.torch) { P('trunk', '#7a5236', capsule(fh, add(fh, [30, -120]), 9), { part: 'prop' }); const f = Math.sin(t * 20) * 8; P('sun', '#ffb020', [add(fh, [20, -110]), add(fh, [50 + f, -190]), add(fh, [42, -130]), add(fh, [60, -125])], { part: 'prop', glow: 1 }); }
  if (ACC.sword) P('stone', '#d8dce2', capsule(fh, add(fh, [190, -110]), 8, 3), { part: 'prop' });
  return { shapes: S, pose: Q, joints: [sh, Q.arms[1].el, hip, FL.K, BL.K] };
}
