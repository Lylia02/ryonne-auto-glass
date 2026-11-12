import GlassReel from '@/components/GlassReel';
import Faq from '@/components/Faq';
import Closing from '@/components/Closing';
import { pageMetadata } from '@/lib/seo';
import { IMG, servicesPage } from '@/lib/site';

export const metadata = pageMetadata('services', '/services', IMG.shop);

export default function ServicesPage() {
  return (
    <>
      <GlassReel />
      <Faq />
      <Closing {...servicesPage.closing} />
    </>
  );
}
