'use client';
/* Inner-page hero — the reveal itself is played by playIntro() (gate/curtain);
   here only the background parallax. */
import { useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import CrackOverlay from './CrackOverlay';
import { parallax, useGsap } from '@/lib/motion';
import type { Img } from '@/lib/site';

type Props = { eyebrow?: string; lines: string[]; text: string; img: Img; style?: CSSProperties; imgStyle?: CSSProperties; crack?: boolean };

export default function PageHero({ lines, text, img, style, imgStyle, crack }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGsap(() => { parallax(ref.current!); }, []);

  return (
    <section className="phero" style={style} ref={ref}>
      <Image src={img.src} alt="" className="phero__bg" data-speed="0.85" fill priority sizes="100vw" style={imgStyle} />
      <div className="phero__shade"></div>
      {crack && <CrackOverlay />}
      <div className="phero__inner">
        <div><h1 className="h-serif">{lines.map(l => <span className="line" key={l}><span><Rich text={l} /></span></span>)}</h1></div>
        <p>{text}</p>
      </div>
    </section>
  );
}
