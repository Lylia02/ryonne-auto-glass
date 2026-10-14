import Link from "next/link";
import Icon from "./Icon";
import Logo from "./Logo";
import { business, navLinks } from "@/lib/content";

// Le pied de page sombre, identique sur toutes les pages (il est appelé dans layout.tsx).
export default function Footer() {
  return (
    <footer className="dark pt-14 pb-8 text-[14px]">
      <div className="wrap">
        {/* 1 colonne sur téléphone, 4 colonnes (la 1re plus large) sur ordinateur */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.3fr_1.3fr]">
          <div className="flex flex-col gap-4">
            <Logo light />
            <p className="max-w-[300px] text-[#9aa7b4]">
              Expert auto glass repair and replacement in Columbus, Ohio. 17 years keeping your vehicle
              safe and road-ready.
            </p>
            <Link href="/book" className="pill pill-sm pill-red self-start">
              Book Service
            </Link>
          </div>

          <div>
            <FooterTitle>Quick Links</FooterTitle>
            <ul className="flex flex-col gap-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/book" className="transition-colors hover:text-white">
                  Book Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <FooterTitle>Customer Care</FooterTitle>
            <ul className="flex flex-col gap-3">
              <li>
                <a href={business.phoneHref} className="flex items-center gap-2.5 transition-colors hover:text-white">
                  <Icon name="phone" className="h-4 w-4 text-glass" />
                  {business.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="flex items-center gap-2.5 break-all transition-colors hover:text-white">
                  <Icon name="mail" className="h-4 w-4 text-glass" />
                  {business.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="pin" className="h-4 w-4 text-glass" />
                {business.city} · {business.note}
              </li>
            </ul>
          </div>

          <div>
            <FooterTitle>Hours</FooterTitle>
            <ul className="flex flex-col gap-2">
              {business.hours.map((h) => (
                <li key={h.days} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <span>{h.days}</span>
                  <span className={h.time === "Closed" ? "text-glass" : "text-white"}>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[12px] text-[#7d8a97] md:flex-row md:justify-between">
          <span>© 2026 {business.name}. All rights reserved.</span>
          {/* Obligatoire : les images de voitures sont sous licence CC BY 4.0, on doit citer l'auteur */}
          <span>
            Vehicle renders:{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              “Car Concept” © 2024 Darmstadt Graphics Group, CC BY 4.0
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return <b className="mb-4 block text-[13px] font-bold tracking-[0.08em] text-white uppercase">{children}</b>;
}
