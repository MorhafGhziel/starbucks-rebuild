// node tools/shot.mjs <url> <out-prefix> [w=1440] [h=900] [--full] [--wait=ms] [--scroll=y]
// Uses real GPU Chrome (headed-new) so WebGL renders; logs console errors.
import { chromium } from 'playwright';

const [url, out, w = '1440', h = '900', ...flags] = process.argv.slice(2);
const opt = Object.fromEntries(flags.map((f) => f.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: opt.dpr ? +opt.dpr : 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
if (opt.scroll) await page.evaluate((y) => window.scrollTo(0, +y), opt.scroll);
if (opt.full) {
  // walk the page so lazy things mount and reveals fire
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}
await page.waitForTimeout(+(opt.wait || 2500));
if (opt.full) {
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < H; y += +h - 60, i++) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(+(opt.step || 900));
    await page.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.png` });
  }
  console.log('frames', i, 'height', H);
} else {
  await page.screenshot({ path: `${out}.png` });
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
