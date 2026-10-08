// =============================================================
// PAGE D'ACCUEIL  ->  URL "/"
// Dans le App Router, le fichier app/page.tsx = la page "/".
// Les textes viennent de lib/content.ts, les images de lib/images.ts.
// =============================================================

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import BookCTA from "@/components/BookCTA";
import { business, chipRepair, reviews, services, specs, stats, steps } from "@/lib/content";
import { images } from "@/lib/images";

// petit raccourci pour retrouver un service par son id
const service = (id: string) => services.find((s) => s.id === id)!;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <ServicesBento />
      <FactorySpec />
      <Process />
      <Reviews />
      <BookCTA
        eyebrow="Mon–Fri 8am – 6pm · Sat 9am – 3pm"
        title="Book your glass repair today."
        text="Submit your vehicle details to start your service request. No upfront credit card required."
        image
      />
    </>
  );
}

/* ---------------------------------------------------------------
   1. HERO : le grand titre + la voiture
   --------------------------------------------------------------- */
function Hero() {
  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#fff_45%,var(--color-bg3)_100%)] pt-16 md:pt-24">
      <div className="wrap flex flex-col items-center gap-[22px] text-center">
        <Reveal>
          <span className="eyebrow">Ryonne Auto Glass · {business.city}</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="h1">
            Precision auto glass.
            <br />
            <span className="text-grey">Repair &amp; replacement.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lead max-w-[640px]">
            Expert windshield replacement and repair in Columbus. With 17 years of experience, we
            ensure your vehicle is safe and road-ready.
          </p>
        </Reveal>
        <Reveal delay={240} className="mt-1.5 flex flex-wrap items-center justify-center gap-6">
          <Link href="/book" className="pill pill-blue">
            Book Appointment
          </Link>
          <a href={business.phoneHref} className="more">
            Call {business.phone}
          </a>
        </Reveal>
      </div>

      {/* priority = on charge cette image en premier (elle est visible tout de suite) */}
      <Reveal delay={200}>
        <Image
          {...images.carMidnight}
          alt="Midnight blue car, studio shot"
          priority
          sizes="(max-width: 820px) 130vw, 1180px"
          className="relative left-[-15%] mx-auto mt-[30px] w-[130%] max-w-none md:left-[2%] md:w-[min(1180px,108%)]"
        />
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------
   2. CHIFFRES CLÉS (4 colonnes)
   --------------------------------------------------------------- */
function Stats() {
  return (
    <div className="wrap">
      <div className="grid grid-cols-2 border-t border-line md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal
            key={s.value}
            delay={i * 80}
            className="border-b border-line px-1 py-[22px] md:border-r md:border-b-0 md:px-7 md:pt-[30px] md:pb-[34px] md:last:border-r-0"
          >
            <b className="block text-[30px] font-semibold tracking-[-0.04em] text-ink md:text-[40px]">
              {s.value}
            </b>
            <span className="text-[14px] text-muted">{s.label}</span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   3. SERVICES EN "BENTO" (grille de cartes de tailles différentes)
   --------------------------------------------------------------- */

// Une carte de la grille. `night` = carte sombre. `wide` = prend 2 colonnes.
function BentoCard({
  code,
  title,
  text,
  night = false,
  wide = false,
  className = "",
  children,
}: {
  code: string;
  title: string;
  text: string;
  night?: boolean;
  wide?: boolean;
  className?: string;
  children: React.ReactNode; // l'image
}) {
  return (
    <Link
      href="/services"
      className={`group relative flex flex-col overflow-hidden rounded-[28px] px-[34px] pt-[34px] transition-transform duration-500 hover:scale-[1.01] ${
        night ? "bg-[linear-gradient(160deg,var(--color-night2),var(--color-night))]" : "bg-bg2"
      } ${wide ? "md:col-span-2" : ""} ${className}`}
    >
      <div className={`relative z-[1] flex flex-col gap-2 ${wide ? "md:max-w-[330px]" : ""}`}>
        <span className={`text-[13px] font-semibold ${night ? "text-[#5d7183]" : "text-soft"}`}>{code}</span>
        <h3 className={`h3 ${night ? "text-white" : ""}`}>{title}</h3>
        <p className={`max-w-[420px] text-[16px] ${night ? "text-[#93a3b2]" : "text-muted"}`}>{text}</p>
        {wide && <span className="more mt-1.5">Learn more</span>}
      </div>
      {children}
    </Link>
  );
}

function ServicesBento() {
  const windshield = service("windshield");
  const adas = service("adas");
  const side = service("side");
  const fleet = service("fleet");
  // classes communes des images : posées en bas de la carte, avec un léger zoom au survol
  const img = "absolute max-w-none transition-transform duration-700 group-hover:scale-[1.03]";

  return (
    <section id="services" className="py-20 md:py-[130px]">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">Services</span>
          <h2 className="h2 mt-2.5 max-w-[760px]">
            Our auto glass services. <span className="text-grey">Certified and OE-grade.</span>
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-14 grid auto-rows-[440px] grid-cols-1 gap-5 md:grid-cols-3">
          <BentoCard code={windshield.code} title={windshield.name} text={windshield.summary} wide>
            <Image
              {...images.carFrontWhite}
              alt=""
              sizes="360px"
              className={`${img} bottom-[-30px] left-1/2 w-[60%] -translate-x-1/2 md:right-9 md:bottom-[-24px] md:left-auto md:w-[360px] md:translate-x-0`}
            />
          </BentoCard>

          <BentoCard code={chipRepair.code} title={chipRepair.name} text={chipRepair.summary}>
            <Image
              {...images.detailGlass}
              alt=""
              sizes="300px"
              className={`${img} bottom-[-70px] left-1/2 w-[300px] -translate-x-1/2`}
            />
          </BentoCard>

          <BentoCard code={adas.code} title={adas.name} text={adas.summary} night>
            <Image {...images.carHeroSilver} alt="" sizes="480px" className={`${img} bottom-5 left-[6%] w-[120%]`} />
          </BentoCard>

          <BentoCard code={side.code} title={side.name} text={side.summary}>
            <Image {...images.carSideGraphite} alt="" sizes="480px" className={`${img} bottom-10 left-[6%] w-[118%]`} />
          </BentoCard>

          <BentoCard code={fleet.code} title={fleet.name} text={fleet.summary} className="!bg-bg3">
            <Image {...images.carWhite} alt="" sizes="480px" className={`${img} bottom-[30px] left-[4%] w-[122%]`} />
          </BentoCard>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   4. SECTION SOMBRE : "Built to factory spec."
   --------------------------------------------------------------- */
function FactorySpec() {
  return (
    <section className="dark overflow-hidden pt-20 md:pt-[130px]">
      <div className="wrap">
        <Reveal className="flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-[640px]">
            <span className="eyebrow">Precision in every install</span>
            <h2 className="h2 mt-2.5">
              Built to factory spec. <span className="serif text-glass">Every time.</span>
            </h2>
          </div>
          <p className="lead max-w-[420px]">
            Certified technicians adhering strictly to Auto Glass Safety Council (AGSC) specifications
            and OEM urethane cure times.
          </p>
        </Reveal>

        <div className="mt-5 grid grid-cols-1 border-t border-[#1f2d3b] md:grid-cols-3">
          {specs.map((s, i) => (
            <Reveal key={s.title} delay={i * 100} className="pt-[30px] md:pr-[30px]">
              <b className="mb-2 block text-[21px] font-semibold tracking-[-0.02em] text-white">{s.title}</b>
              <span className="text-[#93a3b2]">{s.text}</span>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={150}>
        <Image
          {...images.carHeroSilver}
          alt="Silver car"
          sizes="(max-width: 820px) 100vw, 1060px"
          className="relative left-[2%] mx-auto mt-[30px] mb-[-30px] w-[min(1060px,100%)]"
        />
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------
   5. PROCESSUS EN 4 ÉTAPES
   --------------------------------------------------------------- */
function Process() {
  return (
    <section className="py-20 md:py-[130px]">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">Our repair process</span>
          <h2 className="h2 mt-2.5 max-w-[760px]">
            From intake to drive-away. <span className="text-grey">Four careful steps.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 90}
              className="flex flex-col gap-3 rounded-3xl bg-bg2 p-7 lg:min-h-[270px]"
            >
              <span className="text-[13px] font-semibold text-accent">
                {s.n} · {s.tag}
              </span>
              <h3 className="h3 text-[22px]">{s.title}</h3>
              <p className="text-[15px] text-muted">{s.short}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   6. AVIS CLIENTS
   --------------------------------------------------------------- */
function Reviews() {
  return (
    <section id="reviews" className="bg-bg2 py-20 md:py-[130px]">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">Columbus glass reviews</span>
          <h2 className="h2 mt-2.5">4.98 from 800+ jobs.</h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal
              as="figure"
              key={r.name}
              delay={i * 100}
              className="flex flex-col gap-[22px] rounded-3xl border border-line bg-white p-8"
            >
              <span className="text-[14px] tracking-[3px] text-amber" aria-label="5 out of 5 stars">
                ★★★★★
              </span>
              <blockquote className="text-[19px] leading-normal tracking-[-0.01em] text-ink">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-auto text-[14px] text-muted">
                <b className="block text-[15px] text-ink">{r.name}</b>
                {r.detail}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
