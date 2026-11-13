'use client';
/* =========================================================
   Services page — the five services drift past in one endless row.
   The row never stops: it slows down under the mouse, speeds up (and
   leans a little) when you scroll, and you can drag it.
   Click a service: a bone curtain rises, the service name decodes
   letter by letter while a counter runs to 100, then the curtain lifts
   off the service's own page (big title, the photo opening to full
   screen, how we do it, price, and the next service at the bottom).
   ========================================================= */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import TLink from './TLink';
import { env, getLenis, gsap, ScrollTrigger, useGsap } from '@/lib/motion';
import { services, servicesPage } from '@/lib/site';

const n = services.length;
const c = servicesPage.carousel;
const pad = (i: number) => String(i + 1).padStart(2, '0');
const GLYPHS = 'ABCDEFGHJKLMNOPRSTUVWXYZ0123456789/#+';

/* the name decodes from random glyphs, left to right */
function scramble(el: HTMLElement, text: string, duration: number) {
  el.innerHTML = '';
  const words = text.split(' ');
  const chars: HTMLSpanElement[] = [];
  words.forEach((w, wi) => {
    const word = document.createElement('span');
    word.className = 'w';
    [...w].forEach(ch => { const s = document.createElement('span'); s.dataset.c = ch; s.textContent = ch; word.appendChild(s); chars.push(s); });
    el.appendChild(word);
    if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
  const at = chars.map((_, i) => .2 + .75 * (i / chars.length) + Math.random() * .08);
  let f = 0;
  const o = { p: 0 };
  return gsap.to(o, {
    p: 1, duration, ease: 'none',
    onUpdate: () => {
      f++;
      chars.forEach((s, i) => {
        if (o.p >= at[i]) { if (s.classList.contains('x') || s.textContent !== s.dataset.c) { s.textContent = s.dataset.c!; s.classList.remove('x'); } }
        else if (o.p > at[i] - .5 && f % 3 === 0) { s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]; s.classList.add('x'); }
        else if (o.p <= at[i] - .5) { s.textContent = ' '; }
      });
    },
    onComplete: () => chars.forEach(s => { s.textContent = s.dataset.c!; s.classList.remove('x'); }),
  });
}

export default function ServiceIndex() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const hover = useRef(false);
  const moved = useRef(false);
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  /* ---------- the strip: always drifting left, faster when you scroll,
     slower under the mouse, and you can drag it ---------- */
  useGsap(() => {
    const root = ref.current!, tr = track.current!;
    const cards = [...tr.querySelectorAll<HTMLElement>('.svx__card')];
    const reduce = env().reduce;
    let x = 0, speed = 0, boost = 0, setW = 1, drag: { x0: number; at: number } | null = null, last = 0;
    const measure = () => { setW = cards[n].offsetLeft - cards[0].offsetLeft; };
    measure(); addEventListener('resize', measure);
    const base = innerWidth < 980 ? 34 : 52; // px per second
    const skew = gsap.quickTo(tr, 'skewX', { duration: .5, ease: 'power3.out' });
    const st = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top',
      onUpdate: s => { boost = gsap.utils.clamp(-900, 900, s.getVelocity() * .35); } });
    const tick = (_t: number, dt: number) => {
      const target = reduce ? 0 : (hover.current ? base * .18 : base);
      speed += (target - speed) * Math.min(1, dt / 400);
      boost *= Math.pow(.9, dt / 16);
      if (!drag) x -= (speed + Math.abs(boost)) * dt / 1000;
      x = gsap.utils.wrap(-setW, 0, x);
      gsap.set(tr, { x });
      skew(reduce ? 0 : gsap.utils.clamp(-6, 6, -(boost + (drag ? last : 0)) / 120));
    };
    gsap.ticker.add(tick);
    const down = (e: PointerEvent) => { drag = { x0: e.clientX, at: x }; moved.current = false; last = 0; };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      if (Math.abs(dx) > 6) moved.current = true;
      last = (drag.at + dx - x) * 10; x = drag.at + dx;
    };
    const up = () => { drag = null; };
    tr.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    gsap.from(cards.slice(0, n + 2), { yPercent: 30, autoAlpha: 0, duration: 1.4, stagger: .08, ease: 'power4.out', delay: .2, clearProps: 'opacity,visibility,transform' });
    gsap.from(root.querySelectorAll('.svx__head > *, .svx__foot'), { y: 24, opacity: 0, duration: 1, stagger: .07, ease: 'power3.out', delay: .5 });
    return () => {
      gsap.ticker.remove(tick); st.kill(); removeEventListener('resize', measure);
      tr.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up);
    };
  }, []);

  /* ---------- the curtain between the index and a service page ---------- */
  const transition = useCallback((label: string, img: string | null, swap: () => void, withCount: boolean) => {
    if (busy.current) return;
    busy.current = true;
    const cu = curtain.current!;
    const panel = cu.querySelector<HTMLElement>('.svt__panel')!;
    const lipTop = cu.querySelector<HTMLElement>('.svt__lip--t')!;
    const lipBot = cu.querySelector<HTMLElement>('.svt__lip--b')!;
    const name = cu.querySelector<HTMLElement>('.svt__name')!;
    const count = cu.querySelector<HTMLElement>('.svt__count')!;
    const thumb = cu.querySelector<HTMLElement>('.svt__thumb')!;
    const thumbImg = thumb.querySelector('img')!;
    if (img) thumbImg.src = img;
    thumb.style.display = img ? '' : 'none';
    count.style.display = withCount ? '' : 'none';
    count.textContent = '000';
    name.textContent = '';
    const reduce = env().reduce;
    const k = reduce ? .01 : 1;
    const o = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => { gsap.set(cu, { visibility: 'hidden' }); busy.current = false; } });
    tl.set(cu, { visibility: 'visible' })
      .set(lipBot, { height: 0 })
      .fromTo(panel, { y: 0, yPercent: 100 }, { yPercent: 0, duration: .9 * k, ease: 'power3.inOut' })
      .fromTo(lipTop, { height: '18vh' }, { height: 0, duration: .9 * k, ease: 'power2.inOut' }, '<')
      .fromTo(thumb, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .7 * k, ease: 'power3.out' }, .45 * k)
      .add(() => { scramble(name, label, withCount ? 1.15 * k : .7 * k); }, .5 * k);
    if (withCount) tl.to(o, { v: 100, duration: 1.35 * k, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, .5 * k);
    tl.add(swap, withCount ? 1.95 * k : 1.3 * k)
      .to(panel, { yPercent: -100, duration: 1 * k, ease: 'power3.inOut' }, '+=.12')
      .fromTo(lipBot, { height: 0 }, { height: '16vh', duration: 1 * k, ease: 'power2.in' }, '<')
      .to([thumb, name, count], { y: -60, opacity: 0, duration: .5 * k, ease: 'power2.in' }, '<')
      .set([thumb, name, count], { clearProps: 'all' });
  }, []);

  const openService = useCallback((i: number) => {
    const sv = services[i];
    transition(sv.name, sv.img.src, () => {
      getLenis()?.stop();
      document.documentElement.classList.add('svp-open');
      setOpen(i);
      if (page.current) page.current.scrollTop = 0;
    }, true);
  }, [transition]);

  const closeService = useCallback(() => {
    transition(c.close, null, () => {
      setOpen(null);
      document.documentElement.classList.remove('svp-open');
      getLenis()?.start();
    }, false);
  }, [transition]);

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') closeService(); };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [open, closeService]);
  useEffect(() => () => { document.documentElement.classList.remove('svp-open'); getLenis()?.start(); }, []);

  const COPIES = 3;

  return (
    <section className="svx" id="services" ref={ref}>
      <header className="svx__head">
        <span className="mono"><i></i>{c.kicker}</span>
        <h1 className="h-wide">{c.title}</h1>
      </header>

      <div className="svx__strip" onMouseEnter={() => { hover.current = true; }} onMouseLeave={() => { hover.current = false; setActive(null); }}>
        <div className="svx__track" ref={track}>
          {Array.from({ length: n * COPIES }, (_, k) => {
            const i = k % n, sv = services[i];
            return (
              <button type="button" key={k} className={'svx__card' + (active === i ? ' is-on' : active !== null ? ' is-off' : '')}
                data-cursor={c.open} tabIndex={k < n ? 0 : -1} aria-label={`${c.open}: ${sv.name}`}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                onClick={e => { if (moved.current) { e.preventDefault(); moved.current = false; return; } openService(i); }}>
                <span className="svx__photo">
                  <Image src={sv.img.src} width={sv.img.w} height={sv.img.h} alt={sv.alt} sizes="(max-width: 980px) 70vw, 26vw" draggable={false} priority={k < 4} />
                  <span className="svx__open mono">{c.open} <i>+</i></span>
                </span>
                <span className="svx__cap">
                  <span className="mono">{pad(i)}</span>
                  <b className="h-wide">{sv.name}</b>
                  <span className="mono svx__k">{c.kinds[i]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="svx__foot">
        <span className="mono">{c.hint}</span>
        <span className="mono svx__price">{active !== null ? `${services[active].name} · ${services[active].price}` : `${n} ${c.kicker}`}</span>
      </div>

      {/* the service page */}
      <div className={'svp' + (open !== null ? ' is-open' : '')} ref={page} data-lenis-prevent role={open !== null ? 'dialog' : undefined} aria-modal={open !== null || undefined} aria-hidden={open === null}>
        {open !== null && (
          <ServicePage key={open} i={open} scroller={page}
            onClose={closeService} onNext={() => openService((open + 1) % n)} />
        )}
      </div>

      {/* the curtain */}
      <div className="svt" ref={curtain} aria-hidden="true">
        <div className="svt__panel">
          <span className="svt__lip svt__lip--t"></span>
          <figure className="svt__thumb">
            {/* plain img: the source changes right before the curtain rises */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={services[0].img.src} alt="" />
          </figure>
          <div className="svt__name h-wide"></div>
          <span className="svt__count mono">000</span>
          <span className="svt__lip svt__lip--b"></span>
        </div>
      </div>
    </section>
  );
}

/* ---------- one service, full page ---------- */
function ServicePage({ i, scroller, onClose, onNext }: {
  i: number; scroller: React.RefObject<HTMLDivElement | null>; onClose: () => void; onNext: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sv = services[i];
  const nx = services[(i + 1) % n];

  useLayoutEffect(() => {
    const root = ref.current!, sc = scroller.current!;
    const ctx = gsap.context(() => {
      const reduce = env().reduce;
      // title + meta come in once the curtain has lifted
      gsap.from(root.querySelectorAll('.svp__title span i'), { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: .07, delay: reduce ? 0 : .45 });
      gsap.from(root.querySelectorAll('.svp__bar > *, .svp__meta > *'), { opacity: 0, y: 16, duration: .9, ease: 'power3.out', stagger: .06, delay: reduce ? 0 : .7 });
      if (reduce) return;
      // the photo opens from a window to the full screen
      const media = root.querySelector<HTMLElement>('.svp__media')!;
      gsap.fromTo(media, { clipPath: 'inset(0% 24% 0% 24% round 10px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: media, scroller: sc, start: 'top 85%', end: 'top top', scrub: true },
      });
      gsap.fromTo(media.querySelector('img'), { scale: 1.25, yPercent: -6 }, {
        scale: 1, yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: media, scroller: sc, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      root.querySelectorAll<HTMLElement>('[data-up]').forEach(el => gsap.from(el, {
        y: 50, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, scroller: sc, start: 'top 90%', once: true },
      }));
      root.querySelectorAll<HTMLElement>('.svp__facts li').forEach((el, k) => gsap.from(el, {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: k * .08,
        scrollTrigger: { trigger: el, scroller: sc, start: 'top 92%', once: true },
      }));
    }, root);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, [scroller]);

  return (
    <div className="svp__in" ref={ref}>
      <div className="svp__bar">
        <span className="mono">Ryonne <i>/</i> {c.kicker} <i>/</i> {pad(i)}</span>
        <button type="button" className="svp__close mono" onClick={onClose}>{c.close} <i>×</i></button>
      </div>

      <header className="svp__hero">
        <h1 className="svp__title h-wide">
          {sv.name.split(' ').map((w, k) => <span key={k}><i>{w}</i></span>)}
        </h1>
        <div className="svp__meta">
          <span className="mono">{c.kinds[i]}</span>
          <span className="mono">{pad(i)} / {pad(n - 1)}</span>
          <span className="mono svp__gold">{sv.price}</span>
        </div>
      </header>

      <figure className="svp__media">
        <Image src={sv.img.src} width={sv.img.w} height={sv.img.h} alt={sv.alt} sizes="100vw" priority />
      </figure>

      <section className="svp__body">
        <div className="svp__col" data-up>
          <span className="mono svp__k"><i></i>{c.what}</span>
          <h2 className="h-wide"><Rich text={sv.title} /></h2>
        </div>
        <div className="svp__col">
          <p className="svp__text" data-up>{sv.text}</p>
          <ul className="svp__facts">
            {sv.facts.map(([v, l]) => <li key={l}><b className="h-wide">{v}</b><span>{l}</span></li>)}
          </ul>
          <div className="svp__buy" data-up>
            <span className="svp__price">{sv.price}</span>
            <TLink href={sv.href} className="btn btn--accent">{sv.cta} <i>»</i></TLink>
          </div>
        </div>
      </section>

      <button type="button" className="svp__next" onClick={onNext} data-cursor={c.open}>
        <span className="mono svp__nk">{c.next}</span>
        <span className="svp__nimg"><Image src={nx.img.src} width={nx.img.w} height={nx.img.h} alt="" sizes="(max-width: 980px) 60vw, 26vw" /></span>
        <span className="svp__nname">
          <b className="h-wide">{nx.name}</b>
          <span className="mono">{c.kinds[(i + 1) % n]}</span>
        </span>
      </button>
    </div>
  );
}
