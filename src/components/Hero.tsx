'use client';
/* Home hero — pinned (CSS sticky) for a short while: the photo darkens
   and the title steps back before the drive starts. Not pinned under 980px. */
import { useRef } from 'react';
import Image from 'next/image';
import Counter from './Counter';
import Rich from './Rich';
import TLink from './TLink';
import { env, gsap, useGsap } from '@/lib/motion';
import { home, IMG, stats } from '@/lib/site';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { hero } = home;

  useGsap(() => {
    const root = ref.current!;
    if (innerWidth < 980) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: .6 } });
    tl.to('.hero__tint', { opacity: .85, ease: 'none' }, 0)
      .to('.hero__img', { yPercent: 12, filter: 'saturate(.3) contrast(1.1) brightness(.45)', ease: 'none' }, 0)
      .to('.hero__copy', { opacity: .25, y: -40, ease: 'none' }, .3)
      .to('.hero__stats', { opacity: 0, y: 40, ease: 'none' }, 0)
      .to('.hero__scroll', { opacity: 0, ease: 'none' }, 0);

    const { finePointer, reduce } = env();
    if (!finePointer || reduce) return;
    const img = root.querySelector('.hero__img'), copy = root.querySelector('.hero__copy');
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      gsap.to(img, { x: x * -24, duration: 1.4, ease: 'power2.out' });
      gsap.to(copy, { x: x * 10, y: y * 8, duration: 1.4, ease: 'power2.out', overwrite: 'auto' });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [], { scope: ref });

  return (
    <section className="hero" id="hero" ref={ref}>
      <div className="hero__pin">
        <div className="hero__bg">
          <Image src={IMG.hero.src} alt="" className="hero__img" fill priority sizes="100vw" />
          <div className="hero__tint"></div>
          <div className="hero__vignette"></div>
        </div>

        <div className="hero__copy">
          <h1 className="h-wide hero__h1">{hero.lines.map(l => <span className="line" key={l}><Rich text={l} /></span>)}</h1>
          <TLink href="/contact" className="btn btn--ghost" data-magnetic>{hero.cta}</TLink>
        </div>

        <div className="hero__stats">
          {stats.map(s => (
            <div className="stat" key={s.label}><Counter className="stat__num" value={s.value} suffix={s.suffix} decimals={s.decimals} /><span>{s.label}</span></div>
          ))}
        </div>

        <div className="hero__scroll"><span></span>Scroll</div>
      </div>

    </section>
  );
}
