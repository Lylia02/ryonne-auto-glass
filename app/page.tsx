// =============================================================
// PAGE D'ACCUEIL  ->  URL "/"
// Dans le App Router, le fichier app/page.tsx = la page "/".
// Les textes viennent de lib/content.ts, les images de lib/images.ts.
// =============================================================

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import QuickQuote from "@/components/QuickQuote";
import CheckIcon from "@/components/CheckIcon";
import { brands, business, chipRepair, features, reviews, services, steps } from "@/lib/content";
import { images, type ImageKey } from "@/lib/images";

// petit raccourci pour retrouver un service par son id
const service = (id: string) => services.find((s) => s.id === id)!;

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceCards />
      <Features />
      <Promos />
      <Process />
      <Reviews />
      <Brands />
    </>
  );
}

/* ---------------------------------------------------------------
   Titre de section centré, avec un petit trait rouge de chaque côté
   --------------------------------------------------------------- */
function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <Reveal className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-4">
        <span className="h-[2px] w-8 bg-accent md:w-12" />
        <h2 className="h2">{title}</h2>
        <span className="h-[2px] w-8 bg-accent md:w-12" />
      </div>
      {text && <p className="lead max-w-[620px]">{text}</p>}
    </Reveal>
  );
}

/* ---------------------------------------------------------------
   1. HERO : la grande photo, le titre, et le devis rapide
   --------------------------------------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg2">
      {/* Ordinateur : la photo prend tout le fond (fill = remplit le parent) */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={images.hero.src}
          alt="Car on the road with a clear windshield"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* un dégradé blanc à gauche pour que le texte reste lisible */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,#fff_28%,rgba(255,255,255,.88)_42%,rgba(255,255,255,0)_66%)]" />
      </div>

      <div className="wrap relative z-10 pt-12 md:pt-24">
        <div className="flex max-w-[560px] flex-col gap-5">
          <Reveal>
            <span className="eyebrow">Expert auto glass · {business.city}</span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="h1">
              Clear view.
              <br />
              <span className="text-accent">Safe drive.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="lead max-w-[440px]">
              Windshield replacement, rock chip repair and ADAS recalibration in Columbus. 17 years of
              experience, mobile or in-shop.
            </p>
          </Reveal>
          <Reveal delay={240} className="flex flex-wrap gap-3">
            <Link href="/book" className="pill pill-red">
              Book Appointment
            </Link>
            <a href={business.phoneHref} className="pill pill-line">
              Call {business.phone}
            </a>
          </Reveal>
        </div>
      </div>

      {/* Téléphone : la photo passe sous le texte */}
      <div className="relative mt-8 aspect-[16/10] md:hidden">
        <Image src={images.hero.src} alt="" fill sizes="100vw" className="object-cover object-right" />
      </div>

      <Reveal delay={300} className="wrap relative z-10 -mt-10 pb-12 md:mt-16 md:pb-14">
        <QuickQuote />
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------
   2. LES SERVICES EN CARTES (comme les voitures de la maquette)
   --------------------------------------------------------------- */
