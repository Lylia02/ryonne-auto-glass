"use client";
// Les 6 prochains jours ouvrés (dimanche = fermé), sous forme de pastilles.

import { use } from "react";
import { io } from "next/cache";

// Calcule les prochains jours ouverts à partir d'aujourd'hui.
// Retourne par ex. [{ iso: "2026-10-08", weekday: "Thu", day: 8, month: "Oct" }, ...]
function getOpenDays(count: number) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    if (d.getDay() !== 0) {
      // 0 = dimanche
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        iso,
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
        day: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

type Props = {
  value: string;
  onChange: (iso: string) => void;
  invalid?: boolean;
};

export default function DatePicker({ value, onChange, invalid }: Props) {
  // Next.js "pré-construit" les pages à l'avance (au moment du build).
  // Mais "aujourd'hui" change chaque jour ! use(io()) dit à Next :
  // "ne fige pas ce composant au build, calcule-le au moment de la visite".
  use(io());
  const days = getOpenDays(6);

  return (
    <div
      role="radiogroup"
      aria-label="Preferred service date"
      data-invalid={invalid || undefined}
      className="grid grid-cols-3 gap-2 md:grid-cols-6"
    >
      {days.map((d) => {
        const on = value === d.iso;
        return (
          <button
            key={d.iso}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(d.iso)}
            className={`flex flex-col items-center rounded-[14px] border-[1.5px] py-3 text-[12px] transition-colors ${
              on
                ? "border-accent bg-accent text-[#cfe2ef]"
                : `bg-white text-muted hover:border-accent/50 ${invalid ? "border-[#c0392b]" : "border-[#d6dde3]"}`
            }`}
          >
            {d.weekday}
            <b className={`text-[22px] font-semibold tracking-[-0.02em] ${on ? "text-white" : "text-ink"}`}>{d.day}</b>
            {d.month}
          </button>
        );
      })}
    </div>
  );
}

// Ce qu'on affiche pendant le calcul (une fraction de seconde) : 6 cases grises
export function DatePickerSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[79px] animate-pulse rounded-[14px] bg-bg3" />
      ))}
    </div>
  );
}
