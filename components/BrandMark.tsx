import Link from "next/link";

export function BrandSymbol({ className = "" }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="40" height="40" rx="14" fill="currentColor" />
      <path
        d="M20 30V19"
        stroke="#FCF9F1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M20 24C10 24 10 14 11 12C18 12 22 16 20 24Z" fill="#DCE6CE" />
      <path d="M20 21C19 12 25 9 30 9C31 16 27 21 20 21Z" fill="#F0B79B" />
      <circle cx="28.5" cy="28.5" r="2" fill="#F0B79B" />
    </svg>
  );
}

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="mt-brand" aria-label="MamaTrack, accueil">
      <BrandSymbol className="mt-brand-symbol" />
      {!compact && (
        <span>
          MamaTrack<span className="mt-brand-dot">.</span>
        </span>
      )}
    </Link>
  );
}
