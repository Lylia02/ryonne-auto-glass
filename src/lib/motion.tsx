'use client';
/* =========================================================
   Motion layer — GSAP 3.13 (ScrollTrigger, SplitText) + Lenis
   Port of the static site's js/main.js. Same values, same easings.

   - MotionProvider : registers plugins, owns the Lenis instance,
                      refreshes ScrollTrigger + scrolls to top on route change
   - useGsap        : gsap.context scoped to a component, reverted on unmount
   - playIntro      : gate/curtain lifts, hero copy reveals (shared timeline)
   - leavePage / enterPage : page transition used by <TLink> and app/template.tsx
   - helpers        : splitReveal, revealUp, parallax (repeated blocks of main.js)
   ========================================================= */
import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

/* useLayoutEffect on the client (runs before paint → no flash of
   un-animated content), useEffect on the server (no warning). */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ---------- Environment (same checks as main.js) ---------- */
export const env = () => ({
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  finePointer: matchMedia('(pointer: fine) and (hover: hover)').matches && innerWidth > 980,
});

/* ---------- Lenis singleton ---------- */
let lenis: Lenis | null = null;
export const getLenis = () => lenis;
export const scrollToTarget = (t: HTMLElement | number) => {
  if (lenis) lenis.scrollTo(t, { duration: 1.6 });
  else if (typeof t === 'number') window.scrollTo({ top: t, behavior: 'smooth' });
  else t.scrollIntoView({ behavior: 'smooth' });
};
const jumpTo = (t: HTMLElement | number) => {
  if (lenis) lenis.scrollTo(t, { immediate: true, force: true });
  else if (typeof t === 'number') window.scrollTo(0, t);
  else t.scrollIntoView();
};
const hashTarget = () => (location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null);

/* =========================================================
   Provider
   ========================================================= */
