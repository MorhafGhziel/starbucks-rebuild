'use client';

import { useEffect, useState } from 'react';
import { CupAnchor } from '@/components/three/CupAnchor';
import { cupStore } from '@/components/three/cupStore';
import { Icon } from '@/components/ui/Icon';
import { Wave } from '@/components/ui/Wave';
import { useBag } from '@/components/bag/BagProvider';
import { LINKS, goods } from '@/data/content';

const sleeve = goods.find((g) => g.id === 'starbucks-stainless-steel-insulated-sleeve')!;

export function BrandMoment() {
  const [lid, setLid] = useState(false);
  const [sleeveOn, setSleeveOn] = useState(false);
  // the travelling cup reads these every frame
  useEffect(() => {
    cupStore.lidOpen = lid;
    cupStore.sleeveOn = sleeveOn;
  }, [lid, sleeveOn]);
  const turnBy = (dir: number) => {
    cupStore.touched = true;
    cupStore.yaw += (Math.PI / 4) * dir;
  };
  const bag = useBag();

  const caption = sleeveOn
    ? 'The Starbucks® Stainless Steel Insulated Sleeve. Slide in a 16 oz hot cup to keep it hotter, longer.'
    : lid
      ? 'The sip lid presses onto the rolled paper rim of the cup.'
      : 'A grande hot cup: 16 fl oz, with the Siren on the front.';

  return (
    <section className="brand" data-ground="green" aria-labelledby="brand-title">
      <div className="shell brand__grid">
        <div className="brand__copy">
          <h2 id="brand-title" className="h2 brand__title">
            One store in Seattle. Every cup since.
          </h2>
          <p className="lead">
            Starbucks began in 1971 as a single store selling whole bean coffee, tea and spices. Today it’s more than 40,000 stores in
            88 markets, and every drink is still handcrafted.
          </p>
          <p className="fine">
            Store count as published by Starbucks in 2024.{' '}
            <a className="link" href={LINKS.beanToCup} target="_blank" rel="noreferrer">
              Read the story
            </a>
          </p>
        </div>

        <div className="brand__stage">
          <CupAnchor
            name="brand"
            poster="/renders/cup-inspect.png"
            posterAlt="A Starbucks hot cup with its lid and the green Siren logo."
            label="The Starbucks hot cup, up close"
            className="brand__cup"
          />
          <div className="brand__controls" role="group" aria-label="Cup controls">
            <button type="button" className="icon-btn icon-btn--ring" onClick={() => turnBy(-1)} aria-label="Turn left">
              <Icon name="rotateL" />
            </button>
            <button type="button" className="icon-btn icon-btn--ring" onClick={() => turnBy(1)} aria-label="Turn right">
              <Icon name="rotateR" />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--ring"
              onClick={() => {
                cupStore.yaw = Math.round(cupStore.yaw / (Math.PI * 2)) * Math.PI * 2;
                setLid(false);
                setSleeveOn(false);
              }}
              aria-label="Reset the cup"
            >
              <Icon name="reset" />
            </button>
            <span className="brand__sep" aria-hidden="true" />
            <button type="button" className="chip" aria-pressed={lid} onClick={() => setLid((v) => !v)}>
              <Icon name="lid" size={18} /> {lid ? 'Put the lid back' : 'Lift the lid'}
            </button>
            <button type="button" className="chip" aria-pressed={sleeveOn} onClick={() => setSleeveOn((v) => !v)}>
              <Icon name="sleeve" size={18} /> {sleeveOn ? 'Remove the sleeve' : 'Add the Insulated Sleeve'}
            </button>
          </div>
          <div className="brand__caption" aria-live="polite">
            <p>{caption}</p>
            {sleeveOn && (
              <p className="brand__buy">
                <span>90% recycled stainless steel. $24.95</span>
                <button type="button" className="link" onClick={() => bag.add(sleeve.id)}>
                  Add to bag
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
      <Wave fill="cream" slow />
    </section>
  );
}
