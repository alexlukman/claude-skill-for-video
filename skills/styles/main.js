// /styles entry: draw one frame of the chosen style at time t.
function renderAt(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let sc = null;
  if (R.subject && SUBJECT[R.subject]) SUBJECT[R.subject](quantTime(t));
  else sc = drawStyledScene(ctx, t);
  if (R.overlay && OVERLAY[R.overlay]) OVERLAY[R.overlay](quantTime(t), sc);
  applyPost(t);
  redrawLines(t, sc);
  if (SPEC.label) {                                   // the style's name, for catalogue reels and comparisons
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 150, W, 120); ctx.restore();
    text(ctx, `${SPEC.entry.n}. ${SPEC.entry.name}`, W / 2, 232, { size: 56, min: 40, weight: 800, family: BOLD, color: '#ffffff' });
  }
  if (SPEC.caption) text(ctx, SPEC.caption, W / 2, 1700, { size: 52, min: 40, weight: 800, family: BOLD, color: '#ffffff' });
}
window.renderAt = renderAt;
