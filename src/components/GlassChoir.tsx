'use client';
/* =========================================================
   Glass Choir — home services showcase, inspired by the way
   Cartier's "Le Chœur des Pierres" shows one stone at a time.
   Desktop: the section is 5 screens tall and its stage sticks
   (CSS sticky). Each service takes the stage in turn: the "gem"
   changes cut, light sweeps across it, number and text change.
   Phones / reduced motion: a simple list, one gem per service.
   ========================================================= */
import { useRef, useState } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import TLink from './TLink';
import { env, gsap, qa, revealUp, ScrollTrigger, scrollToTarget, useGsap } from '@/lib/motion';
import { choir, services } from '@/lib/site';
import { edgePoints, facetPath, tableClip, tablePoints } from '@/lib/gem';


const DESKTOP = '(min-width: 981px) and (prefers-reduced-motion: no-preference)';

export default function GlassChoir() {
  const ref = useRef<HTMLElement>(null);
  const cur = useRef(0);
  const last = useRef<gsap.core.Timeline | null>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const n = services.length;

  /* Stage change — one timeline per step; a newer step finishes the older one */
  const go = (i: number) => {
    if (i === cur.current) return;
    const root = ref.current!, prev = cur.current, dir = i > prev ? 1 : -1;
    cur.current = i; setActive(i);
    last.current?.progress(1).kill();
    const imgs = qa('.choir__img', root), tImgs = qa('.choir__timg', root), items = qa('.choir__item', root), nums = qa('.choir__num span', root);
    const cut = choir.cuts[i];
    last.current = gsap.timeline({ defaults: { ease: 'power3.inOut', duration: 1.1 } })
      .to(qa('.choir__gem', root), { clipPath: `polygon(${cut})` }, 0)
      .to(qa('.choir__table', root), { clipPath: `polygon(${tableClip(cut)})` }, 0)
      .to(qa('.choir__facets path', root), { attr: { d: facetPath(cut) } }, 0)
      .to(qa('.choir__facets .t', root), { attr: { points: tablePoints(cut) } }, 0)
      .to(qa('.choir__facets .e', root), { attr: { points: edgePoints(cut) } }, 0)
      .to(root, { '--tone': choir.tones[i] }, 0)
      .to([imgs[prev], tImgs[prev]], { opacity: 0, duration: .8 }, 0)
      .fromTo(imgs[i], { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' }, .12)
      .fromTo(tImgs[i], { opacity: 0, scale: 1.55 }, { opacity: .55, scale: 1.3, duration: 1.4, ease: 'power3.out' }, .2)
      .fromTo(qa('.choir__sheen', root), { backgroundPosition: '170% 0' }, { backgroundPosition: '-70% 0', duration: 1.5, ease: 'power2.inOut' }, .05)
      .to(nums[prev], { yPercent: -40 * dir, opacity: 0, duration: .7 }, 0)
      .fromTo(nums[i], { yPercent: 40 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, .2)
      .to(items[prev], { autoAlpha: 0, y: -20 * dir, duration: .45, ease: 'power2.in' }, 0)
      .set(items[i], { autoAlpha: 1, y: 0 }, .4)
      .fromTo(items[i].children, { y: 28 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .06, ease: 'power3.out' }, .4);
  };

  const jump = (i: number) => {
    const t = st.current;
    if (t) scrollToTarget(t.start + (t.end - t.start) * (i + .5) / n);
  };

  useGsap(() => {
    const root = ref.current!;
    revealUp(qa('.choir__card', root));
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      // first service in place, the others hidden
      gsap.set(qa('.choir__item', root).slice(1), { autoAlpha: 0 });
      gsap.set(qa('.choir__num span', root).slice(1), { opacity: 0 });
      gsap.set([...qa('.choir__img', root).slice(1), ...qa('.choir__timg', root).slice(1)], { opacity: 0 });
      gsap.from(qa('.choir__head > *, .choir__index li, .choir__foot > *', root), { y: 30, opacity: 0, duration: 1, stagger: .05, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 70%', once: true } });
      gsap.from(qa('.choir__gemwrap', root), { scale: .82, opacity: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 70%', once: true } });

      st.current = ScrollTrigger.create({
        trigger: root, start: 'top top', end: 'bottom bottom',
        onUpdate: self => {
          go(Math.min(n - 1, Math.floor(self.progress * n)));
          gsap.set(qa('.choir__bar i', root), { scaleX: self.progress });
        },
      });

      // the gem leans toward the pointer
      const wrap = root.querySelector<HTMLElement>('.choir__gemwrap')!;
      const { finePointer } = env();
      if (!finePointer) return;
      const rx = gsap.quickTo(wrap, 'rotationX', { duration: 1.2, ease: 'power3.out' });
      const ry = gsap.quickTo(wrap, 'rotationY', { duration: 1.2, ease: 'power3.out' });
      const onMove = (e: MouseEvent) => { ry((e.clientX / innerWidth - .5) * 14); rx(-(e.clientY / innerHeight - .5) * 10); };
      root.addEventListener('mousemove', onMove);
      return () => root.removeEventListener('mousemove', onMove);
    });
    return () => { mm.revert(); st.current = null; last.current?.kill(); };
  }, [], { fonts: true });

  const cut0 = choir.cuts[0];
  return (
    <section className="choir" id="services" ref={ref} style={{ '--tone': choir.tones[0] } as React.CSSProperties}>
      {/* ---------- desktop stage ---------- */}
      <div className="choir__stage">
        <div className="choir__glow" aria-hidden="true"></div>
        <div className="choir__num" aria-hidden="true">{services.map(s => <span key={s.n}>{s.n}</span>)}</div>

        <header className="choir__head">
          <span className="eyebrow">{choir.eyebrow}</span>
          <h2 className="h-serif"><Rich text={choir.title} /></h2>
        </header>

        <ol className="choir__index">
          {services.map((s, i) => (
            <li key={s.n} className={i === active ? 'is-on' : ''}>
              <button type="button" onClick={() => jump(i)} aria-current={i === active}><i>{s.n}</i>{s.name}</button>
            </li>
          ))}
        </ol>

        <div className="choir__gemwrap">
          <div className="choir__gem" style={{ clipPath: `polygon(${cut0})` }}>
            {services.map(s => <Image key={s.n} className="choir__img" src={s.img.src} alt={s.alt} fill sizes="(max-width: 980px) 90vw, 46vh" />)}
            <div className="choir__table" style={{ clipPath: `polygon(${tableClip(cut0)})` }}>
              {services.map(s => <Image key={s.n} className="choir__timg" src={s.img.src} alt="" fill sizes="30vh" />)}
            </div>
            <svg className="choir__facets" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d={facetPath(cut0)} /><polygon className="t" points={tablePoints(cut0)} /><polygon className="e" points={edgePoints(cut0)} />
            </svg>
            <div className="choir__sheen"></div>
          </div>
        </div>

        <div className="choir__copy">
          {services.map(s => (
            <article className="choir__item" key={s.n}>
              <span className="choir__k">Service {s.n} / 0{n}</span>
              <h3 className="h-serif"><Rich text={s.title} /></h3>
              <p>{s.text}</p>
              <ul className="choir__facts">{s.facts.map(([v, l]) => <li key={l}><b>{v}</b><span>{l}</span></li>)}</ul>
              <div className="choir__buy"><b>{s.price}</b><TLink href={s.href} className="btn btn--ghost">{s.cta} <i>»</i></TLink></div>
            </article>
          ))}
        </div>

        <div className="choir__foot">
          <span className="choir__hint">{choir.hint}</span>
          <span className="choir__bar"><i></i></span>
          <span className="choir__count">{services[active].n} / 0{n}</span>
          <TLink href="/services" className="choir__all">{choir.all}</TLink>
        </div>
      </div>

      {/* ---------- phones / reduced motion ---------- */}
      <div className="choir__list">
        <header className="choir__lhead">
          <span className="eyebrow">{choir.eyebrow}</span>
          <h2 className="h-serif"><Rich text={choir.title} /></h2>
        </header>
        {services.map((s, i) => (
          <article className="choir__card" key={s.n} style={{ '--tone': choir.tones[i] } as React.CSSProperties}>
            <div className="choir__cgem" style={{ clipPath: `polygon(${choir.cuts[i]})` }}>
              <Image src={s.img.src} alt={s.alt} fill sizes="80vw" />
              <svg className="choir__facets" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d={facetPath(choir.cuts[i])} /><polygon className="t" points={tablePoints(choir.cuts[i])} /><polygon className="e" points={edgePoints(choir.cuts[i])} />
              </svg>
            </div>
            <span className="choir__k">Service {s.n} / 0{n}</span>
            <h3 className="h-serif"><Rich text={s.title} /></h3>
            <p>{s.short}</p>
            <div className="choir__buy"><b>{s.price}</b><TLink href={s.href} className="btn btn--ghost">{s.cta} <i>»</i></TLink></div>
          </article>
        ))}
        <TLink href="/services" className="choir__all">{choir.all}</TLink>
      </div>
    </section>
  );
}
