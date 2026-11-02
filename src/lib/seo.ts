/* SEO helpers — per-page metadata (OG / Twitter / canonical) + JSON-LD */
import type { Metadata } from 'next';
import { business, IMG, pages, SITE_URL, type Img } from './site';

export function pageMetadata(key: keyof typeof pages, path: string, image: Img = IMG.hero): Metadata {
  const { title, description } = pages[key];
  const images = [{ url: image.src, width: image.w, height: image.h, alt: business.name }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'en_US', siteName: business.name, url: path, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images: images.map(i => i.url) },
  };
}

/* LocalBusiness → AutoRepair. Add streetAddress / postalCode once the bay address is public. */
export const businessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  '@id': `${SITE_URL}/#business`,
  name: business.name,
  legalName: business.legalName,
  description: business.description,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}${IMG.hero.src}`,
  telephone: business.telE164,
  email: business.email,
  priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: business.city, addressRegion: business.region, addressCountry: business.country },
  areaServed: { '@type': 'City', name: 'Columbus, Ohio' },
  openingHoursSpecification: business.openingHours.map(h => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes,
  })),
};
