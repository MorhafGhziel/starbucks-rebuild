// Screenshots each <section>/<footer> at the given viewport: scrolls it to the top, waits, shoots.
// node tools/sections.mjs <url> <prefix> [w] [h] [selector-list]
import { chromium } from 'playwright';
const [url, out, w = '1440', h = '900', sel = 'main > section, footer'] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(1500);
const n = await page.$$eval(sel, (els) => els.length);
for (let i = 0; i < n; i++) {
  const info = await page.evaluate(([sel, i]) => {
    const el = document.querySelectorAll(sel)[i];
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - 0);
    return { id: el.id || el.className.split(' ')[0], h: Math.round(el.getBoundingClientRect().height) };
  }, [sel, i]);
  await page.waitForTimeout(1400);
  // hide the fixed header so it doesn't cover section tops
  await page.addStyleTag({ content: '.header{opacity:0 !important}' });
  await page.screenshot({ path: `${out}-${String(i).padStart(2, '0')}-${info.id}.png` });
  await page.addStyleTag({ content: '.header{opacity:1 !important}' });
  console.log(i, info.id, info.h);
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
