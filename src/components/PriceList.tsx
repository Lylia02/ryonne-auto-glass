'use client';
/* "What we fix" — price rows slide in */
import { useRef } from 'react';
import Rich from './Rich';
import { gsap, qa, splitReveal, useGsap } from '@/lib/motion';
import { home, prices } from '@/lib/site';

export default function PriceList() {
  const ref = useRef<HTMLElement>(null);
  const p = home.priceList;

  useGsap(() => {
    const root = ref.current!, rows = root.querySelector('.list__rows')!;
    splitReveal(root);
    gsap.from(qa('.row', rows), { x: -30, opacity: 0, stagger: .07, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: rows, start: 'top 80%', once: true } });
  }, [], { fonts: true });

  return (
    <section className="list" id="fleet" ref={ref}>
      <div className="list__inner">
        <div className="list__head"><span className="eyebrow">{p.eyebrow}</span><h2 className="h-serif" data-split><Rich text={p.title} /></h2></div>
        <ul className="list__rows">
          {prices.map(r => (
            <li className={`row${r.hot ? ' row--hot' : ''}`} key={r.name}><div><b>{r.name}</b><span>{r.detail}</span></div><em>{r.price}</em></li>
          ))}
        </ul>
        <p className="list__note">{p.note}</p>
      </div>
    </section>
  );
}
