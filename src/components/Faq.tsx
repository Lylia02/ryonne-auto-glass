import Rich from './Rich';
import { faq, servicesPage } from '@/lib/site';

/* FAQ — native <details>, first one open */
export default function Faq() {
  return (
    <section className="faq">
      <h2 className="h-serif"><Rich text={servicesPage.faqTitle} /></h2>
      <div>
        {faq.map((item, i) => <details key={item.q} open={i === 0}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      </div>
    </section>
  );
}