export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  /* ---------- Lenis ---------- */
  useIsoLayoutEffect(() => {
    if (env().reduce) return;
    const l = new Lenis({ lerp: 0.075, smoothWheel: true });
    lenis = l;
    l.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    l.stop(); // started by the intro
    return () => { gsap.ticker.remove(raf); l.destroy(); if (lenis === l) lenis = null; };
  }, []);

  /* ---------- Route change: top (or #hash) + refresh ---------- */
  useEffect(() => {
    if (firstRoute.current) firstRoute.current = false;
    else jumpTo(0);
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const t = hashTarget();
      if (t) jumpTo(t);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return <>{children}</>;
}

/* =========================================================
   useGsap — everything created in `setup` (tweens, ScrollTriggers,
   SplitText) is recorded in a gsap.context and reverted on unmount.
   `setup` may return a cleanup for DOM listeners.
   opts.fonts: wait for webfonts first (SplitText needs final metrics).
   ========================================================= */
type Setup = (ctx: gsap.Context) => void | (() => void);
export function useGsap(setup: Setup, deps: unknown[] = [], opts: { scope?: RefObject<Element | null>; fonts?: boolean } = {}) {
  const setupRef = useRef(setup);
  setupRef.current = setup;
  useIsoLayoutEffect(() => {
    let ctx: gsap.Context | null = gsap.context(() => {}, opts.scope?.current ?? undefined);
    let cleanup: void | (() => void);
    const run = () => {
      if (!ctx) return;
      ctx.add(() => { cleanup = setupRef.current(ctx!); });
    };
    if (opts.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(run);
    else run();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      ctx?.revert();
      ctx = null;
    };
  }, deps); // deps are forwarded from the caller, like useEffect
}

/* =========================================================
   Shared animation helpers (repeated blocks of main.js)
   ========================================================= */
export const qa = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => [...c.querySelectorAll<T>(s)];

/** Split-text headings (serif, line reveal) — [data-split] */
export const splitReveal = (root: ParentNode) => qa('[data-split]', root).forEach(el => {
  const split = new SplitText(el, { type: 'lines,words', linesClass: 'line' });
  gsap.from(split.words, { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: .04,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
});

/** Fade-up reveal (.ccard, .spec__sticky > *, .spec__form > *, .gallery__head > *, .process__head > *) */
export const revealUp = (els: Element[]) => els.forEach(el =>
  gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));

/** Parallax — [data-speed] */
export const parallax = (root: ParentNode) => qa('[data-speed]', root).forEach(el => {
  const s = parseFloat(el.dataset.speed || '1');
  gsap.to(el, { y: () => (1 - s) * 220, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
});

/* =========================================================
   Intro — the cover (gate or curtain) lifts, then the hero reveals.
   Same timeline as heroIntro() in main.js. When a target isn't on
   the page, an empty spacer of the same length keeps the timing.
   ========================================================= */
export function playIntro(cover: HTMLElement | null, { nav, onCovered }: { nav: boolean; onCovered?: () => void }) {
  const tl = gsap.timeline();
  const step = (targets: Element[], vars: gsap.TweenVars, pos: string, fromVars?: gsap.TweenVars) => {
    if (!targets.length) tl.to({}, { duration: vars.duration as number }, pos);
    else if (fromVars) tl.fromTo(targets, fromVars, vars, pos);
    else tl.from(targets, vars, pos);
  };
  if (cover) tl.to(cover, { yPercent: -100, duration: 1.1, ease: 'power4.inOut' });
  else tl.to({}, { duration: 1.1 });
  tl.add(() => onCovered && onCovered());
  step(qa('.hero__img, .phero__bg'), { scale: 1.08, duration: 2.2, ease: 'power3.out' }, '-=1.2', { scale: 1.25 });
  step(qa('.hero__h1 .line > span, .phero h1 .line > span'), { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: .1 }, '-=1.8');
  step(qa('.phero__inner p, .phero__eyebrow'), { y: 24, opacity: 0, duration: .9, ease: 'power3.out' }, '-=1');
  step(qa(`.hero__copy .btn, .hero__stats .stat, .hero__scroll${nav ? ', .nav > *' : ''}`), { y: 24, opacity: 0, duration: .9, stagger: .06, ease: 'power3.out' }, '-=.9');
  tl.add(() => { lenis?.start(); }, '-=.6');
  return tl;
}

/* =========================================================
   Page transitions (no Barba)
   leavePage : curtain rises from the bottom over the page, content fades
   enterPage : called by app/template.tsx when the new page mounts —
               content fades in, curtain keeps rising away, hero reveals
   ========================================================= */
let enteredPath: string | null = null; // first mount is handled by <Gate>
const curtainEl = () => document.getElementById('curtain');
const hideCurtain = () => gsap.set(curtainEl(), { visibility: 'hidden', yPercent: 0 });

export async function leavePage() {
  lenis?.stop();
  if (env().reduce) return;
  await gsap.timeline()
    .set(curtainEl(), { visibility: 'visible', yPercent: 100 })
    .to(curtainEl(), { yPercent: 0, duration: .8, ease: 'power4.inOut' }, 0)
    .to('#page', { opacity: 0, duration: .6, ease: 'power2.out' }, 0);
}

export function enterPage(page: HTMLElement, path: string) {
  if (enteredPath === null || enteredPath === path) { enteredPath = path; return; } // first load / StrictMode re-run
  enteredPath = path;
  const curtain = curtainEl();
  if (env().reduce) { hideCurtain(); lenis?.start(); return; }
  // Back/forward buttons skip leavePage(): close the curtain before paint
  gsap.set(curtain, { visibility: 'visible', yPercent: 0 });
  gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: .6, ease: 'power2.out', clearProps: 'opacity' });
  playIntro(curtain, { nav: false, onCovered: hideCurtain });
}

/** Cards that lean toward the pointer, with a light that follows it (--mx / --my).
    Returns a cleanup function. Pointer devices only. */
export function tiltCards(cards: HTMLElement[], { x = 10, y = 8 } = {}) {
  const { finePointer, reduce } = env();
  if (!finePointer || reduce) return () => {};
  const offs = cards.map(card => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: .8, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: .8, ease: 'power3.out' });
    const move = (e: MouseEvent) => {
      const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - .5) * x); rx(-(py - .5) * y);
      card.style.setProperty('--mx', `${px * 100}%`); card.style.setProperty('--my', `${py * 100}%`);
    };
    const leave = () => { rx(0); ry(0); };
    card.addEventListener('mousemove', move); card.addEventListener('mouseleave', leave);
    return () => { card.removeEventListener('mousemove', move); card.removeEventListener('mouseleave', leave); };
  });
  return () => offs.forEach(f => f());
}
