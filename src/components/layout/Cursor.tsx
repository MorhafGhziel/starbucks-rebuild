'use client';

import { useEffect, useRef } from 'react';

/**
 * A quiet custom cursor for mouse users: a dot that tracks exactly and a ring
 * that glides after it. The ring grows over anything clickable, reads "Drag"
 * over draggable things, and takes the colour that contrasts with the section
 * underneath (green on cream, cream on green).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    const html = document.documentElement;
    html.classList.add('has-cursor');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, shown = false;
    const d = dot.current!;
    const r = ring.current!;

    const state = (el: Element | null) => {
      const drag = el?.closest('[data-cup-anchor], .flow');
      const hot = el?.closest('a, button, [role="tab"], [role="radio"], label, summary, .chip');
      const text = el?.closest('input, textarea, [contenteditable="true"]');
      const ground = el?.closest('[data-ground]')?.getAttribute('data-ground');
      r.dataset.mode = text ? 'text' : drag && !hot ? 'drag' : hot ? 'hot' : '';
      d.dataset.mode = r.dataset.mode;
      // a filled control (e.g. a cream button on green) decides the contrast itself
      let light = ground !== 'green';
      if (hot) {
        const m = getComputedStyle(hot).backgroundColor.match(/\d+(\.\d+)?/g);
        if (m && (m[3] === undefined || +m[3] > 0.5)) light = +m[0] * 0.2126 + +m[1] * 0.7152 + +m[2] * 0.0722 > 140;
      }
      html.dataset.cursorGround = light ? 'cream' : 'green';
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        d.style.opacity = r.style.opacity = '1';
      }
      state(e.target as Element);
    };
    const down = () => r.classList.add('is-down');
    const up = () => r.classList.remove('is-down');
    const leave = () => {
      shown = false;
      d.style.opacity = r.style.opacity = '0';
    };

    const loop = () => {
      const k = reduced ? 1 : 0.2;
      rx += (x - rx) * k;
      ry += (y - ry) * k;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', leave);
      html.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span>Drag</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
