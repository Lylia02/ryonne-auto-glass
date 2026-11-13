'use client';
/* =========================================================
   Fleet programs — 3 tiers, each one a cut stone in a glass case.
   The stone is SVG (same cuts as the home services showcase);
   the case tilts toward the pointer and a light follows it.
   ========================================================= */
import { useRef } from 'react';
import Rich from './Rich';
import TLink from './TLink';
import { gsap, qa, splitReveal, tiltCards, useGsap } from '@/lib/motion';
import { choir, fleetPage, tiers } from '@/lib/site';
import { edgePoints, facetPath, tablePoints } from '@/lib/gem';

const GEMS: Record<string, { cut: string; tone: string }> = {
  starter: { cut: choir.cuts[4], tone: '#9fc4ff' },     // emerald cut
  priority: { cut: choir.cuts[1], tone: '#ffd400' },    // round brilliant
  enterprise: { cut: choir.cuts[2], tone: '#e8102a' },  // hexagon
};

function Gem({ id }: { id: string }) {
  const { cut, tone } = GEMS[id];
  return (
    <svg className="tier__gem" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".35" stopColor={tone} /><stop offset="1" stopColor="#050505" />
        </linearGradient>
        <linearGradient id={`t-${id}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset=".6" stopColor={tone} stopOpacity=".7" /><stop offset="1" stopColor={tone} stopOpacity=".2" />
        </linearGradient>
        <clipPath id={`c-${id}`}><polygon points={edgePoints(cut)} /></clipPath>
      </defs>
      <polygon points={edgePoints(cut)} fill={`url(#g-${id})`} />
      <polygon points={tablePoints(cut)} fill={`url(#t-${id})`} />
      <path className="tier__facets" d={facetPath(cut)} />
      <polygon className="tier__edge" points={edgePoints(cut)} />
      <g clipPath={`url(#c-${id})`}><rect className="tier__sheen" x="-60" y="-10" width="40" height="120" /></g>
    </svg>
  );
}

export default function Tiers() {
  const ref = useRef<HTMLElement>(null);
  const h = fleetPage.tiersHead;

  useGsap(() => {
    const root = ref.current!;
    splitReveal(root);
    gsap.from(qa('.tier', root), { y: 90, opacity: 0, rotateX: -12, duration: 1.3, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: root.querySelector('.tiers__grid'), start: 'top 80%', once: true } });
    qa<SVGPathElement>('.tier__facets, .tier__edge', root).forEach(el => {
      const len = 900;
      gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    return tiltCards(qa('.tier', root));
  }, [], { fonts: true });

  return (
    <section className="tiers tiers--gems" ref={ref}>
      <div className="tiers__head"><h2 className="h-serif" data-split><Rich text={h.title} /></h2></div>
      <div className="tiers__grid">
        {tiers.map(t => {
          const hot = 'hot' in t && t.hot;
          return (
            <div className={`tier${hot ? ' tier--hot' : ''}`} key={t.id} style={{ '--tone': GEMS[t.id].tone } as React.CSSProperties}>
              {hot && <span className="tier__badge">Most chosen</span>}
              <Gem id={t.id} />
              <span className="tier__k">{t.k}</span><h3 className="h-serif">{t.name}</h3><div className="tier__price">{t.price}<small>{t.unit}</small></div>
              <ul>{t.perks.map(p => <li key={p}>{p}</li>)}</ul>
              <TLink href={`/contact?fleet=${t.id}`} className={`btn ${hot ? 'btn--accent' : 'btn--ghost'}`} data-magnetic>{t.cta} <i>»</i></TLink>
            </div>
          );
        })}
      </div>
    </section>
  );
}
