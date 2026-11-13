'use client';
/* =========================================================
   "Clear ahead" — cinematic chapter on the home page.
   The section is 3.2 screens tall and its stage sticks (CSS sticky).
   It opens the story (it is the "About" part): a car drives at blue
   hour — a picture sequence driven by the scroll (FrameSequence) —
   while our statement comes out of the blur word by word; then the
   whole scene fades to night.
   ========================================================= */
import { useCallback, useRef, useState } from 'react';
import FrameSequence from './FrameSequence';
import Rich from './Rich';
import { gsap, ScrollTrigger, SplitText, useGsap } from '@/lib/motion';
import { cinema } from '@/lib/site';

export default function ShiftCinema() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);

  useGsap(() => {
    const root = ref.current!;
    const q = (s: string) => root.querySelector(s)!;
    ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', onUpdate: s => { progress.current = s.progress; } });
    const words = new SplitText(q('.sc__text'), { type: 'words', wordsClass: 'sc__word' }).words;
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root, start: 'top 60%', end: 'bottom bottom', scrub: true } })
      .fromTo(q('.sc__kicker'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .08 }, .1)
      .fromTo(words, { opacity: .1, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: .04, stagger: .45 / words.length }, .16)
      .to([q('.sc__kicker'), q('.sc__text')], { filter: 'blur(18px)', opacity: 0, duration: .12 }, .74)
      .fromTo(q('.sc__night'), { opacity: 0 }, { opacity: 1, duration: .16 }, .84);
  }, [], { fonts: true });

  const onReady = useCallback(() => setReady(true), []);

  return (
    <section className={`sc${ready ? ' is-ready' : ''}`} id="about" ref={ref}>
      <div className="sc__stage">
        <div className="sc__poster" aria-hidden="true"></div>
        <FrameSequence name="drive" progress={progress} className="sc__scene" onReady={onReady} />
        <div className="sc__shade" aria-hidden="true"></div>
        <div className="sc__copy">
          <span className="sc__kicker mono"><i></i>{cinema.kicker}</span>
          <p className="sc__text"><Rich text={cinema.text} /></p>
        </div>
        <div className="sc__night" aria-hidden="true"></div>
      </div>
    </section>
  );
}
