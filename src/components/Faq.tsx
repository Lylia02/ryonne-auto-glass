import Rich from './Rich';
import { faq, servicesPage } from '@/lib/site';

/* FAQ — native <details>, first one open */
export default function Faq() {
  return (
    <section className="faq">
      <div className="faq__head"><span className="mono"><i></i>{servicesPage.faqKicker}</span><h2 className="h-wide"><Rich text={servicesPage.faqTitle} /></h2></div>
      <div>
        {faq.map((item, i) => <details key={item.q} open={i === 0}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      </div>
    </section>
  );
}
