'use client';
/* =========================================================
   Scroll-driven image sequence (the way Apple shows its products).
   The 3D scenes were rendered ahead of time into numbered pictures
   (public/seq/<name>-d for wide screens, -m for phones, a few pictures
   stacked in each file). This draws
   the picture that matches the scroll on a <canvas>, easing between
   them, so it plays like a video you drive with the scroll — smooth
   on every device, no 3D engine needed.
   Pictures load only when the chapter gets close.
   ========================================================= */
import { useEffect, useRef } from 'react';
import { sequences, type SequenceName } from '@/lib/sequences';

type Fit = { x: number; y: number; w: number; h: number };   // where the picture sits in the canvas (css px)
type Props = {
  name: SequenceName;
  progress: React.RefObject<number>;   // 0 → 1
  className?: string;
  onReady?: () => void;
  onFrame?: (index: number, set: 'd' | 'm', fit: Fit) => void;
};

const pad = (i: number) => String(i).padStart(3, '0');

export default function FrameSequence({ name, progress, className, onReady, onFrame }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onReady, onFrame });
  cb.current = { onReady, onFrame };

  useEffect(() => {
    const el = canvas.current!, ctx = el.getContext('2d')!;
    const set: 'd' | 'm' = matchMedia('(max-width: 980px) and (orientation: portrait)').matches ? 'm' : 'd';
    const count = sequences[name][set];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const per = sequences.per, files = Math.ceil(count / per);
    const sheets: (HTMLImageElement | null)[] = Array(files).fill(null);
    const has = (i: number) => i >= 0 && i < count && !!sheets[Math.floor(i / per)];
    let cur = (progress.current ?? 0) * (count - 1), drawn = -1, raf = 0, visible = false, started = false, ready = false;
    let fit: Fit = { x: 0, y: 0, w: 0, h: 0 };

    // ---- loading: first file, then the rest in an order that fills the timeline evenly
    const order = (() => {
      const seen = new Set<number>(), out: number[] = [];
      for (let step = Math.max(1, files >> 1); step >= 1; step >>= 1)
        for (let i = 0; i < files; i += step) if (!seen.has(i)) { seen.add(i); out.push(i); }
      for (let i = 0; i < files; i++) if (!seen.has(i)) out.push(i);
      return out;
    })();
    const load = () => {
      if (started) return; started = true;
      let next = 0, active = 0;
      const pump = () => {
        while (active < 6 && next < order.length) {
          const i = order[next++], img = new Image();
          active++;
          img.decoding = 'async';
          img.onload = () => { sheets[i] = img; active--; if (!ready) { ready = true; cb.current.onReady?.(); } drawn = -1; pump(); };
          img.onerror = () => { active--; pump(); };
          img.src = `${sequences.base}/${name}-${set}/${pad(i)}.webp`;
        }
      };
      pump();
    };

    // ---- drawing
    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1), r = el.getBoundingClientRect();
      el.width = Math.round(r.width * dpr); el.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawn = -1;
    };
    const nearest = (i: number) => {
      for (let d = 0; d < count; d++) {
        if (has(i - d)) return i - d;
        if (has(i + d)) return i + d;
      }
      return -1;
    };
    const draw = (i: number) => {
      const img = sheets[Math.floor(i / per)]; if (!img) return;
      const fw = img.naturalWidth, fh = img.naturalHeight / per, tile = i % per;
      const r = el.getBoundingClientRect(), s = Math.max(r.width / fw, r.height / fh);
      fit = { w: fw * s, h: fh * s, x: (r.width - fw * s) / 2, y: (r.height - fh * s) / 2 };
      ctx.drawImage(img, 0, tile * fh, fw, fh, fit.x, fit.y, fit.w, fit.h);
      cb.current.onFrame?.(i, set, fit);
    };
    const tick = () => {
      const target = (reduce ? .5 : progress.current ?? 0) * (count - 1);
      cur += (target - cur) * .2;                       // a little easing, like a video catching up
      const want = Math.round(Math.abs(target - cur) < .02 ? target : cur);
      const i = nearest(Math.max(0, Math.min(count - 1, want)));
      if (i >= 0 && i !== drawn) { draw(i); drawn = i; }
      if (visible) raf = requestAnimationFrame(tick);
    };

    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); pre.disconnect(); } }, { rootMargin: '200% 0px' });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    const ro = new ResizeObserver(resize);
    pre.observe(el); io.observe(el); ro.observe(el);
    resize();
    return () => { pre.disconnect(); io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
  }, [name, progress]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
