import { SIREN_PATHS, SIREN_VIEWBOX } from './siren-paths';

type Props = {
  size?: number | string;
  /** colour of the green artwork; the face/ground uses `ground` */
  ink?: string;
  ground?: string;
  className?: string;
  title?: string;
  trademark?: boolean;
};

/** The official Siren. Geometry is untouched; only the two fills change. */
export function Siren({
  size = 48,
  ink = 'var(--green)',
  ground = 'var(--cream)',
  className,
  title = 'Starbucks',
  trademark = false,
}: Props) {
  return (
    <svg
      viewBox={SIREN_VIEWBOX}
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
    >
      <circle cx="31" cy="31" r="30.002" fill={ground} />
      <path d={SIREN_PATHS[0]} fill={ink} />
      {trademark && <path d={SIREN_PATHS[1]} fill={ink} />}
    </svg>
  );
}
