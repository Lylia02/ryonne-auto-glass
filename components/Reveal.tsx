"use client";
// <Reveal> fait apparaître son contenu en douceur (fondu + léger glissement vers le haut)
// quand il entre dans l'écran pendant le scroll. Effet très "Apple".
//
// Exemple :  <Reveal delay={100}><h2>Titre</h2></Reveal>
//
// Comment ça marche ?
// - IntersectionObserver = un outil du navigateur qui nous prévient
//   quand un élément devient visible à l'écran.
// - À ce moment-là on ajoute la classe "is-visible" (voir globals.css).

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  delay?: number; // en millisecondes, pour décaler plusieurs éléments
  className?: string;
  as?: "div" | "li" | "figure";
};

export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // on n'anime qu'une seule fois
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect(); // nettoyage quand on quitte la page
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
