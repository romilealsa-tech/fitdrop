// FitDrop brand icon, rendered as PNG at any size (used by app/icon.tsx and app/apple-icon.tsx).
// Black background, "FitDrop" in white, "Fashion. Delivered." in aqua underneath.
// At tab size (≤ 48px) text that small is unreadable, so it becomes a bold white "F"
// with the aqua accent line — the same colors, recognizable in a browser tab.

const BLACK = "#0D0D0F"
const WHITE = "#E8E8EA"
const AQUA = "#7EC8B8"

export function BrandIcon({ size }: { size: number }) {
  if (size <= 48) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BLACK, borderRadius: size * 0.2 }}>
        <div style={{ display: "flex", color: WHITE, fontSize: size * 0.72, fontWeight: 700, lineHeight: 1 }}>F</div>
        <div style={{ display: "flex", width: size * 0.5, height: Math.max(2, size * 0.08), background: AQUA, borderRadius: 2, marginTop: size * 0.02 }} />
      </div>
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BLACK }}>
      <div style={{ display: "flex", color: WHITE, fontSize: size * 0.2, fontWeight: 700, letterSpacing: size * 0.012, lineHeight: 1 }}>
        FitDrop
      </div>
      <div style={{ display: "flex", color: AQUA, fontSize: size * 0.068, letterSpacing: size * 0.008, marginTop: size * 0.06, textTransform: "uppercase" }}>
        Fashion. Delivered.
      </div>
    </div>
  )
}
