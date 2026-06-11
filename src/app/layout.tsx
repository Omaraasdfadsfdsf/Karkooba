import type { Metadata } from 'next';
import { Archivo_Black, Space_Grotesk, Cairo } from 'next/font/google';
import Header from '@/components/Header';
import { siteUrl } from '@/lib/utils';
import './globals.css';

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

const cairo = Cairo({
  weight: '700',
  subsets: ['arabic'],
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "KARKOOBA — One man's junk, another man's jackpot",
    template: '%s · KARKOOBA',
  },
  description:
    "The UAE's classifieds board for cheap secondhand finds. Everything under AED 999 — fans with personality, chairs with history, cables from civilizations unknown.",
  openGraph: {
    siteName: 'KARKOOBA',
    type: 'website',
    locale: 'en_AE',
    title: "KARKOOBA — One man's junk, another man's jackpot",
    description:
      "The UAE's classifieds board for cheap secondhand finds. Everything under AED 999.",
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${spaceGrotesk.variable} ${cairo.variable}`}>
        <Header />
        {children}
        <footer className="site-footer">
          <b>KARKOOBA</b> · كركوبة · Where the UAE&apos;s forgotten things find new homes.
          Nothing here is fancy — that&apos;s the point.
        </footer>
      </body>
    </html>
  );
}
