'use client';
/* =========================================================
   "Show us the damage" — 3D configurator.
   Home (showroom): the section is 3 screens tall and its stage sticks.
   Scrolling turns the car in a light studio with every make around it,
   then the lights go down and the configurator panel slides in.
   Contact page: the configurator alone.
   1. pick the glass (on the car or with the chips)
   2. pick what happened (chip / crack / shattered)
   3. see the right repair + price → "Book this repair" pre-fills
      the quote form (event "ryonne:prefill", read by <SpecForm>)
   The WebGL scene (Diagnose3D) only loads when the section gets close.
   ========================================================= */
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Rich from './Rich';
import { gsap, qa, revealUp, scrollToTarget, useGsap } from '@/lib/motion';
import { diagnose as d, diagnoseResult, gridMakes, home, type DamageId, type GlassId } from '@/lib/site';
import type { Pick } from './Diagnose3D';
import { PREFILL_EVENT, type Prefill } from '@/lib/keys';

const Scene = dynamic(() => import('./Diagnose3D'), { ssr: false });

export default function Diagnose({ showroom = false }: { showroom?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const intro = useRef(showroom ? 0 : 1); // 0 → 1 while the showroom intro scrolls; read by the 3D camera
  const [near, setNear] = useState(false);     // mount the 3D scene
  const [onScreen, setOnScreen] = useState(false); // run its render loop
  const [ready, setReady] = useState(false);
  const [touch, setTouch] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [glass, setGlass] = useState<GlassId | null>(null);
  const [damage, setDamage] = useState<DamageId | null>(null);
  const [paint, setPaint] = useState(d.paints[1].variant);
  const [mark, setMark] = useState<Pick | null>(null);
  const hots = useRef<Partial<Record<GlassId, HTMLButtonElement | null>>>({});

  useEffect(() => {
    setTouch(matchMedia('(hover: none), (pointer: coarse)').matches);
    const mq = matchMedia('(max-width: 980px)');
    const onMq = () => setStacked(mq.matches); onMq(); mq.addEventListener('change', onMq);
    const el = ref.current!;
    const lazy = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); lazy.disconnect(); } }, { rootMargin: '600px 0px' });
    const vis = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '80px 0px' });
    lazy.observe(el); vis.observe(el);
    return () => { lazy.disconnect(); vis.disconnect(); mq.removeEventListener('change', onMq); };
  }, []);

  useGsap(() => {
    const root = ref.current!;
    if (!showroom) { revealUp(qa('.dx__panel > *', root)); return; }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 981px) and (prefers-reduced-motion: no-preference)', () => {
      intro.current = 0;
      const $ = (sel: string) => qa(sel, root);
      // positions are scroll progress (0 → 1): the timeline lasts exactly 1
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: .6,
        onUpdate: st => { intro.current = st.progress; } } })
        .fromTo($('.sr__label'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .08 }, .02)
        .fromTo($('.sr__grid li'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .1, stagger: { each: .012, from: 'center' } }, .08)
        .fromTo($('.sr__title'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .1 }, .2)
        .to($('.sr__grid li, .sr__label, .sr__title'), { opacity: 0, y: -20, duration: .08, stagger: { each: .004, from: 'edges' } }, .5)
        .to($('.sr__light'), { opacity: 0, duration: .14 }, .52)
        .fromTo($('.dx__panel'), { autoAlpha: 0, xPercent: 18 }, { autoAlpha: 1, xPercent: 0, duration: .14 }, .7)
        .fromTo($('.dx__tag, .dx__hint, .dx__paints'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .08 }, .76)
        .to({}, { duration: .1 }, .9);
      return () => { intro.current = 1; };
    });
    mm.add('(max-width: 980px), (prefers-reduced-motion: reduce)', () => {
      intro.current = 1;
      revealUp(qa('.dx__panel > *, .sr__overlay > *', root));
    });
    return () => mm.revert();
  }, []);

  const onPick = useCallback((p: Pick) => {
    setGlass(p.glass);
    setMark(p);
    setDamage(prev => (p.glass === mark?.glass ? prev : null));
  }, [mark]);
  const chooseGlass = (id: GlassId) => { setGlass(id); setMark({ glass: id }); setDamage(null); };
  const reset = () => { setGlass(null); setDamage(null); setMark(null); };
  const onReady = useCallback(() => setReady(true), []);

  const g = d.glass.find(x => x.id === glass);
  const r = glass && damage ? diagnoseResult(glass, damage) : null;

  const book = () => {
    if (!g || !r) return;
    const dmg = d.damage.find(x => x.id === damage)!;
    const detail: Prefill = { glass: g.form, message: `3D diagnosis: ${g.label.toLowerCase()}, ${dmg.label.toLowerCase()}. Suggested: ${r.service}${r.extra ? ` + ${r.extra.split(' · ')[0]}` : ''}.` };
    window.dispatchEvent(new CustomEvent<Prefill>(PREFILL_EVENT, { detail }));
    const form = document.getElementById('contact');
    if (form) scrollToTarget(form);
  };

  return (
    <section className={`dx${showroom ? ' dx--showroom' : ''}`} id="diagnose" ref={ref}>
      {showroom && <div className="sr__lightzone" data-theme="light" aria-hidden="true"></div>}
      <div className="dx__sticky">
      {showroom && (
        <div className="sr__overlay">
          <p className="sr__label eyebrow">{home.makes.label}</p>
          <ul className="sr__grid">{gridMakes.map(x => <li key={x}>{x}</li>)}</ul>
          <h2 className="sr__title h-serif"><Rich text={home.makes.title} /></h2>
        </div>
      )}
      <div className="dx__stage" data-cursor="Drag">
        {showroom && <div className="sr__light" aria-hidden="true"></div>}
        {near && (
          <Scene glass={glass} damage={damage} paint={paint} mark={mark} touch={touch} stacked={stacked}
            active={onScreen} intro={intro} hots={hots} onPick={onPick} onReady={onReady} />
        )}
        <div className="dx__hots">
          {d.glass.map(x => (
            <button key={x.id} className="dx-hot" ref={el => { hots.current[x.id] = el; }} aria-label={x.label} onClick={() => chooseGlass(x.id)}><i></i><span>{x.label}</span></button>
          ))}
        </div>
        <div className={`dx__loader${ready ? ' is-done' : ''}`} aria-hidden={ready}>
          <span>{d.loading}</span><i></i>
        </div>
        <span className="dx__tag"><b></b>Live 3D</span>
        <span className="dx__hint">{touch ? 'Tap a glass' : d.rotate}</span>
        <div className="dx__paints" role="group" aria-label={d.steps.paint}>
          <span>{d.steps.paint}</span>
          {d.paints.map(p => (
            <button key={p.variant} className={p.variant === paint ? 'is-on' : ''} onClick={() => setPaint(p.variant)}
              aria-label={p.label} aria-pressed={p.variant === paint} style={{ '--sw': p.swatch } as React.CSSProperties}></button>
          ))}
        </div>
      </div>

      <div className="dx__panel">
        <span className="eyebrow">{d.eyebrow}</span>
        <h2 className="h-serif"><Rich text={d.title} /></h2>
        <p className="dx__lead">{d.text}</p>

        <fieldset className="dx__step">
          <legend><i>01</i>{d.steps.glass}</legend>
          <div className="dx__chips">
            {d.glass.map(x => (
              <button key={x.id} type="button" className={x.id === glass ? 'is-on' : ''} aria-pressed={x.id === glass} onClick={() => chooseGlass(x.id)}>{x.label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className={`dx__step${glass ? '' : ' is-locked'}`} disabled={!glass}>
          <legend><i>02</i>{d.steps.damage}</legend>
          <div className="dx__chips dx__chips--damage">
            {d.damage.map(x => (
              <button key={x.id} type="button" className={x.id === damage ? 'is-on' : ''} aria-pressed={x.id === damage} onClick={() => setDamage(x.id)}>
                <b>{x.label}</b><small>{x.hint}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <div className={`dx__result${r ? ' is-on' : ''}`} aria-live="polite">
          {r ? (
            <div key={`${glass}-${damage}`} className="dx__card">
              <span className="dx__k">Recommended</span>
              <h3 className="h-serif">{r.service}</h3>
              <div className="dx__meta"><b>{r.price}</b><span>{r.time}</span>{r.extra && <span className="dx__extra">+ {r.extra}</span>}</div>
              <p>{r.note}</p>
              <div className="dx__actions">
                <button type="button" className="btn btn--accent" onClick={book}>{d.cta} <i>»</i></button>
                <button type="button" className="dx__reset" onClick={reset}>{d.reset}</button>
              </div>
            </div>
          ) : (
            <p className="dx__idle">{glass ? d.pickDamage : d.idle}</p>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
