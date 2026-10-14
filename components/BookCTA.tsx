import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { business } from "@/lib/content";
import { images } from "@/lib/images";

// Le bloc "Réserve maintenant" en bas des pages Accueil et Services.
// On le réutilise avec des textes différents grâce aux "props".
type Props = {
  eyebrow?: string;
  title: string;
  text: string;
  image?: boolean; // afficher la voiture en dessous ?
};

export default function BookCTA({ eyebrow, title, text, image = false }: Props) {
  return (
    <section
      className={`overflow-hidden text-center ${
        image ? "bg-[linear-gradient(180deg,#fff_0%,var(--color-bg3)_100%)] pt-24 md:pt-[140px]" : "py-24 md:py-[140px]"
      }`}
    >
      <Reveal className="wrap flex flex-col items-center gap-5">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="h2 text-[32px] md:text-[48px]">{title}</h2>
        <p className="lead max-w-[620px]">{text}</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-6">
          <Link href="/book" className="pill pill-red">
            Book Appointment
          </Link>
          <a href={business.phoneHref} className="more">
            Call {business.phone}
          </a>
        </div>
      </Reveal>

      {image && (
        <Reveal delay={150}>
          <Image
            {...images.carMidnight2}
            alt=""
            sizes="(max-width: 820px) 96vw, 980px"
            className="mx-auto mt-[50px] mb-[-10px] w-[min(980px,96%)]"
          />
        </Reveal>
      )}
    </section>
  );
}
