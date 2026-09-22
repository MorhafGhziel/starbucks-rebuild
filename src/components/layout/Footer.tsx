import Link from 'next/link';
import { Siren } from '@/components/brand/Siren';
import { LINKS, SOCIAL } from '@/data/content';

const COLS = [
  {
    title: 'Coffee',
    links: [
      { label: 'Menu', href: '/menu' },
      { label: 'Shop coffee and drinkware', href: '/shop' },
      { label: 'From farm to cup', href: '/#coffee' },
      { label: 'Questions', href: '/#faq' },
    ],
  },
  {
    title: 'Order and visit',
    links: [
      { label: 'Order on starbucks.com', href: LINKS.order },
      { label: 'Find a store', href: LINKS.stores },
      { label: 'Starbucks Rewards', href: LINKS.rewards },
      { label: 'Gift cards', href: LINKS.giftCards },
    ],
  },
  {
    title: 'Starbucks',
    links: [
      { label: 'About Starbucks', href: LINKS.about },
      { label: 'Stories', href: LINKS.coffeeStories },
      { label: 'Careers', href: LINKS.careers },
      { label: 'Customer service', href: LINKS.customerService },
    ],
  },
];

const ext = (h: string) => h.startsWith('http');

export function Footer() {
  return (
    <footer className="footer" data-ground="green">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <Siren size={88} ink="var(--green)" ground="var(--cream)" title="Starbucks" />
            <p className="footer__line">Your coffee. Your kind of day.</p>
          </div>
          <nav className="footer__cols" aria-label="Footer">
            {COLS.map((c) => (
              <div key={c.title}>
                <h2 className="footer__h">{c.title}</h2>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {ext(l.href) ? (
                        <a href={l.href} target="_blank" rel="noreferrer">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href}>{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="footer__h">Follow</h2>
              <ul>
                {SOCIAL.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noreferrer">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className="footer__bottom">
          <p className="footer__concept">
            Independent concept redesign. Not affiliated with Starbucks. Built by{' '}
            <a className="footer__sima" href="https://www.simastudio.it.com" target="_blank" rel="noreferrer">
              SIMA Studio
            </a>
          </p>
          <ul className="footer__legal">
            <li>
              <Link href="/credits">Sources and credits</Link>
            </li>
            <li>
              <a href={LINKS.privacy} target="_blank" rel="noreferrer">
                Starbucks privacy notice
              </a>
            </li>
            <li>
              <a href={LINKS.terms} target="_blank" rel="noreferrer">
                Starbucks terms of use
              </a>
            </li>
            <li>
              <a href="#main">Back to top</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
