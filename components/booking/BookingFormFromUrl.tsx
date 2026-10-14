"use client";
// Lit l'adresse de la page (ex : /book?year=2021&make=Honda&glass=Windshield)
// et passe ces valeurs au formulaire pour le préremplir.
//
// useSearchParams = "donne-moi les paramètres après le ? de l'adresse".
// Ces paramètres ne sont connus qu'au moment de la visite, donc ce composant
// doit être entouré d'un <Suspense> (voir app/book/page.tsx).

import { useSearchParams } from "next/navigation";
import { bookingOptions } from "@/lib/content";
import BookingForm, { type Prefill } from "./BookingForm";

export default function BookingFormFromUrl() {
  const params = useSearchParams();

  // Comme toujours : on ne fait pas confiance à ce qui vient de l'adresse.
  const text = (key: string, max: number) => (params.get(key) ?? "").trim().slice(0, max);
  const oneOf = (key: string, list: string[]) => {
    const value = params.get(key) ?? "";
    return list.includes(value) ? value : undefined;
  };

  const prefill: Prefill = {
    year: text("year", 4).replace(/\D/g, ""),
    make: text("make", 40),
    model: text("model", 60),
    service: oneOf("service", bookingOptions.service),
    glass: oneOf("glass", bookingOptions.glass),
  };

  return <BookingForm prefill={prefill} />;
}
