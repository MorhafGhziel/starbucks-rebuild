// Interaction checks against a running server. node tools/interact.mjs [base]
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:3970';
const results = [];
const check = (name, ok, extra = '') => {
  results.push([ok ? 'PASS' : 'FAIL', name, extra]);
};

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--headless=new', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

// anchors
for (const [label, id] of [['Our Coffee', 'coffee'], ['Drinkware', 'home']]) {
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label }).click();
  await page.waitForTimeout(1200);
  const top = await page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top, id);
  check(`nav "${label}" scrolls to #${id}`, Math.abs(top) < 140, `top=${Math.round(top)}`);
}
await page.evaluate(() => window.scrollTo(0, 0));

// menu tabs filter
const names = () => page.$$eval('#menu-panel .dcard__open', (b) => b.map((x) => x.textContent));
const fall = await names();
await page.getByRole('tab', { name: 'Iced coffee' }).click();
await page.waitForTimeout(300);
const iced = await names();
check('menu tab filters drinks', iced.length === 4 && iced.join() !== fall.join(), iced.join(' | '));
await page.getByRole('tab', { name: 'Iced coffee' }).press('ArrowRight');
check('menu tabs arrow-key to next', (await page.getByRole('tab', { name: 'Chai & matcha' }).getAttribute('aria-selected')) === 'true');

// drink drawer + focus return
const trigger = page.locator('#menu-panel .dcard__open').first();
const tname = await trigger.textContent();
await trigger.click();
await page.waitForTimeout(600);
const dlg = page.getByRole('dialog', { name: tname });
check('drink details open in dialog', await dlg.isVisible());
check('dialog shows official description', (await dlg.textContent()).length > 80);
await page.keyboard.press('Escape');
await page.waitForTimeout(600);
check('Escape closes dialog', !(await dlg.isVisible()));
check('focus returns to trigger', await page.evaluate((t) => document.activeElement?.textContent === t, tname));

// cup controls
await page.evaluate(() => document.querySelector('.brand').scrollIntoView());
await page.waitForTimeout(800);
const lid = page.getByRole('button', { name: 'Lift the lid' });
await lid.click();
check('lid toggle pressed', (await page.getByRole('button', { name: 'Put the lid back' }).getAttribute('aria-pressed')) === 'true');
await page.getByRole('button', { name: 'Add the Insulated Sleeve' }).click();
await page.waitForTimeout(300);
check('sleeve caption updates', (await page.locator('.brand__caption').textContent()).includes('Insulated Sleeve'));
await page.getByRole('button', { name: 'Reset the cup' }).click();
check('reset clears toggles', await page.getByRole('button', { name: 'Lift the lid' }).isVisible());
const cupFocus = await page.evaluate(() => document.querySelector('.brand__cup').tabIndex);
check('3D stage keyboard-focusable', cupFocus === 0);

// goods tabs, roast filter, rail arrows, bag
await page.evaluate(() => document.getElementById('home').scrollIntoView());
await page.waitForTimeout(500);
const cards = () => page.locator('#goods-panel .pcard').count();
check('whole bean shows 11', (await cards()) === 11);
await page.getByRole('button', { name: 'Dark', exact: true }).click();
await page.waitForTimeout(300);
check('roast filter Dark shows 4', (await cards()) === 4, String(await cards()));
await page.getByRole('tab', { name: /Drinkware/ }).click();
await page.waitForTimeout(300);
check('drinkware tab shows 8', (await cards()) === 8, String(await cards()));
const prev = page.getByRole('button', { name: 'Previous products' });
check('rail prev disabled at start', await prev.isDisabled());
await page.getByRole('button', { name: 'Next products' }).click();
await page.waitForTimeout(900);
check('rail next scrolls', (await page.evaluate(() => document.getElementById('goods-panel').scrollLeft)) > 100);

