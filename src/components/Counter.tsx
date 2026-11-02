'use client';
/* Animated number — counts up once when scrolled into view */
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGsap } from '@/lib/motion';

type Props = { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string };

export default function Counter({ value, prefix = '', suffix = '', decimals = 0, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGsap(() => {
    const el = ref.current!, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: () =>
      gsap.to(o, { v: value, duration: 2.2, ease: 'power3.out', delay: 1.6, onUpdate: () => { el.textContent = prefix + o.v.toFixed(decimals) + suffix; } }) });
  }, []);
  return <b className={className} ref={ref} data-count={value} data-suffix={suffix || undefined} data-dec={decimals || undefined}>{prefix}0</b>;
}
