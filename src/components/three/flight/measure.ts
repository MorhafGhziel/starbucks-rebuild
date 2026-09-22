// Reads the page once per layout change (never per frame) and turns it into
// the document-space facts the flight planner needs.
import type { Box, Layout } from './plan';
import { CUP_TOP } from './plan';

const PLINTH_R = 1.28; // matches Plinth in CupModels
const PLINTH_H = 0.42;

function doc(el: Element | null, sy: number): Box | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  return { x: r.left, y: r.top + sy, w: r.width, h: r.height };
}

export function measureLayout(): Layout | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sy = window.scrollY;
  const mobile = vw < 700;

  const hero = doc(document.querySelector('[data-cup-anchor="hero"]'), sy);
  const brand = doc(document.querySelector('[data-cup-anchor="brand"]'), sy);
  if (!hero || !brand) return null;

  const heroPx = hero.h * (mobile ? 0.56 : 0.58);
  const heroFoot = { x: hero.x + hero.w / 2, y: hero.y + hero.h * 0.8 };
  const landPx = Math.min(brand.h * 0.6, heroPx * 0.98);
  const landFoot = { x: brand.x + brand.w / 2, y: brand.y + brand.h * 0.82 };

  const maxScroll = document.documentElement.scrollHeight - vh;
  const s1 = Math.max(200, Math.min(maxScroll, brand.y + brand.h / 2 - vh / 2));

  const q = (sel: string) => doc(document.querySelector(sel), sy);
  const title = q('#menu-title');
  const tabs = q('#menu [role="tablist"]');
  const grid = q('#menu-panel');
  const foot = q('#menu .section__foot');
  const menuParts = [title, tabs, grid, foot].filter(Boolean) as Box[];
  const menuRight = Math.max(...menuParts.map((b) => b.x + b.w));

  const edge = mobile ? 8 : 20;
  const clear = mobile ? 12 : 28;

  const protect: Layout['protect'] = [];
  const add = (name: string, b: Box | null) => b && protect.push({ name, box: b });
  add('hero copy', q('.hero__copy'));
  add('menu title', title);
  add('menu tabs', tabs);
  add('drink cards', grid);
  add('menu CTA', foot);
  add('story text', q('.brand__copy'));
  add('cup controls', q('.brand__controls'));
  add('cup caption', q('.brand__caption'));
  // the hero pedestal (below its top surface) — the cup must lift clear of it
  const pr = (PLINTH_R / CUP_TOP) * heroPx;
  protect.push({ name: 'pedestal', box: { x: heroFoot.x - pr, y: heroFoot.y + 6, w: pr * 2, h: (PLINTH_H / CUP_TOP) * heroPx } });

  return {
    vw,
    vh,
    mobile,
    s1,
    topSafe: mobile ? 76 : 96,
    edge,
    clear,
    heroFoot,
    heroPx,
    landFoot,
    landPx,
    gridTop: grid ? grid.y : hero.y + hero.h,
    heroCopyRight: (() => { const c = q('.hero__copy'); return c ? c.x + c.w : 0; })(),
    menuHeadTop: Math.min(title?.y ?? Infinity, tabs?.y ?? Infinity),
    menuHeadRight: Math.max(title ? title.x + title.w : 0, tabs ? tabs.x + tabs.w : 0),
    footBottom: foot ? foot.y + foot.h : grid ? grid.y + grid.h : brand.y,
    corridor: { x0: menuRight + clear, x1: vw - edge },
    protect,
  };
}
