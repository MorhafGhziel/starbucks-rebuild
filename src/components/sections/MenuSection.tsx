'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { DrinkCard } from '@/components/products/DrinkCard';
import { DrinkDrawer } from '@/components/products/DrinkDrawer';
import { Wave } from '@/components/ui/Wave';
import { MENU_GROUPS, drinks, type Drink } from '@/data/content';

type GroupId = (typeof MENU_GROUPS)[number]['id'];

export function MenuSection() {
  const [group, setGroup] = useState<GroupId>('fall');
  const [open, setOpen] = useState<Drink | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = drinks.filter((d) => d.group === group);

  // arrow keys move between tabs (WAI-ARIA tabs pattern)
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = MENU_GROUPS.length;
    const to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    setGroup(MENU_GROUPS[to].id);
    tabs.current[to]?.focus();
  };

  return (
    <section id="menu" className="menu section" data-ground="cream" aria-labelledby="menu-title">
      <div className="shell">
        <div className="section__head">
          <h2 id="menu-title" className="h2">
            What are you drinking today?
          </h2>
          <div className="chips" role="tablist" aria-label="Drink categories">
            {MENU_GROUPS.map((g, i) => (
              <button
                key={g.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${g.id}`}
                aria-selected={group === g.id}
                aria-controls="menu-panel"
                tabIndex={group === g.id ? 0 : -1}
                className="chip"
                onClick={() => setGroup(g.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div id="menu-panel" role="tabpanel" aria-labelledby={`tab-${group}`} className="menu__grid" key={group}>
          {list.map((d, i) => (
            <div key={d.id} className="menu__cell" style={{ '--i': i } as React.CSSProperties}>
              <DrinkCard drink={d} onOpen={setOpen} priority={i < 2} />
            </div>
          ))}
        </div>

        <div className="section__foot">
          <p className="soft body-sm">Calories and caffeine for a Grande, from starbucks.com. Availability varies by store.</p>
          <Link className="btn btn--line" href="/menu">
            See all drinks
          </Link>
        </div>
      </div>
      <DrinkDrawer drink={open} onClose={() => setOpen(null)} />
      <Wave fill="green" />
    </section>
  );
}
