"use client";
// =============================================================
// LE FORMULAIRE DE RÉSERVATION (la pièce la plus importante du site)
//
// Ce qu'il fait :
//  - garde en mémoire ce que le client tape (useState)
//  - met à jour le résumé "Your request" à droite en direct
//  - vérifie les champs avant l'envoi (même règles que le serveur)
//  - compresse les photos, puis envoie tout à /api/book
//  - affiche l'écran "Request sent." si tout s'est bien passé
// =============================================================

import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { business, bookingOptions } from "@/lib/content";
import { formatDate, parseBooking, type Booking } from "@/lib/booking";
import { images } from "@/lib/images";
import { compressImage } from "./compressImage";
import DatePicker, { DatePickerSkeleton } from "./DatePicker";
import PhotoDrop, { type Photo } from "./PhotoDrop";
import Confirmation from "./Confirmation";

// Les valeurs de départ du formulaire
const initial = {
  year: "",
  make: "",
  model: "",
  repairOrReplace: "Not sure",
  service: "",
  location: "Mobile",
  date: "",
  window: "",
  address: "",
};
type Summary = typeof initial;

// Les valeurs déjà choisies dans le "devis rapide" de l'accueil (voir BookingFormFromUrl.tsx)
export type Prefill = { year?: string; make?: string; model?: string; service?: string; glass?: string };

