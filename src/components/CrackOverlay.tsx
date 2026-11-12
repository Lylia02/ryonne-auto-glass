'use client';
/* =========================================================
   Contact hero — "every chip starts…": a crack spreads across the
   glass in front of the photo once the page intro has played,
   then drifts with the pointer as if it sat on a windshield.
   SVG paths drawn with stroke-dashoffset (no WebGL).
   ========================================================= */
import { useMemo, useRef } from 'react';
import { env, gsap, qa, useGsap } from '@/lib/motion';

const CX = 720, CY = 200; // impact point (viewBox 1000 × 600)

function crackPaths(seed = 11) {
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rays: string[] = [], branches: string[] = [], rings: string[] = [];
  const RAYS = 13;
  for (let i = 0; i < RAYS; i++) {
    let a = i / RAYS * Math.PI * 2 + rnd() * .4, x = CX, y = CY, d = `M${CX} ${CY}`;
    const len = 150 + rnd() * 430, steps = 9 + Math.floor(rnd() * 6);
    for (let k = 0; k < steps; k++) {
      a += (rnd() - .5) * .5; x += Math.cos(a) * len / steps; y += Math.sin(a) * len / steps;
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
      if (k > 1 && rnd() < .22) {
        let bx = x, by = y, ba = a + (rnd() - .5) * 1.7, bd = `M${bx.toFixed(1)} ${by.toFixed(1)}`;
        for (let j = 0; j < 5; j++) { ba += (rnd() - .5) * .6; bx += Math.cos(ba) * len * .06; by += Math.sin(ba) * len * .06; bd += `L${bx.toFixed(1)} ${by.toFixed(1)}`; }
        branches.push(bd);
      }
    }
    rays.push(d);
  }
  for (let r = 1; r <= 3; r++) {
    const R = 18 * r + r * r * 7; let d = '';
    for (let k = 0; k <= 30; k++) { const t = k / 30 * Math.PI * 2, j = R * (.82 + .32 * rnd()); d += `${k ? 'L' : 'M'}${(CX + Math.cos(t) * j).toFixed(1)} ${(CY + Math.sin(t) * j).toFixed(1)}`; }
    rings.push(d);
  }
  return { rays, branches, rings };
}

export default function CrackOverlay() {
  const ref = useRef<SVGSVGElement>(null);
  const { rays, branches, rings } = useMemo(() => crackPaths(), []);

  useGsap(() => {
    const svg = ref.current!;
    const prep = (els: SVGPathElement[]) => els.map(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); return p; });
    const r = prep(qa<SVGPathElement>('.crack__ray', svg)), b = prep(qa<SVGPathElement>('.crack__branch', svg)), g = prep(qa<SVGPathElement>('.crack__ring', svg));
    const tl = gsap.timeline({ delay: 1.7 });
    tl.fromTo(qa('.crack__hit', svg), { scale: 0, opacity: 0, transformOrigin: `${CX}px ${CY}px` }, { scale: 1, opacity: 1, duration: .25, ease: 'power4.out' })
      .to(r, { strokeDashoffset: 0, duration: 1.1, stagger: .025, ease: 'power4.out' }, .05)
      .to(b, { strokeDashoffset: 0, duration: .7, stagger: .02, ease: 'power3.out' }, .45)
      .to(g, { strokeDashoffset: 0, duration: .9, stagger: .1, ease: 'power2.out' }, .2)
      .to(qa('.crack__hit', svg), { opacity: .55, duration: 1.2 }, .4);
    const { finePointer, reduce } = env();
    if (!finePointer || reduce) return;
    const mx = gsap.quickTo(svg, 'x', { duration: 1.2, ease: 'power3.out' }), my = gsap.quickTo(svg, 'y', { duration: 1.2, ease: 'power3.out' });
    const move = (e: MouseEvent) => { mx((e.clientX / innerWidth - .5) * -18); my((e.clientY / innerHeight - .5) * -12); };
    addEventListener('mousemove', move);
    return () => removeEventListener('mousemove', move);
  }, []);

  return (
    <svg className="crack" ref={ref} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="crack-fade" gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r="320">
          <stop offset=".35" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="crack-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600"><rect width="1000" height="600" fill="url(#crack-fade)" /></mask>
        <radialGradient id="crack-hit"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".35" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <circle className="crack__hit" cx={CX} cy={CY} r="34" fill="url(#crack-hit)" />
      <g mask="url(#crack-mask)">
        {rings.map((d, i) => <path key={`g${i}`} className="crack__ring" d={d} />)}
        {rays.map((d, i) => <path key={`r${i}`} className="crack__ray" d={d} />)}
        {branches.map((d, i) => <path key={`b${i}`} className="crack__branch" d={d} />)}
      </g>
    </svg>
  );
}
