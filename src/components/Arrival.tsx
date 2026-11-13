'use client';
/* =========================================================
   "Show us the damage" — home page, right after "How it works".
   The section is 2.6 screens tall and its stage sticks (CSS sticky).
   The car drives in and parks side-on (a picture sequence driven by
   the scroll, FrameSequence); once it has stopped, the text and the
   button to the 3D diagnosis come in. A red dot stays on its windshield.
   ========================================================= */
import { useCallback, useRef, useState } from 'react';
import FrameSequence from './FrameSequence';
import Rich from './Rich';
import TLink from './TLink';
import { gsap, qa, ScrollTrigger, useGsap } from '@/lib/motion';
import { diagnoseTeaser as t } from '@/lib/site';
import { arrivalPins } from '@/lib/arrivalPins';


export default function Arrival() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pin = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useGsap(() => {
    const root = ref.current!;
    // the car finishes parking at 80% of the scroll; the text follows
    ScrollTrigger.create({ trigger: root, start: 'top 70%', end: 'bottom bottom', onUpdate: s => { progress.current = Math.min(1, s.progress / .8); } });
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } })
      .fromTo(qa('.ar__copy > *', root), { opacity: 0, y: 24, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .12, stagger: .04 }, .62)
      .fromTo(qa('.ar__ping', root), { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .1 }, .7);
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  // keep the "tap the glass" dot on the windshield: its spot was saved with each picture
  const place = useCallback((i: number, set: 'd' | 'm', fit: { x: number; y: number; w: number; h: number }) => {
    const at = arrivalPins[set][i], el = pin.current;
    if (!at || !el) return;
    el.style.left = `${fit.x + at[0] * fit.w}px`; el.style.top = `${fit.y + at[1] * fit.h}px`;
  }, []);

  return (
    <section className={`ar${ready ? ' is-ready' : ''}`} id="diagnose-3d" ref={ref}>
      <div className="ar__stage">
        <FrameSequence name="arrival" progress={progress} className="ar__scene" onReady={onReady} onFrame={place} />
        <div className="ar__shade" aria-hidden="true"></div>
        <div className="ar__copy">
          <span className="mono"><i></i>{t.eyebrow}</span>
          <h2 className="h-wide"><Rich text={t.title} /></h2>
          <p>{t.text}</p>
          <TLink href={t.href} className="btn btn--accent" data-magnetic>{t.cta} <i>»</i></TLink>
        </div>
        {/* "tap the glass" hint over the parked car's windshield */}
        <div className="ar__ping" ref={pin}><TLink href={t.href} aria-label={t.cta}><i></i><span className="mono">Tap the glass</span></TLink></div>
      </div>
    </section>
  );
}
