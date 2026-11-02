/* Typography — Manrope (variable, 300–800) for headings, numbers and body.
   next/font downloads it at build time and serves it from the site itself. */
import { Manrope } from 'next/font/google';

export const sans = Manrope({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-sans',
  display: 'swap',
});
