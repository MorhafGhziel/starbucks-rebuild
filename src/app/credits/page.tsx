import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SOURCES } from '@/data/content';

export const metadata: Metadata = {
  title: 'Sources and credits | Starbucks (concept)',
};

export default function CreditsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-head" data-ground="green">
          <div className="shell">
            <h1 className="display page-head__title">Sources and credits.</h1>
            <p className="lead">This is an independent concept redesign. It is not affiliated with, endorsed by or sponsored by Starbucks.</p>
          </div>
        </section>
        <section className="section section--tight" data-ground="cream" aria-label="Sources">
          <div className="shell credits">
            <p>
              Starbucks, the Siren logo and the product names are trademarks of Starbucks Corporation, used here to show the concept.
              Every fact, price and product on these pages was read from Starbucks’ own sites on 22 September 2026.
            </p>
            <table className="credits__table">
              <thead>
                <tr>
                  <th scope="col">What</th>
                  <th scope="col">Where it comes from</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map(([what, where, href]) => (
                  <tr key={what}>
                    <td>{what}</td>
                    <td>
                      <a className="link" href={href} target="_blank" rel="noreferrer">
                        {where}
                      </a>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>3D cup, lid, sleeve and beans</td>
                  <td>Modeled for this concept in Three.js from real proportions, printed with the official Siren</td>
                </tr>
                <tr>
                  <td>Photo treatment</td>
                  <td>Every photo is mapped onto the two site colors, #00754A and #F7F5EE</td>
                </tr>
                <tr>
                  <td>Type</td>
                  <td>Young Serif and Figtree, both under the SIL Open Font License</td>
                </tr>
              </tbody>
            </table>
            <p className="soft">
              The bag on this site is a concept. It keeps a list in your browser and links each item to shop.starbucks.com; nothing is charged
              or sent anywhere. The site never asks for your location; store search happens on the official store locator.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
