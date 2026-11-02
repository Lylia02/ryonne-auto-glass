import PageHero from '@/components/PageHero';
import StatsBand from '@/components/StatsBand';
import Manifesto from '@/components/Manifesto';
import Tiers from '@/components/Tiers';
import Process from '@/components/Process';
import Closing from '@/components/Closing';
import { pageMetadata } from '@/lib/seo';
import { fleetPage, fleetProcess, IMG } from '@/lib/site';

export const metadata = pageMetadata('fleet', '/fleet', IMG.fleet);

export default function FleetPage() {
  return (
    <>
      <PageHero {...fleetPage.hero} />
      <StatsBand />
      <Manifesto {...fleetPage.manifesto} />
      <Tiers />
      <Process data={fleetProcess} />
      <Closing {...fleetPage.closing} />
    </>
  );
}
