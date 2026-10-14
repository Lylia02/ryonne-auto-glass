"use client";
// La barre de "pastilles" collée sous le menu, sur la page Services.
// Pendant le scroll, la pastille de la section visible devient noire.

import Link from "next/link";
import { useEffect, useState } from "react";

type Chip = { id: string; label: string };

export default function ServiceChips({ chips }: { chips: Chip[] }) {
  const [active, setActive] = useState(chips[0].id);

  useEffect(() => {
    // À chaque scroll : la section active = la dernière dont le haut
    // a dépassé le milieu de l'écran. Avant la 1re section -> la 1re.
    function onScroll() {
      let current = chips[0].id;
      for (const c of chips) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight / 2) current = c.id;
      }
      setActive(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll); // nettoyage
  }, [chips]);

  return (
    <nav
      aria-label="Services"
      className="sticky top-[72px] z-40 border-b border-line bg-white/[0.86] backdrop-blur-xl"
    >
      <div className="wrap flex h-14 items-center gap-2 overflow-x-auto text-[14px] [scrollbar-width:none]">
        {chips.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={`flex h-[34px] shrink-0 items-center rounded-full px-4 transition-colors ${
              active === c.id ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {c.label}
          </a>
        ))}
        <span className="flex-1" />
        <Link href="/book" className="pill pill-sm pill-red shrink-0">
          Book Service
        </Link>
      </div>
    </nav>
  );
}
