import Form from "next/form";
import { bookingOptions, business } from "@/lib/content";

// Le panneau sombre "GET A QUICK QUOTE" sous le grand titre de l'accueil.
// C'est un formulaire GET : en cliquant, on arrive sur
//   /book?year=2021&make=Honda&glass=Windshield&service=...
// et le formulaire de réservation est déjà prérempli avec ces valeurs.
// <Form> de Next.js fait ce changement de page sans recharger tout le site.
export default function QuickQuote() {
  return (
    <div className="rounded-md bg-night2 p-6 text-white shadow-[0_30px_60px_-30px_rgba(14,22,32,.6)] md:p-8">
      <b className="font-brand text-[18px] font-extrabold tracking-[0.02em] uppercase">Get a quick quote</b>
      <Form
        action="/book"
        className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[0.7fr_1fr_1.2fr_1.3fr_auto]"
      >
        <QuoteField label="Year">
          <input name="year" inputMode="numeric" maxLength={4} placeholder="2021" className="input h-12 text-[15px]" />
        </QuoteField>
        <QuoteField label="Make">
          <input name="make" placeholder="Honda" autoComplete="off" className="input h-12 text-[15px]" />
        </QuoteField>
        <QuoteField label="Damaged glass">
          <select name="glass" defaultValue="" className="input h-12 text-[15px]">
            <option value="">Any glass</option>
            {bookingOptions.glass.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </QuoteField>
        <QuoteField label="Service">
          <select name="service" defaultValue="" className="input h-12 text-[15px]">
            <option value="">Any service</option>
            {bookingOptions.service.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </QuoteField>
        <button type="submit" className="pill pill-red h-12 w-full lg:w-auto">
          Get my quote
        </button>
      </Form>
      <p className="mt-4 text-right text-[12px] text-white/60">
        Not sure what you need?{" "}
        <a href={business.phoneHref} className="font-semibold text-white underline-offset-4 hover:underline">
          Call {business.phone}
        </a>
      </p>
    </div>
  );
}

function QuoteField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-white/80">
      {label}
      {children}
    </label>
  );
}
