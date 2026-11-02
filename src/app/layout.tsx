import type { Metadata, Viewport } from 'next';
import './globals.css';
import { sans } from './fonts';
import { MotionProvider } from '@/lib/motion';
import { businessJsonLd, pageMetadata } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import Gate from '@/components/Gate';
import { GATE_KEY } from '@/lib/keys';
import Chrome from '@/components/Chrome';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata('home', '/'),
};

export const viewport: Viewport = { themeColor: '#0c0c0c' };

// Runs before first paint: if the gate was already played this session,
// hide it and start with the curtain closed (see globals.css additions).
const gateScript = `try{if(sessionStorage.getItem('${GATE_KEY}'))document.documentElement.setAttribute('data-gate','seen')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: gateScript }} />
      </head>
      <body>
        <MotionProvider>
          <Gate />
          {/* page-transition curtain */}
          <div className="curtain" id="curtain" aria-hidden="true"><span className="mark">R</span></div>
          <Chrome />
          <Nav />
          <main id="top">{children}</main>
          <Footer />
        </MotionProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }} />
      </body>
    </html>
  );
}
