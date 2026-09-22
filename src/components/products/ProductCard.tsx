'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useBag } from '@/components/bag/BagProvider';
import { Icon } from '@/components/ui/Icon';
import { fmtPrice, type Product } from '@/data/content';

export function AddButton({ product, wide }: { product: Product; wide?: boolean }) {
  const bag = useBag();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      className={`btn btn--solid btn--sm ${wide ? 'btn--wide' : ''}`}
      onClick={() => {
        bag.add(product.id);
        setDone(true);
      }}
      aria-live="polite"
    >
      {done ? (
        <>
          <Icon name="check" size={18} /> Added to bag
        </>
      ) : (
        <>Add to bag</>
      )}
    </button>
  );
}

export function ProductCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  return (
    <article className="pcard" data-kind={product.kind}>
      <div className="pcard__tile" data-ground={product.kind === 'coffee' ? 'green' : 'cream'}>
        <Image src={`${product.image}-560.webp`} alt="" fill sizes="(max-width: 700px) 72vw, 320px" />
      </div>
      <div className="pcard__body">
        <h3 className="pcard__name">
          <button type="button" className="pcard__open" onClick={() => onOpen(product)}>
            {product.name}
          </button>
        </h3>
        <p className="pcard__note">{product.notes ?? product.description.split('. ')[0].replace(/\.$/, '') + '.'}</p>
        <p className="pcard__price">
          <strong>{fmtPrice(product.price)}</strong> <span>{product.size}</span>
        </p>
        <div className="pcard__actions">
          <AddButton product={product} />
        </div>
      </div>
    </article>
  );
}
