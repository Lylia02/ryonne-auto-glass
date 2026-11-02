'use client';
/* Intro gate — blurred words + loading bar, then Enter / auto-continue.
   Shown once per browser session (sessionStorage). On later loads the
   curtain (closed by the inline script in layout.tsx) lifts instead. */
import { Fragment, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { env, getLenis, gsap, playIntro, useGsap } from '@/lib/motion';
import { gateLines } from '@/lib/site';
import { GATE_KEY } from '@/lib/keys';

export default function Gate() {
  const pathname = usePathname();
  const [line] = useState(() => gateLines[pathname] ?? gateLines['/']); // first page only
  const gateRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  useGsap(() => {
    const gate = gateRef.current!, curtain = document.getElementById('curtain');
    let seen = false;
    try { seen = !!sessionStorage.getItem(GATE_KEY); } catch {}
    const hideCurtain = () => gsap.set(curtain, { visibility: 'hidden', yPercent: 0 });

    if (env().reduce) { gate.style.display = 'none'; hideCurtain(); getLenis()?.start(); return; }
    if (seen) { gate.style.display = 'none'; playIntro(curtain, { nav: true, onCovered: hideCurtain }); return; }

    const ws = [...gate.querySelectorAll('.w')];
    const tl = gsap.timeline();
    tl.to(ws, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .9, stagger: .14, ease: 'power2.out' }, .4)
      .to(barRef.current, { width: '100%', duration: ws.length * .14 + .9, ease: 'power1.inOut' }, .4)
      .add(() => enterRef.current?.classList.add('is-ready'))
      .add(() => {
        playIntro(gate, { nav: true, onCovered: () => {
          gsap.set(gate, { display: 'none' });
          try { sessionStorage.setItem(GATE_KEY, '1'); } catch {}
        } });
      }, '+=.9');
    const enter = enterRef.current!, onEnter = () => { tl.progress(1); };
    enter.addEventListener('click', onEnter);
    return () => enter.removeEventListener('click', onEnter);
  }, []);

  const words = line.trim().split(/\s+/);
  return (
    <div className="gate" id="gate" aria-hidden="true" ref={gateRef}>
      <div className="gate__logo"><span className="mark">R</span></div>
      <p className="gate__line" id="gateLine">
        {words.map((w, i) => <Fragment key={i}>{i > 0 && ' '}<span className="w">{w}</span></Fragment>)}
      </p>
      <div className="gate__bar"><i id="gateBar" ref={barRef}></i></div>
      <button className="gate__enter" id="gateEnter" type="button" ref={enterRef}>Enter</button>
    </div>
  );
}
