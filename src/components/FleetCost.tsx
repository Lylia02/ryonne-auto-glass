'use client';
/* =========================================================
   Fleet — "the real price of a crack".
   The screen stays put while you scroll: a counter adds $600 for every
   day the van stays parked, three day marks fill up, a red glow grows.
   Then the figure is struck out and the answer comes in: we fix it
   before 7am.
   ========================================================= */
import { useRef } from 'react';
import { env, gsap, ScrollTrigger, useGsap } from '@/lib/motion';
import { fleetPage } from '@/lib/site';

const c = fleetPage.cost;
const money = (v: number) => '$' + v.toLocaleString('en-US');

export default function FleetCost() {
  const ref = useRef<HTMLElement>(null);

  useGsap(() => {
    const root = ref.current!;
    const num = root.querySelector<HTMLElement>('.fc__num b')!;
    const days = [...root.querySelectorAll<HTMLElement>('.fc__day')];
    const total = c.perDay * c.days;
    const reduce = env().reduce;
    gsap.from(root.querySelectorAll('.fc__lead > *'), { y: 30, opacity: 0, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 70%', once: true } });
    ScrollTrigger.create({
      trigger: root, start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        const p = reduce ? 1 : s.progress;
        const run = Math.min(1, p / .62);                 // the counting part
        const v = Math.round(run * total / 10) * 10;
        num.textContent = money(v);
        days.forEach((d, i) => d.style.setProperty('--f', String(gsap.utils.clamp(0, 1, run * c.days - i))));
        root.style.setProperty('--heat', String(run));
        root.classList.toggle('is-turn', p > .68);
      },
    });
  }, []);

  return (
    <section className="fc" ref={ref}>
      <div className="fc__stage">
        <span className="fc__glow" aria-hidden="true"></span>
        <div className="fc__lead">
          <span className="mono"><i></i>{c.kicker}</span>
          <p>{c.lead}</p>
        </div>
        <div className="fc__num h-wide" aria-hidden="true"><b>$0</b><span className="fc__strike"></span></div>
        <div className="fc__days" aria-hidden="true">
          {Array.from({ length: c.days }, (_, i) => (
            <span className="fc__day" key={i}><i></i><span className="mono">{c.day} {i + 1}</span></span>
          ))}
        </div>
        <div className="fc__turn">
          <h2 className="h-wide">{c.turn.map((l, i) => <span key={i}><i>{l}</i></span>)}</h2>
          <p>{c.sub}</p>
        </div>
      </div>
    </section>
  );
}
