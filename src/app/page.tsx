import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Manifesto from '@/components/Manifesto';
import Makes from '@/components/Makes';
import Process from '@/components/Process';
import ServicesCarousel from '@/components/ServicesCarousel';
import PriceList from '@/components/PriceList';
import FleetBlock from '@/components/FleetBlock';
import ReviewsArc from '@/components/ReviewsArc';
import SpecForm from '@/components/SpecForm';
import Closing from '@/components/Closing';
import { home, homeProcess } from '@/lib/site';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Manifesto id="about" {...home.manifesto} />
      <Makes />
      <Process data={homeProcess} />
      <ServicesCarousel />
      <PriceList />
      <FleetBlock />
      <ReviewsArc />
      <SpecForm />
      <Closing {...home.closing} />
    </>
  );
}
