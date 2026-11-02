import PageHero from '@/components/PageHero';
import DetailList from '@/components/DetailList';
import Faq from '@/components/Faq';
import Closing from '@/components/Closing';
import { pageMetadata } from '@/lib/seo';
import { IMG, servicesPage } from '@/lib/site';

export const metadata = pageMetadata('services', '/services', IMG.shop);

export default function ServicesPage() {
  return (
    <>
      <PageHero {...servicesPage.hero} />
      <DetailList />
      <Faq />
      <Closing {...servicesPage.closing} />
    </>
  );
}
