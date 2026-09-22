'use client';

import Image from 'next/image';
import { AddButton } from '@/components/products/ProductCard';
import { Ring } from '@/components/ui/Ring';
import { Wave } from '@/components/ui/Wave';
import { LINKS, goods } from '@/data/content';

const sleeve = goods.find((g) => g.id === 'starbucks-stainless-steel-insulated-sleeve')!;
const cold = goods.find((g) => g.id === 'starbucks-classic-cold-cup')!;

export function Reuse() {
  return (
    <section id="reuse" className="reuse section" data-ground="green" aria-labelledby="reuse-title">
      <div className="shell reuse__grid">
        <div className="reuse__copy">
          <h2 id="reuse-title" className="h2">
            Bring your own cup.
          </h2>
          <p className="lead">
            In the U.S. and Canada, a clean personal cup works everywhere you order: in the café, at the drive-thru and in the Starbucks app.
          </p>
          <a className="link" href={LINKS.reuseSearch} target="_blank" rel="noreferrer">
            Starbucks stories on reusable cups<span className="sr-only"> (about.starbucks.com)</span>
          </a>
        </div>

        <div className="reuse__stage">
          <div className="reuse__tile" data-ground="cream">
            <Image src={`${sleeve.image}-1000.webp`} alt={sleeve.name} fill sizes="(max-width: 900px) 90vw, 40vw" />
          </div>
          <div className="reuse__tile reuse__tile--small" data-ground="cream">
            <Image src={`${cold.image}-1000.webp`} alt={cold.name} fill sizes="(max-width: 900px) 45vw, 18vw" />
          </div>
          <Ring text="Bring your own cup · Bring your own cup · " className="reuse__ring" />

          <ul className="callouts">
            <li className="callout callout--a">
              <strong>Insulated Sleeve</strong>
              <span>Made from 90% recycled stainless steel. A 16 oz hot cup slides in and stays hotter, longer.</span>
            </li>
            <li className="callout callout--b">
              <strong>Classic Cold Cup</strong>
              <span>24 oz, clear, with a matching reusable straw.</span>
            </li>
            <li className="callout callout--c">
              <strong>FlavorLock</strong>
              <span>Built into Starbucks coffee bags: it lets roasting gases out and keeps air from dulling the beans.</span>
            </li>
          </ul>
        </div>

        <div className="reuse__buy">
          <div>
            <p className="reuse__name">{sleeve.name}</p>
            <p className="soft body-sm">$24.95, 16 oz</p>
          </div>
          <AddButton product={sleeve} />
          <div>
            <p className="reuse__name">{cold.name}</p>
            <p className="soft body-sm">$14.95, 24 oz</p>
          </div>
          <AddButton product={cold} />
        </div>
      </div>
      <Wave fill="cream" slow />
    </section>
  );
}
