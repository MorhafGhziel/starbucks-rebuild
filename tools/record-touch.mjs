// Records an emulated touch phone scrolling like a thumb (flick, pause, flick
// back). Output: shots/touch.webm
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const ctx = await b.newContext({ ...devices['iPhone 13'], recordVideo: { dir: 'shots/rec-tmp', size: { width: 390, height: 844 } } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:3970/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
// a thumb flick: fast start, decelerating momentum
const flick = async (dist) => {
  const steps = 28;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const v = (1 - t) * (1 - t);
    await p.evaluate((d) => window.scrollBy(0, d), (dist * v * 3) / steps);
    await p.waitForTimeout(16);
  }
};
for (let i = 0; i < 6; i++) { await flick(420); await p.waitForTimeout(500); }
await flick(-700);
await p.waitForTimeout(600);
for (let i = 0; i < 6; i++) { await flick(450); await p.waitForTimeout(450); }
await p.waitForTimeout(1200);
const v = p.video();
await ctx.close();
fs.renameSync(await v.path(), 'shots/touch.webm');
console.log(errs.length ? errs : 'no errors');
await b.close();
