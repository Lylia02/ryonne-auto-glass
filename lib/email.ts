// =============================================================
// LE CONTENU DES EMAILS (en HTML)
// Les emails n'aiment pas le CSS moderne : on utilise des <table>
// et des styles écrits directement dans les balises (style="...").
// =============================================================

import { formatDate, type Booking } from "./booking";
import { business } from "./content";

// Sécurité : on "échappe" le texte du client pour qu'il ne puisse pas
// injecter du HTML (par ex. un faux lien) dans l'email.
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const font = "font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif";

// Une ligne "Libellé : valeur" du tableau
function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:12px 16px;border-top:1px solid #e3e8ec;color:#5b6b7a;font-size:13px;width:150px;vertical-align:top">${esc(label)}</td>
    <td style="padding:12px 16px;border-top:1px solid #e3e8ec;color:#0c1824;font-size:15px">${esc(value)}</td>
  </tr>`;
}

// Le cadre commun aux 2 emails
function layout(title: string, intro: string, rows: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f7f9;${font}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f9;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;border:1px solid #e3e8ec">
        <tr><td style="padding:28px 28px 8px">
          <div style="font-size:13px;font-weight:700;letter-spacing:.14em;color:#0c1824">RYONNE</div>
          <h1 style="margin:18px 0 8px;font-size:24px;line-height:1.2;color:#0c1824">${title}</h1>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#5b6b7a">${intro}</p>
        </td></tr>
        <tr><td style="padding:0 12px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        <tr><td style="padding:22px 28px 28px;font-size:14px;line-height:1.5;color:#1b2733">${footer}</td></tr>
      </table>
      <p style="font-size:12px;color:#8796a3;margin:16px 0 0">${esc(business.name)} · ${esc(business.city)} · ${esc(business.phone)}</p>
    </td></tr>
  </table></body></html>`;
}

const vehicle = (b: Booking) => `${b.year} ${b.make} ${b.model}`;

// Le sujet de l'email que reçoit le garage
export function shopSubject(b: Booking): string {
  return `New booking request — ${vehicle(b)} · ${b.service}`;
}

// 1) L'email envoyé AU GARAGE (ton frère)
export function shopEmailHtml(b: Booking, photoCount: number): string {
  const rows = [
    row("Customer", b.name),
    row("Phone", b.phone),
    row("Email", b.email),
    row("Vehicle", vehicle(b)),
    row("VIN", b.vin || "Not provided"),
    row("Repair or replace", b.repairOrReplace),
    row("Glass", b.glass),
    row("Service", b.service),
    row("Location", `${b.location} · ${b.address}`),
    row("Date", `${formatDate(b.date)} · ${b.window}`),
    row("Details", b.details || "—"),
    row("Photos", photoCount ? `${photoCount} attached` : "None"),
  ].join("");

  const tel = b.phone.replace(/[^\d+]/g, "");
  const footer = `<a href="tel:${esc(tel)}" style="display:inline-block;background:#1f5f8b;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600">Call ${esc(b.name)}</a>
    <span style="color:#5b6b7a;margin-left:10px">or just reply to this email.</span>`;

  return layout("New booking request", "A customer just booked from the website.", rows, footer);
}

// 2) L'email de confirmation envoyé AU CLIENT
export function customerEmailHtml(b: Booking): string {
  const rows = [
    row("Vehicle", vehicle(b)),
    row("Service", b.service),
    row("Location", `${b.location} · ${b.address}`),
    row("Preferred date", `${formatDate(b.date)} · ${b.window}`),
  ].join("");

  const footer = `We'll call you to confirm glass OE codes and your final quote before dispatch.<br>
    Questions? Call us at <a href="${business.phoneHref}" style="color:#1f5f8b">${esc(business.phone)}</a>.`;

  return layout(
    `Thanks, ${esc(b.name.split(" ")[0])}. We got your request.`,
    "Here is a summary of your booking request with Ryonne Auto Glass.",
    rows,
    footer,
  );
}
