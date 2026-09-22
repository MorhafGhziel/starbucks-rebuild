'use client';

import { useCallback, useState } from 'react';
import { Catalog } from '@/components/catalog/Catalog';
import { DrinkCard } from '@/components/products/DrinkCard';
import { DrinkDrawer } from '@/components/products/DrinkDrawer';
import { LINKS, MENU_GROUPS, drinks, type Drink } from '@/data/content';

export function MenuCatalog() {
  const [open, setOpen] = useState<Drink | null>(null);
  const filterOf = useCallback((d: Drink) => d.group, []);
  const searchText = useCallback((d: Drink) => `${d.name} ${d.description} ${d.form}`, []);
  return (
    <>
      <Catalog
        items={drinks}
        filters={MENU_GROUPS.map((g) => ({ id: g.id, label: g.label }))}
        filterOf={filterOf}
        searchText={searchText}
        keyOf={(d) => d.id}
        noun="drink"
        searchLabel="Search drinks"
        gridClass="menu__grid catalog__grid"
        render={(d, i) => <DrinkCard drink={d} onOpen={setOpen} priority={i < 4} />}
      />
      <p className="catalog__note soft body-sm">
        Looking for something else? The full, location-aware menu lives on{' '}
        <a className="link" href={LINKS.menu} target="_blank" rel="noreferrer">
          starbucks.com/menu
        </a>
        .
      </p>
      <DrinkDrawer drink={open} onClose={() => setOpen(null)} />
    </>
  );
}
