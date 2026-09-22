'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Wave } from '@/components/ui/Wave';
import { JOURNEY, PHOTOS, ROASTS, coffee } from '@/data/content';

type Step = (typeof JOURNEY)[number];

function RoastPicker() {
  const [roast, setRoast] = useState<(typeof ROASTS)[number]['id']>('medium');
  const r = ROASTS.find((x) => x.id === roast)!;
  const bags = coffee.filter((c) => c.group === roast);
  return (
    <div className="roast">
      <div className="roast__scale" role="radiogroup" aria-label="Roast">
        {ROASTS.map((x) => (
          <button key={x.id} type="button" role="radio" aria-checked={roast === x.id} className="roast__stop" onClick={() => setRoast(x.id)}>
            <span className="roast__dot" data-roast={x.id} aria-hidden="true" />
            {x.label}
          </button>
        ))}
      </div>
      <p className="roast__text" aria-live="polite">
        {r.text}
      </p>
      <ul className="roast__bags">
        {bags.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              className="roast__bag"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('sbx:goods', { detail: { tab: 'coffee', roast } }));
                document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="roast__thumb">
                <Image src={`${b.image}-560.webp`} alt="" fill sizes="64px" />
              </span>
              <span>
                <strong>{b.name.replace('Starbucks® ', '')}</strong>
                <small>{b.notes}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Visual({ step, active }: { step: Step; active: boolean }) {
  if (step.image === 'roast') {
    const trio = ['starbucks-veranda-blend', 'starbucks-pike-place-roast', 'starbucks-caffe-verona'];
    return (
      <div className="journey__visual journey__visual--bags" data-active={active} aria-hidden={!active}>
        {trio.map((id, i) => (
          <span key={id} className="journey__bag" style={{ '--i': i } as React.CSSProperties}>
            <Image src={`/products/${id}-1000.webp`} alt={i === 1 ? step.alt : ''} fill sizes="(max-width: 900px) 30vw, 16vw" />
          </span>
        ))}
      </div>
    );
  }
  const p = PHOTOS[step.image];
  return (
    <div className="journey__visual" data-active={active} aria-hidden={!active}>
      <Image src={p.src} alt={step.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
    </div>
  );
}

function StepBody({ step, onNext, nextLabel }: { step: Step; onNext?: () => void; nextLabel?: string }) {
  return (
    <>
      <p className="journey__text">{step.text}</p>
      {step.detail && <p className="soft">{step.detail}</p>}
      {step.id === 'roast' && <RoastPicker />}
      <div className="journey__links">
        <a className="link" href={step.source} target="_blank" rel="noreferrer">
          Read the source story<span className="sr-only"> on about.starbucks.com</span>
        </a>
        {onNext && (
          <button type="button" className="btn btn--line btn--sm" onClick={onNext}>
            Next: {nextLabel}
          </button>
        )}
      </div>
    </>
  );
}

export function Journey() {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (n: number, focus = false) => {
    setI(n);
    if (focus) tabs.current[n]?.focus();
  };
  const onKey = (e: React.KeyboardEvent, n: number) => {
    const L = JOURNEY.length;
    const to = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (n + 1) % L : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (n - 1 + L) % L : -1;
    if (to < 0) return;
    e.preventDefault();
    go(to, true);
  };

  return (
    <section id="coffee" className="journey section" data-ground="green" aria-labelledby="journey-title">
      <div className="shell">
        <div className="section__head">
          <h2 id="journey-title" className="h2">
            From the farm to your cup.
          </h2>
          <p className="soft journey__lede">Four steps every Starbucks coffee takes before it reaches the counter.</p>
        </div>

        {/* desktop: one scene, four selectable steps */}
        <div className="journey__split">
          <div className="journey__scene">
            {JOURNEY.map((s, n) => (
              <Visual key={s.id} step={s} active={n === i} />
            ))}
            <p className="journey__count" aria-hidden="true">
              {i + 1} / {JOURNEY.length}
            </p>
          </div>
          <div className="journey__steps">
            <div role="tablist" aria-orientation="vertical" aria-label="Steps from farm to cup" className="journey__tabs">
              {JOURNEY.map((s, n) => (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[n] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`jt-${s.id}`}
                  aria-selected={n === i}
                  aria-controls={`jp-${s.id}`}
                  tabIndex={n === i ? 0 : -1}
                  className="journey__tab"
                  onClick={() => go(n)}
                  onKeyDown={(e) => onKey(e, n)}
                >
                  <span className="journey__num">{n + 1}</span>
                  <span className="journey__name">{s.title}</span>
                </button>
              ))}
            </div>
            {JOURNEY.map((s, n) => (
              <div key={s.id} id={`jp-${s.id}`} role="tabpanel" aria-labelledby={`jt-${s.id}`} hidden={n !== i} className="journey__panel">
                <StepBody step={s} onNext={n < JOURNEY.length - 1 ? () => go(n + 1, true) : undefined} nextLabel={JOURNEY[n + 1]?.title} />
              </div>
            ))}
          </div>
        </div>

        {/* mobile: the same four steps in reading order */}
        <ol className="journey__list">
          {JOURNEY.map((s, n) => (
            <li key={s.id} className="journey__item">
              <div className="journey__scene journey__scene--item">
                <Visual step={s} active />
              </div>
              <h3 className="h3">
                <span className="journey__num">{n + 1}</span> {s.title}
              </h3>
              <StepBody step={s} />
            </li>
          ))}
        </ol>
      </div>
      <Wave fill="cream" slow />
    </section>
  );
}
