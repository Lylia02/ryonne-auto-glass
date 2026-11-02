'use client';
/* Services page — one alternating block per service */
import { useRef } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import TLink from './TLink';
import { parallax, splitReveal, useGsap } from '@/lib/motion';
import { services } from '@/lib/site';

export default function DetailList() {
  const ref = useRef<HTMLElement>(null);
  useGsap(() => { splitReveal(ref.current!); parallax(ref.current!); }, [], { fonts: true });

  return (
    <section className="detail" data-theme="light" ref={ref}>
      {services.map(s => (
        <article className="detail__item" key={s.n}>
          <div className="detail__media" data-cursor="View"><Image src={s.img.src} width={s.img.w} height={s.img.h} alt={s.alt} data-speed="0.9" sizes="(max-width: 980px) 90vw, 45vw" /></div>
          <div className="detail__copy"><span className="detail__n">{s.n}</span><h2 className="h-serif" data-split><Rich text={s.title} /></h2>
            <p>{s.text}</p>
            <ul className="detail__facts">{s.facts.map(([b, t]) => <li key={b}><b>{b}</b>{t}</li>)}</ul>
            <span className="price">{s.price}</span><TLink href={s.href} className="btn btn--dark" data-magnetic>{s.cta} <i>»</i></TLink></div>
        </article>
      ))}
    </section>
  );
}
