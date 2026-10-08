import Link from "next/link";

// Le logo Ryonne : un pare-brise avec un R, un reflet bleu, et le nom en lettres larges.
export default function Logo() {
  return (
    <Link href="/" aria-label="Ryonne Auto Glass, home" className="flex items-center gap-2.5 text-ink">
      <svg width="36" height="28" viewBox="0 0 58 46" aria-hidden="true">
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
          fill="#ffffff"
        >
          R
        </text>
        {/* le reflet */}
        <path d="M41 9 L45.5 9 L39 40 L34.5 40 Z" fill="#7fb2cf" />
      </svg>
      <span className="font-brand text-[15px] font-bold tracking-[0.14em]" style={{ fontStretch: "125%" }}>
        RYONNE
      </span>
    </Link>
  );
}
