// Petite coche bleue utilisée dans les listes ("✓ Certified technicians...")
// currentColor = elle prend la couleur du texte autour (text-accent, text-glass...)
export default function CheckIcon({ className = "text-accent" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`mt-[3px] shrink-0 ${className}`}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
