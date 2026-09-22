// Captures the cup's trip from hero to "One store" as a scroll sequence.
// node tools/flight.mjs [w] [h] [frames]
import { chromium } from 'playwright';
const [w = '1440', h = '900', n = '8'] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto('http://localhost:3970/', { waitUntil: 'networkidle' });
await p.waitForTimeout(3500);
const end = await p.evaluate(() => {
  const br = document.querySelector('[data-cup-anchor="brand"]').getBoundingClientRect();
  return br.top + scrollY - (innerHeight - br.height) / 2;
});
const N = +n;
for (let i = 0; i <= N; i++) {
  const y = Math.round((end * i) / N) + (i === N ? 200 : 0);
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `shots/fl-${w}-${String(i).padStart(2, '0')}.png` });
}
console.log('end', Math.round(end), errors.length ? errors.join(' | ') : 'no errors');
await b.close();
