// Stylized typographic wordmark for each store (replaces the old one-letter avatars).
// These are FitDrop's own typographic treatments, not the brands' official logo files —
// swap in official assets here once a brand partnership grants logo usage rights.

const STYLES: Record<string, { text: string; className: string }> = {
  zara: { text: "ZARA", className: "font-serif font-light tracking-[0.25em]" },
  uniqlo: { text: "UNIQLO", className: "font-sans font-black tracking-tight" },
  hm: { text: "H&M", className: "font-serif italic font-bold tracking-tight" },
  nike: { text: "NIKE", className: "font-sans font-black italic tracking-tighter" },
  cos: { text: "COS", className: "font-sans font-medium tracking-[0.35em]" },
  mango: { text: "MANGO", className: "font-serif font-semibold tracking-[0.18em]" },
  marlow: { text: "Marlow", className: "font-serif italic font-normal tracking-wide" },
}

type Props = {
  slug: string
  name?: string
  size?: "sm" | "md" | "lg"
  /** "tile" = square badge, "plain" = just the wordmark */
  variant?: "tile" | "plain"
  className?: string
}

const SIZES = {
  sm: { tile: "w-10 h-10 rounded-lg", text: "text-[9px]" },
  md: { tile: "w-14 h-14 rounded-xl", text: "text-[11px]" },
  lg: { tile: "w-20 h-20 rounded-2xl", text: "text-sm" },
}

export default function StoreLogo({ slug, name, size = "md", variant = "tile", className = "" }: Props) {
  const style = STYLES[slug] || { text: (name || slug).toUpperCase(), className: "font-sans font-bold tracking-widest" }
  const s = SIZES[size]

  if (variant === "plain") {
    return <span className={`${style.className} text-[#E8E8EA] ${className}`}>{style.text}</span>
  }

  return (
    <div
      className={`${s.tile} bg-[#0D0D0F] border border-[#2B2B2E] flex items-center justify-center shrink-0 ${className}`}
      aria-label={name || style.text}
    >
      <span className={`${style.className} ${s.text} text-[#E8E8EA] leading-none`}>{style.text}</span>
    </div>
  )
}
