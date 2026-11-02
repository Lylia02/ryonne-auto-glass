'use client';
/* Site chrome: custom cursor, scroll progress, grid lines, magnetic
   buttons, nav hide on scroll + light nav over data-theme="light". */
import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { env, gsap, qa, ScrollTrigger, scrollToTarget, useGsap } from '@/lib/motion';


export default function Chrome() {
  const pathname = usePathname();
  const cursorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);

  /* ---------- Custom cursor (delegated, so it follows page changes) ---------- */
  useGsap(() => {
    const { finePointer, reduce } = env();
    if (!finePointer || reduce) return;
    document.body.classList.add('has-cursor');
    const cur = cursorRef.current!, label = cur.querySelector('.cursor__label')!;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, ring = { x: pos.x, y: pos.y };
    const onMove = (e: MouseEvent) => { pos.x = e.clientX; pos.y = e.clientY; };
    const tick = () => {
      ring.x += (pos.x - ring.x) * .18; ring.y += (pos.y - ring.y) * .18;
      gsap.set('.cursor__dot', { x: pos.x, y: pos.y });
      gsap.set('.cursor__ring, .cursor__label', { x: ring.x, y: ring.y });
    };
    // mouseover on every element = same result as mouseenter/leave on each one
    const onOver = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      cur.classList.toggle('is-hover', !!t?.closest('a, button, label, .row'));
      const lab = t?.closest<HTMLElement>('[data-cursor]');
      if (lab) label.textContent = lab.dataset.cursor ?? '';
      cur.classList.toggle('is-label', !!lab);
    };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      gsap.ticker.remove(tick);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  /* ---------- Scroll progress + nav hide + #anchor links ---------- */
  useGsap(() => {
    const bar = barRef.current!, nav = document.getElementById('nav')!, menu = document.getElementById('menu')!;
    let lastY = 0;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
      bar.style.width = (self.progress * 100) + '%';
      const y = self.scroll();
      nav.classList.toggle('nav--hidden', y > lastY && y > 300 && !menu.classList.contains('is-open'));
      lastY = y;
    } });
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      if (!a || e.defaultPrevented) return;
      const id = a.getAttribute('href')!; if (id.length < 2) return;
      const t = document.getElementById(id.slice(1)); if (!t) return;
      e.preventDefault(); scrollToTarget(t);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* ---------- Per page: light nav + magnetic buttons ---------- */
  useGsap(() => {
    const nav = document.getElementById('nav')!;
    nav.classList.remove('nav--light');
    qa('[data-theme="light"]').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 40px', end: 'bottom 40px',
      onToggle: self => nav.classList.toggle('nav--light', self.isActive) }));

    const { finePointer, reduce } = env();
    if (!finePointer || reduce) return;
    const offs = qa('[data-magnetic]').map(el => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .5, ease: 'power3.out' });
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' });
      el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave);
      return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
    });
    return () => offs.forEach(off => off());
  }, [pathname]);

  return (
    <>
      {/* custom cursor */}
      <div className="cursor" id="cursor" aria-hidden="true" ref={cursorRef}><span className="cursor__dot"></span><span className="cursor__ring"></span><span className="cursor__label"></span></div>
      {/* scroll progress */}
      <div className="progress" aria-hidden="true"><i id="progressBar" ref={barRef}></i></div>
      {/* vertical grid lines */}
      <div className="grid-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    </>
  );
}
