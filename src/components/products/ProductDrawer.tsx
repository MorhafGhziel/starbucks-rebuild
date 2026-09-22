'use client';

import Image from 'next/image';
import { Drawer } from '@/components/ui/Drawer';
import { Icon } from '@/components/ui/Icon';
import { ROASTS, fmtPrice, type Product } from '@/data/content';
import { AddButton } from './ProductCard';

export function ProductDrawer({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const roast = product && ROASTS.find((r) => r.id === product.group);
  return (
    <Drawer open={!!product} onClose={onClose} label={product ? product.name : 'Product details'}>
      {product && (
        <div className="detail">
          <div className="detail__media" data-ground={product.kind === 'coffee' ? 'green' : 'cream'}>
            <Image src={`${product.image}-1000.webp`} alt={product.name} fill sizes="480px" />
          </div>
          <div className="detail__body">
            <h2 className="detail__title">{product.name}</h2>
            <p className="detail__price">
              <strong>{fmtPrice(product.price)}</strong> <span>{product.size}</span>
            </p>
            <p>{product.description}</p>
            {product.kind === 'coffee' && (
              <dl className="facts">
                {product.notes && (
                  <div>
                    <dt>Tasting notes</dt>
                    <dd>{product.notes}</dd>
                  </div>
                )}
                <div>
                  <dt>Roast</dt>
                  <dd>{roast ? roast.label : 'Starbucks Reserve'}</dd>
                </div>
              </dl>
            )}
            <div className="detail__actions">
              <AddButton product={product} wide />
              <a className="btn btn--line btn--wide" href={product.url} target="_blank" rel="noreferrer">
                Buy on shop.starbucks.com <Icon name="external" size={18} />
              </a>
            </div>
            <p className="fine">
              Price and size from the official Starbucks shop (USD), checked 22 Sep 2026. “Add to bag” keeps a list on this concept page only.
            </p>
          </div>
        </div>
      )}
    </Drawer>
  );
}
