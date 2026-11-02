'use client';
/* Fleet programs — 3 tiers */
import { useRef } from 'react';
import Rich from './Rich';
import TLink from './TLink';
import { splitReveal, useGsap } from '@/lib/motion';
import { fleetPage, tiers } from '@/lib/site';

export default function Tiers() {
  const ref = useRef<HTMLElement>(null);
  const h = fleetPage.tiersHead;
  useGsap(() => { splitReveal(ref.current!); }, [], { fonts: true });

  return (
    <section className="tiers" data-theme="light" ref={ref}>
      <div className="tiers__head"><span className="eyebrow">{h.eyebrow}</span><h2 className="h-serif" data-split><Rich text={h.title} /></h2></div>
      <div className="tiers__grid">
        {tiers.map(t => {
          const hot = 'hot' in t && t.hot;
          return (
            <div className={`tier${hot ? ' tier--hot' : ''}`} key={t.id}>
              <span className="tier__k">{t.k}</span><h3 className="h-serif">{t.name}</h3><div className="tier__price">{t.price}<small>{t.unit}</small></div>
              <ul>{t.perks.map(p => <li key={p}>{p}</li>)}</ul>
              <TLink href={`/contact?fleet=${t.id}`} className={`btn ${hot ? 'btn--accent' : 'btn--dark'}`} data-magnetic>{t.cta}</TLink>
            </div>
          );
        })}
      </div>
    </section>
  );
}
