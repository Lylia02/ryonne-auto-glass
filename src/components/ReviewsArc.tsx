'use client';
/* Reviews — cards on a draggable arc */
import { useRef } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { gsap, qa, revealUp, ScrollTrigger, useGsap } from '@/lib/motion';
import { home, reviews } from '@/lib/site';

export default function ReviewsArc() {
  const ref = useRef<HTMLElement>(null);
  const arcRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(d: number) => void>(() => {});
  const h = home.reviewsHead;

  useGsap(() => {
    const root = ref.current!, arc = arcRef.current!;
    revealUp(qa('.gallery__head > *', root));

    const items = qa('.arc__item', arc), n = items.length, spread = 19;
    // arc radius — wider on phones so the cards fan out instead of piling up
    const R = () => (innerWidth < 600 ? innerWidth * 1.15 : Math.min(innerWidth * .55, 760));
    let rot = 0;
    const render = () => items.forEach((it, i) => {
      const a = (i - (n - 1) / 2) * spread + rot, w = it.offsetWidth;
      gsap.set(it, { x: -w / 2, y: -R() - w, rotation: a, transformOrigin: `50% ${R() + w}px` });
      it.classList.toggle('is-front', Math.abs(((a % 360) + 540) % 360 - 180) < spread / 2);
    });
    // Place the arc just under the heading (measured, so it works on any screen
    // height), then size the section to the fanned cards + the arrows.
    const head = root.querySelector<HTMLElement>('.gallery__head')!, nav = root.querySelector<HTMLElement>('.gallery__nav')!;
    const layout = () => {
      const w = items[0].offsetWidth, gap = Math.max(48, innerHeight * .07);
      arc.style.top = `${head.offsetTop + head.offsetHeight + gap + R() + w}px`;
      render();
      const top = root.getBoundingClientRect().top;
      const fan = items.filter((_, i) => Math.abs(i - (n - 1) / 2) <= (innerWidth < 600 ? 1 : 2)); // cards actually on screen
      const low = Math.max(...fan.map(it => it.getBoundingClientRect().bottom - top));
      root.style.height = `${Math.round(low + 40 + nav.offsetHeight + parseFloat(getComputedStyle(root).paddingBottom))}px`;
    };
    layout();
    const spin =(to: number, duration: number) => { const o = { r: rot }; gsap.to(o, { r: to, duration, ease: 'power3.out', onUpdate: () => { rot = o.r; render(); } }); };
    goRef.current = d => spin(rot + d * spread, 1);

    let down = false, sx = 0, sr = 0;
    const onDown = (e: PointerEvent) => { down = true; sx = e.clientX; sr = rot; };
    const onUp = () => { if (!down) return; down = false; spin(Math.round(rot / spread) * spread, .6); };
    const onMove = (e: PointerEvent) => { if (down) { rot = sr + (e.clientX - sx) * .15; render(); } };
    arc.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('resize', layout);
    ScrollTrigger.create({ trigger: root, start: 'top 70%', once: true, onEnter: () => gsap.from(items, { y: 200, opacity: 0, stagger: .08, duration: 1.2, ease: 'power4.out' }) });
    return () => {
      arc.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', layout);
      root.style.height = ''; arc.style.top = '';
    };
  }, []);

  return (
    <section className="gallery" id="reviews" data-theme="light" ref={ref}>
      <div className="gallery__head"><span className="eyebrow">{h.eyebrow}</span><h2 className="h-serif"><Rich text={h.title} /></h2></div>
      <div className="gallery__arc" id="arc" data-cursor="Drag" ref={arcRef}>
        {reviews.map(r => (
          <figure className="arc__item" key={r.author}>
            <Image src={r.img.src} width={r.img.w} height={r.img.h} alt="" sizes="(max-width: 600px) 60vw, 280px" />
            <figcaption>{r.quote}<b>{r.author}</b></figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery__nav"><button id="arcPrev" aria-label="Previous" onClick={() => goRef.current(1)}>«</button><button id="arcNext" aria-label="Next" onClick={() => goRef.current(-1)}>»</button></div>
    </section>
  );
}
