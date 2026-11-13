'use client';
/* =========================================================
   "Real value" — home page. The view through a fogged windshield.
   The section is 1 + 4 × 0.7 screens tall and its stage sticks
   (CSS sticky). Behind: one photo of the road, seen through misted
   glass. Each promise you scroll past clears more of the mist, from
   a small wiped patch to the whole view on the fourth one ("clear
   view" = what we deliver). In front: the current promise in large
   type, which changes with a blur, and a tick for each promise.
   Two text tabs switch between drivers and fleets.
   ========================================================= */
import { useRef, useState } from 'react';
import Image from 'next/image';
import TLink from './TLink';
import { gsap, ScrollTrigger, scrollToTarget, useGsap } from '@/lib/motion';
import { IMG, value } from '@/lib/site';

const n = 4;

export default function RealValue() {
  const ref = useRef<HTMLElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [tab, setTab] = useState(0);
  const [step, setStep] = useState(0);
  const t = value.tabs[tab];

  useGsap(() => {
    const root = ref.current!;
    st.current = ScrollTrigger.create({
      trigger: root, start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        setStep(Math.min(n - 1, Math.floor(s.progress * n)));
        // how much glass is wiped clear: a patch at first, the whole view at the end
        root.style.setProperty('--clear', `${8 + Math.pow(s.progress, 1.25) * 110}%`);
      },
    });
    gsap.from(root.querySelectorAll('.rv__head > *'), { y: 24, opacity: 0, filter: 'blur(10px)', duration: 1.1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 60%', once: true } });
    return () => { st.current = null; };
  }, []);

  const go = (i: number) => {
    const s = st.current;
    if (s) scrollToTarget(s.start + (s.end - s.start) * (i + .5) / n);
  };

  return (
    <section className="rv" id="value" ref={ref}>
      <div className="rv__stage">
        <div className="rv__view" aria-hidden="true">
          <Image src={IMG.drive.src} alt="" fill sizes="100vw" className="rv__sharp" />
          <div className="rv__mist"><Image src={IMG.drive.src} alt="" fill sizes="100vw" /></div>
          <span className="rv__shade"></span>
        </div>

        <header className="rv__head">
          <h2 className="h-wide">{value.title}</h2>
          <div className="rv__tabs" role="tablist">
            {value.tabs.map((x, i) => (
              <button key={x.label} type="button" role="tab" aria-selected={i === tab} className={i === tab ? 'is-on' : ''} onClick={() => setTab(i)}>{x.label}</button>
            ))}
          </div>
        </header>

        <div className="rv__copy" role="tabpanel">
          {t.cards.map((c, i) => (
            <article key={`${tab}-${i}`} className={`rv__item${i === step ? ' is-on' : ''}`} aria-hidden={i !== step}>
              <h3 className="h-wide">{c.title}</h3>
              <p>{c.text}</p>
              <span className="rv__fact"><b>{c.metric}</b></span>
            </article>
          ))}
        </div>

        <ol className="rv__ticks" aria-label="Promises">
          {t.cards.map((c, i) => (
            <li key={i}><button type="button" className={i === step ? 'is-on' : ''} onClick={() => go(i)}><i></i><span className="mono">{c.title}</span></button></li>
          ))}
        </ol>

        <TLink href={t.href} className="btn btn--accent rv__cta" data-magnetic>{t.cta} <i>»</i></TLink>
        <span className="rv__caption mono">{value.figure}</span>
      </div>
    </section>
  );
}
