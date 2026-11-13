'use client';
/* =========================================================
   "Show us the damage" — 3D configurator.
   Home (showroom): the section is 3 screens tall and its stage sticks.
   Scrolling turns the car in a light studio with every make around it,
   then the lights go down and the configurator panel slides in.
   Contact page: the configurator alone.
   Two ways to ask for a quote, switchable at the top of the panel:
   · 3D diagnosis → glass + damage → recommended repair → short form
   · Send a photo → photo + glass → short form (the stage shows the photo)
   The short form posts to the same server action as the full quote form.
   1. pick the glass (on the car or with the chips)
   2. pick what happened (chip / crack / shattered)
   3. see the right repair + price → "Book this repair" pre-fills
      the quote form (event "ryonne:prefill", read by <SpecForm>)
   The WebGL scene (Diagnose3D) only loads when the section gets close.
   ========================================================= */
import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Rich from './Rich';
import { gsap, qa, revealUp, scrollToTarget, useGsap } from '@/lib/motion';
import { diagnose as d, diagnoseResult, gridMakes, home, type DamageId, type GlassId } from '@/lib/site';
import type { Pick } from './Diagnose3D';
import { PREFILL_EVENT, type Prefill } from '@/lib/keys';
import { submitQuote, type QuoteState } from '@/app/actions';

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
  const [mode, setMode] = useState<'model' | 'photo'>('model');
  const [view, setView] = useState<'diagnose' | 'details' | 'sent'>('diagnose');
  const [photo, setPhoto] = useState<string | null>(null); // preview URL of the chosen photo
  const [round, setRound] = useState(0);                   // new key → fresh form after "New request"

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
    setView(v => (v === 'details' ? 'diagnose' : v));
    setGlass(p.glass);
    setMark(p);
    setDamage(prev => (p.glass === mark?.glass ? prev : null));
  }, [mark]);
  const chooseGlass = (id: GlassId) => { setGlass(id); setMark({ glass: id }); setDamage(null); if (view === 'details') setView('diagnose'); };
  const reset = () => { setGlass(null); setDamage(null); setMark(null); };
  const showPhoto = (file: File | null) => setPhoto(prev => { if (prev) URL.revokeObjectURL(prev); return file ? URL.createObjectURL(file) : null; });
  const switchMode = (m: 'model' | 'photo') => { if (m === mode) return; setMode(m); setView(m === 'photo' ? 'details' : (glass && damage ? 'details' : 'diagnose')); showPhoto(null); };
  const again = () => { reset(); showPhoto(null); setRound(n => n + 1); setView(mode === 'photo' ? 'details' : 'diagnose'); };
  const onReady = useCallback(() => setReady(true), []);

  const g = d.glass.find(x => x.id === glass);
  const r = glass && damage ? diagnoseResult(glass, damage) : null;

  // "Use the full form": pre-fill the big quote form (#contact) and scroll to it
  const book = () => {
    const dmg = d.damage.find(x => x.id === damage);
    const detail: Prefill = mode === 'model' && g && dmg && r
      ? { glass: g.form, message: `3D diagnosis: ${g.label.toLowerCase()}, ${dmg.label.toLowerCase()}. Suggested: ${r.service}${r.extra ? ` + ${r.extra.split(' · ')[0]}` : ''}.` }
      : { glass: 'Not sure', message: 'I have a photo of the damage (attached).' };
    window.dispatchEvent(new CustomEvent<Prefill>(PREFILL_EVENT, { detail }));
    const form = document.getElementById('contact');
    if (form) scrollToTarget(form);
  };

  return (
    <section className={`dx${showroom ? ' dx--showroom' : ''}${mode === 'photo' ? ' is-photo' : ''}`} id="diagnose" ref={ref}>
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
            active={onScreen && mode === 'model'} intro={intro} hots={hots} onPick={onPick} onReady={onReady} />
        )}
        {mode === 'photo' && (
          <div className="dx__photo">
            {photo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={photo} alt="Your photo of the damage" />
              : <div className="dx__ph"><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M14 8 Q60 0 106 8 L116 62 Q60 70 4 62 Z" /></svg><span>{d.request.placeholder}</span></div>}
          </div>
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

      <div className="dx__panel" data-lenis-prevent>
        <div className="dx__top">
          <span className="eyebrow">{d.eyebrow}</span>
          <div className="dx__modes" role="tablist" aria-label="How do you want to show us the damage?">
            {(['model', 'photo'] as const).map(m => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? 'is-on' : ''} onClick={() => switchMode(m)}>{d.modes[m]}</button>
            ))}
          </div>
        </div>

        {view === 'sent' ? (
          <div className="dx__sent" aria-live="polite">
            <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
            <h2 className="h-serif"><Rich text={d.sent.title} /></h2>
            <p>{d.sent.text}</p>
            <button type="button" className="btn btn--ghost" onClick={again}>{d.sent.again} <i>»</i></button>
          </div>
        ) : mode === 'model' && view === 'diagnose' ? (
          <>
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
                    <button type="button" className="btn btn--accent" onClick={() => setView('details')}>{d.cta} <i>»</i></button>
                    <button type="button" className="dx__reset" onClick={reset}>{d.reset}</button>
                  </div>
                </div>
              ) : (
                <p className="dx__idle">{glass ? d.pickDamage : d.idle}</p>
              )}
            </div>
          </>
        ) : (
          <RequestForm key={`${mode}-${round}`} mode={mode} glass={glass} damage={damage}
            onBack={() => setView('diagnose')} onPhoto={showPhoto} onSent={() => setView('sent')} onFullForm={book} />
        )}
      </div>
      </div>
    </section>
  );
}

