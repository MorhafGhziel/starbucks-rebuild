import { Siren } from '@/components/brand/Siren';

/** A slowly turning ring of type around a small Siren: the logo's outer band, as a sticker. */
export function Ring({ text, className }: { text: string; className?: string }) {
  const id = `ring-${text.length}-${text.charCodeAt(0)}`;
  return (
    <div className={`ring ${className ?? ''}`} aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id={id} d="M60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text>
          <textPath href={`#${id}`} textLength={289} lengthAdjust="spacing">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <span className="ring__core">
        <Siren size="78%" ink="var(--bg)" ground="var(--fg)" title="" />
      </span>
    </div>
  );
}
