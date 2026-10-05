// First-open probe: fresh context, wheel-scroll from the first moment,
// log long tasks, scrollY, when the 3D cup goes live, and the cup's pose.
//   node tools/first-load.mjs [url]
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3970/?flight-debug';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  const w = window;
  w.__log = [];
  const t0 = performance.now();
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) w.__log.push({ t: Math.round(e.startTime - t0), long: Math.round(e.duration) });
  }).observe({ type: 'longtask', buffered: true });
  const tick = () => {
    const f = w.__flight;
    w.__log.push({
      t: Math.round(performance.now() - t0),
      y: Math.round(scrollY),
      live: document.documentElement.dataset.cup === 'live',
      p: f ? +f.p.toFixed(3) : null,
      s1: f?.plan ? Math.round(f.plan.L.s1) : null,
      foot: f?.plan ? Math.round(f.plan.L.heroFoot.y) : null,
      sh: document.documentElement.scrollHeight,
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const t = Date.now();
page.goto(url).catch(() => {});
await page.waitForTimeout(300);
await page.mouse.move(700, 450);
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel(0, 60);
  await page.waitForTimeout(100);
}
await page.waitForTimeout(3000);
const log = await page.evaluate(() => window.__log);
let last = '';
for (const e of log) {
  const s = e.long ? `LONG ${e.long}ms` : `y=${e.y} live=${e.live} p=${e.p} s1=${e.s1} foot=${e.foot} sh=${e.sh}`;
  const k = s.replace(/^y=\d+ /, '');
  if (e.long || k !== last || e.t % 500 < 17) console.log(String(e.t).padStart(5), s);
  if (!e.long) last = k;
}
console.log('wall', Date.now() - t);
await browser.close();
