// Captures the live 3D stages as transparent PNG posters (the no-WebGL /
// loading fallback), at 2x, so the fallback matches the real render.
import { chromium } from 'playwright';
import sharp from 'sharp';

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:3970/', { waitUntil: 'networkidle' });

async function grab(selector, out, before) {
  await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), selector);
  if (before) await page.evaluate(before);
  await page.waitForTimeout(5200);
  const style = await page.addStyleTag({
    content: `html,body,main>section,.brand,.hero{background:transparent !important}
      .cup-stage__poster,.header,.ring,.hero__copy,.brand__copy,.wave{visibility:hidden !important}`,
  });
  const buf = await page.locator(selector).screenshot({ omitBackground: true });
  await style.evaluate((n) => n.remove());
  await sharp(buf).png({ compressionLevel: 9, palette: false }).toFile(out);
  const m = await sharp(out).metadata();
  console.log(out, m.width, m.height, m.hasAlpha);
}

await grab('.hero__cup', 'public/renders/cup-hero.png');
await grab('.brand__cup', 'public/renders/cup-inspect.png');
await browser.close();
