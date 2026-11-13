import ServiceIndex from '@/components/ServiceIndex';
import Faq from '@/components/Faq';
import { pageMetadata } from '@/lib/seo';
import { IMG } from '@/lib/site';

export const metadata = pageMetadata('services', '/services', IMG.shop);

/* Services: the five services one per scroll step (click one for its own page),
   then the questions drivers ask. */
export default function ServicesPage() {
  return (
    <>
      <ServiceIndex />
      <Faq />
    </>
  );
}
