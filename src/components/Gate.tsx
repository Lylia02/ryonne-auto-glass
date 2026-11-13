'use client';
/* Intro gate — the screen is a pane of glass.
   While the words and the loading bar come in, a stone hits the glass
   and a crack spreads from the impact to the edges. When loading is
   done (or on Enter) a second hit shatters it: the pane breaks along
   the crack lines into shards that fall away, revealing the page.
   Shown once per browser session (sessionStorage). On later loads the
   curtain (closed by the inline script in layout.tsx) lifts instead. */
import { Fragment, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { env, getLenis, gsap, playIntro, useGsap } from '@/lib/motion';
import { gateLines } from '@/lib/site';
import { GATE_KEY } from '@/lib/keys';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Crack geometry: rays from the impact point, crossed by rings. The same
    vertices give the crack lines (drawn while loading) and the shards. */
function buildGlass(W: number, H: number) {
  let s = 1234; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ix = W * .6, iy = H * .4, m = Math.min(W, H), far = Math.hypot(W, H) * 1.2;
  const K = W > 980 ? 12 : 9;
  const radii = [0, m * .05, m * .15, m * .32, m * .58, far];
  const angles = Array.from({ length: K }, (_, j) => (j + (rnd() - .5) * .55) / K * Math.PI * 2);
  const V = radii.map((r, i) => angles.map(a => {
    if (i === 0) return [ix, iy];
    const rr = i === radii.length - 1 ? r : r * (.82 + rnd() * .36), aa = a + (rnd() - .5) * (.5 / K) * Math.PI;
    return [ix + Math.cos(aa) * rr, iy + Math.sin(aa) * rr];
  }));
  const pt = (p: number[]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const rays = angles.map((_, j) => 'M' + V.map(row => pt(row[j])).join('L'));
  const rings: string[] = [];
  for (let i = 1; i < radii.length - 1; i++) // rings are only partly broken
    for (let j = 0; j < K; j++) if (i === 1 || rnd() < .72) rings.push(`M${pt(V[i][j])}L${pt(V[i][(j + 1) % K])}`);
  const shards: { poly: string; cx: number; cy: number; d: number }[] = [];
  for (let i = 0; i < radii.length - 1; i++)
    for (let j = 0; j < K; j++) {
      const ps = [V[i][j], V[i][(j + 1) % K], V[i + 1][(j + 1) % K], V[i + 1][j]];
      const cx = ps.reduce((a, p) => a + p[0], 0) / 4, cy = ps.reduce((a, p) => a + p[1], 0) / 4;
      shards.push({ poly: `polygon(${ps.map(p => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(',')})`, cx, cy, d: Math.hypot(cx - ix, cy - iy) });
    }
  return { ix, iy, rays, rings, shards };
}

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

    /* ---------- the glass: crack lines (SVG) + shards (clipped divs) ---------- */
    const W = innerWidth, H = innerHeight, g = buildGlass(W, H);
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'gate__crack'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    const path = (d: string, cls: string) => { const p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); svg.appendChild(p); return p; };
    const rayEls = g.rays.map(d => path(d, 'gate__ray'));
    const ringEls = g.rings.map(d => path(d, 'gate__ring'));
    const hit = document.createElement('span'); hit.className = 'gate__hit';
    gsap.set(hit, { left: g.ix, top: g.iy });
    const flash = document.createElement('span'); flash.className = 'gate__flash';
    flash.style.background = `radial-gradient(circle at ${g.ix}px ${g.iy}px,rgba(255,255,255,.9),rgba(255,255,255,.15) 18%,transparent 45%)`;
    const shardWrap = document.createElement('div'); shardWrap.className = 'gate__shards';
    const shardEls = g.shards.map(sh => {
      const el = document.createElement('i'); el.style.clipPath = sh.poly; shardWrap.appendChild(el);
      gsap.set(el, { transformPerspective: 900, transformOrigin: `${sh.cx}px ${sh.cy}px` }); // set once, never tweened
      return el;
    });
    gate.append(svg, hit, flash, shardWrap);
    [...rayEls, ...ringEls].forEach(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });

    const content = [svg, hit, ...gate.querySelectorAll('.gate__logo, .gate__line, .gate__enter')]; // not the bar: it is centred with translateX(-50%)
    const shake = (power: number) => gsap.timeline()
      .to(content, { keyframes: { x: [0, -power, power * .8, -power * .5, power * .25, 0], y: [0, power * .6, -power * .5, power * .3, 0, 0] }, duration: .38, ease: 'none' })
      .fromTo(flash, { opacity: 0 }, { opacity: power > 8 ? .9 : .45, duration: .06, yoyo: true, repeat: 1, ease: 'power2.out' }, 0);

    /* ---------- the second hit: the pane shatters and falls ---------- */
    const shatter = () => {
      const t = gsap.timeline({
        onComplete: () => {
          gsap.set(gate, { display: 'none' });
          try { sessionStorage.setItem(GATE_KEY, '1'); } catch {}
        },
      });
      t.add(shake(14))
        .to(ringEls, { strokeDashoffset: 0, duration: .15 }, 0)
        .set(shardWrap, { visibility: 'visible' }, .12)
        .set(gate, { backgroundColor: 'transparent', pointerEvents: 'none' }, .12)
        .to(gate.querySelectorAll('.gate__logo, .gate__line, .gate__bar, .gate__enter'), { opacity: 0, duration: .15 }, .1)
        .to([svg, hit], { opacity: 0, duration: .5 }, .35)
        .add(() => { playIntro(null, { nav: true }); }, .3);
      g.shards.forEach((sh, k) => {
        const el = shardEls[k], dx = sh.cx - g.ix, dy = sh.cy - g.iy, len = Math.hypot(dx, dy) || 1;
        const push = 40 + Math.random() * 140;
        t.to(el, {
          x: dx / len * push + (Math.random() - .5) * 60,
          y: dy / len * push + H * (1 + Math.random() * .4),
          rotation: (Math.random() - .5) * 70,
          rotationX: (Math.random() - .5) * 80,
          duration: 1 + Math.random() * .6,
          ease: 'power2.in',
        }, .18 + Math.min(.35, sh.d / Math.hypot(W, H) * .5));
      });
    };

    /* ---------- loading: words + bar, the crack spreads with the bar ---------- */
    const ws = [...gate.querySelectorAll('.w')];
    const load = ws.length * .14 + .9;
    const tl = gsap.timeline();
    tl.to(ws, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .9, stagger: .14, ease: 'power2.out' }, .4)
      .to(barRef.current, { width: '100%', duration: load, ease: 'power1.inOut' }, .4)
      .add(shake(6), .55)
      .fromTo(hit, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .25, ease: 'power4.out' }, .55)
      .to(rayEls, { strokeDashoffset: 0, duration: load - .2, stagger: { each: .03, from: 'random' }, ease: 'power2.out' }, .6)
      .to(ringEls, { strokeDashoffset: 0, duration: .5, stagger: .06, ease: 'power2.out' }, .9)
      .add(() => enterRef.current?.classList.add('is-ready'))
      .add(shatter, '+=.9');
    const enter = enterRef.current!, onEnter = () => { tl.progress(1); };
    enter.addEventListener('click', onEnter);
    return () => {
      enter.removeEventListener('click', onEnter);
      svg.remove(); hit.remove(); flash.remove(); shardWrap.remove();
    };
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