function ServiceCards() {
  const cards: { href: string; code: string; name: string; text: string; badges: readonly string[]; image: ImageKey }[] = [
    { ...pick("windshield"), image: "serviceWindshield" },
    {
      href: "/book",
      code: chipRepair.code,
      name: chipRepair.name,
      text: chipRepair.summary,
      badges: chipRepair.badges,
      image: "serviceChip",
    },
    { ...pick("adas"), image: "serviceAdas" },
    { ...pick("side"), image: "serviceSide" },
  ];

  return (
    <section id="services" className="py-20 md:py-24">
      <div className="wrap">
        <SectionTitle title="Our services" text="Certified, OE-grade glass work for every make and model." />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.code} delay={i * 80}>
              <Link
                href={c.href}
                className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-white transition-shadow duration-300 hover:shadow-[0_20px_40px_-24px_rgba(14,22,32,.35)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-bg2">
                  <Image
                    src={images[c.image].src}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-3 left-3 rounded-sm bg-ink px-2 py-1 text-[11px] font-bold tracking-[0.05em] text-white">
                    {c.code}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-[17px] font-bold text-ink">{c.name}</h3>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted">
                    {c.badges.map((b) => (
                      <li key={b} className="flex items-center gap-1.5">
                        <CheckIcon className="mt-0 h-3.5 w-3.5 text-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[14px] text-muted">{c.text}</p>
                  <span className="more mt-auto pt-1">Learn more</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Les infos d'une carte à partir d'un service de content.ts
function pick(id: string) {
  const s = service(id);
  return { href: `/services#${s.id}`, code: s.code, name: s.name, text: s.summary, badges: s.badges };
}

/* ---------------------------------------------------------------
   3. LES 4 ARGUMENTS AVEC ICÔNES
   --------------------------------------------------------------- */
function Features() {
  return (
    <section className="border-y border-line bg-bg2">
      <div className="wrap grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal
            key={f.title}
            delay={i * 80}
            className="flex flex-col items-center gap-3 border-line px-6 py-10 text-center sm:border-r sm:even:border-r-0 lg:even:border-r lg:last:border-r-0"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Icon name={f.icon} className="h-6 w-6" />
            </span>
            <b className="text-[14px] font-bold tracking-[0.05em] text-ink uppercase">{f.title}</b>
            <p className="max-w-[240px] text-[14px] text-muted">{f.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   4. LES 2 ENCARTS CÔTE À CÔTE : service mobile (sombre) + flottes (clair)
   --------------------------------------------------------------- */
function Promos() {
  const fleet = service("fleet");
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2">
      {/* ----- Service mobile ----- */}
      <div className="dark grid grid-cols-1 sm:grid-cols-[1.1fr_1fr]">
        <Reveal className="flex flex-col justify-center gap-4 p-8 md:p-12">
          <span className="eyebrow">Mobile service</span>
          <h2 className="h2 text-[28px] md:text-[34px]">We come to you.</h2>
          <p className="text-[15px] text-[#9aa7b4]">
            Home, office or parking lot: our technicians bring the shop to your driveway anywhere in
            Columbus.
          </p>
          <Link href="/book" className="pill pill-red self-start">
            Book mobile service
          </Link>
        </Reveal>
        <div className="relative min-h-[240px]">
          <Image
            src={images.promoMobile.src}
            alt="Technician on a mobile auto glass call"
            fill
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* ----- Flottes d'entreprise ----- */}
      <div className="relative overflow-hidden bg-white">
        <Reveal className="relative z-10 flex max-w-[360px] flex-col gap-4 p-8 md:p-12">
          <span className="eyebrow">Commercial fleets</span>
          <h2 className="h2 text-[28px] md:text-[34px]">Keep your fleet on the road.</h2>
          <p className="text-[15px] text-muted">{fleet.summary}</p>
          <Link href="/services#fleet" className="pill pill-line self-start">
            Fleet services
          </Link>
        </Reveal>
        <Image
          {...images.promoFleet}
          alt="Commercial van"
          sizes="(max-width: 1024px) 70vw, 380px"
          className="pointer-events-none relative -mt-6 ml-auto w-[80%] sm:absolute sm:right-[-6%] sm:bottom-6 sm:mt-0 sm:w-[52%]"
        />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   5. PROCESSUS EN 4 ÉTAPES
   --------------------------------------------------------------- */
function Process() {
  return (
    <section className="py-20 md:py-24">
      <div className="wrap">
        <SectionTitle title="How it works" text="From intake to drive-away, four careful steps." />
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="flex flex-col gap-2 border-t-2 border-accent pt-5">
              <span className="font-brand text-[40px] leading-none font-extrabold text-accent">{s.n}</span>
              <span className="eyebrow mt-2 text-muted">{s.tag}</span>
              <h3 className="h3 text-[18px]">{s.title}</h3>
              <p className="text-[14px] text-muted">{s.short}</p>
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
    <section id="reviews" className="bg-bg2 py-20 md:py-24">
      <div className="wrap">
        <SectionTitle title="What drivers say" text="Rated 4.98 from 800+ glass jobs in Columbus." />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal
              as="figure"
              key={r.name}
              delay={i * 100}
              className="flex flex-col gap-5 rounded-md border border-line bg-white p-7"
            >
              <span className="text-[15px] tracking-[3px] text-amber" aria-label="5 out of 5 stars">
                ★★★★★
              </span>
              <blockquote className="text-[16px] leading-relaxed text-ink">“{r.quote}”</blockquote>
              <figcaption className="mt-auto border-t border-line pt-4 text-[13px] text-muted">
                <b className="block text-[14px] font-bold text-ink uppercase">{r.name}</b>
                {r.detail}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   7. LES MARQUES (simples noms en gris)
   --------------------------------------------------------------- */
function Brands() {
  return (
    <section className="py-14">
      <div className="wrap flex flex-col items-center gap-7">
        <span className="text-[12px] font-bold tracking-[0.18em] text-ink uppercase">
          We service all makes &amp; models
        </span>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-14">
          {brands.map((b) => (
            <li key={b} className="font-brand text-[17px] font-extrabold tracking-[0.1em] text-soft uppercase">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
