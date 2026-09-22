// Records the cup flight while scrolling like a person: slow down, pause,
// fast down, reverse up, then slow to the landing. Output: shots/rec-<w>.webm
// node tools/record.mjs [w] [h] [debug]
import { chromium } from 'playwright';
import fs from 'node:fs';
const [w = '1440', h = '900', debug = ''] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, recordVideo: { dir: 'shots/rec-tmp', size: { width: +w, height: +h } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto('http://localhost:3970/' + (debug ? '?flight-debug' : ''), { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.mouse.move(+w / 2, +h / 2);
const s1 = await p.evaluate(() => {
  const el = document.querySelector('[data-cup-anchor="brand"]').getBoundingClientRect();
  return el.top + scrollY + el.height / 2 - innerHeight / 2;
});
const wheel = async (total, step, delay) => {
  const n = Math.ceil(Math.abs(total) / step);
  for (let i = 0; i < n; i++) {
    await p.mouse.wheel(0, Math.sign(total) * step);
    await p.waitForTimeout(delay);
  }
};
// slow through the first half
await wheel(s1 * 0.5, 20, 30);
await p.waitForTimeout(900); // stop midway
await wheel(-s1 * 0.3, 60, 16); // quick reverse
await p.waitForTimeout(700);
await wheel(s1 * 0.3, 120, 16); // fast forward again
await wheel(s1 * 0.5 + 40, 18, 30); // slow into the landing
await p.waitForTimeout(1500);
await wheel(500, 40, 20); // it should ride away with its section
await p.waitForTimeout(600);
await wheel(-500, 40, 20);
await p.waitForTimeout(1000);
const video = p.video();
await ctx.close();
const src = await video.path();
fs.renameSync(src, `shots/rec-${w}${debug ? '-debug' : ''}.webm`);
console.log('s1', Math.round(s1), errors.length ? errors : 'no errors');
await b.close();
