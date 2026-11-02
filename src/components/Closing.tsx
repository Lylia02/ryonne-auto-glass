'use client';
/* Closing CTA — letters arrive from the centre, background drifts */
import { useRef } from 'react';
import Image from 'next/image';
import TLink from './TLink';
import { gsap, parallax, SplitText, useGsap } from '@/lib/motion';
import type { Img } from '@/lib/site';

type Props = { id?: string; eyebrow: string; title: string; cta: string; href: string; img: Img };

export default function Closing({ id, eyebrow, title, cta, href, img }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGsap(() => {
    const root = ref.current!, el = root.querySelector<HTMLElement>('[data-letters]')!;
    const split = new SplitText(el, { type: 'chars', charsClass: 'ch' });
    gsap.from(split.chars, { opacity: 0, y: 40, color: '#e8102a', duration: 1.4, ease: 'power4.out', stagger: { each: .05, from: 'center' },
      scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
    parallax(root);
  }, [], { fonts: true });

  return (
    <section className="closing" id={id} ref={ref}>
      <Image src={img.src} width={img.w} height={img.h} alt="" className="closing__bg" data-speed="0.8" sizes="100vw" />
      <div className="closing__inner">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="h-serif closing__h" data-letters>{title}</h2>
        {href.startsWith('#')
          ? <a href={href} className="btn btn--ghost" data-magnetic>{cta}</a>
          : <TLink href={href} className="btn btn--ghost" data-magnetic>{cta}</TLink>}
      </div>
    </section>
  );
}
