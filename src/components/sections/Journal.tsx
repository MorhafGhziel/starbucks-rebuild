import Image from 'next/image';
import { Wave } from '@/components/ui/Wave';
import { JOURNAL, LINKS, PHOTOS, fmtDate } from '@/data/content';

export function Journal() {
  return (
    <section id="stories" className="journal section" data-ground="cream" aria-labelledby="journal-title">
      <div className="shell">
        <div className="section__head">
          <h2 id="journal-title" className="h2">
            Fresh from the coffeehouse.
          </h2>
          <a className="btn btn--line" href={LINKS.coffeeStories} target="_blank" rel="noreferrer">
            More Starbucks stories
          </a>
        </div>
        <ul className="journal__list">
          {JOURNAL.map((j) => {
            const p = PHOTOS[j.image];
            return (
              <li key={j.href} className="story">
                <div className="story__media" data-ground={j.image === 'bag' ? 'green' : undefined}>
                  <Image src={p.src} alt="" fill sizes="(max-width: 700px) 80vw, (max-width: 1100px) 45vw, 22vw" />
                </div>
                <p className="story__meta">
                  <span>{j.kind}</span>
                  <time dateTime={j.date}>{fmtDate(j.date)}</time>
                </p>
                <h3 className="story__title">
                  <a href={j.href} target="_blank" rel="noreferrer">
                    {j.title}
                  </a>
                </h3>
                <p className="story__sum">{j.summary}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <Wave fill="green" />
    </section>
  );
}
