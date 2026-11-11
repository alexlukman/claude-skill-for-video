// node render.mjs <workdir> stills 1,2.5,4 <outdir>     -> PNG stills
// node render.mjs <workdir> video <out.mp4>             -> the whole video (no audio)
// Playwright comes from ../../kit/node_modules. Set CHROME=/path/to/chrome to use an installed Chrome instead of Playwright's Chromium.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../kit');
const { chromium } = createRequire(path.join(KIT, 'package.json'))('playwright');
const [work, mode, a, b] = process.argv.slice(2);
const browser = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}) });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => { console.error('[page error]', e.message); process.exitCode = 1; });
await page.goto('file://' + path.resolve(work, 'index.html'));
await page.waitForFunction(() => window.ready === true);
const grab = () => page.evaluate(() => document.getElementById('c').toDataURL('image/png').split(',')[1]);
if (mode === 'stills') {
  fs.mkdirSync(b, { recursive: true });
  for (const t of a.split(',').map(Number)) {
    await page.evaluate(t => window.renderAt(t), t);
    fs.writeFileSync(path.join(b, `t_${t.toFixed(2)}.png`), Buffer.from(await grab(), 'base64'));
  }
} else {
  const total = await page.evaluate(() => window.TOTAL), fps = await page.evaluate(() => window.FPS), n = Math.floor(total * fps);
  const tmp = a + '.part.mp4';
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < n; f++) {
    await page.evaluate(t => window.renderAt(t), f / fps);
    const buf = Buffer.from(await grab(), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 90 === 0) console.log(`frame ${f}/${n}`);
  }
  ff.stdin.end(); const code = await new Promise(r => ff.on('close', r));
  if (code !== 0) { console.error('ffmpeg failed'); process.exit(1); }
  fs.renameSync(tmp, a);
}
await browser.close();
