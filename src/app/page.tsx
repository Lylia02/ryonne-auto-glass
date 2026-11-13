import Hero from '@/components/Hero';
import ShiftCinema from '@/components/ShiftCinema';
import Surfaces from '@/components/Surfaces';
import ProcessFilm from '@/components/ProcessFilm';
import Arrival from '@/components/Arrival';
import RealValue from '@/components/RealValue';
import WiperReviews from '@/components/WiperReviews';

/* Home, told like a short film:
   who we are (the drive at blue hour) → what we do (service screens)
   → how we do it (a strip of four photos) → the car drives out and parks: show us
   your damage in 3D → what you get → what drivers say. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ShiftCinema />
      <Surfaces />
      <ProcessFilm />
      <Arrival />
      <RealValue />
      <WiperReviews />
    </>
  );
}
