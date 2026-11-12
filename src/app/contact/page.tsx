import PageHero from '@/components/PageHero';
import ContactCards from '@/components/ContactCards';
import SpecForm from '@/components/SpecForm';
import Diagnose from '@/components/Diagnose';
import Bay from '@/components/Bay';
import { pageMetadata } from '@/lib/seo';
import { contactPage, fleetPrograms, quoteForm } from '@/lib/site';

export const metadata = pageMetadata('contact', '/contact');

type Search = { mode?: string | string[]; fleet?: string | string[] };

export default async function ContactPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { mode, fleet } = await searchParams;
  // ?mode=mobile|in-shop → preferred service · ?fleet=starter|priority|enterprise → message
  const service = quoteForm.services.find(s => s.value === mode)?.value;
  const program = (fleetPrograms as readonly string[]).find(p => p === fleet);
  const message = program ? quoteForm.fleetMessage(program) : undefined;

  return (
    <>
      <PageHero {...contactPage.hero} style={{ minHeight: '82vh' }} imgStyle={{ objectPosition: '50% 30%' }} crack />
      <ContactCards />
      <Diagnose />
      <SpecForm key={`${service}-${program}`} defaultService={service} defaultMessage={message} />
      <Bay />
    </>
  );
}
