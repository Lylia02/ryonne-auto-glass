'use client';
/* Inner-page hero — the reveal itself is played by playIntro() (gate/curtain);
   here only the background parallax. */
import { useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { parallax, useGsap } from '@/lib/motion';
import type { Img } from '@/lib/site';

type Props = { eyebrow: string; lines: string[]; text: string; img: Img; style?: CSSProperties; imgStyle?: CSSProperties };

export default function PageHero({ eyebrow, lines, text, img, style, imgStyle }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGsap(() => { parallax(ref.current!); }, []);

  return (
    <section className="phero" style={style} ref={ref}>
      <Image src={img.src} alt="" className="phero__bg" data-speed="0.85" fill priority sizes="100vw" style={imgStyle} />
      <div className="phero__shade"></div>
      <div className="phero__inner">
        <div><span className="eyebrow phero__eyebrow">{eyebrow}</span><h1 className="h-serif">{lines.map(l => <span className="line" key={l}><span><Rich text={l} /></span></span>)}</h1></div>
        <p>{text}</p>
      </div>
    </section>
  );
}
