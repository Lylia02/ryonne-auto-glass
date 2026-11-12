'use client';
/* Contact page — phone / email / visit cards (glass cards that lean toward the pointer) */
import { useRef } from 'react';
import { qa, revealUp, tiltCards, useGsap } from '@/lib/motion';
import { contactPage } from '@/lib/site';

export default function ContactCards() {
  const ref = useRef<HTMLElement>(null);
  useGsap(() => { revealUp(qa('.ccard', ref.current!)); return tiltCards(qa('.ccard', ref.current!), { x: 8, y: 6 }); }, []);

  return (
    <section className="cinfo" ref={ref}>
      {contactPage.cards.map(c => {
        const inner = <><i className="ccard__glint" aria-hidden="true"></i><span className="ccard__k">{c.k}</span><b className="h-serif">{c.title}</b><span>{c.text}</span></>;
        return c.href
          ? <a className="ccard" href={c.href} key={c.k}>{inner}</a>
          : <div className="ccard" key={c.k}>{inner}</div>;
      })}
    </section>
  );
}
