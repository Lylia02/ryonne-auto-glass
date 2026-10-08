"use client";
// "use client" = ce composant tourne aussi dans le navigateur.
// On en a besoin ici pour 2 choses interactives :
//   1. savoir sur quelle page on est (usePathname) pour colorer le lien actif
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
      <nav aria-label="Main" className="hidden gap-[34px] text-[13px] text-muted md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors hover:text-ink ${pathname === link.href ? "text-ink" : ""}`}
          >
            {link.label}
          </Link>
        ))}
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
        <span className="relative block h-3 w-[18px]">
          {/* les 2 traits qui se transforment en croix */}
          <span
            className={`absolute left-0 h-[1.5px] w-full bg-ink transition-all duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`}
          />
          <span
            className={`absolute left-0 h-[1.5px] w-full bg-ink transition-all duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`}
          />
        </span>
      </button>

      {/* ----- Le panneau du menu téléphone ----- */}
      <div
        id="mobile-menu"
        className={`absolute inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto bg-white transition-all duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="wrap flex flex-col py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-4 text-[22px] font-semibold tracking-tight text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-6 pb-2">
            <Link href="/book" onClick={() => setOpen(false)} className="pill pill-blue flex-1">
              Book Service
            </Link>
            <a href={business.phoneHref} className="pill flex-1 border border-line text-ink">
              Call
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
