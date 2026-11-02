import { Fragment } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { business, contactPage } from '@/lib/site';

/* Contact page — "The bay": photo + hours / mobile / insurance / payment */
export default function Bay() {
  const b = contactPage.bay;
  return (
    <section className="map" data-theme="light">
      <div className="map__img"><Image src={b.img.src} width={b.img.w} height={b.img.h} alt={b.alt} sizes="(max-width: 980px) 100vw, 50vw" /></div>
      <div className="map__copy"><span className="eyebrow">{b.eyebrow}</span><h2 className="h-serif"><Rich text={b.title} /></h2>
        <dl>{b.facts.map(([dt, dd]) => <Fragment key={dt}><dt>{dt}</dt><dd>{dd}</dd></Fragment>)}</dl>
        <a href={`tel:${business.tel}`} className="btn btn--dark" data-magnetic style={{ alignSelf: 'flex-start' }}>{b.cta}</a></div>
    </section>
  );
}
