import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MenuCatalog } from './MenuCatalog';

export const metadata: Metadata = {
  title: 'Menu | Starbucks (concept)',
  description: 'Starbucks drinks with official descriptions, calories and caffeine. Independent concept redesign, not affiliated with Starbucks.',
};

export default function MenuPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-head" data-ground="green">
          <div className="shell">
            <h1 className="display page-head__title">The menu.</h1>
            <p className="lead">Sixteen favorites from the starbucks.com menu, with the calories and caffeine for a Grande.</p>
          </div>
        </section>
        <section className="section section--tight" data-ground="cream" aria-label="Drinks">
          <div className="shell">
            <MenuCatalog />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
