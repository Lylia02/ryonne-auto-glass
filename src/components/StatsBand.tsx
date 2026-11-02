import Counter from './Counter';
import { fleetPage } from '@/lib/site';

/* Fleet numbers band (oxblood) */
export default function StatsBand() {
  return (
    <section className="stats-band">
      {fleetPage.stats.map(s => <div key={s.label}><Counter value={s.value} prefix={'prefix' in s ? s.prefix : undefined} suffix={'suffix' in s ? s.suffix : undefined} /><span>{s.label}</span></div>)}
    </section>
  );
}
