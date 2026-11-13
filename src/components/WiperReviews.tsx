'use client';
/* =========================================================
   Reviews — "the wiper".
   Each review sits behind a rainy windshield: blurred, covered in
   drops. A wiper sweeps across, clears the drops and reveals the
   review sharp; rain slowly comes back, then the next review.
   - drops: a <canvas>, removed when the blade passes over them
   - reveal: the sharp copy is masked by a conic-gradient that
     follows the blade (CSS variable --reveal)
   Auto-plays while on screen; arrows / dots / swipe to browse.
   ========================================================= */
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { env, gsap, qa, revealUp, useGsap } from '@/lib/motion';
import { reviews, reviewsWiper as w } from '@/lib/site';

type Drop = { x: number; y: number; r: number; a: number };
const HOLD = 6500; // ms a review stays before the next wipe

const split = (author: string) => { const [name, ...car] = author.split(' · '); return { name, car: car.join(' · ') }; };

export default function WiperReviews() {
  const ref = useRef<HTMLElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drops = useRef<Drop[]>([]);
  const arm = useRef({ a: 0, prev: 0 });  // blade angle, 0 = pointing left … 180 = pointing right
  const visible = useRef(false);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);   // review currently on the glass (changes while it's fogged)
  const [cycle, setCycle] = useState(0);   // +1 after each wipe → restarts the auto-play timer
  const idxRef = useRef(0);
  const busy = useRef(false);
  const rain = useRef<(k: number) => void>(() => {});
  const n = reviews.length;

  /* ---------- rain on a canvas ---------- */
  useEffect(() => {
    const cv = canvas.current!, g = cv.getContext('2d')!, box = glass.current!;
    let raf = 0, W = 0, H = 0, last = performance.now();
    const size = () => {
      const r = box.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const angleOf = (x: number, y: number) => 180 - Math.atan2(H - y, x - W / 2) * 180 / Math.PI;
    const add = (k: number) => {
      for (let i = 0; i < k; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        drops.current.push({ x, y, r: .8 + Math.random() ** 3 * 5.5, a: angleOf(x, y) });
      }
      if (drops.current.length > 520) drops.current.splice(0, drops.current.length - 520);
    };
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible.current) return;
      const dt = Math.min(64, now - last); last = now;
      add(Math.random() < dt / 22 ? 1 : 0);
      // the blade clears every drop between its previous and current angle
      const { a, prev } = arm.current, lo = Math.min(a, prev) - 2, hi = Math.max(a, prev) + 2;
      if (Math.abs(a - prev) > .01) drops.current = drops.current.filter(d => d.a < lo || d.a > hi);
      arm.current.prev = a;
      g.clearRect(0, 0, W, H);
      for (const d of drops.current) {
        g.beginPath(); g.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        g.fillStyle = 'rgba(255,255,255,.07)'; g.fill();
        g.lineWidth = Math.max(.6, d.r * .28);
        g.strokeStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.arc(d.x + d.r * .12, d.y + d.r * .14, d.r * .92, .2, Math.PI * .9); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(d.x - d.r * .1, d.y - d.r * .12, d.r * .62, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
      }
    };
    rain.current = add;
    size(); add(260);
    raf = requestAnimationFrame(draw);
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(box);
    addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', size); };
  }, []);

  /* ---------- one wipe: fog in → swap review → blade across and back ---------- */
  const wipe = useCallback((to: number) => {
    const box = glass.current; if (!box || busy.current) return false;
    busy.current = true;
    const { reduce } = env();
    const o = arm.current;
    if (reduce) { setShown(to); setIdx(to); idxRef.current = to; box.style.setProperty('--reveal', '180deg'); busy.current = false; return true; }
    const tl = gsap.timeline({ onComplete: () => { busy.current = false; setCycle(c => c + 1); } });
    tl.to(box, { '--reveal': '0deg', duration: .45, ease: 'power2.in' })            // the glass fogs up again
      .call(() => { setShown(to); setIdx(to); idxRef.current = to; rain.current(160); })
      .to(o, { a: 180, duration: 1.15, ease: 'power2.inOut',
        onUpdate: () => { box.style.setProperty('--arm', `${o.a}deg`); box.style.setProperty('--reveal', `${o.a}deg`); } }, '+=.25')
      .to(o, { a: 0, duration: 1, ease: 'power2.inOut', onUpdate: () => box.style.setProperty('--arm', `${o.a}deg`) });
    return true;
  }, []);

  // auto-play: a new wipe HOLD ms after the last one ended, only while on screen
  useEffect(() => {
    if (cycle === 0) return; // the first wipe is started by the scroll trigger below
    let t = 0;
    const tick = (delay: number) => { t = window.setTimeout(() => {
      if (visible.current && !document.hidden && wipe((idxRef.current + 1) % n)) return;
      tick(1500);
    }, delay); };
    tick(HOLD);
    return () => clearTimeout(t);
  }, [cycle, n, wipe]);

  useGsap(() => {
    const root = ref.current!, box = glass.current!;
    revealUp(qa('.wr__side > *', root));
    // first wipe when the section arrives
    const st = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 70%', once: true } });
    st.from(box, { opacity: 0, y: 60, duration: 1.1, ease: 'power3.out' })
      .add(() => { busy.current = false; wipe(0); }, '-=.3');
    busy.current = true; // no auto wipe before the first one
  }, []);

  // swipe on touch screens
  const sx = useRef(0);
  const r = reviews[shown], who = split(r.author);

  return (
    <section className="wr" id="reviews" ref={ref}>
      <div className="wr__side">
        <span className="eyebrow">{w.eyebrow}</span>
        <div className="wr__score"><b>{w.score}</b><span className="wr__stars" aria-label="5 out of 5">★★★★★</span></div>
        <p className="wr__label">{w.label}</p>
        <div className="wr__nav">
          <button type="button" aria-label="Previous review" onClick={() => wipe((idx - 1 + n) % n)}>«</button>
          <span className="wr__count"><b>0{idx + 1}</b> / 0{n}</span>
          <button type="button" aria-label="Next review" onClick={() => wipe((idx + 1) % n)}>»</button>
        </div>
        <ol className="wr__dots">{reviews.map((x, i) => <li key={x.author} className={i === idx ? 'is-on' : ''}><button type="button" aria-label={`Review ${i + 1}`} onClick={() => i !== idx && wipe(i)}></button></li>)}</ol>
      </div>

      <div className="wr__glass" ref={glass} data-cursor="Wipe"
        onClick={() => wipe((idx + 1) % n)}
        onTouchStart={e => { sx.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 40) wipe((idx + (dx < 0 ? 1 : -1) + n) % n); }}>
        <div className="wr__view">
          {reviews.map((x, i) => <Image key={x.author} src={x.img.src} alt="" fill sizes="65vw" className={i === shown ? 'is-on' : ''} />)}
        </div>
        <figure className="wr__q wr__q--fog" aria-hidden="true"><blockquote>{r.quote}</blockquote><figcaption><b>{who.name}</b>{who.car}</figcaption></figure>
        <figure className="wr__q wr__q--sharp" aria-live="polite"><blockquote>{r.quote}</blockquote><figcaption><b>{who.name}</b>{who.car}</figcaption></figure>
        <canvas className="wr__rain" ref={canvas} aria-hidden="true"></canvas>
        <div className="wr__arm" aria-hidden="true"><i></i></div>
        <span className="wr__hint">{w.hint}</span>
      </div>
    </section>
  );
}
