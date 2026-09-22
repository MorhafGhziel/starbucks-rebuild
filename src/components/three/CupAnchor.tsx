'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { cupStore } from './cupStore';

type Props = {
  name: 'hero' | 'brand';
  poster: string;
  posterAlt: string;
  label: string;
  className?: string;
};

/**
 * A place the cup can sit. The 3D cup itself lives in one fixed canvas
 * (CupFlight) that reads this element's position every frame; this element
 * owns the poster fallback and the drag / keyboard input.
 */
export function CupAnchor({ name, poster, posterAlt, label, className }: Props) {
  const drag = useRef<{ x: number; y: number; yaw: number; id: number; axis: 'x' | 'y' | null } | null>(null);

  // the cup can only be turned while it rests here, not mid-flight
  const here = () => (name === 'hero' ? cupStore.flight < 0.01 : cupStore.flight > 0.99);
  const onDown = (e: React.PointerEvent) => {
    if (!here()) return;
    drag.current = { x: e.clientX, y: e.clientY, yaw: cupStore.yaw, id: e.pointerId, axis: e.pointerType === 'mouse' ? 'x' : null };
    if (e.pointerType === 'mouse') (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    // on touch, vertical swipes keep scrolling the page
    if (!d.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis === 'x') (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (d.axis !== 'x') return;
    cupStore.touched = true;
    cupStore.yaw = d.yaw + dx * 0.012;
  };
  const onUp = () => {
    drag.current = null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (!here()) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      cupStore.touched = true;
      cupStore.yaw += (e.key === 'ArrowLeft' ? -1 : 1) * (Math.PI / 8);
    }
    if (e.key === 'Home') {
      e.preventDefault();
      cupStore.yaw = 0;
    }
  };

  return (
    <div
      className={`cup-stage cup-stage--${name} ${className ?? ''}`}
      data-cup-anchor={name}
      tabIndex={0}
      role="img"
      aria-label={`${label}. Use the left and right arrow keys to turn it.`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
    >
      <Image className="cup-stage__poster" src={poster} alt={posterAlt} fill sizes="(max-width: 900px) 100vw, 55vw" priority={name === 'hero'} />
    </div>
  );
}
