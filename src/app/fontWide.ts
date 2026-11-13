/* Wide display face for the big uppercase titles — Archivo (variable width + weight),
   SIL Open Font License (see src/fonts/ARCHIVO-OFL.txt). Served from the site itself. */
import localFont from 'next/font/local';

export const wide = localFont({
  src: '../fonts/archivo-wide.woff2',
  variable: '--font-wide',
  weight: '100 900',
  display: 'swap',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
});
