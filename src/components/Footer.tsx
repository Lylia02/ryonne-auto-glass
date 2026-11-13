import TLink from './TLink';
import { business, footerMenu } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <TLink href="/" className="footer__logo"><span className="mark">R</span>RYONNE <small>AUTO GLASS</small></TLink>
        <a href="#top" className="footer__up">Back to top ↑</a>
      </div>
      <div className="footer__cols">
        <div><b>Menu</b>{footerMenu.map(m => <TLink key={m.href} href={m.href}>{m.label}</TLink>)}</div>
        <div><b>Socials</b>{business.socials.map(s => <a key={s.label} href={s.href}>{s.label}</a>)}</div>
        <div><b>Contact</b><a href={`tel:${business.tel}`}>{business.phone}</a><a href={`mailto:${business.email}`}>{business.email}</a><span>{business.footerContact}</span></div>
        <div><b>Hours</b>{business.hours.footer.map(h => <span key={h}>{h}</span>)}</div>
      </div>
      <div className="footer__bottom"><span>{business.copyright}</span><span>{business.credit} · <a href={business.creditHref} target="_blank" rel="noopener noreferrer">source</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">licence</a></span></div>
    </footer>
  );
}
