/* Typography — Inter (body, numbers) + Sora (headings).
   next/font downloads them at build time and serves them from the site itself. */
import { Inter, Sora } from 'next/font/google';

export const sans = Inter({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-sans',
  display: 'swap',
});

export const display = Sora({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-display',
  display: 'swap',
});
