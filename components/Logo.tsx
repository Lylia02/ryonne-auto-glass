import Link from "next/link";

// Le logo Ryonne : un pare-brise avec un R, un reflet, et le nom en lettres larges.
// light = version blanche, pour les fonds sombres (pied de page)
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Ryonne Auto Glass, home"
      className={`flex items-center gap-2.5 ${light ? "text-white" : "text-ink"}`}
    >
      <svg width="40" height="31" viewBox="0 0 58 46" aria-hidden="true">
        {/* la forme du pare-brise */}
        <path d="M3 42 Q29 46 55 42 L46 6 Q29 2 12 6 Z" fill="currentColor" />
        {/* le R */}
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontFamily="var(--font-archivo)"
          fontWeight="700"
          fontSize="23"
          fill={light ? "#0e1620" : "#ffffff"}
        >
          R
        </text>
        {/* le reflet rouge */}
        <path d="M41 9 L45.5 9 L39 40 L34.5 40 Z" fill="#d71e28" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-brand text-[17px] font-extrabold tracking-[0.14em]" style={{ fontStretch: "125%" }}>
          RYONNE
        </span>
        <span className="mt-1 text-[8.5px] font-semibold tracking-[0.42em] text-accent">AUTO GLASS</span>
      </span>
    </Link>
  );
}
