import type { Metadata, Viewport } from 'next';
import { Young_Serif, Figtree } from 'next/font/google';
import { BagProvider } from '@/components/bag/BagProvider';
import { AnchorScroll } from '@/components/layout/AnchorScroll';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import './globals.css';
import './sections.css';
import './pages.css';

const display = Young_Serif({ subsets: ['latin'], weight: '400', variable: '--font-display', display: 'swap' });
const sans = Figtree({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Starbucks: your coffee, your kind of day (concept)',
  description:
    'An independent concept redesign of the Starbucks website: the menu, whole bean coffee, drinkware and the journey from bean to cup. Not affiliated with Starbucks.',
  robots: { index: false, follow: false },
  icons: { icon: '/brand/siren-icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#00754A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <BagProvider>{children}</BagProvider>
        <AnchorScroll />
        <SmoothScroll />
      </body>
    </html>
  );
}
