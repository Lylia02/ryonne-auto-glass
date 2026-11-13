'use client';
/* Process — pinned 4-step timeline (home + fleet) */
import { useRef } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { gsap, qa, revealUp, ScrollTrigger, useGsap } from '@/lib/motion';
import type { ProcessData } from '@/lib/site';

export default function Process({ data }: { data: ProcessData }) {
  const ref = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useGsap(() => {
    const sec = ref.current!, counter = countRef.current!;
    revealUp(qa('.process__head > *', sec));
    const setStep = (n: number) => { qa('[data-step]', sec).forEach(el => el.classList.toggle('is-active', +el.dataset.step! === n)); counter.textContent = String(n + 1); };
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: s => setStep(Math.min(3, Math.floor(s.progress * 4))) });
    gsap.to(qa('.process__img img', sec), { scale: 1.12, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true } });
  }, []);

  const active = (i: number) => (i === 0 ? ' is-active' : '');
  return (
    <section className="process" id="process" ref={ref}>
      <div className="process__pin">
        <div className="process__head"><h2 className="h-serif"><Rich text={data.title} /></h2></div>
        <div className="process__titles">
          {data.steps.map((s, i) => <h3 key={i} className={`h-display process__title${active(i)}`} data-step={i}><Rich text={s.title} /></h3>)}
        </div>
        <div className="process__media">
          {data.steps.map((s, i) => (
            <figure key={i} className={`process__img${active(i)}`} data-step={i}>
              <Image src={s.img.src} alt="" fill sizes="(max-width: 980px) 70vw, 420px" />
            </figure>
          ))}
        </div>
        <div className="process__texts">
          {data.steps.map((s, i) => <p key={i} className={`process__text${active(i)}`} data-step={i}>{s.text}</p>)}
        </div>
        <div className="process__counter"><i></i><span id="processCount" ref={countRef}>1</span>/4</div>
        <a href={data.skipHref} className="btn btn--accent process__skip">Skip <i>»</i></a>
      </div>
    </section>
  );
}
