'use client';
/* =========================================================
   Services as "screens" — home page.
   Desktop: the text column on the left sticks while a stack of
   service screens scrolls up on the right. The screen in the middle
   of the viewport is sharp, the others are blurred and dimmed, and
   the text on the left follows it.
   Phones: each screen is followed by its own text.
   ========================================================= */
import { useRef, useState } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import TLink from './TLink';
import { qa, ScrollTrigger, scrollToTarget, useGsap } from '@/lib/motion';
import { services, surfaces } from '@/lib/site';

const n = services.length;
const pad = (i: number) => String(i).padStart(2, '0');

function Copy({ i }: { i: number }) {
  const s = services[i];
  return (
    <>
      <span className="sf__kicker mono">{surfaces.kicker} <b>{s.n}</b></span>
      <h3 className="sf__title h-wide">{s.name}</h3>
      <p className="sf__text">{s.short}</p>
      <div className="sf__row">
        <TLink href={s.href} className="btn btn--accent">{s.cta} <i>»</i></TLink>
        <span className="sf__price">{s.price}</span>
      </div>
    </>
  );
}

export default function Surfaces() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGsap(() => {
    const root = ref.current!;
    qa('.sf__screen', root).forEach((el, i) => ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'bottom 45%',
      onToggle: s => { if (s.isActive) setActive(i); },
    }));
  }, []);

  const go = (i: number) => {
    const el = ref.current?.querySelectorAll<HTMLElement>('.sf__screen')[i];
    if (el) scrollToTarget(el.getBoundingClientRect().top + scrollY - (innerHeight - el.offsetHeight) / 2);
  };

  return (
    <section className="sf" id="services" ref={ref}>
      <div className="sf__side">
        <div className="sf__panels">
          {services.map((s, i) => (
            <div key={s.n} className={`sf__panel${i === active ? ' is-on' : ''}`} aria-hidden={i !== active}><Copy i={i} /></div>
          ))}
        </div>
        <ol className="sf__dashes" aria-label="Services">
          {services.map((s, i) => (
            <li key={s.n}><button type="button" className={i === active ? 'is-on' : ''} onClick={() => go(i)} aria-label={s.name}></button></li>
          ))}
        </ol>
      </div>

      <div className="sf__list">
        {services.map((s, i) => (
          <article key={s.n} className="sf__item">
            <figure className={`sf__screen${i === active ? ' is-on' : ''}`}>
              <div className="sf__top mono">
                <span>← Services</span>
                <b>Ryonne</b>
                <span>{s.n} / {pad(n)}</span>
              </div>
              <Image src={s.img.src} width={s.img.w} height={s.img.h} alt={s.alt} sizes="(max-width: 980px) 92vw, 58vw" />
              <span className="sf__ghost h-wide" aria-hidden="true">{surfaces.words[i]}</span>
              <div className="sf__hud mono">
                {s.facts.map(([v, l]) => <span key={l}><b>{v}</b>{l}</span>)}
              </div>
              <figcaption className="sf__cap h-serif"><Rich text={s.title} /></figcaption>
            </figure>
            <div className="sf__mtext"><Copy i={i} /></div>
          </article>
        ))}
      </div>
    </section>
  );
}
