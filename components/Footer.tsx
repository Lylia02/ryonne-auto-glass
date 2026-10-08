import Link from "next/link";
import { business, footerServices } from "@/lib/content";

// Le pied de page, identique sur toutes les pages (il est appelé dans layout.tsx).
export default function Footer() {
  return (
    <footer className="bg-bg2 pt-11 pb-[30px] text-[12px] leading-[1.6] text-muted">
      <div className="wrap">
        <p className="pb-5">
          Expert auto glass repair and replacement in Columbus, Ohio. With 17 years of experience, we
          ensure your vehicle is safe and road-ready.
        </p>

        {/* 2 colonnes sur téléphone, 4 colonnes (la 1re plus large) sur ordinateur */}
        <div className="grid grid-cols-2 gap-[30px] border-y border-line py-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <b className="mb-2 block font-semibold text-text">{business.name}</b>
            {business.city}
            <br />
            {business.note}
            <br />
            <a href={business.phoneHref} className="hover:text-ink">
              {business.phone}
            </a>
            <br />
            <a href={`mailto:${business.email}`} className="hover:text-ink">
              {business.email}
            </a>
          </div>

          <div>
            <b className="mb-2 block font-semibold text-text">Services</b>
            <ul>
              {footerServices.map((s) => (
                <li key={s}>
                  <Link href="/services" className="hover:text-ink">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <b className="mb-2 block font-semibold text-text">Hours</b>
            <ul>
              {business.hours.map((h) => (
                <li key={h.days}>
                  {h.days}: {h.time}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <b className="mb-2 block font-semibold text-text">Book</b>
            <Link href="/book" className="hover:text-ink">
              Schedule Service
            </Link>
            <br />
            <a href={business.phoneHref} className="hover:text-ink">
              Call Now
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-[18px] md:flex-row md:justify-between">
          <span>© 2026 {business.name}. All rights reserved.</span>
          {/* Obligatoire : les images de voitures sont sous licence CC BY 4.0, on doit citer l'auteur */}
          <span>
            Vehicle renders:{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              “Car Concept” © 2024 Darmstadt Graphics Group, CC BY 4.0
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
