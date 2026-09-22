'use client';

import Image from 'next/image';
import { Drawer } from '@/components/ui/Drawer';
import { Icon } from '@/components/ui/Icon';
import { LINKS, fmtPrice } from '@/data/content';
import { useBag } from './BagProvider';

export function BagDrawer() {
  const bag = useBag();
  return (
    <Drawer open={bag.open} onClose={() => bag.setOpen(false)} label="Your bag">
      <div className="bag">
        <h2 className="bag__title">Your bag</h2>
        <p className="notice">
          <strong>Concept bag.</strong> Nothing is charged here, and this list doesn’t carry over to the official
          Starbucks shop. Use “Buy on shop” to open each item there.
        </p>

        {bag.lines.length === 0 ? (
          <div className="bag__empty">
            <p>Your bag is empty. Pick a coffee or a mug to keep track of it here.</p>
            <a className="btn btn--solid" href="#home" onClick={() => bag.setOpen(false)}>
              Browse coffee and drinkware
            </a>
          </div>
        ) : (
          <>
            <ul className="bag__list">
              {bag.lines.map((l) => (
                <li key={l.id} className="bag__line">
                  <div className="bag__thumb" data-kind={l.product.kind}>
                    <Image src={`${l.product.image}-560.webp`} alt="" width={80} height={100} />
                  </div>
                  <div className="bag__info">
                    <p className="bag__name">{l.product.name}</p>
                    <p className="bag__meta">
                      {l.product.size} <span aria-hidden="true">/</span> {fmtPrice(l.product.price)} each
                    </p>
                    <div className="bag__row">
                      <div className="qty" role="group" aria-label={`Quantity of ${l.product.name}`}>
                        <button type="button" onClick={() => bag.setQty(l.id, l.qty - 1)} aria-label="One fewer">
                          <Icon name="minus" size={18} />
                        </button>
                        <output aria-live="polite">{l.qty}</output>
                        <button type="button" onClick={() => bag.setQty(l.id, l.qty + 1)} disabled={l.qty >= 9} aria-label="One more">
                          <Icon name="plus" size={18} />
                        </button>
                      </div>
                      <a className="link" href={l.product.url} target="_blank" rel="noreferrer">
                        Buy on shop<span className="sr-only"> (opens shop.starbucks.com)</span>
                      </a>
                      <button type="button" className="link link--quiet" onClick={() => bag.remove(l.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bag__total">
              <div>
                <p className="bag__sum">
                  <span>Estimated subtotal</span>
                  <strong>{fmtPrice(String(bag.subtotal))}</strong>
                </p>
                <p className="bag__fine">Official shop prices in USD, checked 22 Sep 2026. Tax and shipping are worked out on the shop.</p>
              </div>
              <a className="btn btn--solid btn--wide" href={LINKS.shop} target="_blank" rel="noreferrer">
                Go to shop.starbucks.com <Icon name="external" size={18} />
              </a>
              <button type="button" className="link link--quiet" onClick={bag.clear}>
                Empty bag
              </button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