/* =========================================================
   The short request form (inside the panel)
   ========================================================= */
function RequestForm({ mode, glass, damage, onBack, onPhoto, onSent, onFullForm }: {
  mode: 'model' | 'photo'; glass: GlassId | null; damage: DamageId | null;
  onBack: () => void; onPhoto: (f: File | null) => void; onSent: () => void; onFullForm: () => void;
}) {
  const [state, formAction, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: 'idle' });
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [who, setWho] = useState({ name: '', email: '', phone: '' });
  const bind = (k: keyof typeof who) => ({ name: k, value: who[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setWho(w => ({ ...w, [k]: e.target.value })) });
  const [photoGlass, setPhotoGlass] = useState<string>('Not sure');
  const [fileName, setFileName] = useState<string | null>(null);
  const q = d.request;

  useEffect(() => { if (state.status === 'success') onSent(); }, [state, onSent]);

  const g = d.glass.find(x => x.id === glass);
  const dmg = d.damage.find(x => x.id === damage);
  const r = glass && damage ? diagnoseResult(glass, damage) : null;
  const message = mode === 'model' && g && dmg && r
    ? `3D diagnosis: ${g.label.toLowerCase()}, ${dmg.label.toLowerCase()}. Suggested: ${r.service}${r.extra ? ` + ${r.extra.split(' · ')[0]}` : ''}.`
    : `Photo request: ${photoGlass.toLowerCase()}.`;
  const err = (k: string) => state.errors?.[k] ? <em className="dx__ferr">{state.errors[k]}</em> : null;
  const pick = (f: File | undefined) => { setFileName(f?.name ?? null); onPhoto(f ?? null); };

  return (
    // submitted by hand (not <form action>) so React doesn't clear the fields — the photo included — if there's an error
    <form className="dx__form" noValidate onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => formAction(fd)); }}>
      {mode === 'model' ? (
        <>
          <button type="button" className="dx__back" onClick={onBack}>← {q.back}</button>
          <h2 className="h-serif"><Rich text={q.title} /></h2>
          {g && dmg && r && (
            <div className="dx__summary"><span className="dx__k">{q.summary}</span><b>{g.label} · {dmg.label}</b><span>{r.service} — {r.price}</span></div>
          )}
        </>
      ) : (
        <>
          <h2 className="h-serif"><Rich text={q.photoTitle} /></h2>
          <p className="dx__lead">{q.photoText}</p>
          <label className={`dx__drop${fileName ? ' has-file' : ''}`}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 4v12m0-12-4 4m4-4 4 4" /></svg>
            <b>{fileName ?? q.drop}</b><small>{q.dropHint}</small>
            <input type="file" name="photo" accept="image/*" onChange={e => pick(e.target.files?.[0])} />
          </label>
          {err('photo')}
          <fieldset className="dx__step dx__step--tight">
            <legend>{q.which}</legend>
            <div className="dx__chips">
              {[...d.glass.filter(x => x.id !== 'passenger' && x.id !== 'quarter').map(x => x.form), 'Not sure'].filter((v, i, a) => a.indexOf(v) === i).map(v => (
                <button key={v} type="button" className={v === photoGlass ? 'is-on' : ''} aria-pressed={v === photoGlass} onClick={() => setPhotoGlass(v)}>{v}</button>
              ))}
            </div>
          </fieldset>
        </>
      )}

      <fieldset className="dx__step dx__step--tight">
        <legend>{q.type}</legend>
        <div className="dx__chips dx__chips--small">
          {d.vehicleTypes.map(v => (
            <button key={v} type="button" className={v === type ? 'is-on' : ''} aria-pressed={v === type} onClick={() => setType(t => (t === v ? '' : v))}>{v}</button>
          ))}
        </div>
      </fieldset>

      <div className="dx__fields">
        <label><span>Name</span><input {...bind('name')} autoComplete="name" required aria-invalid={!!state.errors?.name} />{err('name')}</label>
        <label><span>Email</span><input type="email" {...bind('email')} autoComplete="email" required aria-invalid={!!state.errors?.email} />{err('email')}</label>
        <label><span>Phone <small>optional</small></span><input type="tel" {...bind('phone')} autoComplete="tel" aria-invalid={!!state.errors?.phone} />{err('phone')}</label>
        <label><span>Vehicle <small>year, make, model</small></span><input value={model} onChange={e => setModel(e.target.value)} placeholder="2021 Honda Civic" /></label>
      </div>
      {mode === 'model' && (
        <label className={`dx__attach${fileName ? ' has-file' : ''}`}>
          <span>+ {fileName ?? q.attach}</span><small>optional</small>
          <input type="file" name="photo" accept="image/*" onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
        </label>
      )}

      <input type="hidden" name="vehicle" value={[type, model.trim()].filter(Boolean).join(' · ')} />
      <input type="hidden" name="glass" value={mode === 'model' && g ? g.form : photoGlass} />
      <input type="hidden" name="service" value="mobile" />
      <input type="hidden" name="message" value={message} />
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" hidden aria-hidden="true" />

      <div className="dx__actions">
        <button type="submit" className="btn btn--accent" disabled={pending}>{pending ? q.sending : q.send} <i>»</i></button>
        <button type="button" className="dx__reset" onClick={onFullForm}>{q.fullForm}</button>
      </div>
      <p className="dx__ferr" role="alert">{state.status === 'error' ? state.message : ''}</p>
    </form>
  );
}
