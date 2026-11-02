'use client';
/* Fixed nav + full-screen menu */
import { useState, type CSSProperties } from 'react';
import TLink from './TLink';
import { getLenis } from '@/lib/motion';
import { business, menu } from '@/lib/site';

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Same as toggleMenu() in main.js. The header's class list is also
  // driven by <Chrome> (nav--light / nav--hidden), so it's toggled directly.
  const toggle = (next: boolean) => {
    setOpen(next);
    document.getElementById('nav')?.classList.toggle('is-menu', next);
    const lenis = getLenis();
    if (next) lenis?.stop();
    else lenis?.start();
  };

  return (
    <>
      <header className="nav" id="nav">
        <div className="nav__left">
          <a href="#" aria-label="Instagram" className="nav__social"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg></a>
          <a href="#" aria-label="Facebook" className="nav__social"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" /></svg></a>
          <a href={`tel:${business.tel}`} className="nav__phone">{business.phone}</a>
          <TLink href="/contact" className="nav__phone nav__book">Book</TLink>
        </div>
        <TLink href="/" className="nav__logo" aria-label="Ryonne Auto Glass — home"><span className="mark">R</span><span className="nav__word">RYONNE<small>AUTO GLASS</small></span></TLink>
        <button className={`nav__burger${open ? ' is-open' : ''}`} id="burger" aria-label="Open menu" aria-expanded={open} onClick={() => toggle(!open)}>
          <span>{open ? 'Close' : 'Navigate'}</span><i></i><i></i>
        </button>
      </header>

      <nav className={`menu${open ? ' is-open' : ''}`} id="menu" aria-hidden={!open} inert={!open}>
        <div className="menu__bg"></div>
        <ul className="menu__list">
          {menu.map((m, i) => (
            <li key={m.href} style={{ '--n': i + 1 } as CSSProperties}>
              <TLink href={m.href} data-i={String(i + 1).padStart(2, '0')} onClick={() => toggle(false)}>{m.label}</TLink>
            </li>
          ))}
        </ul>
        <div className="menu__meta">
          <a href={`tel:${business.tel}`}>{business.phone}</a>
          <span>{business.hours.short}</span>
          <span className="menu__tag">{business.tagline}</span>
        </div>
      </nav>
    </>
  );
}
