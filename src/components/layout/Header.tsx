'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Siren } from '@/components/brand/Siren';
import { Icon } from '@/components/ui/Icon';
import { Drawer } from '@/components/ui/Drawer';
import { useBag } from '@/components/bag/BagProvider';
import { BagDrawer } from '@/components/bag/BagDrawer';
import { LINKS } from '@/data/content';

const NAV = [
  { label: 'Menu', href: '/menu' },
  { label: 'Our Coffee', href: '/#coffee' },
  { label: 'Drinkware', href: '/#home' },
];

export function Header() {
  const bag = useBag();
  const [menu, setMenu] = useState(false);
  const [bump, setBump] = useState(false);

  // a small nudge on the bag when something is added
  useEffect(() => {
    if (!bag.lastAdded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- transient feedback
    setBump(true);
    const t = setTimeout(() => setBump(false), 700);
    return () => clearTimeout(t);
  }, [bag.lastAdded, bag.count]);

  return (
    <>
      <header className="header">
        <div className="header__bar">
          <button type="button" className="icon-btn header__burger" onClick={() => setMenu(true)} aria-label="Open menu">
            <Icon name="menu" size={24} />
          </button>
          <nav className="header__nav" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="header__link">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="header__logo" aria-label="Starbucks home">
            <Siren size={52} title="" />
          </Link>
          <div className="header__actions">
            <a className="header__link header__store" href={LINKS.stores} target="_blank" rel="noreferrer">
              <Icon name="pin" size={20} />
              Find a Store
            </a>
            <button
              type="button"
              className="icon-btn header__bag"
              data-bump={bump}
              onClick={() => bag.setOpen(true)}
              aria-label={`Bag, ${bag.count} ${bag.count === 1 ? 'item' : 'items'}`}
            >
              <Icon name="bag" size={24} />
              {bag.count > 0 && (
                <span className="header__count" aria-hidden="true">
                  {bag.count}
                </span>
              )}
            </button>
            <a className="btn btn--solid btn--sm header__order" href={LINKS.order} target="_blank" rel="noreferrer">
              Order now
            </a>
          </div>
        </div>
      </header>

      <Drawer open={menu} onClose={() => setMenu(false)} label="Menu" side="full" ground="green">
        <nav className="mnav" aria-label="Mobile">
          <Siren size={64} ink="var(--green)" ground="var(--cream)" title="Starbucks" />
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setMenu(false)}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={LINKS.stores} target="_blank" rel="noreferrer">
                Find a Store
              </a>
            </li>
          </ul>
          <div className="mnav__foot">
            <a className="btn btn--solid" href={LINKS.order} target="_blank" rel="noreferrer">
              Order on starbucks.com
            </a>
            <a className="btn btn--line" href={LINKS.rewards} target="_blank" rel="noreferrer">
              Starbucks Rewards
            </a>
          </div>
        </nav>
      </Drawer>

      <BagDrawer />
    </>
  );
}
