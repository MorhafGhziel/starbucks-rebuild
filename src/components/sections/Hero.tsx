'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CupAnchor } from '@/components/three/CupAnchor';
import { Wave } from '@/components/ui/Wave';
import { Ring } from '@/components/ui/Ring';
import { LINKS } from '@/data/content';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  // the page's one orchestrated entrance; content is readable before it runs
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.9 } });
      tl.from(el.querySelectorAll('.hero__line > span'), { yPercent: 105, stagger: 0.07 })
        .from(el.querySelector('.hero__sub'), { y: 18, autoAlpha: 0, duration: 0.7 }, '-=0.6')
        .from(el.querySelectorAll('.hero__actions > *'), { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, '-=0.55')
        .from(el.querySelector('.hero .ring'), { scale: 0.6, autoAlpha: 0, rotate: -90, duration: 1.1 }, '-=0.5');
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="hero" data-ground="green" aria-labelledby="hero-title">
      <div className="shell hero__grid">
        <div className="hero__copy">
          <h1 id="hero-title" className="display hero__title">
            <span className="hero__line"><span>Your coffee.</span></span>
            <span className="hero__line"><span>Your kind</span></span>
            <span className="hero__line"><span>of day.</span></span>
          </h1>
          <p className="lead hero__sub">Handcrafted by a barista and made exactly the way you like it, from the first shot to the last sip.</p>
          <div className="hero__actions">
            <a className="btn btn--solid" href="#menu">
              Explore the menu
            </a>
            <a className="btn btn--line" href={LINKS.stores} target="_blank" rel="noreferrer">
              Find a store
            </a>
          </div>
        </div>

        <div className="hero__stage">
          <CupAnchor
            name="hero"
            poster="/renders/cup-hero.png"
            posterAlt="A Starbucks hot cup with the green Siren logo, standing on a cream plinth among coffee beans."
            label="A Starbucks hot cup you can turn"
            className="hero__cup"
          />
          <Ring text="Drag to turn the cup · Starbucks · Since 1971 · " className="hero__ring" />
        </div>
      </div>
      <Wave fill="cream" />
    </section>
  );
}
