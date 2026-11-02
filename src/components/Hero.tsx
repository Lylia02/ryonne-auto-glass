'use client';
/* Home hero — pinned (CSS sticky), contact cards travel over it,
   oxblood tint scrubs in. Not pinned under 980px (see CSS). */
import { useRef } from 'react';
import Image from 'next/image';
import Counter from './Counter';
import Rich from './Rich';
import TLink from './TLink';
import { env, gsap, qa, revealUp, useGsap } from '@/lib/motion';
import { business, home, IMG, stats } from '@/lib/site';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { hero } = home, c = hero.cards;

  useGsap(() => {
    const root = ref.current!;
    revealUp(qa('.ccard', root));
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
          <h1 className="h-serif hero__h1">{hero.lines.map(l => <span className="line" key={l}><Rich text={l} /></span>)}</h1>
          <a href="#contact" className="btn btn--ghost" data-magnetic>{hero.cta}</a>
        </div>

        <div className="hero__stats">
          {stats.map(s => (
            <div className="stat" key={s.label}><Counter className="stat__num" value={s.value} suffix={s.suffix} decimals={s.decimals} /><span>{s.label}</span></div>
          ))}
        </div>

        <div className="hero__scroll"><span></span>Scroll</div>
      </div>

      {/* cards that travel over the pinned hero */}
      <div className="hero__cards" id="heroCards">
        <a className="ccard" href={`tel:${business.tel}`}>
          <span className="ccard__k">{c.phone.k}</span>
          <svg className="ccard__ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z" /></svg>
          <b className="h-serif">{c.phone.title}</b>
          <span>{c.phone.text}</span>
        </a>
        <a className="ccard" href="#contact">
          <span className="ccard__k">{c.email.k}</span>
          <svg className="ccard__ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          <b className="h-serif">{c.email.title}</b>
          <span>{c.email.text}</span>
        </a>
        <a className="ccard" href="#contact">
          <span className="ccard__k">{c.mobile.k}</span>
          <svg className="ccard__ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
          <b className="h-serif">{c.mobile.title}</b>
          <span>{c.mobile.text}</span>
        </a>
        <div className="ccard ccard--split">
          <span className="ccard__k">{c.visit.k}</span>
          <svg className="ccard__ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 22s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
          <b className="h-serif">{c.visit.title}</b>
          <span>{c.visit.text}</span>
          <div className="ccard__btns"><TLink href="/contact">{c.visit.inShop}</TLink><TLink href="/contact?mode=mobile">{c.visit.mobileBtn}</TLink></div>
        </div>
      </div>
    </section>
  );
}
