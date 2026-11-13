'use client';
/* =========================================================
   Intro gate — the screen is a pane of dark glass.
   1. The logo and a short line appear, a light sweeps the glass.
   2. Impact: a flash, then cracks run out from the hit in a star
      with rings, and the glass shivers.
   3. The pane shatters: every shard falls away (outward from the
      hit, spinning, pulled down), revealing the page behind.
   Shown once per browser session (sessionStorage). On later loads the
   curtain (closed by the inline script in layout.tsx) lifts instead.
   The shards are drawn in one SVG: a grid of rays and rings around the
   impact point, with each corner nudged once so the shards still fit.
   ========================================================= */
import { Fragment, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { env, getLenis, gsap, playIntro, useGsap } from '@/lib/motion';
import { gateLines } from '@/lib/site';
import { GATE_KEY } from '@/lib/keys';

const NS = 'http://www.w3.org/2000/svg';
const RAYS = 15;
const RINGS = [0, .045, .1, .18, .3, .46, .7, 1.2];   // fractions of the screen diagonal

function buildGlass(svg: SVGSVGElement, W: number, H: number) {
  const P = { x: W * .5, y: H * .46 }, D = Math.hypot(W, H);
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const angles = Array.from({ length: RAYS }, (_, i) => (i / RAYS) * Math.PI * 2 + (rnd() - .5) * .32);
  // one nudged corner per (ring, ray), shared by the shards that meet there
  const pt = RINGS.map((r, j) => angles.map(a => {
    if (j === 0) return P;
    const rr = r * D * (j === RINGS.length - 1 ? 1 : .85 + rnd() * .3), aa = a + (j > 1 ? (rnd() - .5) * .16 : 0);
    return { x: P.x + Math.cos(aa) * rr, y: P.y + Math.sin(aa) * rr };
  }));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `<defs>
    <linearGradient id="gGlass" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">
      <stop offset="0" stop-color="#0b0d14"/><stop offset=".45" stop-color="#06070b"/><stop offset=".55" stop-color="#0c0e15"/><stop offset="1" stop-color="#040406"/>
    </linearGradient>
    <radialGradient id="gFlash" cx="${P.x}" cy="${P.y}" r="${D * .25}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".15" stop-color="#cfe2ff" stop-opacity=".35"/><stop offset="1" stop-color="#cfe2ff" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
  const shards = document.createElementNS(NS, 'g'), cracks = document.createElementNS(NS, 'g');
  shards.setAttribute('class', 'gate__shards'); cracks.setAttribute('class', 'gate__cracks');
  const list: { el: SVGPolygonElement; cx: number; cy: number; d: number }[] = [];
  for (let j = 0; j < RINGS.length - 1; j++) for (let i = 0; i < RAYS; i++) {
    const k = (i + 1) % RAYS;
    const poly = j === 0 ? [P, pt[1][i], pt[1][k]] : [pt[j][i], pt[j + 1][i], pt[j + 1][k], pt[j][k]];
    const el = document.createElementNS(NS, 'polygon');
    el.setAttribute('points', poly.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    el.setAttribute('fill', 'url(#gGlass)');
    shards.appendChild(el);
    const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length, cy = poly.reduce((s, p) => s + p.y, 0) / poly.length;
    list.push({ el, cx, cy, d: Math.hypot(cx - P.x, cy - P.y) / D });
  }
  // crack lines: the rays (from the hit outward) and the ring segments
  const lines: { el: SVGPathElement; d: number; len: number }[] = [];
  const addLine = (pts: { x: number; y: number }[], d: number) => {
    const el = document.createElementNS(NS, 'path');
    el.setAttribute('d', pts.map((p, n) => `${n ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(''));
    cracks.appendChild(el);
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`; el.style.strokeDashoffset = `${len}`;
    lines.push({ el, d, len });
  };
  for (let i = 0; i < RAYS; i++) addLine(RINGS.map((_, j) => pt[j][i]), 0);
  for (let j = 1; j < RINGS.length - 2; j++) for (let i = 0; i < RAYS; i++) if (j < 3 || rnd() < .55) addLine([pt[j][i], pt[j][(i + 1) % RAYS]], RINGS[j]);
  const flash = document.createElementNS(NS, 'circle');
  flash.setAttribute('cx', `${P.x}`); flash.setAttribute('cy', `${P.y}`); flash.setAttribute('r', `${D * .25}`);
  flash.setAttribute('fill', 'url(#gFlash)'); flash.setAttribute('class', 'gate__flash');
  svg.append(shards, cracks, flash);
  return { list, lines, flash, P, D, rnd };
}

export default function Gate() {
  const pathname = usePathname();
  const [line] = useState(() => gateLines[pathname] ?? gateLines['/']); // first page only
  const gateRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useGsap(() => {
    const gate = gateRef.current!, curtain = document.getElementById('curtain');
    let seen = false;
    try { seen = !!sessionStorage.getItem(GATE_KEY); } catch {}
    const hideCurtain = () => gsap.set(curtain, { visibility: 'hidden', yPercent: 0 });

    if (env().reduce) { gate.style.display = 'none'; hideCurtain(); getLenis()?.start(); return; }
    if (seen) { gate.style.display = 'none'; playIntro(curtain, { nav: true, onCovered: hideCurtain }); return; }

    const { list, lines, flash, P, rnd } = buildGlass(svgRef.current!, innerWidth, innerHeight);
    const ws = [...gate.querySelectorAll('.w')];
    const done = () => {
      gsap.set(gate, { display: 'none' });
      try { sessionStorage.setItem(GATE_KEY, '1'); } catch {}
    };

    const tl = gsap.timeline();
    // 1. logo, line, light sweep, loading bar
    tl.to(ws, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .9, stagger: .12, ease: 'power2.out' }, .3)
      .to(barRef.current, { width: '100%', duration: ws.length * .12 + .8, ease: 'power1.inOut' }, .3)
      .fromTo(gate.querySelector('.gate__sheen'), { xPercent: -120 }, { xPercent: 120, duration: 1.6, ease: 'power2.inOut' }, .5)
      .add(() => skipRef.current?.classList.add('is-ready'), 1)
      .to(gate.querySelectorAll('.gate__logo, .gate__line, .gate__bar, .gate__enter'), { opacity: 0, duration: .35, ease: 'power2.in' }, '+=.35')
      // 2. impact: flash, cracks run outward, the pane shivers
      .addLabel('hit')
      .fromTo(flash, { opacity: 0, scale: .2, svgOrigin: `${P.x} ${P.y}` }, { opacity: 1, scale: 1, duration: .12, ease: 'power4.out' }, 'hit')
      .to(flash, { opacity: 0, duration: .7, ease: 'power2.out' }, 'hit+=.12')
      .to(lines.map(l => l.el), { strokeDashoffset: 0, duration: .5, ease: 'power3.out', stagger: (i: number) => lines[i].d * 1.1 + rnd() * .05 }, 'hit')
      .fromTo(svgRef.current, { x: -6 }, { x: 0, duration: .45, ease: 'elastic.out(1.2, .3)' }, 'hit')
      // 3. shatter: the page shows through, the shards fall
      .addLabel('break', '+=.35')
      .set(gate, { backgroundColor: 'transparent' }, 'break')
      .add(() => gate.classList.add('is-broken'), 'break')
      .add(() => { playIntro(null, { nav: true }); }, 'break');
    list.forEach(s => {
      const dx = s.cx - P.x, dy = s.cy - P.y, len = Math.hypot(dx, dy) || 1;
      const push = 60 + rnd() * 220 * (1 - Math.min(1, s.d * 1.5));
      tl.to(s.el, {
        x: (dx / len) * push + (rnd() - .5) * 80,
        y: (dy / len) * push * .6 + innerHeight * (.6 + rnd() * .7),
        rotation: (rnd() - .5) * 140, svgOrigin: `${s.cx} ${s.cy}`,
        opacity: 0, duration: 1.2 + rnd() * .5, ease: 'power2.in',
      }, `break+=${(s.d * .5 + rnd() * .08).toFixed(3)}`);
    });
    tl.to(gate.querySelector('.gate__cracks'), { opacity: 0, duration: .25 }, 'break')
      .add(done);

    const skip = skipRef.current!, onSkip = () => { tl.progress(1); };
    skip.addEventListener('click', onSkip);
    return () => skip.removeEventListener('click', onSkip);
  }, []);

  const words = line.trim().split(/\s+/);
  return (
    <div className="gate" id="gate" aria-hidden="true" ref={gateRef}>
      <svg className="gate__glass" ref={svgRef} preserveAspectRatio="none"></svg>
      <span className="gate__sheen"></span>
      <div className="gate__logo"><span className="mark">R</span></div>
      <p className="gate__line" id="gateLine">
        {words.map((w, i) => <Fragment key={i}>{i > 0 && ' '}<span className="w">{w}</span></Fragment>)}
      </p>
      <div className="gate__bar"><i id="gateBar" ref={barRef}></i></div>
      <button className="gate__enter" id="gateEnter" type="button" ref={skipRef}>Skip</button>
    </div>
  );
}
