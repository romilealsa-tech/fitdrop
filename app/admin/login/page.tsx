"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const STORE_CREDENTIALS: Record<string, { password: string; store: string; slug: string }> = {
  "zara@fitdrop.com":    { password: "zara2026",   store: "Zara",   slug: "zara" },
  "uniqlo@fitdrop.com":  { password: "uniqlo2026", store: "Uniqlo", slug: "uniqlo" },
  "hm@fitdrop.com":      { password: "hm2026",     store: "H&M",    slug: "hm" },
  "nike@fitdrop.com":    { password: "nike2026",    store: "Nike",   slug: "nike" },
  "cos@fitdrop.com":     { password: "cos2026",     store: "COS",    slug: "cos" },
  "mango@fitdrop.com":   { password: "mango2026",   store: "Mango",  slug: "mango" },
}

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setError("")
    const cred = STORE_CREDENTIALS[email.toLowerCase()]
    if (cred && cred.password === password) {
      localStorage.setItem("fitdrop_admin", JSON.stringify({ store: cred.store, slug: cred.slug, email }))
      router.push("/admin/dashboard")
    } else {
      setError("Invalid email or password")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-widest text-[#E8E8EA] mb-2">FIT DROP</h1>
          <p className="text-[#7EC8B8] text-sm uppercase tracking-widest font-medium">Brand Portal</p>
        </div>

        {/* Card */}
        <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#E8E8EA] mb-1">Welcome back</h2>
          <p className="text-[#6b6b6b] text-sm mb-8">Sign in to manage your inventory</p>

          <div className="mb-4">
            <label className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-2 block">Email</label>
            <input
              type="email"
              placeholder="store@fitdrop.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
            />
          </div>

          <div className="mb-6">
            <label className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#7EC8B8] text-[#0D0D0F] py-3 rounded-full font-bold hover:bg-[#22b8a4] transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5">
          <p className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-3">Demo Credentials</p>
          <div className="flex flex-col gap-1.5 text-xs text-[#6b6b6b]">
            {Object.entries(STORE_CREDENTIALS).map(([email, { store, password }]) => (
              <div key={email} className="flex justify-between">
                <span className="text-[#E8E8EA]">{store}</span>
                <span>{email} / {password}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}