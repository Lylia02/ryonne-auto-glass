'use client';
/* =========================================================
   Fleet page hero — the depot at night, the title in wide type and a
   small clock that runs from 05:42 to 06:59: the job is done before
   the first shift. Same markup as <PageHero> so the page intro plays.
   ========================================================= */
import { useRef } from 'react';
import Image from 'next/image';
import { env, gsap, useGsap } from '@/lib/motion';
import { fleetPage } from '@/lib/site';

const h = fleetPage.hero;
const toMin = (t: string) => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export default function FleetHero() {
  const ref = useRef<HTMLElement>(null);

  useGsap(() => {
    const root = ref.current!;
    const clock = root.querySelector<HTMLElement>('.fh__time')!;
    const a = toMin(h.clockFrom), b = toMin(h.clockTo);
    const o = { m: a };
    if (env().reduce) { clock.textContent = h.clockTo; return; }
    gsap.timeline({ delay: 1.6 })
      .from(root.querySelector('.fh__clock'), { opacity: 0, y: 20, duration: .9, ease: 'power3.out' })
      .to(o, { m: b, duration: 3.4, ease: 'power2.inOut', onUpdate: () => { clock.textContent = fmt(Math.round(o.m)); } }, '-=.4')
      .add(() => root.classList.add('is-done'));
    // the depot drifts slower than the page, the title lifts away
    gsap.to(root.querySelector('.phero__bg'), { yPercent: 14, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(root.querySelector('.phero__inner'), { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: root, start: '30% top', end: 'bottom top', scrub: true } });
  }, []);

  return (
    <section className="phero fh" ref={ref}>
      <Image src={h.img.src} alt="" className="phero__bg" fill priority sizes="100vw" />
      <div className="phero__shade"></div>
      <div className="fh__clock" aria-hidden="true">
        <span className="mono"><i></i>{h.clockLabel}</span>
        <b className="fh__time h-wide">{h.clockFrom}</b>
      </div>
      <div className="phero__inner">
        <div>
          <span className="mono phero__eyebrow">{h.eyebrow}</span>
          <h1 className="h-wide">{h.lines.map(l => <span className="line" key={l}><span>{l}</span></span>)}</h1>
        </div>
        <p>{h.text}</p>
      </div>
    </section>
  );
}
