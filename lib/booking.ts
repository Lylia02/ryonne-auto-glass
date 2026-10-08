// =============================================================
// LA RÉSERVATION : le type des données + la vérification côté serveur.
// Utilisé par app/api/book/route.ts.
//
// Pourquoi vérifier sur le serveur alors que le formulaire vérifie déjà ?
// -> Parce que n'importe qui peut envoyer une requête à /api/book sans
//    passer par le formulaire. Le serveur ne doit JAMAIS faire confiance
//    à ce qu'il reçoit.
// =============================================================

import { bookingOptions } from "./content";

export type Booking = {
  year: string;
  make: string;
  model: string;
  vin: string;
  repairOrReplace: string;
  glass: string;
  service: string;
  details: string;
  location: string;
  date: string; // format "2026-10-09"
  window: string;
  name: string;
  phone: string;
  email: string;
  address: string;
};

// Les limites des photos (le formulaire les compresse avant l'envoi)
export const MAX_PHOTOS = 3;
export const MAX_PHOTO_MB = 10;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Lit un champ texte du FormData, enlève les espaces autour, coupe à `max` caractères
function text(form: FormData, key: string, max = 200): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Transforme le FormData reçu en objet Booking + liste d'erreurs
export function parseBooking(form: FormData): { data: Booking; errors: Record<string, string> } {
  const data: Booking = {
    year: text(form, "year", 4),
    make: text(form, "make", 40),
    model: text(form, "model", 60),
    vin: text(form, "vin", 17).toUpperCase(),
    repairOrReplace: text(form, "repairOrReplace", 20),
    glass: text(form, "glass", 60),
    service: text(form, "service", 60),
    details: text(form, "details", 2000),
    location: text(form, "location", 20),
    date: text(form, "date", 10),
    window: text(form, "window", 40),
    name: text(form, "name", 80),
    phone: text(form, "phone", 30),
    email: text(form, "email", 120),
    address: text(form, "address", 160),
  };

  const errors: Record<string, string> = {};
  const thisYear = new Date().getFullYear();
  const year = Number(data.year);

  if (!/^\d{4}$/.test(data.year) || year < 1950 || year > thisYear + 1) errors.year = "Enter a valid year.";
  if (!data.make) errors.make = "Required.";
  if (!data.model) errors.model = "Required.";
  if (data.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(data.vin)) errors.vin = "A VIN has 17 letters and numbers.";
  if (!bookingOptions.repairOrReplace.includes(data.repairOrReplace)) errors.repairOrReplace = "Choose one.";
  if (!bookingOptions.glass.includes(data.glass)) errors.glass = "Choose the damaged glass.";
  if (!bookingOptions.service.includes(data.service)) errors.service = "Choose a service.";
  if (!bookingOptions.location.some((l) => l.value === data.location)) errors.location = "Choose one.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errors.date = "Choose a date.";
  if (!bookingOptions.windows.includes(data.window)) errors.window = "Choose a time window.";
  if (data.name.length < 2) errors.name = "Enter your name.";
  if (data.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email.";
  if (data.address.length < 3) errors.address = "Enter the service address or zip.";

  return { data, errors };
}

// "2026-10-09" -> "Fri, Oct 9"
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
