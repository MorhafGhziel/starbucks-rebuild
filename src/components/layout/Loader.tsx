'use client';

import { useEffect, useState } from 'react';
import { Siren } from '@/components/brand/Siren';

/**
 * Covers the home page until the 3D cup has drawn its first frame
 * (html[data-cup="live"]), so the first scroll is already the real one.
 * Without WebGL, with reduced motion, or after 8 s it simply lifts.
 * Scrolling is held by CSS (html:has(.loader[data-state="on"])) from the first paint.
 */
export function Loader() {
  const [state, setState] = useState<'on' | 'out' | 'gone'>('on');

  useEffect(() => {
    const root = document.documentElement;
    let gl = false;
    try {
      const c = document.createElement('canvas');
      gl = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {}
    const instant = !gl || matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo(0, 0);
    // Lenis is created after this effect (SmoothScroll mounts later)
    const hold = requestAnimationFrame(() => !done && window.__lenis?.stop());

    let done = false;
    const lift = () => {
      if (done) return;
      done = true;
      mo.disconnect();
      clearTimeout(cap);
      window.__lenis?.start();
      setState('out');
      setTimeout(() => setState('gone'), 600);
    };
    const mo = new MutationObserver(() => root.dataset.cup === 'live' && lift());
    mo.observe(root, { attributes: true, attributeFilter: ['data-cup'] });
    const cap = window.setTimeout(lift, 8000);
    if (instant || root.dataset.cup === 'live') lift();
    return () => {
      cancelAnimationFrame(hold);
      mo.disconnect();
      clearTimeout(cap);
      window.__lenis?.start();
    };
  }, []);

  if (state === 'gone') return null;
  return (
    <div className="loader" data-state={state} role="status" aria-live="polite">
      <Siren size={64} title="Loading" />
      <span className="loader__bar" aria-hidden="true" />
    </div>
  );
}
