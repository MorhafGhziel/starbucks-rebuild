// Debug-overlay stills of the flight at chosen progress values (page scrolled to match).
// node tools/flight-debug.mjs <w> <h> <p1,p2,...>
import { chromium } from 'playwright';
const [w = '1440', h = '900', list = '0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1'] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const pg = await b.newPage({ viewport: { width: +w, height: +h } });
await pg.goto('http://localhost:3970/' + (process.env.NODBG ? '' : '?flight-debug'), { waitUntil: 'networkidle' });
await pg.waitForTimeout(500);
await pg.waitForTimeout(1500);
const s1 = await pg.evaluate(() => { const e = document.querySelector('[data-cup-anchor="brand"]').getBoundingClientRect(); return e.top + scrollY + e.height / 2 - innerHeight / 2; });
let i = 0;
for (const p of list.split(',').map(Number)) {
  await pg.evaluate((y) => window.scrollTo(0, y), p * s1);
  await pg.waitForTimeout(1600);
  await pg.screenshot({ path: `shots/dbg-${w}-${String(i++).padStart(2, '0')}.png` });
}
console.log('s1', Math.round(s1));
await b.close();
