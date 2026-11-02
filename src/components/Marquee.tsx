import { marqueeMakes } from '@/lib/site';

/* Infinite makes ticker (pure CSS animation) — list rendered twice for the loop */
export default function Marquee() {
  return (
    <section className="marquee" aria-label="Makes serviced">
      <div className="marquee__track">
        {[...marqueeMakes, ...marqueeMakes].map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </section>
  );
}
