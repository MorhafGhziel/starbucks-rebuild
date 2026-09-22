'use client';

import { useCallback, useState } from 'react';
import { Catalog } from '@/components/catalog/Catalog';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDrawer } from '@/components/products/ProductDrawer';
import { coffee, goods, type Product } from '@/data/content';

const ALL = [...coffee, ...goods] as Product[];
const FILTERS = [
  { id: 'coffee', label: 'Whole bean' },
  { id: 'drinkware', label: 'Drinkware' },
  { id: 'brewing', label: 'Brewing' },
];

export function ShopCatalog() {
  const [open, setOpen] = useState<Product | null>(null);
  const filterOf = useCallback((p: Product) => (p.kind === 'coffee' ? 'coffee' : p.group === 'brewing' ? 'brewing' : 'drinkware'), []);
  const searchText = useCallback((p: Product) => `${p.name} ${p.description} ${p.notes ?? ''} ${p.group}`, []);
  return (
    <>
      <Catalog
        items={ALL}
        filters={FILTERS}
        filterOf={filterOf}
        searchText={searchText}
        keyOf={(p) => p.id}
        noun="product"
        searchLabel="Search coffee and drinkware"
        gridClass="shop__grid catalog__grid"
        render={(p) => <ProductCard product={p} onOpen={setOpen} />}
      />
      <ProductDrawer product={open} onClose={() => setOpen(null)} />
    </>
  );
}
