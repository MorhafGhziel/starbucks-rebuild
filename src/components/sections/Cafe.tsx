import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { Wave } from '@/components/ui/Wave';
import { LINKS, PHOTOS } from '@/data/content';

// Starbucks' store locator does not accept a location in its URL (tested
// 22 Sep 2026: ?map= and ?place= are reset to the whole-US view), so this
// page never asks for location itself. The official locator asks, on its own
// page, only if the visitor chooses to share it there.
export function Cafe() {
  return (
    <section id="stores" className="cafe section" data-ground="cream" aria-labelledby="cafe-title">
      <div className="shell cafe__grid">
        <figure className="cafe__photo">
          <Image src={PHOTOS.barista.src} alt="A Starbucks barista in a green apron and cap hands a cup to a customer." fill sizes="(max-width: 900px) 100vw, 58vw" />
        </figure>
        <figure className="cafe__photo cafe__photo--small">
          <Image src={PHOTOS.b2c2.src} alt="A barista shaking a drink behind the counter." fill sizes="(max-width: 900px) 50vw, 22vw" />
        </figure>

        <div className="cafe__copy">
          <h2 id="cafe-title" className="h2">
            Made for you, by name.
          </h2>
          <p className="lead">
            Green Apron baristas handcraft every drink, remember the regulars and customize an order however you like it. A Black Apron
            is the mark of a Starbucks Coffee Master.
          </p>

          <div className="finder" data-ground="green">
            <h3 className="h3">Find your Starbucks</h3>
            <p className="finder__text">
              Search by city or ZIP code for hours, directions and ordering options at the stores near you.
            </p>
            <div className="finder__actions">
              <a className="btn btn--solid" href={LINKS.stores} target="_blank" rel="noreferrer">
                <Icon name="pin" size={20} />
                Open the store locator
              </a>
            </div>
            <p className="finder__status">
              Opens starbucks.com. You can let it use your location there, or just type a place. This page never asks for it.
            </p>
          </div>
        </div>
      </div>
      <Wave fill="green" />
    </section>
  );
}
