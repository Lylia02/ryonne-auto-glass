// =============================================================
// PAGE RÉSERVATION  ->  URL "/book"
// La page elle-même est un composant SERVEUR très simple :
// toute l'interactivité est dans <BookingForm /> (composant CLIENT).
// =============================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/booking/BookingForm";
import BookingFormFromUrl from "@/components/booking/BookingFormFromUrl";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Book Service",
  description:
    "Book your windshield repair or replacement in Columbus, Ohio. Mobile or in-shop service, no upfront credit card required.",
};

export default function BookPage() {
  return (
    <>
      {/* Le temps de lire l'adresse (?year=...), on affiche le formulaire vide,
          puis il est remplacé par la version préremplie. */}
      <Suspense fallback={<BookingForm />}>
        <BookingFormFromUrl />
      </Suspense>

      {/* ----- Les conseils en bas de page ----- */}
      <section className="bg-bg2 py-20 md:py-[110px]">
        <Reveal className="wrap grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-4">
            <span className="eyebrow">Intake guidelines</span>
            <h2 className="h2 md:text-[44px]">Ryonne Auto Glass standards.</h2>
          </div>
          <div className="flex flex-col gap-[18px]">
            <p className="lead md:text-[19px]">
              Providing accurate Year, Make, and Model allows our technicians to cross-reference factory
              glass curvatures, acoustic sound-dampening layers, and embedded rain or optical safety
              sensors.
            </p>
            <p className="rounded-2xl border border-line bg-white px-5 py-[18px] text-[15px] text-text">
              For fractures larger than a dollar bill, structural windshield integrity requires a full
              replacement rather than resin injection to ensure roof support during collision.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
