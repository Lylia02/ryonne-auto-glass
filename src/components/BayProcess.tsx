'use client';
/* =========================================================
   "How it works" — home page, told as camera shots.
   The section is 4.4 screens tall and its stage sticks (CSS sticky).
   Behind: the car in a service bay (BayScene); the camera moves to a
   new shot for each step. In front: the step text, which changes
   with a blur, and a dash for each step.
   ========================================================= */
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ScrollTrigger, scrollToTarget, useGsap } from '@/lib/motion';
import { bay, homeProcess } from '@/lib/site';

const Scene = dynamic(() => import('./BayScene'), { ssr: false });
const steps = homeProcess.steps;

export default function BayProcess() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const st = useRef<ScrollTrigger | null>(null);
  const [step, setStep] = useState(0);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const mq = matchMedia('(max-width: 980px)');
    const on = () => setCompact(mq.matches); on(); mq.addEventListener('change', on);
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); pre.disconnect(); } }, { rootMargin: '150% 0px' });
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    pre.observe(el); io.observe(el);
    return () => { mq.removeEventListener('change', on); pre.disconnect(); io.disconnect(); };
  }, []);

  useGsap(() => {
    st.current = ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom bottom', onUpdate: s => {
      progress.current = s.progress;
      setStep(Math.min(steps.length - 1, Math.floor(s.progress * steps.length)));
    } });
    return () => { st.current = null; };
  }, []);

  const go = (i: number) => {
    const t = st.current;
    if (t) scrollToTarget(t.start + (t.end - t.start) * (i + .5) / steps.length);
  };
  const onReady = useCallback(() => setReady(true), []);

  return (
    <section className={`bp${ready ? ' is-ready' : ''}`} id="process" ref={ref}>
      <div className="bp__stage">
        <div className="bp__scene">{near && <Scene progress={progress} compact={compact} active={onScreen} onReady={onReady} />}</div>
        <div className="bp__shade" aria-hidden="true"></div>
        <header className="bp__head">
          <span className="mono"><i></i>{bay.kicker}</span>
          <h2 className="h-wide">{bay.title}</h2>
        </header>
        <div className="bp__copy">
          {steps.map((s, i) => (
            <div key={i} className={`bp__step${i === step ? ' is-on' : ''}`} aria-hidden={i !== step}>
              <span className="mono">{bay.step} {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
              <h3 className="h-wide">{s.title.replace('\n', ' ')}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <ol className="bp__dashes" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={i}><button type="button" className={i === step ? 'is-on' : ''} onClick={() => go(i)} aria-label={s.title.replace('\n', ' ')}></button></li>
          ))}
        </ol>
        <span className="bp__hud mono">{bay.shots[step]}</span>
      </div>
    </section>
  );
}
