'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDrawer } from '@/components/products/ProductDrawer';
import { Icon } from '@/components/ui/Icon';
import { Wave } from '@/components/ui/Wave';
import { coffee, goods, type Product } from '@/data/content';

const TABS = [
  { id: 'coffee', label: 'Whole bean coffee', items: coffee as Product[] },
  { id: 'drinkware', label: 'Drinkware', items: (goods as Product[]).filter((g) => g.group !== 'brewing') },
  { id: 'brewing', label: 'Brewing', items: (goods as Product[]).filter((g) => g.group === 'brewing') },
] as const;
const ROAST_FILTERS = [
  { id: 'all', label: 'All roasts' },
  { id: 'blonde', label: 'Blonde' },
  { id: 'medium', label: 'Medium' },
  { id: 'dark', label: 'Dark' },
  { id: 'reserve', label: 'Reserve' },
];

export function HomeGoods() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('coffee');
  const [roast, setRoast] = useState('all');
  const [open, setOpen] = useState<Product | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  // other sections (the roast step, the header) can ask for a tab + roast
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ tab?: string; roast?: string }>).detail;
      if (d.tab) setTab(d.tab as typeof tab);
      if (d.roast) setRoast(d.roast);
    };
    window.addEventListener('sbx:goods', on);
    return () => window.removeEventListener('sbx:goods', on);
  }, []);

  const current = TABS.find((t) => t.id === tab)!;
  const items = tab === 'coffee' && roast !== 'all' ? current.items.filter((p) => p.group === roast) : current.items;

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [tab, roast, measure]);

  const page = (dir: number) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  // mouse drag on the rail (touch already scrolls natively)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !rail.current) return;
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !rail.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) {
      d.moved = true;
      rail.current.dataset.dragging = 'true';
    }
    rail.current.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    if (rail.current) delete rail.current.dataset.dragging;
    setTimeout(() => (drag.current = null), 0);
  };

  return (
    <section id="home" className="goods section" data-ground="cream" aria-labelledby="goods-title">
      <div className="shell">
        <div className="section__head">
          <div className="goods__intro">
            <h2 id="goods-title" className="h2">
              Take it home.
            </h2>
            <p className="soft">Whole bean coffee, cups and brewers from the official Starbucks shop.</p>
          </div>
          <div className="chips" role="tablist" aria-label="Product type">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls="goods-panel"
                className="chip"
                onClick={() => {
                  setTab(t.id);
                  setRoast('all');
                }}
              >
                {t.label} <small>{t.items.length}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="goods__bar">
          {tab === 'coffee' ? (
            <div className="chips chips--quiet" role="group" aria-label="Filter by roast">
              {ROAST_FILTERS.map((r) => (
                <button key={r.id} type="button" className="chip" aria-pressed={roast === r.id} onClick={() => setRoast(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <div className="goods__arrows">
            <button type="button" className="icon-btn icon-btn--ring" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous products" aria-controls="goods-panel">
              <Icon name="left" />
            </button>
            <button type="button" className="icon-btn icon-btn--ring" onClick={() => page(1)} disabled={edge.end} aria-label="Next products" aria-controls="goods-panel">
              <Icon name="right" />
            </button>
          </div>
        </div>
      </div>

      <div
        id="goods-panel"
        ref={rail}
        className="rail"
        role="region"
        aria-label={`${current.label}, ${items.length} products. Scroll sideways for more.`}
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <ul className="rail__track" key={tab + roast}>
          {items.map((p, i) => (
            <li key={p.id} className="rail__item" style={{ '--i': i } as React.CSSProperties}>
              <ProductCard product={p} onOpen={setOpen} />
            </li>
          ))}
        </ul>
      </div>

      <div className="shell section__foot">
        <p className="soft body-sm">Prices in USD from shop.starbucks.com, checked 22 Sep 2026.</p>
        <Link className="btn btn--line" href="/shop">
          Browse the whole shop
        </Link>
      </div>
      <ProductDrawer product={open} onClose={() => setOpen(null)} />
      <Wave fill="green" />
    </section>
  );
}
