import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShopCatalog } from './ShopCatalog';

export const metadata: Metadata = {
  title: 'Shop coffee and drinkware | Starbucks (concept)',
  description: 'Whole bean coffee, drinkware and brewers from the official Starbucks shop. Independent concept redesign, not affiliated with Starbucks.',
};

export default function ShopPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-head" data-ground="green">
          <div className="shell">
            <h1 className="display page-head__title">Take it home.</h1>
            <p className="lead">Whole bean coffee, cups and brewers, with prices from shop.starbucks.com.</p>
          </div>
        </section>
        <section className="section section--tight" data-ground="cream" aria-label="Products">
          <div className="shell">
            <ShopCatalog />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
