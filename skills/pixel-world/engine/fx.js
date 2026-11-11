// FX: pixel effects from pixelfx (MIT, see pixelfx.bundle.js), driven by time so any frame can be rendered alone.
// A scene's "fx" list: { "type": "fire/campfire", "x": 120, "at": 0.5, "y": 0, "front": false, "palette": [...], "flip": false, ... }
// Effects are stepped at 1/30 s; an instance is kept between frames and replayed from the start if time goes backwards.
const PFX = window.PIXELFX;
const FX_DT = 1 / 30;
const fxCache = new Map();
const fxFrames = {};
function fxModule(type) {
  const m = PFX.ALL.effects[type];
  if (!m) throw new Error(`fx: unknown effect "${type}". See the list in SKILL.md`);
  return m;
}
function fxInstance(key, f, lt) {
  const steps = Math.floor((lt - (f.at ?? 0)) / FX_DT + 1e-6);
  if (steps < 0) return null;
  let c = fxCache.get(key);
  if (!c || c.steps > steps) {
    const { type, x, y, at, front, until, ...opts } = f;
    c = { inst: PFX.createFx(fxModule(type), { seed: 7, ...opts, x: 0, y: 0 }), steps: 0 };
    fxCache.set(key, c);
  }
  while (c.steps < steps) { c.inst.update(FX_DT); c.steps++; }
  return c;
}
function fxFrame(Lw, Lh) {
  const k = Lw + 'x' + Lh;
  return fxFrames[k] ||= (() => {
    const cv = document.createElement('canvas'); cv.width = Lw; cv.height = Lh;
    const g = cv.getContext('2d');
    return { frame: PFX.createFrame(Lw, Lh, 0, 0), cv, g, img: g.createImageData(Lw, Lh) };
  })();
}
// layer: 'back' (behind actors) or 'front'
function drawFx(g, sc, si, lt, camX, gy, Lw, Lh, layer) {
  const list = sc.fx || []; if (!list.length) return;
  const F = fxFrame(Lw, Lh); PFX.clearFrame(F.frame); let any = false;
  list.forEach((f, j) => {
    if (lt < (f.at ?? 0) || (f.until != null && lt > f.until)) return;
    const c = fxInstance(si + ':' + j, f, lt); if (!c || (c.inst.done && c.inst.done())) return;
    c.inst.options.x = Math.round(f.x - camX); c.inst.options.y = gy + Math.round(f.y ?? 0);
    if (f.front) { if (layer === 'front') c.inst.draw(F.frame); else return; }
    else c.inst.draw(F.frame, layer);
    any = true;
  });
  if (!any) return;
  PFX.composite(F.frame, F.img.data, null);
  F.g.putImageData(F.img, 0, 0); g.drawImage(F.cv, 0, 0);
}
window.drawFx = drawFx;
