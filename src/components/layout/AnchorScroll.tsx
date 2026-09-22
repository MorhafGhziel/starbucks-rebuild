'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

/**
 * Smooth in-page anchor jumps. CSS `scroll-behavior: smooth` fights
 * ScrollTrigger (its refresh interrupts the native smooth scroll), so
 * same-page hash links are scrolled with GSAP instead.
 */
export function AnchorScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top = el.getBoundingClientRect().top + scrollY - 96;
      gsap.to(window, { scrollTo: { y: Math.max(0, top), autoKill: true }, duration: reduced ? 0 : Math.min(1.4, 0.5 + Math.abs(top - scrollY) / 4000), ease: 'power2.inOut' });
      history.pushState(null, '', url.hash);
      // move focus for keyboard and screen-reader users
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
