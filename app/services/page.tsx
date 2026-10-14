// =============================================================
// PAGE SERVICES  ->  URL "/services"
// Le dossier app/services/ + le fichier page.tsx = la page "/services".
// =============================================================

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import BookCTA from "@/components/BookCTA";
import CheckIcon from "@/components/CheckIcon";
import ServiceChips from "@/components/ServiceChips";
import { business, services, steps, trust } from "@/lib/content";
import { images } from "@/lib/images";

// Le titre de l'onglet devient "Services | Ryonne Auto Glass" (voir le template dans layout.tsx)
export const metadata: Metadata = {
  title: "Services",
  description:
    "Windshield replacement, ADAS recalibration, side & rear glass and commercial fleet glass in Columbus, Ohio.",
};

// Le style du panneau image de chaque service (fond + taille de la voiture).
// Séparé du contenu : ici c'est du design, dans content.ts c'est du texte.
const media: Record<string, { bg: string; img: string; dark?: boolean }> = {
  windshield: { bg: "bg-[linear-gradient(170deg,#f3f6f8,#e4eaef)]", img: "w-[66%] mt-10" },
  adas: { bg: "bg-[linear-gradient(160deg,var(--color-night2),var(--color-night))]", img: "w-[96%]", dark: true },
  side: { bg: "bg-[linear-gradient(170deg,#f3f6f8,#e4eaef)]", img: "w-[96%]" },
  fleet: { bg: "bg-[linear-gradient(170deg,#eef2f5,#dfe6ec)]", img: "w-[98%]" },
};

export default function ServicesPage() {
  return (
    <>
      {/* ----- HERO ----- */}
      <section className="overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#fff_50%,var(--color-bg3)_100%)] pt-16 md:pt-24">
        <div className="wrap flex flex-col items-center gap-[22px] text-center">
          <Reveal>
            <span className="eyebrow">Expert Auto Glass</span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="h1">Our glass services.</h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="lead max-w-[660px]">
              Professional windshield replacement and glass repair in Columbus, Ohio, backed by 17
              years of technical experience and precision craftsmanship.
            </p>
          </Reveal>
          <Reveal delay={240} className="flex gap-2">
            <span className="tag">Same-Day Service</span>
            <span className="tag">Insurance Approved</span>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <Image
            {...images.carFrontBlue}
            alt="Car seen from the front, windshield in view"
            priority
            sizes="(max-width: 820px) 80vw, 620px"
            className="mx-auto mt-[50px] mb-[-6px] w-[min(620px,80%)]"
          />
        </Reveal>
      </section>

      {/* ----- BARRE DE PASTILLES (collante) ----- */}
      <ServiceChips chips={services.map((s) => ({ id: s.id, label: s.short }))} />

      {/* ----- LES 4 SERVICES : une ligne sur deux, l'image passe à droite ----- */}
      {services.map((s, i) => {
        const m = media[s.id];
        const flip = i % 2 === 1; // 2e et 4e ligne : image à droite + fond gris
        return (
          <section key={s.id} id={s.id} className={`py-20 md:py-[130px] ${flip ? "bg-bg2" : ""}`}>
            <div
              className={`wrap grid grid-cols-1 items-center gap-10 md:gap-16 ${
                flip ? "md:grid-cols-[1fr_1.15fr]" : "md:grid-cols-[1.15fr_1fr]"
              }`}
            >
              <Reveal
                className={`relative flex h-80 items-center justify-center overflow-hidden rounded-lg md:h-[520px] ${m.bg} ${
                  flip ? "md:order-2" : ""
                }`}
              >
                <span
                  className={`absolute top-6 left-[30px] text-[13px] font-semibold ${m.dark ? "text-[#5d7183]" : "text-soft"}`}
                >
                  0{i + 1}
                </span>
                <Image {...images[s.image]} alt={s.name} sizes="(max-width: 820px) 90vw, 600px" className={m.img} />
              </Reveal>

              <Reveal delay={120} className="flex flex-col gap-5">
                <span className="eyebrow">
                  0{i + 1} · {s.short}
                </span>
                <h2 className="h2">{s.title}</h2>
                <p className="lead">{s.text}</p>
                <ul className="mt-1 flex flex-col gap-3.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-[16px] text-text">
                      <CheckIcon />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {s.badges.map((b) => (
                    <span key={b} className="tag">
                      {b}
                    </span>
                  ))}
                </div>
                <Link href="/book" className="more self-start">
                  Book this service
                </Link>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* ----- BANDEAU SOMBRE ----- */}
      <section className="dark py-20 md:py-[110px]">
        <Reveal className="wrap flex flex-wrap items-center justify-between gap-10">
          <div className="max-w-[660px]">
            <span className="eyebrow">Certified auto glass technicians</span>
            <h2 className="h2 mt-2.5">
              Need a windshield repair <span className="serif text-glass">or replacement?</span>
            </h2>
            <p className="lead mt-4">
              Get a professional assessment and fast service from our experienced team. We handle all
              vehicle makes and models.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 md:w-auto md:min-w-[260px]">
            <Link href="/book" className="pill pill-white">
              Schedule Appointment
            </Link>
            <a href={business.phoneHref} className="pill pill-outline">
              {business.phone}
            </a>
          </div>
        </Reveal>
      </section>

      {/* ----- PROCESSUS : titre collant à gauche, étapes à droite ----- */}
      <section className="py-20 md:py-[130px]">
        <div className="wrap grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.5fr] md:gap-20">
          <div className="flex flex-col gap-4 self-start md:sticky md:top-[150px]">
            <span className="eyebrow">Expert glass repair</span>
            <h2 className="h2">Our repair process.</h2>
            <p className="lead">
              We combine 17 years of glass craftsmanship with precise installation standards to ensure
              your vehicle is safe, clear, and road-ready in Columbus.
            </p>
          </div>

          <ol className="flex flex-col border-b border-line">
            {steps.map((s) => (
              <Reveal
                as="li"
                key={s.n}
                className="grid grid-cols-[52px_1fr] gap-4 border-t border-line py-[34px] md:grid-cols-[70px_1fr] md:gap-5"
              >
                <span className="text-[32px] leading-none font-semibold tracking-[-0.04em] text-[#c4ced6] md:text-[40px]">
                  {s.n}
                </span>
                <div>
                  <span className="eyebrow text-[13px]">{s.tag}</span>
                  <h3 className="h3 text-[24px]">{s.title}</h3>
                  <p className="mt-2 mb-3.5 text-[16px] text-muted">{s.text}</p>
                  <ul className="mb-3.5 flex flex-wrap gap-x-[18px] gap-y-2 text-[14px] text-text">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-1.5">
                        <CheckIcon className="mt-[2px] h-3.5 w-3.5 text-accent" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {s.badges.map((b) => (
                      <span key={b} className="tag">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ----- 3 ARGUMENTS DE CONFIANCE ----- */}
      <div className="wrap">
        <div className="grid grid-cols-1 border-y border-line md:grid-cols-3">
          {trust.map((t, i) => (
            <Reveal
              key={t.title}
              delay={i * 100}
              className="border-b border-line px-1 py-7 last:border-b-0 md:border-r md:border-b-0 md:px-[30px] md:py-[34px] md:last:border-r-0"
            >
              <b className="block text-[26px] font-semibold tracking-[-0.03em] text-ink">{t.title}</b>
              <span className="text-muted">{t.text}</span>
            </Reveal>
          ))}
        </div>
      </div>

      <BookCTA
        title="Need auto glass service?"
        text="Submit your vehicle details and damage info to get started. We provide professional glass repair for all makes and models."
      />
    </>
  );
}