await page.locator('#goods-panel .pcard').first().getByRole('button', { name: 'Add to bag' }).click();
await page.locator('#goods-panel .pcard').nth(1).getByRole('button', { name: 'Add to bag' }).click();
await page.waitForTimeout(300);
const bagBtn = page.locator('.header__bag');
check('bag count = 2', (await bagBtn.getAttribute('aria-label')).includes('2 items'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
check('bag persists after reload', (await page.locator('.header__bag').getAttribute('aria-label')).includes('2 items'));
await page.locator('.header__bag').click();
await page.waitForTimeout(600);
const bagDlg = page.getByRole('dialog', { name: 'Your bag' });
check('bag drawer opens', await bagDlg.isVisible());
check('bag says it is a concept', (await bagDlg.textContent()).includes('Concept bag'));
await bagDlg.getByRole('button', { name: 'One more' }).first().click();
await page.waitForTimeout(200);
check('quantity increases', (await bagDlg.locator('output').first().textContent()) === '2');
const sub1 = await bagDlg.locator('.bag__sum strong').textContent();
await bagDlg.getByRole('button', { name: 'Remove' }).first().click();
await page.waitForTimeout(200);
const sub2 = await bagDlg.locator('.bag__sum strong').textContent();
check('remove updates subtotal', sub1 !== sub2, `${sub1} -> ${sub2}`);
await bagDlg.getByRole('button', { name: 'Empty bag' }).click();
await page.waitForTimeout(200);
check('empty state shows', (await bagDlg.textContent()).includes('Your bag is empty'));
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// journey tabs + keyboard
await page.evaluate(() => document.getElementById('coffee').scrollIntoView());
await page.getByRole('tab', { name: /Grow/ }).click();
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(300);
check('journey arrow key selects Source', (await page.getByRole('tab', { name: /Source/ }).getAttribute('aria-selected')) === 'true');
await page.getByRole('button', { name: 'Next: Roast' }).click();
await page.waitForTimeout(300);
check('journey next button', (await page.getByRole('tab', { name: /Roast/ }).getAttribute('aria-selected')) === 'true');
await page.locator('#jp-roast').getByRole('radio', { name: 'Dark' }).click();
check('roast picker lists dark bags', (await page.locator('#jp-roast .roast__bag').count()) === 4);
await page.locator('#jp-roast .roast__bag').first().click();
await page.waitForTimeout(1200);
check('roast bag jumps to shop rail filtered', (await page.getByRole('button', { name: 'Dark', exact: true }).getAttribute('aria-pressed')) === 'true');

// faq
const q = page.getByRole('button', { name: 'Cold brew, iced coffee or iced Americano?' });
await q.click();
check('faq opens', (await q.getAttribute('aria-expanded')) === 'true');
check('first faq closes (single open)', (await page.getByRole('button', { name: 'Can I bring my own cup?' }).getAttribute('aria-expanded')) === 'false');

// mobile menu sheet
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.getByRole('button', { name: 'Open menu' }).click();
await page.waitForTimeout(600);
check('mobile menu opens', await page.getByRole('dialog', { name: 'Menu' }).isVisible());
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
await page.setViewportSize({ width: 1440, height: 900 });

// menu page search
await page.goto(BASE + '/menu', { waitUntil: 'networkidle' });
const count = async () => page.locator('.catalog__grid > li').count();
check('/menu lists 16', (await count()) === 16);
await page.getByRole('searchbox').fill('latte');
await page.waitForTimeout(400);
const n = await count();
check('/menu search "latte" narrows', n > 0 && n < 16, String(n));
await page.getByRole('searchbox').fill('zzzz');
await page.waitForTimeout(400);
check('/menu empty state', await page.getByText('Nothing matches').isVisible());
await page.getByRole('button', { name: 'Show everything' }).click();
await page.waitForTimeout(300);
check('/menu reset restores 16', (await count()) === 16);

// shop page filter
await page.goto(BASE + '/shop', { waitUntil: 'networkidle' });
check('/shop lists 22', (await count()) === 22);
await page.getByRole('button', { name: 'Brewing', exact: true }).click();
await page.waitForTimeout(300);
check('/shop brewing filter = 3', (await count()) === 3);

// overflow at key widths
for (const w of [390, 768, 1440, 1920]) {
  for (const path of ['/', '/menu', '/shop', '/credits']) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`no horizontal overflow ${path} @${w}`, over <= 0, `over=${over}`);
  }
}

check('no console errors', errors.length === 0, errors.slice(0, 5).join(' || '));
await browser.close();

// no-WebGL fallback
const b2 = await chromium.launch({ args: ['--disable-gpu', '--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
const p2 = await b2.newPage({ viewport: { width: 1440, height: 900 } });
await p2.goto(BASE + '/', { waitUntil: 'networkidle' });
await p2.waitForTimeout(1500);
const fb = await p2.evaluate(() => ({
  canvas: !!document.querySelector('.hero__cup canvas'),
  alt: document.querySelector('.hero__cup img')?.getAttribute('alt'),
  loaded: document.querySelector('.hero__cup img')?.complete,
}));
check('no-WebGL: poster shown, no canvas', !fb.canvas && !!fb.alt && fb.loaded, JSON.stringify(fb));
await p2.screenshot({ path: 'shots/nowebgl.png' });
await b2.close();

// reduced motion
const b3 = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--headless=new', '--use-angle=d3d11'] });
const c3 = await b3.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p3 = await c3.newPage();
await p3.goto(BASE + '/', { waitUntil: 'networkidle' });
await p3.waitForTimeout(300);
const vis = await p3.evaluate(() => getComputedStyle(document.querySelector('.hero__sub')).opacity);
check('reduced motion: hero text visible immediately', vis === '1', vis);
await b3.close();

for (const r of results) console.log(r.join('  '));
console.log(`\n${results.filter((r) => r[0] === 'PASS').length}/${results.length} passed`);
