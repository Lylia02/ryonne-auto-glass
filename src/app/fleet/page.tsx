import FleetHero from '@/components/FleetHero';
import FleetCost from '@/components/FleetCost';
import FleetNight from '@/components/FleetNight';
import FleetPrograms from '@/components/FleetPrograms';
import FleetCall from '@/components/FleetCall';
import { pageMetadata } from '@/lib/seo';
import { IMG } from '@/lib/site';

export const metadata = pageMetadata('fleet', '/fleet', IMG.fleet);

/* Fleet: the problem (a day off the road), the answer (a night at the
   depot), the programs, then one call to action. */
export default function FleetPage() {
  return (
    <>
      <FleetHero />
      <FleetCost />
      <FleetNight />
      <FleetPrograms />
      <FleetCall />
    </>
  );
}
