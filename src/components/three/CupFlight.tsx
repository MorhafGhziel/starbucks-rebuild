'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useSyncExternalStore } from 'react';

const FlightScene = dynamic(() => import('./FlightScene'), { ssr: false });

const noop = () => () => {};
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia('(prefers-reduced-motion: reduce)');
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}
function useWebGL() {
  return useSyncExternalStore(
    noop,
    () => {
      const w = window as unknown as { __sbxGL?: boolean };
      if (w.__sbxGL === undefined) {
        try {
          const c = document.createElement('canvas');
          w.__sbxGL = !!(c.getContext('webgl2') || c.getContext('webgl'));
        } catch {
          w.__sbxGL = false;
        }
      }
      return w.__sbxGL;
    },
    () => false,
  );
}

/** Mounts the single travelling cup; without WebGL the anchors keep their posters. */
export function CupFlight() {
  const gl = useWebGL();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(true);

  // render only while the cup can be on screen (until "One store" has scrolled away)
  useEffect(() => {
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const brand = document.querySelector('[data-cup-anchor="brand"]');
        const past = brand ? brand.getBoundingClientRect().bottom < -80 : false;
        setActive(!past && !document.hidden);
      });
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  if (!gl) return null;
  return (
    <div className="cup-flight-layer" aria-hidden="true" data-active={active}>
      <FlightScene active={active} reduced={reduced} onReady={() => (document.documentElement.dataset.cup = 'live')} />
    </div>
  );
}
