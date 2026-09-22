'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CupControl } from './CupScene';

const CupScene = dynamic(() => import('./CupScene'), { ssr: false });

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

type Props = {
  mode: 'hero' | 'inspect';
  poster: string;
  posterAlt: string;
  lidOpen?: boolean;
  sleeveOn?: boolean;
  /** bump to nudge the cup; sign = direction */
  nudge?: { n: number; dir: number };
  resetKey?: number;
  className?: string;
  label: string;
};

export function CupStage({ mode, poster, posterAlt, lidOpen, sleeveOn, nudge, resetKey, className, label }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const control = useRef<CupControl>({ yaw: 0, touched: false });
  const [visible, setVisible] = useState(false);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const reduced = useReducedMotion();
  const gl = useWebGL();

  // mount when close, run only when on screen and the tab is visible
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const far = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '600px 0px' });
    const on = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    far.observe(el);
    on.observe(el);
    const vis = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', vis);
    return () => {
      far.disconnect();
      on.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  useEffect(() => {
    if (!nudge || nudge.n === 0) return;
    control.current.touched = true;
    control.current.yaw += (Math.PI / 4) * nudge.dir;
  }, [nudge]);
  useEffect(() => {
    if (!resetKey) return;
    control.current.yaw = Math.round(control.current.yaw / (Math.PI * 2)) * Math.PI * 2;
    control.current.touched = mode === 'inspect';
  }, [resetKey, mode]);

  // drag to turn (pointer events cover mouse, pen and touch)
  const drag = useRef<{ x: number; y: number; yaw: number; id: number; axis: 'x' | 'y' | null } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, yaw: control.current.yaw, id: e.pointerId, axis: e.pointerType === 'mouse' ? 'x' : null };
    if (e.pointerType === 'mouse') (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    // on touch, let vertical swipes scroll the page
    if (!d.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis === 'x') (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (d.axis !== 'x') return;
    control.current.touched = true;
    control.current.yaw = d.yaw + dx * 0.012;
  };
  const onUp = () => {
    drag.current = null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      control.current.touched = true;
      control.current.yaw += (e.key === 'ArrowLeft' ? -1 : 1) * (Math.PI / 8);
    }
    if (e.key === 'Home') {
      e.preventDefault();
      control.current.yaw = 0;
    }
  };

  const live = gl && near;
  return (
    <div
      ref={wrap}
      className={`cup-stage cup-stage--${mode} ${className ?? ''}`}
      data-ready={ready && live}
      tabIndex={live ? 0 : -1}
      role={live ? 'img' : undefined}
      aria-label={live ? `${label}. Use the left and right arrow keys to turn it.` : undefined}
      onPointerDown={live ? onDown : undefined}
      onPointerMove={live ? onMove : undefined}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={live ? onKey : undefined}
    >
      <Image className="cup-stage__poster" src={poster} alt={live ? '' : posterAlt} fill sizes="(max-width: 900px) 100vw, 55vw" priority={mode === 'hero'} />
      {live && (
        <CupScene
          mode={mode}
          control={control}
          lidOpen={lidOpen}
          sleeveOn={sleeveOn}
          active={visible && !tabHidden}
          reduced={reduced}
          onReady={() => setReady(true)}
        />
      )}
    </div>
  );
}
