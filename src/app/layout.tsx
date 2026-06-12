import type { Metadata } from 'next';
import { Unbounded, Space_Grotesk, Cairo } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Header from '@/components/Header';
import { I18nProvider } from '@/components/I18nProvider';
import PwaRegister from '@/components/PwaRegister';
import { getDict } from '@/lib/i18n/server';
import { siteUrl } from '@/lib/utils';
import './globals.css';

const unbounded = Unbounded({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
});

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

const cairo = Cairo({
  weight: ['400', '600', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
});

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDict();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: dict.meta.title,
      template: '%s · KARKOOBA',
    },
    description: dict.meta.description,
    openGraph: {
      siteName: 'KARKOOBA',
      type: 'website',
      locale: 'en_AE',
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { dict, locale } = await getDict();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${unbounded.variable} ${spaceGrotesk.variable} ${cairo.variable}`}>
        <I18nProvider dict={dict} locale={locale}>
          <Header />
          {children}
          <footer className="site-footer">
            <p>
              <b>KARKOOBA</b> · كركوبة — {dict.footer.line}
            </p>
            <p style={{ marginTop: 10, display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/terms">{dict.footer.terms}</a>
              <a href="/privacy">{dict.footer.privacy}</a>
              <a href="/safety">{dict.footer.safety}</a>
            </p>
          </footer>
        </I18nProvider>
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
