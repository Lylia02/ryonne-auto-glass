'use client';
/* Services carousel — arrows, drag to scroll, cards rise in */
import { useRef } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import TLink from './TLink';
import { gsap, qa, splitReveal, useGsap } from '@/lib/motion';
import { home, services } from '@/lib/site';

export default function ServicesCarousel() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const h = home.servicesHead;

  const step = () => (trackRef.current!.querySelector<HTMLElement>('.svc')!.offsetWidth + 16);
  const scrollBy = (dir: number) => trackRef.current!.scrollBy({ left: dir * step(), behavior: 'smooth' });

  useGsap(() => {
    const root = ref.current!, track = trackRef.current!;
    splitReveal(root);
    // drag
    let down = false, sx = 0, sl = 0;
    const onDown = (e: PointerEvent) => { down = true; sx = e.clientX; sl = track.scrollLeft; };
    const onUp = () => { down = false; };
    const onMove = (e: PointerEvent) => { if (down) track.scrollLeft = sl - (e.clientX - sx); };
    track.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    track.addEventListener('pointermove', onMove);
    gsap.from(qa('.svc', track), { y: 60, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: track, start: 'top 85%', once: true } });
    return () => {
      track.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointermove', onMove);
    };
  }, [], { fonts: true });

  return (
    <section className="services" id="services" data-theme="light" ref={ref}>
      <div className="services__head">
        <div><span className="eyebrow">{h.eyebrow}</span><h2 className="h-serif" data-split><Rich text={h.title} /></h2><TLink href="/services" className="services__all">{h.all}</TLink></div>
        <div className="services__arrows"><button id="svcPrev" aria-label="Previous" onClick={() => scrollBy(-1)}>«</button><button id="svcNext" aria-label="Next" onClick={() => scrollBy(1)}>»</button></div>
      </div>
      <div className="services__track" id="svcTrack" data-cursor="Drag" ref={trackRef}>
        {services.map(s => (
          <article className="svc" key={s.n}>
            <div className="svc__img"><Image src={s.img.src} width={s.img.w} height={s.img.h} alt="" sizes="(max-width: 980px) 78vw, 440px" /></div>
            <span className="svc__n">{s.n}</span>
            <h3 className="h-serif">{s.name}</h3>
            <p>{s.short}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
