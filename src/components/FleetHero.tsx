'use client';
/* =========================================================
   Fleet page hero — three cars in a dark showroom (3D).
   Same markup as <PageHero> (so the page intro plays on it); the
   photo stays underneath as a poster until the 3D scene is ready.
   ========================================================= */
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Rich from './Rich';
import { ScrollTrigger, useGsap } from '@/lib/motion';
import { fleetPage } from '@/lib/site';

const Scene = dynamic(() => import('./FleetScene'), { ssr: false });

export default function FleetHero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const h = fleetPage.hero;

  useEffect(() => {
    const mq = matchMedia('(max-width: 980px)');
    const on = () => setCompact(mq.matches); on(); mq.addEventListener('change', on);
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(ref.current!);
    return () => { mq.removeEventListener('change', on); io.disconnect(); };
  }, []);

  useGsap(() => {
    ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom top', onUpdate: st => { progress.current = st.progress; } });
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <section className={`phero fhero${ready ? ' is-ready' : ''}`} ref={ref}>
      <Image src={h.img.src} alt="" className="phero__bg" fill priority sizes="100vw" />
      <div className="fhero__scene"><Scene progress={progress} compact={compact} active={onScreen} onReady={onReady} /></div>
      <div className="phero__shade"></div>
      <span className="fhero__tag"><b></b>Fleet showroom · live 3D</span>
      <div className="phero__inner">
        <div>
          <h1 className="h-serif">{h.lines.map(l => <span className="line" key={l}><span><Rich text={l} /></span></span>)}</h1></div>
        <p>{h.text}</p>
      </div>
    </section>
  );
}
