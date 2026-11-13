'use client';
/* =========================================================
   Fleet — the three programs as one spec sheet.
   Slide "How many vehicles?" and the matching column lights up
   (a highlight slides across); every row says what each program
   includes. Clicking a column header picks it too.
   ========================================================= */
import { useRef, useState } from 'react';
import Rich from './Rich';
import TLink from './TLink';
import { gsap, useGsap } from '@/lib/motion';
import { fleetPage, tiers } from '@/lib/site';

const d = fleetPage.programs;
const pick = (v: number) => (v <= 10 ? 0 : v <= 50 ? 1 : 2);
const mid = [6, 24, 80];

export default function FleetPrograms() {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(d.start);
  const on = pick(count);
  const fill = ((count - d.min) / (d.max - d.min)) * 100;

  useGsap(() => {
    const root = ref.current!;
    gsap.from(root.querySelectorAll('.fp__head > *, .fp__ask'), { y: 30, opacity: 0, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 75%', once: true } });
    gsap.from(root.querySelectorAll('.fp__row'), { y: 24, opacity: 0, duration: .8, stagger: .04, ease: 'power3.out', scrollTrigger: { trigger: root.querySelector('.fp__sheet'), start: 'top 80%', once: true } });
  }, []);

  return (
    <section className="fp" ref={ref} style={{ '--on': on } as React.CSSProperties}>
      <header className="fp__head">
        <span className="mono"><i></i>{d.kicker}</span>
        <h2 className="h-wide"><Rich text={d.title} /></h2>
      </header>

      <div className="fp__ask">
        <label htmlFor="fp-count" className="mono">{d.ask}</label>
        <div className="fp__count h-wide"><b>{count}{count >= d.max ? '+' : ''}</b><span className="mono">{d.unit}</span></div>
        <input id="fp-count" type="range" min={d.min} max={d.max} value={count} onChange={e => setCount(Number(e.target.value))}
          style={{ '--fill': `${fill}%` } as React.CSSProperties} />
      </div>

      <div className="fp__sheet" role="table" aria-label={d.title.replace(/\*/g, '')}>
        <span className="fp__light" aria-hidden="true"></span>
        <div className="fp__row fp__row--head" role="row">
          <span role="columnheader"></span>
          {tiers.map((t, i) => (
            <button type="button" role="columnheader" key={t.id} className={'fp__col' + (i === on ? ' is-on' : '')} onClick={() => setCount(mid[i])}>
              <span className="mono">{t.k}</span>
              <b className="h-wide">{t.name}</b>
              <span className="fp__price">{t.price} <small className="mono">{t.unit}</small></span>
            </button>
          ))}
        </div>
        {d.rows.map(([label, ...ids]) => (
          <div className="fp__row" role="row" key={label}>
            <span role="rowheader">{label}</span>
            {tiers.map((t, i) => (
              <span role="cell" key={t.id} className={'fp__cell' + (i === on ? ' is-on' : '')}>
                {ids.includes(t.id) ? <i className="fp__yes" aria-label="Included"></i> : <i className="fp__no" aria-label="Not included"></i>}
              </span>
            ))}
          </div>
        ))}
        <div className="fp__row fp__row--foot" role="row">
          <span></span>
          {tiers.map((t, i) => (
            <span role="cell" key={t.id} className={'fp__cell' + (i === on ? ' is-on' : '')}>
              <TLink href={`/contact?fleet=${t.id}`} className={'btn ' + (i === on ? 'btn--accent' : 'btn--ghost')}>{t.cta} <i>»</i></TLink>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
