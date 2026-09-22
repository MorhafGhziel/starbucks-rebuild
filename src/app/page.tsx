import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { MenuSection } from '@/components/sections/MenuSection';
import { BrandMoment } from '@/components/sections/BrandMoment';
import { HomeGoods } from '@/components/sections/HomeGoods';
import { Journey } from '@/components/sections/Journey';
import { Cafe } from '@/components/sections/Cafe';
import { Reuse } from '@/components/sections/Reuse';
import { Faq } from '@/components/sections/Faq';
import { Journal } from '@/components/sections/Journal';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <MenuSection />
        <BrandMoment />
        <HomeGoods />
        <Journey />
        <Cafe />
        <Reuse />
        <Faq />
        <Journal />
      </main>
      <Footer />
    </>
  );
}
