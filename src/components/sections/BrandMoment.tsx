'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CupStage } from '@/components/three/CupStage';
import { Icon } from '@/components/ui/Icon';
import { Wave } from '@/components/ui/Wave';
import { useBag } from '@/components/bag/BagProvider';
import { LINKS, goods } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);
const sleeve = goods.find((g) => g.id === 'starbucks-stainless-steel-insulated-sleeve')!;

export function BrandMoment() {
  const root = useRef<HTMLElement>(null);
  const [lid, setLid] = useState(false);
  const [sleeveOn, setSleeveOn] = useState(false);
  const [nudge, setNudge] = useState({ n: 0, dir: 1 });
  const [reset, setReset] = useState(0);
  const bag = useBag();

  // the cup rises into the section as you arrive (echoes the hero)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el.querySelector('.brand__stage'),
        { yPercent: 18, scale: 0.92 },
        { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 20%', scrub: 0.6 } },
      );
    });
    return () => mm.revert();
  }, []);

  const caption = sleeveOn
    ? 'The Starbucks® Stainless Steel Insulated Sleeve. Slide in a 16 oz hot cup to keep it hotter, longer.'
    : lid
      ? 'The sip lid presses onto the rolled paper rim of the cup.'
      : 'A grande hot cup: 16 fl oz, with the Siren on the front.';

  return (
    <section ref={root} className="brand" data-ground="green" aria-labelledby="brand-title">
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
          <CupStage
            mode="inspect"
            poster="/renders/cup-inspect.png"
            posterAlt="A Starbucks hot cup with its lid and the green Siren logo."
            lidOpen={lid}
            sleeveOn={sleeveOn}
            nudge={nudge}
            resetKey={reset}
            label="The Starbucks hot cup, up close"
            className="brand__cup"
          />
          <div className="brand__controls" role="group" aria-label="Cup controls">
            <button type="button" className="icon-btn icon-btn--ring" onClick={() => setNudge((v) => ({ n: v.n + 1, dir: -1 }))} aria-label="Turn left">
              <Icon name="rotateL" />
            </button>
            <button type="button" className="icon-btn icon-btn--ring" onClick={() => setNudge((v) => ({ n: v.n + 1, dir: 1 }))} aria-label="Turn right">
              <Icon name="rotateR" />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--ring"
              onClick={() => {
                setReset((r) => r + 1);
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
