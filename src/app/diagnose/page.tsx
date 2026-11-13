import Diagnose from '@/components/Diagnose';
import SpecForm from '@/components/SpecForm';
import { pageMetadata } from '@/lib/seo';
import { IMG } from '@/lib/site';

export const metadata = pageMetadata('diagnose', '/diagnose', IMG.hero);

/* The 3D showroom: the car turns among every make, the lights go down,
   then the configurator (3D diagnosis or photo) takes over. */
export default function DiagnosePage() {
  return (
    <>
      <Diagnose showroom />
      <SpecForm />
    </>
  );
}
