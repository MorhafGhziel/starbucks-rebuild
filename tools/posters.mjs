// Renders the poster images each cup anchor shows before (or without) WebGL,
// straight from the live flight scene at rest, so the hand-off is invisible.
import { chromium } from 'playwright';
import sharp from 'sharp';

const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:3970/?still', { waitUntil: 'networkidle' });
await page.addStyleTag({
  content: `html,body,main>section,.brand,.hero,.footer{background:transparent !important}
    body>*:not(.cup-flight-layer){visibility:hidden !important}`,
});
async function grab(anchor, scrollTo, out) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
  await page.waitForTimeout(3500);
  const r = await page.evaluate((a) => {
    const b = document.querySelector(`[data-cup-anchor="${a}"]`).getBoundingClientRect();
    return { x: b.left, y: b.top, width: b.width, height: b.height };
  }, anchor);
  const buf = await page.screenshot({ omitBackground: true, clip: r });
  await sharp(buf).png({ compressionLevel: 9 }).toFile(out);
  console.log(out, r);
}
await grab('hero', 0, 'public/renders/cup-hero.png');
const s1 = await page.evaluate(() => {
  const el = document.querySelector('[data-cup-anchor="brand"]').getBoundingClientRect();
  return Math.round(el.top + scrollY + el.height / 2 - innerHeight / 2);
});
await grab('brand', s1, 'public/renders/cup-inspect.png');
await b.close();
