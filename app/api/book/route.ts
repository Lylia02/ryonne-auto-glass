// =============================================================
// L'API DE RÉSERVATION  ->  POST /api/book
//
// C'est du code SERVEUR uniquement (il ne part jamais dans le navigateur).
// C'est donc le seul endroit où on peut utiliser la clé secrète Resend.
//
// Le trajet complet :
//   1. le client clique "Schedule Appointment"
//   2. le formulaire envoie les données ici (fetch POST)
//   3. on vérifie tout
//   4. Resend envoie l'email au garage (+ une confirmation au client)
//   5. on répond { ok: true } -> le formulaire affiche "Request sent."
// =============================================================

import { Resend } from "resend";
import { ACCEPTED_TYPES, MAX_PHOTOS, MAX_PHOTO_MB, parseBooking } from "@/lib/booking";
import { customerEmailHtml, shopEmailHtml, shopSubject } from "@/lib/email";

// Les variables secrètes viennent du fichier .env.local (jamais dans le code !)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO = process.env.BOOKING_TO_EMAIL; // l'email de ton frère
// Tant que tu n'as pas vérifié un nom de domaine sur Resend, garde onboarding@resend.dev
const FROM = process.env.BOOKING_FROM_EMAIL || "Ryonne Website <onboarding@resend.dev>";

export async function POST(request: Request) {
  // ---- 1. Lire les données envoyées par le formulaire ----
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Piège à robots : un champ caché que les humains ne remplissent jamais.
  // S'il est rempli, c'est un robot -> on fait semblant que tout va bien.
  if (form.get("company")) return Response.json({ ok: true });

  // ---- 2. Vérifier les champs texte ----
  const { data, errors } = parseBooking(form);

  // ---- 3. Vérifier les photos ----
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);
  if (photos.length > MAX_PHOTOS) errors.photos = `Up to ${MAX_PHOTOS} photos.`;
  for (const p of photos) {
    if (!ACCEPTED_TYPES.includes(p.type)) errors.photos = "Photos must be PNG, JPG or WEBP.";
    if (p.size > MAX_PHOTO_MB * 1024 * 1024) errors.photos = `Each photo must be under ${MAX_PHOTO_MB}MB.`;
  }

  // S'il y a des erreurs, on les renvoie au formulaire (status 400 = "mauvaise requête")
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, error: "Please check the highlighted fields.", errors }, { status: 400 });
  }

  // On transforme chaque photo en pièce jointe pour l'email
  const attachments = await Promise.all(
    photos.map(async (p, i) => ({
      filename: `damage-${i + 1}.${p.type.split("/")[1].replace("jpeg", "jpg")}`,
      content: Buffer.from(await p.arrayBuffer()),
      contentType: p.type,
    })),
  );

  // ---- Mode "test" : pas de clé Resend -> on affiche l'email dans le terminal ----
  // Pratique en local : le formulaire marche même sans compte Resend.
  if (!RESEND_API_KEY || !TO) {
    console.log("\n📩 [DEV] New booking (no RESEND_API_KEY, so no email sent):");
    console.log(shopSubject(data));
    console.log(data, `\n${attachments.length} photo(s)\n`);
    return Response.json({ ok: true, dev: true });
  }

  // ---- 4. Envoyer les emails avec Resend ----
  const resend = new Resend(RESEND_API_KEY);

  // a) L'email au garage. replyTo = le client : ton frère clique "Répondre" et écrit directement au client.
  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: data.email,
    subject: shopSubject(data),
    html: shopEmailHtml(data, attachments.length),
    attachments,
  });

  if (error) {
    console.error("Resend error:", error);
    return Response.json(
      { ok: false, error: "We couldn't send your request. Please call us instead." },
      { status: 502 },
    );
  }

  // b) La confirmation au client. Si elle échoue, ce n'est pas grave :
  //    le garage a bien reçu la demande, donc on ne bloque pas.
  //    (Note : avec onboarding@resend.dev, Resend n'envoie qu'à TA propre adresse.
  //     Ça marchera pour tous les clients une fois ton domaine vérifié.)
  const confirmation = await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "We received your booking request — Ryonne Auto Glass",
    html: customerEmailHtml(data),
  });
  if (confirmation.error) console.warn("Customer confirmation not sent:", confirmation.error.message);

  // ---- 5. Tout est bon ----
  return Response.json({ ok: true, confirmationSent: !confirmation.error });
}
