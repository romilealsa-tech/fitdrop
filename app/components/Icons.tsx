// Shared line icons (stroke = currentColor) used by the Navbar, Footer and home sections.
type P = { className?: string }
const base = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

export const StoreIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6" /></svg>
)
export const SparkIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></svg>
)
export const HeartIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><path d="M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 10-7.1 7.1L12 21.5l8.8-8.8a5 5 0 000-7.1z" /></svg>
)
export const BagIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><path d="M5 7h14l-1 14H6L5 7zM9 7V5a3 3 0 016 0v2" /></svg>
)
export const ReceiptIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3" /></svg>
)
export const UserIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>
)
export const PinIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
)
export const ClockIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const ScooterIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M9 17h6l-2-9h3M13 8H9M6 14l2-5" /></svg>
)
export const TagIcon = ({ className = "w-4 h-4" }: P) => (
  <svg {...base} className={className}><path d="M3 12V4a1 1 0 011-1h8l9 9-9 9-9-9z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
)
