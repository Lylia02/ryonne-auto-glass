import Link from "next/link";
import Icon from "./Icon";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import { business } from "@/lib/content";

// En haut de chaque page :
//  1. une fine barre sombre (téléphone, ville, horaires) qui part avec le scroll
//  2. la barre blanche du menu, collée en haut de l'écran (sticky)
// C'est un composant SERVEUR : seule la partie interactive est dans <NavLinks />.
export default function Navbar() {
  const openHours = business.hours.filter((h) => h.time !== "Closed");

  return (
    <>
      {/* ----- 1. Barre d'infos (cachée sur téléphone) ----- */}
      <div className="hidden bg-night text-[12px] text-white/75 md:block">
        <div className="wrap flex h-10 items-center justify-between">
          <div className="flex items-center gap-7">
            <a href={business.phoneHref} className="flex items-center gap-2 transition-colors hover:text-white">
              <Icon name="phone" className="h-3.5 w-3.5 text-glass" />
              {business.phone}
            </a>
            <span className="flex items-center gap-2">
              <Icon name="pin" className="h-3.5 w-3.5 text-glass" />
              {business.city}
            </span>
          </div>
          <span className="flex items-center gap-2">
            <Icon name="clock" className="h-3.5 w-3.5 text-glass" />
            {openHours.map((h) => `${h.days} ${h.time}`).join("  ·  ")}
          </span>
        </div>
      </div>

      {/* ----- 2. Le menu ----- */}
      <header className="sticky top-0 z-50 border-b border-line bg-white/95 shadow-[0_1px_12px_rgba(14,22,32,.06)] backdrop-blur">
        <div className="wrap flex h-[72px] items-center justify-between">
          <Logo />
          <NavLinks />
          <Link href="/book" className="pill pill-sm pill-red hidden md:inline-flex">
            Book Service
          </Link>
        </div>
      </header>
    </>
  );
}
