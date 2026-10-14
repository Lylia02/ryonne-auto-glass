"use client";
// "use client" = ce composant tourne aussi dans le navigateur.
// On en a besoin ici pour 2 choses interactives :
//   1. savoir sur quelle page on est (usePathname) pour souligner le lien actif en rouge
//   2. ouvrir / fermer le menu sur téléphone (useState)

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { business, navLinks } from "@/lib/content";

export default function NavLinks() {
  const pathname = usePathname(); // ex : "/services"
  const [open, setOpen] = useState(false); // le menu téléphone est-il ouvert ?

  return (
    <>
      {/* ----- Ordinateur : liens au centre (cachés sur téléphone) ----- */}
      <nav aria-label="Main" className="hidden h-full items-stretch gap-9 md:flex">
        {navLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center text-[12.5px] font-bold tracking-[0.06em] uppercase transition-colors ${
                active ? "text-accent" : "text-ink hover:text-accent"
              }`}
            >
              {link.label}
              {/* le petit trait rouge sous le lien actif */}
              {active && <span className="absolute inset-x-0 bottom-[18px] h-[2px] bg-accent" />}
            </Link>
          );
        })}
      </nav>

      {/* ----- Téléphone : bouton "burger" (caché sur ordinateur) ----- */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 flex h-10 w-10 items-center justify-center md:hidden"
      >
        <span className="relative block h-3 w-[20px]">
          {/* les 2 traits qui se transforment en croix */}
          <span
            className={`absolute left-0 h-[2px] w-full bg-ink transition-all duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`}
          />
          <span
            className={`absolute left-0 h-[2px] w-full bg-ink transition-all duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`}
          />
        </span>
      </button>

      {/* ----- Le panneau du menu téléphone ----- */}
      <div
        id="mobile-menu"
        className={`absolute inset-x-0 top-[72px] h-[calc(100dvh-72px)] overflow-y-auto bg-white transition-all duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="wrap flex flex-col py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`border-b border-line py-4 font-brand text-[20px] font-extrabold uppercase ${
                pathname === link.href ? "text-accent" : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-6 pb-2">
            <Link href="/book" onClick={() => setOpen(false)} className="pill pill-red flex-1">
              Book Service
            </Link>
            <a href={business.phoneHref} className="pill pill-line flex-1">
              Call
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
