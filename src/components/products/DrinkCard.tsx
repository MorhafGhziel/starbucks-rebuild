'use client';

import Image from 'next/image';
import type { Drink } from '@/data/content';

export function DrinkCard({ drink, onOpen, priority }: { drink: Drink; onOpen: (d: Drink) => void; priority?: boolean }) {
  return (
    <article className="dcard">
      <div className="dcard__tile" data-ground="green">
        <Image src={`${drink.image}-900.webp`} alt="" fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 320px" priority={priority} />
      </div>
      <h3 className="dcard__name">
        <button type="button" className="dcard__open" onClick={() => onOpen(drink)}>
          {drink.name}
        </button>
      </h3>
      <p className="dcard__meta">
        {drink.calories} calories{drink.caffeine ? `, ${drink.caffeine} caffeine` : ''}
        <span className="sr-only"> for a {drink.caloriesSize}</span>
      </p>
    </article>
  );
}
