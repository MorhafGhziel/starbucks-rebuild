/**
 * The section edge. Its curve borrows the long S-bend of the Siren's hair,
 * repeated so it can drift sideways without a seam. `fill` is the colour of
 * the section it leads INTO; it sits on the bottom edge of the section above.
 */
type Props = { fill: 'green' | 'cream'; flip?: boolean; className?: string; slow?: boolean };

// one period = 720 units wide; drawn over two periods so a -50% translate loops
const PERIOD =
  'c 60 0 90 -34 180 -34 s 120 34 180 34 s 120 -22 180 -22 s 120 22 180 22';

export function Wave({ fill, flip, className, slow }: Props) {
  const d = `M0 34 ${PERIOD} ${PERIOD} V 80 H 0 Z`;
  return (
    <div className={`wave ${flip ? 'wave--flip' : ''} ${className ?? ''}`} aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={slow ? 'wave__svg wave__svg--slow' : 'wave__svg'}>
        <path d={d} fill={`var(--${fill})`} />
      </svg>
    </div>
  );
}
