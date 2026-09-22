'use client';

import Image from 'next/image';
import { Drawer } from '@/components/ui/Drawer';
import { Icon } from '@/components/ui/Icon';
import type { Drink } from '@/data/content';

export function DrinkDrawer({ drink, onClose }: { drink: Drink | null; onClose: () => void }) {
  return (
    <Drawer open={!!drink} onClose={onClose} label={drink ? drink.name : 'Drink details'}>
      {drink && (
        <div className="detail">
          <div className="detail__media" data-ground="green">
            <Image src={`${drink.image}-900.webp`} alt={drink.name} fill sizes="480px" />
          </div>
          <div className="detail__body">
            <h2 className="detail__title">{drink.name}</h2>
            <p>{drink.description}</p>
            <dl className="facts">
              <div>
                <dt>Calories</dt>
                <dd>{drink.calories}</dd>
              </div>
              {drink.caffeine && (
                <div>
                  <dt>Caffeine</dt>
                  <dd>{drink.caffeine}</dd>
                </div>
              )}
              {drink.protein && (
                <div>
                  <dt>Protein</dt>
                  <dd>{drink.protein}</dd>
                </div>
              )}
            </dl>
            <p className="fine">
              Nutrition for a {drink.caloriesSize} ({drink.servingSize}) made the standard way, as listed on starbucks.com. Sizes:{' '}
              {drink.sizes.join(', ')}.
            </p>
            <a className="btn btn--solid btn--wide" href={drink.url} target="_blank" rel="noreferrer" data-autofocus>
              Order on starbucks.com <Icon name="external" size={18} />
            </a>
          </div>
        </div>
      )}
    </Drawer>
  );
}
