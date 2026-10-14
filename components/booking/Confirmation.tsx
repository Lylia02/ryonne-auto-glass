"use client";
// L'écran "Request sent." affiché après l'envoi réussi du formulaire.
// En dessous : un aperçu de l'email que reçoit le garage (bonus portfolio !).

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatDate, type Booking } from "@/lib/booking";
import { shopSubject } from "@/lib/email";
import type { Photo } from "./PhotoDrop";

type Props = {
  data: Booking;
  photos: Photo[];
  confirmationSent: boolean;
  onReset: () => void;
};

export default function Confirmation({ data, photos, confirmationSent, onReset }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // À l'affichage : on remonte en haut et on place le focus sur le titre
  // (utile pour les lecteurs d'écran : ils annoncent "Request sent.")
  useEffect(() => {
    window.scrollTo({ top: 0 });
    titleRef.current?.focus();
  }, []);

  const firstName = data.name.split(" ")[0];
  const kv: [string, string][] = [
    ["Vehicle", `${data.year} ${data.make} ${data.model}`],
    ["VIN", data.vin || "Not provided"],
    ["Repair or replace", data.repairOrReplace],
    ["Glass", data.glass],
    ["Service", data.service],
    ["Location", `${data.location} · ${data.address}`],
    ["Date", `${formatDate(data.date)} · ${data.window}`],
    ["Customer", `${data.name} · ${data.phone}`],
  ];

  return (
    <section className="bg-[linear-gradient(180deg,#fff,var(--color-bg3))] pt-20 pb-24 md:pt-[100px] md:pb-[130px]">
      <div className="wrap flex flex-col items-center gap-5 text-center">
        <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#1f9d55] shadow-[0_20px_40px_-18px_rgba(31,157,85,.6)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 ref={titleRef} tabIndex={-1} className="h1 text-[40px] outline-none md:text-[56px]">
          Request sent.
        </h1>
        <p className="lead max-w-[620px]">
          Thanks, {firstName}. Ryonne Auto Glass has received your request by email
          {confirmationSent ? `, and a confirmation is on its way to ${data.email}` : ""}. We&apos;ll call
          you to confirm glass OE codes and your final quote before dispatch.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/" className="pill pill-ink">
            Back to home
          </Link>
          <button type="button" onClick={onReset} className="more">
            Book another vehicle
          </button>
        </div>

        <span className="eyebrow mt-12 text-[14px]">The email the shop receives</span>

        {/* Faux client mail, juste pour montrer le résultat */}
        <div className="w-full max-w-[760px] overflow-hidden rounded-[20px] border border-line bg-white text-left shadow-[0_40px_80px_-50px_rgba(12,24,36,.4)]">
          <div className="flex items-center gap-2 border-b border-line bg-bg2 px-[18px] py-3.5 text-[13px] text-muted">
            <span className="h-[11px] w-[11px] rounded-full bg-[#d6dde3]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#d6dde3]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#d6dde3]" />
            <span className="ml-2.5">Inbox · Ryonne Auto Glass</span>
            <span className="ml-auto">Just now</span>
          </div>

          <div className="grid grid-cols-[70px_1fr] gap-x-3 gap-y-1.5 border-b border-line px-5 pt-[22px] pb-[18px] text-[14px] md:px-7">
            <span className="text-muted">From</span>
            <b>Ryonne website — Booking form</b>
            <span className="text-muted">Reply-to</span>
            <span className="break-all">
              {data.name} &lt;{data.email}&gt;
            </span>
            <span className="text-muted">Subject</span>
            <b>{shopSubject(data)}</b>
          </div>

          <div className="flex flex-col gap-[18px] px-5 pt-[26px] pb-[30px] md:px-7">
            <div className="grid grid-cols-1 overflow-hidden rounded-[14px] border border-line sm:grid-cols-2">
              {kv.map(([k, v]) => (
                <div key={k} className="border-b border-line px-4 py-3.5 text-[14px] sm:odd:border-r">
                  <span className="mb-0.5 block text-[12px] text-muted">{k}</span>
                  {v}
                </div>
              ))}
            </div>
            {data.details && (
              <p className="text-[14px] text-text">
                <span className="text-muted">Details:</span> {data.details}
              </p>
            )}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {photos.map((p, i) => (
                  <span key={p.url} className="flex items-center gap-2.5 rounded-xl border border-line py-2 pr-3 pl-2 text-[13px]">
                    <i
                      className="block h-9 w-9 rounded-lg bg-[#e9eef2] bg-cover bg-center"
                      style={{ backgroundImage: `url(${p.url})` }}
                    />
                    damage-{i + 1}.jpg
                  </span>
                ))}
              </div>
            )}
            <span className="pill pill-red h-10 self-start text-[14px]" aria-hidden="true">
              Call customer
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
