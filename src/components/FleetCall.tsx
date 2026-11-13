'use client';
/* =========================================================
   Fleet — last call. Two lines of wide type slide in from opposite
   sides as you scroll, over a road whose white dashes never stop
   moving. One button, the phone number, the opening hours.
   ========================================================= */
import { useRef } from 'react';
import TLink from './TLink';
import { gsap, useGsap } from '@/lib/motion';
import { business, fleetPage } from '@/lib/site';

const c = fleetPage.closing;

export default function FleetCall() {
  const ref = useRef<HTMLElement>(null);

  useGsap(() => {
    const root = ref.current!;
    const [a, b] = root.querySelectorAll<HTMLElement>('.fcl__h span');
    const st = { trigger: root, start: 'top bottom', end: 'center center', scrub: true };
    gsap.fromTo(a, { xPercent: -18 }, { xPercent: 0, ease: 'none', scrollTrigger: st });
    gsap.fromTo(b, { xPercent: 18 }, { xPercent: 0, ease: 'none', scrollTrigger: { ...st } });
    gsap.from(root.querySelectorAll('.fcl__foot > *'), { y: 24, opacity: 0, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 55%', once: true } });
  }, []);

  return (
    <section className="fcl" id={c.id} ref={ref}>
      <span className="mono fcl__k"><i></i>{c.kicker}</span>
      <h2 className="fcl__h h-wide">{c.lines.map(l => <span key={l}>{l}</span>)}</h2>
      <div className="fcl__road" aria-hidden="true"><i></i></div>
      <div className="fcl__foot">
        <p>{c.text}</p>
        <TLink href={c.href} className="btn btn--accent">{c.cta} <i>»</i></TLink>
        <span className="mono"><a href={`tel:${business.tel}`}>{business.phone}</a> · {business.hours.short}</span>
      </div>
    </section>
  );
}
