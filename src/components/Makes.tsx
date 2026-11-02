'use client';
/* Makes — pinned (CSS sticky): car scales down, makes fade in around it */
import { useRef } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { gsap, useGsap } from '@/lib/motion';
import { gridMakes, home, IMG } from '@/lib/site';

export default function Makes() {
  const ref = useRef<HTMLElement>(null);
  const m = home.makes;

  useGsap(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 1 } });
    tl.fromTo('.makes__car', { scale: 1.7, rotate: -5, yPercent: 8 }, { scale: 1, rotate: 0, yPercent: -8, ease: 'none' }, 0)
      .to('.makes__grid li', { opacity: 1, y: 0, stagger: { each: .04, from: 'center' }, ease: 'none' }, .2)
      .to('.makes__title', { opacity: 1, ease: 'none' }, .55)
      .from('.makes__cta', { y: 40, opacity: 0 }, .7);
  }, [], { scope: ref });

  return (
    <section className="makes" id="makes" data-theme="light" ref={ref}>
      <div className="makes__pin">
        <div className="makes__car"><Image src={IMG.car.src} width={IMG.car.w} height={IMG.car.h} alt={m.carAlt} sizes="(max-width: 980px) 80vw, 760px" /></div>
        <ul className="makes__grid">{gridMakes.map(x => <li key={x}>{x}</li>)}</ul>
        <p className="makes__label eyebrow">{m.label}</p>
        <h2 className="makes__title h-serif"><Rich text={m.title} /></h2>
        <a href="#contact" className="btn btn--accent makes__cta" data-magnetic>{m.cta} <i>»</i></a>
      </div>
    </section>
  );
}
