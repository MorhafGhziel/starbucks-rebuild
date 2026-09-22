'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

const noop = () => () => {};

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: 'right' | 'full';
  ground?: 'cream' | 'green';
  children: React.ReactNode;
};

/**
 * Accessible side sheet: traps focus, closes on Escape or the scrim,
 * locks page scroll, and hands focus back to whatever opened it.
 */
export function Drawer({ open, onClose, label, side = 'right', ground = 'cream', children }: Props) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    const t = window.setTimeout(() => {
      panel.current?.querySelector<HTMLElement>('[data-autofocus], button, a, input')?.focus();
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close.current();
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex="0"]')];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      html.style.overflow = prev;
      opener.current?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;
  return createPortal(
    <div className={`drawer drawer--${side}`} data-open={open} aria-hidden={!open} inert={!open}>
      <div className="drawer__scrim" onClick={onClose} />
      <div ref={panel} className="drawer__panel" data-ground={ground} role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="icon-btn drawer__close" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