export default function BookingForm({ prefill = {} }: { prefill?: Prefill }) {
  // Les champs qui s'affichent dans le résumé à droite (les autres sont lus à l'envoi)
  const [form, setForm] = useState<Summary>(() => ({
    ...initial,
    year: prefill.year ?? "",
    make: prefill.make ?? "",
    model: prefill.model ?? "",
    service: prefill.service ?? "",
  }));
  const [glassDefault, setGlassDefault] = useState(prefill.glass ?? ""); // le select "glass" n'est pas suivi par useState
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState<{ data: Booking; confirmationSent: boolean } | null>(null);
  const [formKey, setFormKey] = useState(0); // changer la "key" vide complètement le formulaire

  // Met à jour un champ du résumé + efface son erreur
  function update(key: keyof Summary, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  // Dès qu'on modifie un champ en erreur, son message rouge disparaît
  function clearError(event: React.FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name;
    if (name && errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  // Quand on quitte la page : on libère la mémoire des aperçus photo
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  // ----------------------------------------------------------
  // L'ENVOI
  // ----------------------------------------------------------
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // empêche le navigateur de recharger la page
    setServerError("");

    // 1. On récupère tous les champs qui ont un "name"
    const formData = new FormData(event.currentTarget);

    // 2. On vérifie avec les MÊMES règles que le serveur (lib/booking.ts)
    const { errors: found } = parseBooking(formData);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // on fait défiler jusqu'au premier champ en erreur
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (first instanceof HTMLInputElement || first instanceof HTMLSelectElement) first.focus({ preventScroll: true });
      });
      return;
    }

    setStatus("sending");
    try {
      // 3. On ajoute les photos compressées
      for (const p of photos) formData.append("photos", await compressImage(p.file));

      // 4. On envoie à notre API (app/api/book/route.ts)
      const res = await fetch("/api/book", { method: "POST", body: formData });
      if (res.status === 413) throw new Error("Your photos are too large. Try fewer or smaller photos.");
      const json = await res.json();

      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error || "Something went wrong.");
      }

      // 5. Succès !
      setSent({ data: parseBooking(formData).data, confirmationSent: Boolean(json.confirmationSent) });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Network error. Please try again or call us.");
    } finally {
      setStatus("idle");
    }
  }

  // Bouton "Book another vehicle" : on remet tout à zéro
  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setForm(initial);
    setGlassDefault("");
    setErrors({});
    setSent(null);
    setFormKey((k) => k + 1);
  }

  // Une fois envoyé, on affiche l'écran de confirmation à la place du formulaire
  if (sent) {
    return <Confirmation data={sent.data} photos={photos} confirmationSent={sent.confirmationSent} onReset={reset} />;
  }

  // Petit raccourci pour les props d'erreur d'un champ
  const err = (key: string) => ({ "aria-invalid": errors[key] ? true : undefined });
  const zip = form.address.match(/\b\d{5}\b/)?.[0];

  return (
    <>
      {/* ---------- TITRE ---------- */}
      <section className="pt-16 pb-[30px] md:pt-20">
        <div className="wrap flex flex-col gap-4">
          <span className="eyebrow">Book Service</span>
          <h1 className="h1 max-w-[820px] text-[36px] md:text-[56px]">Book your vehicle glass service.</h1>
          <p className="lead max-w-[680px]">
            Submit your vehicle specifications, select your damaged glass, and choose your preferred
            appointment date in Columbus, Ohio.
          </p>
        </div>
      </section>

      <section className="pt-[30px] pb-20 md:pb-[120px]">
        <div className="wrap grid grid-cols-1 items-start gap-14 lg:grid-cols-[1.45fr_1fr]">
          {/* noValidate = on gère nous-mêmes les messages d'erreur (plus jolis) */}
          <form key={formKey} onSubmit={handleSubmit} onChange={clearError} noValidate className="flex flex-col">
            {/* Piège à robots (invisible pour les humains) */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />

            {/* ===== BLOC 1 : LE VÉHICULE ===== */}
            <Block title="Your vehicle." step="01 · Precision match">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Year *" error={errors.year}>
                  <input name="year" inputMode="numeric" maxLength={4} placeholder="2021" className="input" value={form.year} onChange={(e) => update("year", e.target.value)} {...err("year")} />
                </Field>
                <Field label="Make *" error={errors.make}>
                  <input name="make" placeholder="Honda" autoComplete="off" className="input" value={form.make} onChange={(e) => update("make", e.target.value)} {...err("make")} />
                </Field>
                <Field label="Model *" error={errors.model}>
                  <input name="model" placeholder="CR-V" autoComplete="off" className="input" value={form.model} onChange={(e) => update("model", e.target.value)} {...err("model")} />
                </Field>
              </div>
              <Field label="VIN (Vehicle Identification Number)" error={errors.vin}>
                <input name="vin" maxLength={17} placeholder="Optional · 17 characters" className="input uppercase placeholder:normal-case" {...err("vin")} />
              </Field>
              <p className="-mt-2.5 text-[13px] text-muted">
                Found on your insurance card, vehicle registration, or driver door jam.
              </p>
            </Block>

            {/* ===== BLOC 2 : LES DÉGÂTS ===== */}
            <Block title="The damage." step="02 · Damage scope">
              <Group label="Repair or Replace">
                <Segmented name="repairOrReplace" options={bookingOptions.repairOrReplace} value={form.repairOrReplace} onChange={(v) => update("repairOrReplace", v)} />
              </Group>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Damaged Glass Location *" error={errors.glass}>
                  <select name="glass" defaultValue={glassDefault} className="input" {...err("glass")}>
                    <option value="" disabled>
                      Select glass…
                    </option>
                    {bookingOptions.glass.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Service Requirement *" error={errors.service}>
                  <select name="service" value={form.service} className="input" onChange={(e) => update("service", e.target.value)} {...err("service")}>
                    <option value="" disabled>
                      Select service…
                    </option>
                    {bookingOptions.service.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Group label="Upload Damage Photos">
                <PhotoDrop photos={photos} onChange={setPhotos} error={errors.photos} />
                <span className="text-[13px] font-normal text-muted">
                  Clear photos assist our 17-year veteran technicians in determining whether a repair or
                  full replacement is structurally mandatory.
                </span>
              </Group>
              <Field label="Damage Details & Special Instructions">
                <textarea name="details" maxLength={2000} placeholder="Rock hit on I-70, crack spreading from the passenger side…" className="input" />
              </Field>
            </Block>

            {/* ===== BLOC 3 : QUAND ET OÙ ===== */}
            <Block title="When and where." step="03 · Columbus dispatch & contact">
              <div role="radiogroup" aria-label="Service location" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {bookingOptions.location.map((o) => {
                  const on = form.location === o.value;
                  return (
                    <label
                      key={o.value}
                      className={`cursor-pointer rounded-[14px] border-[1.5px] bg-white p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
                        on ? "border-accent shadow-[0_0_0_3px_rgba(31,95,139,.12)]" : "border-[#d6dde3] hover:border-accent/50"
                      }`}
                    >
                      <input type="radio" name="location" value={o.value} checked={on} onChange={() => update("location", o.value)} className="sr-only" />
                      <b className="block text-[16px] text-ink">{o.label}</b>
                      <span className="text-[14px] text-muted">{o.hint}</span>
                    </label>
                  );
                })}
              </div>

              <Group label="Preferred Service Date *" error={errors.date}>
                <input type="hidden" name="date" value={form.date} />
                {/* Suspense : affiche des cases grises le temps de calculer les dates */}
                <Suspense fallback={<DatePickerSkeleton />}>
                  <DatePicker value={form.date} onChange={(v) => update("date", v)} invalid={Boolean(errors.date)} />
                </Suspense>
              </Group>

              <Group label="Arrival Window *" error={errors.window}>
                <Segmented
                  name="window"
                  options={bookingOptions.windows}
                  value={form.window}
                  onChange={(v) => update("window", v)}
                  invalid={Boolean(errors.window)}
                />
              </Group>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Full Name *" error={errors.name}>
                  <input name="name" autoComplete="name" placeholder="Jordan Smith" className="input" {...err("name")} />
                </Field>
                <Field label="Phone *" error={errors.phone}>
                  <input name="phone" type="tel" autoComplete="tel" placeholder="(614) 555-0100" className="input" {...err("phone")} />
                </Field>
              </div>
              <Field label="Email *" error={errors.email}>
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className="input" {...err("email")} />
              </Field>
              <Field label={form.location === "Mobile" ? "Service Address *" : "Zip Code *"} error={errors.address}>
                <input
                  name="address"
                  autoComplete={form.location === "Mobile" ? "street-address" : "postal-code"}
                  placeholder={form.location === "Mobile" ? "123 High St, Columbus, OH 43215" : "43215"}
                  className="input"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  {...err("address")}
                />
              </Field>
            </Block>

            {/* Erreur renvoyée par le serveur (ou problème de réseau) */}
            {serverError && (
              <p role="alert" className="mb-4 rounded-xl border border-[#f0c4bf] bg-[#fdf3f2] px-4 py-3 text-[14px] text-[#c0392b]">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="pill pill-red h-14 text-[16px] disabled:cursor-wait disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Schedule Appointment"}
            </button>
            <p className="mt-3 text-center text-[13px] text-muted">
              No upfront credit card required. We&apos;ll call you to confirm your final quote.
            </p>
          </form>

          {/* ---------- LE RÉSUMÉ "YOUR REQUEST" (se met à jour en direct) ---------- */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-[96px]">
            <div className="overflow-hidden rounded-[28px] bg-bg2">
              <div className="relative h-[170px] overflow-hidden bg-[linear-gradient(170deg,#f3f6f8,#e4eaef)]">
                <Image
                  {...images.carSideGraphite}
                  alt=""
                  sizes="460px"
                  className="absolute bottom-5 left-1/2 w-[112%] max-w-none -translate-x-1/2"
                />
              </div>
              <div className="flex flex-col p-7">
                <span className="eyebrow text-[14px]">Your request</span>
                <h3 className="h3 mt-1 mb-4 text-[24px]">
                  {[form.year, form.make, form.model].filter(Boolean).join(" ") || "Your vehicle"}
                </h3>
                <Line label="Repair or replace" value={form.repairOrReplace} />
                <Line label="Service" value={form.service || "—"} />
                <Line label="Location" value={zip ? `${form.location} · ${zip}` : form.location} />
                <Line label="Date" value={form.date ? formatDate(form.date) : "—"} />
                <Line label="Window" value={form.window || "—"} />
                <Line label="Photos" value={photos.length ? `${photos.length} attached` : "None"} />
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-[20px] border border-line p-6 text-[14px] text-muted">
              <b className="text-[15px] text-ink">Prefer to talk?</b>
              <span>
                {business.note} ·{" "}
                {business.hours
                  .filter((h) => h.time !== "Closed")
                  .map((h) => `${h.days} ${h.time}`)
                  .join(" · ")}
              </span>
              <a href={business.phoneHref} className="more mt-2 self-start">
                Call {business.phone}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/* =============================================================
   PETITS COMPOSANTS UTILISÉS SEULEMENT DANS CE FICHIER
   ============================================================= */

// Un bloc du formulaire avec son titre ("Your vehicle.") et son numéro
function Block({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-[22px] border-t border-line py-10">
      <legend className="sr-only">{title}</legend>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="h3">{title}</h3>
        <span className="text-[13px] font-semibold text-soft">{step}</span>
      </div>
      {children}
    </fieldset>
  );
}

// Un champ simple : libellé + input + message d'erreur
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
      {error && <span className="text-[12px] text-[#c0392b]">{error}</span>}
    </label>
  );
}

// Comme Field, mais pour un groupe de boutons (pas un seul input)
function Group({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <span>{label}</span>
      {children}
      {error && <span className="text-[12px] text-[#c0392b]">{error}</span>}
    </div>
  );
}

// Le sélecteur "à onglets" façon iPhone (Repair / Replace / Not sure)
function Segmented({
  name,
  options,
  value,
  onChange,
  invalid,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      data-invalid={invalid || undefined}
      className={`grid gap-1 rounded-xl bg-[#eceff2] p-1 ${invalid ? "ring-1 ring-[#c0392b]" : ""}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((o) => {
        const on = value === o;
        return (
          <label
            key={o}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-[9px] px-2 text-center text-[13px] leading-tight font-medium transition sm:text-[15px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
              on ? "bg-white text-ink shadow-[0_2px_8px_-3px_rgba(0,0,0,.25)]" : "text-muted hover:text-ink"
            }`}
          >
            <input type="radio" name={name} value={o} checked={on} onChange={() => onChange(o)} className="sr-only" />
            {o}
          </label>
        );
      })}
    </div>
  );
}

// Une ligne du résumé : "Vehicle ........ 2021 Honda CR-V"
function Line({ label, value, noBorder = false }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2.5 text-[15px] ${noBorder ? "" : "border-t border-line"}`}>
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
