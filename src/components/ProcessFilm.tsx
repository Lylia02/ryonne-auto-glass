'use client';
/* =========================================================
   "How it works" — home page, as a strip of four photos.
   Desktop: the stage sticks (CSS sticky) while you scroll through
   the four steps. The photo of the current step opens wide, in
   colour, with its text; the others fold into narrow black & white
   slices that show only their number and title. A thin line on the
   open photo fills up as you go. Click a slice to jump to it.
   Phones / reduced motion: the four steps are stacked cards.
   ========================================================= */
import { useRef, useState } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { gsap, ScrollTrigger, scrollToTarget, useGsap } from '@/lib/motion';
import { bay, homeProcess } from '@/lib/site';

const steps = homeProcess.steps;
const n = steps.length;
const DESKTOP = '(min-width: 981px) and (prefers-reduced-motion: no-preference)';

export default function ProcessFilm() {
  const ref = useRef<HTMLElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [step, setStep] = useState(0);

  useGsap(() => {
    const root = ref.current!;
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      st.current = ScrollTrigger.create({
        trigger: root, start: 'top top', end: 'bottom bottom',
        onUpdate: s => {
          const p = s.progress * n, i = Math.min(n - 1, Math.floor(p));
          setStep(i);
          root.style.setProperty('--fill', String(Math.min(1, p - i)));
        },
      });
      gsap.from(root.querySelectorAll('.pf__panel'), { yPercent: 12, opacity: 0, duration: 1.2, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 75%', once: true } });
    });
    return () => { mm.revert(); st.current = null; };
  }, []);

  const go = (i: number) => {
    const t = st.current;
    if (t) scrollToTarget(t.start + (t.end - t.start) * (i + .5) / n);
  };

  return (
    <section className="pf" id="process" ref={ref}>
      <div className="pf__stage">
        <header className="pf__head">
          <span className="mono"><i></i>{bay.kicker}</span>
          <h2 className="h-wide">{bay.title}</h2>
        </header>

        <ol className="pf__strip">
          {steps.map((s, i) => (
            <li key={i} className={`pf__panel${i === step ? ' is-on' : ''}`} onClick={() => go(i)}>
              <Image src={s.img.src} width={s.img.w} height={s.img.h} alt="" sizes="(max-width: 980px) 92vw, 60vw" />
              <span className="pf__shade" aria-hidden="true"></span>
              <span className="pf__line" aria-hidden="true"><i></i></span>
              <span className="pf__num h-wide" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="pf__label mono" aria-hidden="true">{s.title.replace('\n', ' ')}</span>
              <div className="pf__copy">
                <span className="mono">{bay.step} {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {bay.shots[i]}</span>
                <h3 className="h-wide"><Rich text={s.title} /></h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
