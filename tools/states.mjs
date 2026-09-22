// Visual states the automated checks can't judge.
import { chromium } from 'playwright';
const BASE = 'http://localhost:3970';
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
const hideHeader = () => p.addStyleTag({ content: '.header{visibility:hidden !important}' });

await p.evaluate(() => document.querySelector('.brand').scrollIntoView());
await p.waitForTimeout(2500);
await p.getByRole('button', { name: 'Add the Insulated Sleeve' }).click();
await p.getByRole('button', { name: 'Lift the lid' }).click();
await p.waitForTimeout(2500);
await hideHeader();
await p.screenshot({ path: 'shots/st-sleeve-lid.png' });
await p.getByRole('button', { name: 'Turn right' }).click();
await p.getByRole('button', { name: 'Turn right' }).click();
await p.waitForTimeout(1500);
await p.screenshot({ path: 'shots/st-sleeve-turned.png' });

await p.evaluate(() => document.getElementById('home').scrollIntoView());
await p.waitForTimeout(600);
await p.locator('#goods-panel .pcard__open').first().click();
await p.waitForTimeout(900);
await p.screenshot({ path: 'shots/st-product-drawer.png' });
await p.keyboard.press('Escape');

for (const [w, h] of [[1920, 1080], [768, 1024]]) {
  await p.setViewportSize({ width: w, height: h });
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `shots/st-hero-${w}.png` });
}
await p.setViewportSize({ width: 1440, height: 900 });
await p.goto(BASE + '/menu', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.screenshot({ path: 'shots/st-menu.png', fullPage: false });
await p.evaluate(() => window.scrollTo(0, 600));
await p.waitForTimeout(800);
await p.screenshot({ path: 'shots/st-menu-2.png' });
await p.goto(BASE + '/shop', { waitUntil: 'networkidle' });
await p.evaluate(() => window.scrollTo(0, 600));
await p.waitForTimeout(1200);
await p.screenshot({ path: 'shots/st-shop.png' });
// short mobile viewport
await p.setViewportSize({ width: 390, height: 640 });
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
await p.screenshot({ path: 'shots/st-short-mobile.png' });
await b.close();
console.log('done');
