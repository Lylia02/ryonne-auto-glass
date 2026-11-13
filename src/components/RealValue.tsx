'use client';
/* =========================================================
   "Real value" — home page (light). A switch flips the list between
   what drivers get and what fleets get; rows come in one by one.
   ========================================================= */
import { useRef, useState } from 'react';
import TLink from './TLink';
import { gsap, qa, useGsap } from '@/lib/motion';
import { value } from '@/lib/site';

export default function RealValue() {
  const ref = useRef<HTMLElement>(null);
  const [tab, setTab] = useState(0);
  const t = value.tabs[tab];

  // first arrival: title out of the blur, rows one by one
  useGsap(() => {
    const root = ref.current!;
    gsap.from(qa('.rv__title', root), { filter: 'blur(20px)', opacity: 0, scale: 1.05, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 70%', once: true } });
    gsap.from(qa('.rv__switch, .rv__row, .rv__foot', root), { y: 30, opacity: 0, filter: 'blur(8px)', duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 55%', once: true } });
  }, []);

  // switching: the new rows slide in
  useGsap(() => {
    if (!ref.current?.dataset.switched) return;
    gsap.fromTo(qa('.rv__row, .rv__foot', ref.current), { y: 24, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .7, stagger: .06, ease: 'power3.out' });
  }, [tab]);

  const pick = (i: number) => { if (ref.current) ref.current.dataset.switched = '1'; setTab(i); };

  return (
    <section className="rv" id="value" ref={ref}>
      <div className="rv__lightzone" data-theme="light" aria-hidden="true"></div>
      <h2 className="rv__title h-wide">{value.title}</h2>
      <div className="rv__switch" role="tablist">
        <i style={{ transform: `translateX(${tab * 100}%)` }} aria-hidden="true"></i>
        {value.tabs.map((x, i) => (
          <button key={x.label} type="button" role="tab" aria-selected={i === tab} className={i === tab ? 'is-on' : ''} onClick={() => pick(i)}>{x.label}</button>
        ))}
      </div>
      <ul className="rv__list" role="tabpanel">
        {t.rows.map(([lead, rest]) => (
          <li className="rv__row" key={lead}><i aria-hidden="true">”</i><p><b>{lead}</b> {rest}</p></li>
        ))}
      </ul>
      <div className="rv__foot">
        {t.href.startsWith('#')
          ? <a href={t.href} className="btn btn--line">{t.cta} <i>»</i></a>
          : <TLink href={t.href} className="btn btn--line">{t.cta} <i>»</i></TLink>}
      </div>
    </section>
  );
}
