// Edge cases: reload mid-flight, deep-link to a later section, resize mid-flight.
import { chromium } from 'playwright';
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
const s1 = async () =>
  p.evaluate(() => {
    const el = document.querySelector('[data-cup-anchor="brand"]').getBoundingClientRect();
    return el.top + scrollY + el.height / 2 - innerHeight / 2;
  });

// 1) reload in the middle of the flight
await p.goto('http://localhost:3970/?flight-debug', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.evaluate((y) => scrollTo(0, y), (await s1()) * 0.6);
await p.waitForTimeout(1200);
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(400);
await p.screenshot({ path: 'shots/edge-reload-early.png' });
await p.waitForTimeout(1600);
await p.screenshot({ path: 'shots/edge-reload.png' });
console.log('reload: scrollY', await p.evaluate(() => Math.round(scrollY)), 'p', await p.evaluate(() => window.__flight.p.toFixed(3)));

// 2) arrive directly at a later section
await p.goto('http://localhost:3970/?flight-debug#stores', { waitUntil: 'networkidle' });
await p.waitForTimeout(1800);
await p.screenshot({ path: 'shots/edge-deeplink.png' });
console.log('deeplink: layer', await p.evaluate(() => getComputedStyle(document.querySelector('.cup-flight-layer')).visibility));

// 3) resize mid-flight
await p.goto('http://localhost:3970/?flight-debug', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
await p.evaluate((y) => scrollTo(0, y), (await s1()) * 0.62);
await p.waitForTimeout(1200);
await p.setViewportSize({ width: 1100, height: 800 });
await p.waitForTimeout(1500);
await p.screenshot({ path: 'shots/edge-resize.png' });
console.log(errs.length ? errs : 'no errors');
await b.close();
