'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type Filter = { id: string; label: string };

type Props<T> = {
  items: T[];
  filters: Filter[];
  filterOf: (item: T) => string;
  searchText: (item: T) => string;
  render: (item: T, i: number) => React.ReactNode;
  keyOf: (item: T) => string;
  noun: string;
  searchLabel: string;
  gridClass: string;
};

/** Search + filter chips + results grid, with live count, empty and reset states. */
export function Catalog<T>({ items, filters, filterOf, searchText, render, keyOf, noun, searchLabel, gridClass }: Props<T>) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const dq = useDeferredValue(q);

  const results = useMemo(() => {
    const terms = dq.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return items.filter((it) => {
      if (f !== 'all' && filterOf(it) !== f) return false;
      const hay = searchText(it).toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, dq, f, filterOf, searchText]);

  const reset = () => {
    setQ('');
    setF('all');
  };
  const dirty = q !== '' || f !== 'all';

  return (
    <div className="catalog">
      <div className="catalog__bar">
        <label className="search">
          <span className="sr-only">{searchLabel}</span>
          <Icon name="search" size={20} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchLabel} autoComplete="off" />
          {q && (
            <button type="button" className="search__clear" onClick={() => setQ('')} aria-label="Clear search">
              <Icon name="close" size={18} />
            </button>
          )}
        </label>
        <div className="chips" role="group" aria-label="Filter">
          {[{ id: 'all', label: 'All' }, ...filters].map((x) => (
            <button key={x.id} type="button" className="chip" aria-pressed={f === x.id} onClick={() => setF(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <p className="catalog__count" role="status">
        {results.length} {results.length === 1 ? noun : `${noun}s`}
        {dirty && (
          <>
            {' '}
            <button type="button" className="link" onClick={reset}>
              Reset filters
            </button>
          </>
        )}
      </p>
      {results.length ? (
        <ul className={gridClass}>
          {results.map((it, i) => (
            <li key={keyOf(it)}>{render(it, i)}</li>
          ))}
        </ul>
      ) : (
        <div className="catalog__empty">
          <p className="h3">Nothing matches “{q}”{f !== 'all' ? ' in this filter' : ''}.</p>
          <p className="soft">Try a shorter word, like “latte” or “cold”, or clear the filters.</p>
          <button type="button" className="btn btn--solid" onClick={reset}>
            Show everything
          </button>
        </div>
      )}
    </div>
  );
}
