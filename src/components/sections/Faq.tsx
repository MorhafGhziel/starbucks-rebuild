'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { FAQ } from '@/data/content';

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="faq section" data-ground="cream" aria-labelledby="faq-title">
      <div className="shell faq__grid">
        <div>
          <h2 id="faq-title" className="h2">
            Good questions.
          </h2>
          <p className="soft faq__lede">Answers come from Starbucks’ own Coffee Science stories and announcements.</p>
        </div>
        <div className="acc">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q} className="acc__item" data-open={on}>
                <h3 className="acc__h">
                  <button type="button" className="acc__btn" aria-expanded={on} aria-controls={`faq-${i}`} id={`faqb-${i}`} onClick={() => setOpen(on ? null : i)}>
                    <span>{f.q}</span>
                    <span className="acc__icon" aria-hidden="true">
                      <Icon name="plus" size={20} />
                    </span>
                  </button>
                </h3>
                <div className="acc__panel" id={`faq-${i}`} role="region" aria-labelledby={`faqb-${i}`}>
                  <div className="acc__inner">
                    <p>{f.a}</p>
                    <a className="link" href={f.source} target="_blank" rel="noreferrer" tabIndex={on ? 0 : -1}>
                      Source<span className="sr-only"> for “{f.q}”</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
