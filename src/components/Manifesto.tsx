'use client';
/* Manifesto — words come out of the blur as you scroll, side images drift (parallax) */
import { useRef } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { parallax, ScrollTrigger, SplitText, useGsap } from '@/lib/motion';
import type { Img } from '@/lib/site';

type Side = { img: Img; alt: string };
type Props = { id?: string; eyebrow: string; text: string; sub: string; left: Side; right: Side };

const sizes = '20vw';

export default function Manifesto({ id, eyebrow, text, sub, left, right }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGsap(() => {
    const root = ref.current!;
    const el = root.querySelector<HTMLElement>('[data-words]')!;
    const split = new SplitText(el, { type: 'words', wordsClass: 'word' });
    ScrollTrigger.create({ trigger: el, start: 'top 75%', end: 'bottom 50%', scrub: true,
      onUpdate: s => { const n = Math.floor(s.progress * split.words.length); split.words.forEach((w, i) => w.classList.toggle('is-on', i <= n)); } });
    parallax(root);
  }, [], { fonts: true });

  return (
    <section className="manifesto" id={id} ref={ref}>
      <figure className="manifesto__img manifesto__img--l" data-speed="0.85"><Image src={left.img.src} width={left.img.w} height={left.img.h} alt={left.alt} sizes={sizes} /></figure>
      <div className="manifesto__center">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="manifesto__text h-display" data-words><Rich text={text} /></h2>
        <p className="manifesto__sub h-serif">{sub}</p>
      </div>
      <figure className="manifesto__img manifesto__img--r" data-speed="1.15"><Image src={right.img.src} width={right.img.w} height={right.img.h} alt={right.alt} sizes={sizes} /></figure>
    </section>
  );
}
