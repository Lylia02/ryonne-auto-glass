import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Manifesto from '@/components/Manifesto';
import Process from '@/components/Process';
import GlassChoir from '@/components/GlassChoir';
import PriceList from '@/components/PriceList';
import FleetBlock from '@/components/FleetBlock';
import ReviewsArc from '@/components/ReviewsArc';
import SpecForm from '@/components/SpecForm';
import Diagnose from '@/components/Diagnose';
import Closing from '@/components/Closing';
import { home, homeProcess } from '@/lib/site';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Manifesto id="about" {...home.manifesto} />
      <Diagnose showroom />
      <Process data={homeProcess} />
      <GlassChoir />
      <PriceList />
      <FleetBlock />
      <ReviewsArc />
      <SpecForm />
      <Closing {...home.closing} />
    </>
  );
}
