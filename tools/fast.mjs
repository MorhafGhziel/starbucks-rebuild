// Fast-scroll into the landing and capture frames while the cup settles.
// node tools/fast.mjs [w] [h] [step]
import { chromium } from 'playwright';
const [w = '1440', h = '900', step = '400'] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const p = await b.newPage({ viewport: { width: +w, height: +h }, hasTouch: +w < 700, isMobile: +w < 700 });
await p.goto('http://localhost:3970/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.mouse.move(+w / 2, +h / 2);
const s1 = await p.evaluate(() => {
  const e = document.querySelector('[data-cup-anchor="brand"]').getBoundingClientRect();
  return e.top + scrollY + e.height / 2 - innerHeight / 2;
});
const n = Math.ceil(s1 / +step);
let f = 0;
for (let i = 0; i < n; i++) {
  if (+w < 700) await p.evaluate((d) => window.scrollBy(0, d), +step);
  else await p.mouse.wheel(0, +step);
  await p.waitForTimeout(40);
  if (i >= n - 3) await p.screenshot({ path: `shots/fast-${w}-${String(f++).padStart(2, '0')}.png` });
}
for (let i = 0; i < 8; i++) {
  await p.waitForTimeout(120);
  await p.screenshot({ path: `shots/fast-${w}-${String(f++).padStart(2, '0')}.png` });
}
await b.close();
