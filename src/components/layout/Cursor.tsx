'use client';

import { useEffect, useRef } from 'react';

/**
 * A quiet custom cursor for mouse users: a dot and a ring that glide after the
 * pointer with frame-rate-independent easing. Only transforms change (GPU), so
 * movement and state changes stay seamless. The ring grows over clickable
 * things, reads "Drag" over draggable ones, and contrasts with what's under it.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    const html = document.documentElement;
    html.classList.add('has-cursor');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = dot.current!;
    const r = ring.current!;

    let x = -100, y = -100, dx = -100, dy = -100, rx = -100, ry = -100;
    let raf = 0, last = performance.now(), shown = false, target: Element | null = null, dirty = false;

    const state = () => {
      dirty = false;
      const el = target;
      const drag = el?.closest('[data-cup-anchor], .flow');
      const hot = el?.closest('a, button, [role="tab"], [role="radio"], label, summary, .chip');
      const text = el?.closest('input, textarea, [contenteditable="true"]');
      const ground = el?.closest('[data-ground]')?.getAttribute('data-ground');
      const mode = text ? 'text' : drag && !hot ? 'drag' : hot ? 'hot' : '';
      if (r.dataset.mode !== mode) r.dataset.mode = d.dataset.mode = mode;
      let light = ground !== 'green';
      if (hot) {
        const m = getComputedStyle(hot).backgroundColor.match(/\d+(\.\d+)?/g);
        if (m && (m[3] === undefined || +m[3] > 0.5)) light = +m[0] * 0.2126 + +m[1] * 0.7152 + +m[2] * 0.0722 > 140;
      }
      const g = light ? 'cream' : 'green';
      if (html.dataset.cursorGround !== g) html.dataset.cursorGround = g;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        dx = rx = x;
        dy = ry = y;
        d.style.opacity = r.style.opacity = '1';
      }
      if (e.target !== target) {
        target = e.target as Element;
        dirty = true;
      }
    };
    // what's under the pointer changes while scrolling too
    const scrolled = () => {
      if (shown) {
        target = document.elementFromPoint(x, y);
        dirty = true;
      }
    };
    const down = () => r.classList.add('is-down');
    const up = () => r.classList.remove('is-down');
    const leave = () => {
      shown = false;
      d.style.opacity = r.style.opacity = '0';
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // exponential smoothing: same feel at 60, 120 or 144 Hz
      const kd = reduced ? 1 : 1 - Math.exp(-dt * 38);
      const kr = reduced ? 1 : 1 - Math.exp(-dt * 11);
      dx += (x - dx) * kd;
      dy += (y - dy) * kd;
      rx += (x - rx) * kr;
      ry += (y - ry) * kr;
      d.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (dirty) state();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scrolled, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scrolled);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', leave);
      html.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <i />
        <span>Drag</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true">
        <i />
      </div>
    </>
  );
}
