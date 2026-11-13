'use client';
/* =========================================================
   Services page — "glass reel".
   One 3D windshield, cut like a jewel, stays on screen (sticky
   canvas) while the chapters scroll over it: the hero, then one
   chapter per service. Each chapter gives the glass a new pose,
   a new light tone and a detail (chip, ADAS camera, edge, spin)
   — WebGi's moving ring + Cartier's one-stone-at-a-time.
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Rich from './Rich';
import TLink from './TLink';
import { gsap, qa, ScrollTrigger, useGsap } from '@/lib/motion';
import { choir, services, servicesPage } from '@/lib/site';

const Scene = dynamic(() => import('./ReelScene'), { ssr: false });
const tones = ['#9fc4ff', ...choir.tones];

export default function GlassReel() {
  const ref = useRef<HTMLDivElement>(null);
  const chapter = useRef(-1);
  const [active, setActive] = useState(-1);
  const [compact, setCompact] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const h = servicesPage.hero;

  useEffect(() => {
    const mq = matchMedia('(max-width: 980px)');
    const on = () => setCompact(mq.matches); on(); mq.addEventListener('change', on);
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(ref.current!);
    return () => { mq.removeEventListener('change', on); io.disconnect(); };
  }, []);

  useGsap(() => {
    const root = ref.current!;
    const go = (i: number) => {
      if (chapter.current === i) return;
      chapter.current = i; setActive(i);
      gsap.to(root, { '--tone': tones[Math.max(0, Math.min(tones.length - 1, i + 1))], duration: 1.2, ease: 'power2.out' });
    };
    qa('[data-ch]', root).forEach(el => {
      const i = Number(el.dataset.ch);
      ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: st => { if (st.isActive) go(i); } });
      // copy: words rise as the chapter arrives
      const kids = qa('.reel__copy > *', el);
      if (kids.length) gsap.from(kids, { y: 46, opacity: 0, duration: 1.1, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' } });
    });
    gsap.to(qa('.reel__bar i', root), { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } });
  }, [], { fonts: true });

  return (
    <div className="reel" ref={ref} style={{ '--tone': tones[0] } as React.CSSProperties}>
      <div className="reel__stage" aria-hidden="true">
        <div className="reel__glow"></div>
        <Scene chapter={chapter} compact={compact} active={onScreen} />
        <div className="reel__num">{services.map((s, i) => <span key={s.n} className={i === active ? 'is-on' : ''}>{s.n}</span>)}</div>
        <div className="reel__bar"><i></i></div>
        <ol className="reel__dots">{services.map((s, i) => <li key={s.n} className={i === active ? 'is-on' : ''}>{s.name}</li>)}</ol>
      </div>

      {/* hero — same markup as <PageHero> so the page intro plays on it */}
      <section className="phero phero--reel" data-ch="-1">
        <div className="phero__inner">
          <div>
            <h1 className="h-serif">{h.lines.map(l => <span className="line" key={l}><span><Rich text={l} /></span></span>)}</h1></div>
          <p>{h.text}</p>
        </div>
        <span className="reel__scroll">Scroll · five services</span>
      </section>

      {services.map((s, i) => (
        <section className={`reel__ch reel__ch--${i % 2 ? 'r' : 'l'}`} data-ch={i} key={s.n}>
          <div className="reel__copy">
            <span className="reel__k"><i>{s.n}</i>{s.name}</span>
            <h2 className="h-serif"><Rich text={s.title} /></h2>
            <p>{s.text}</p>
            <ul className="reel__facts">{s.facts.map(([b, t]) => <li key={b}><b>{b}</b><span>{t}</span></li>)}</ul>
            <div className="reel__buy"><b>{s.price}</b><TLink href={s.href} className="btn btn--accent" data-magnetic>{s.cta} <i>»</i></TLink></div>
          </div>
        </section>
      ))}
      <div className="reel__end" data-ch="5"></div>
    </div>
  );
}
