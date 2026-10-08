import Link from "next/link";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import { business } from "@/lib/content";

// La barre du haut, collée en haut de l'écran (sticky) avec un effet de verre flou.
// C'est un composant SERVEUR (pas de "use client") : il est rendu en HTML une fois.
// Seule la partie interactive (lien actif + menu téléphone) est dans <NavLinks />.
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/[0.06] bg-white/[0.82] backdrop-blur-xl backdrop-saturate-180">
      <div className="wrap flex h-16 items-center justify-between">
        <Logo />
        <NavLinks />
        <div className="hidden items-center gap-[22px] text-[13px] text-muted md:flex">
          <a href={business.phoneHref} className="transition-colors hover:text-ink">
            {business.phone}
          </a>
          <Link href="/book" className="pill pill-sm pill-ink">
            Book Service
          </Link>
        </div>
      </div>
    </header>
  );
}
