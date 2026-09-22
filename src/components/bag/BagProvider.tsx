'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { coffee, goods, type Product } from '@/data/content';

/**
 * A concept bag. It remembers what you picked (localStorage), adds up the
 * official shop prices, and hands each item off to shop.starbucks.com.
 * Nothing here can charge or transfer to the official cart; the UI says so.
 */
type Line = { id: string; qty: number };
type Ctx = {
  lines: (Line & { product: Product })[];
  count: number;
  subtotal: number;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  lastAdded: string | null;
};

const BagContext = createContext<Ctx | null>(null);
const KEY = 'sbx-concept-bag-v1';
const catalog = new Map<string, Product>([...coffee, ...goods].map((p) => [p.id, p as Product]));

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '[]');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydrate from storage
      if (Array.isArray(v)) setRaw(v.filter((l) => catalog.has(l.id) && l.qty > 0));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(raw));
    } catch {}
  }, [raw, loaded]);

  const add = useCallback((id: string) => {
    setRaw((r) => {
      const hit = r.find((l) => l.id === id);
      return hit ? r.map((l) => (l.id === id ? { ...l, qty: Math.min(9, l.qty + 1) } : l)) : [...r, { id, qty: 1 }];
    });
    setLastAdded(id);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setRaw((r) => (qty <= 0 ? r.filter((l) => l.id !== id) : r.map((l) => (l.id === id ? { ...l, qty: Math.min(9, qty) } : l))));
  }, []);
  const remove = useCallback((id: string) => setRaw((r) => r.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<Ctx>(() => {
    const lines = raw.map((l) => ({ ...l, product: catalog.get(l.id)! })).filter((l) => l.product);
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * Number(l.product.price), 0),
      add,
      setQty,
      remove,
      clear,
      open,
      setOpen,
      lastAdded,
    };
  }, [raw, add, setQty, remove, clear, open, lastAdded]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const c = useContext(BagContext);
  if (!c) throw new Error('useBag outside BagProvider');
  return c;
}
