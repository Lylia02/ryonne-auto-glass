'use client';
/* Home fleet teaser — heading reveal + depot image parallax */
import { useRef } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import TLink from './TLink';
import { parallax, splitReveal, useGsap } from '@/lib/motion';
import { home } from '@/lib/site';

export default function FleetBlock() {
  const ref = useRef<HTMLElement>(null);
  const f = home.fleetBlock;

  useGsap(() => { splitReveal(ref.current!); parallax(ref.current!); }, [], { fonts: true });

  return (
    <section className="guide" data-theme="light" ref={ref}>
      <div className="guide__head">
        <span className="eyebrow">{f.eyebrow}</span>
        <h2 className="h-serif" data-split><Rich text={f.title} /></h2>
        <p>{f.text}</p>
        <TLink href="/fleet" className="btn btn--dark" data-magnetic>{f.cta} <i>»</i></TLink>
      </div>
      <div className="guide__video" data-cursor="Play">
        <Image src={f.img.src} width={f.img.w} height={f.img.h} alt={f.alt} data-speed="0.92" sizes="(max-width: 1440px) 92vw, 1320px" />
      </div>
      <span className="guide__badge">{f.badge}</span>
    </section>
  );
}
