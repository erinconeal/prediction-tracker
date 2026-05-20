import type { Metadata } from 'next';
import {
  IBM_Plex_Mono,
  Instrument_Serif,
  Source_Sans_3,
} from 'next/font/google';
import { SiteHeader } from '@/components/layout/SiteHeader';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  variable: '--font-pt-display',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const sourceSans3 = Source_Sans_3({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-pt-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prediction Tracker',
  description:
    'Track predictions from public figures and measure accuracy over time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${sourceSans3.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <a
          href="#main-content"
          className="fixed start-4 top-0 z-[200] -translate-y-full rounded-b-md bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-md transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
