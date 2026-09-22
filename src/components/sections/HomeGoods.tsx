'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AddButton } from '@/components/products/ProductCard';
import { ProductDrawer } from '@/components/products/ProductDrawer';
import { Icon } from '@/components/ui/Icon';
import { Wave } from '@/components/ui/Wave';
import { coffee, fmtPrice, goods, type Product } from '@/data/content';

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

/**
 * A focused product carousel: the chosen product sits large in the centre,
 * its neighbours shrink, soften and blur to either side. Arrows, a click on
 * a neighbour, a drag/swipe or the arrow keys move it.
 */
export function HomeGoods() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('coffee');
  const [roast, setRoast] = useState('all');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<Product | null>(null);

  // other sections (the roast step) can ask for a tab + roast
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ tab?: string; roast?: string }>).detail;
      if (d.tab) setTab(d.tab as typeof tab);
      if (d.roast) setRoast(d.roast);
      setActive(0);
    };
    window.addEventListener('sbx:goods', on);
    return () => window.removeEventListener('sbx:goods', on);
  }, []);

  const current = TABS.find((t) => t.id === tab)!;
  const items = tab === 'coffee' && roast !== 'all' ? current.items.filter((p) => p.group === roast) : current.items;
  const idx = Math.min(active, items.length - 1);
  const item = items[idx];
  const go = (n: number) => setActive(Math.max(0, Math.min(items.length - 1, n)));

  // drag / swipe: one product per gesture
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const moved = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    moved.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - d.y)) {
      go(idx + (dx < 0 ? 1 : -1));
      moved.current = true;
      drag.current = null;
    }
  };
  const onUp = () => (drag.current = null);

  return (
    <section id="home" className="goods section" data-ground="cream" aria-labelledby="goods-title">
      <div className="shell">
        <div className="section__head goods__head">
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
                  setActive(0);
                }}
              >
                {t.label} <small>{t.items.length}</small>
              </button>
            ))}
          </div>
        </div>
        {tab === 'coffee' && (
          <div className="chips chips--quiet goods__roasts" role="group" aria-label="Filter by roast">
            {ROAST_FILTERS.map((r) => (
              <button
                key={r.id}
                type="button"
                className="chip"
                aria-pressed={roast === r.id}
                onClick={() => {
                  setRoast(r.id);
                  setActive(0);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        id="goods-panel"
        className="flow"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${current.label}: ${idx + 1} of ${items.length}. Use the arrow keys to browse.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') (e.preventDefault(), go(idx + 1));
          if (e.key === 'ArrowLeft') (e.preventDefault(), go(idx - 1));
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <ul className="flow__stage">
          {items.map((p, i) => {
            const o = i - idx;
            const a = Math.abs(o);
            return (
              <li
                key={p.id}
                data-item
                className="flow__item"
                data-active={o === 0}
                aria-hidden={o !== 0}
                style={{ '--o': o, '--a': a } as React.CSSProperties}
                onClick={() => {
                  if (moved.current) return;
                  if (o !== 0) go(i);
                  else setOpen(p);
                }}
              >
                <div className="flow__tile" data-ground={p.kind === 'coffee' ? 'green' : 'cream'}>
                  <Image src={`${p.image}-1000.webp`} alt={o === 0 ? p.name : ''} fill sizes="(max-width: 700px) 70vw, 420px" draggable={false} />
                </div>
              </li>
            );
          })}
        </ul>
        <button type="button" className="icon-btn icon-btn--ring flow__arrow flow__arrow--prev" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Previous product">
          <Icon name="left" />
        </button>
        <button type="button" className="icon-btn icon-btn--ring flow__arrow flow__arrow--next" onClick={() => go(idx + 1)} disabled={idx === items.length - 1} aria-label="Next product">
          <Icon name="right" />
        </button>
      </div>

      {item && (
        <div className="flow__info" key={item.id} aria-live="polite">
          <h3 className="flow__name">{item.name}</h3>
          <p className="soft flow__note">{item.notes ?? item.description.split('. ')[0].replace(/\.$/, '') + '.'}</p>
          <p className="flow__price">
            <strong>{fmtPrice(item.price)}</strong> <span>{item.size}</span>
          </p>
          <div className="flow__actions">
            <AddButton product={item} />
            <button type="button" className="link" onClick={() => setOpen(item)}>
              Details
            </button>
          </div>
          <p className="fine flow__count">
            {idx + 1} / {items.length}
          </p>
        </div>
      )}

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
