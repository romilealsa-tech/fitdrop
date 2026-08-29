"use client"
import { useState } from "react"
import Link from "next/link"

export default function DrivePage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", vehicleType: "", availability: "", message: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle")
  const [error, setError] = useState("")

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in your name, email, and phone.")
      return
    }
    setError("")
    setStatus("submitting")
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setStatus("done")
      } else {
        setError(data.error || "Something went wrong. Please try again.")
        setStatus("error")
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setStatus("error")
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FitDrop</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b] items-center">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <Link href="/new-drops" className="hover:text-[#E8E8EA] transition">New Drops</Link>
          <Link href="/drive" className="text-[#7EC8B8]">Drive</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-16 pb-12 max-w-3xl mx-auto text-center">
        <p className="text-[#7EC8B8] uppercase tracking-widest text-sm mb-4 font-medium">Join the fleet</p>
        <h1 className="text-5xl font-bold mb-6 leading-tight">Drive with FitDrop</h1>
        <p className="text-[#6b6b6b] text-lg max-w-xl mx-auto">
          Deliver same-day fashion drops from the brands people love. Flexible hours, fast payouts, your own schedule.
        </p>
      </section>

      {/* Perks */}
      <section className="px-8 pb-16 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">⏱️</p>
          <p className="text-sm font-semibold text-[#E8E8EA] mb-1">Flexible hours</p>
          <p className="text-xs text-[#6b6b6b]">Work whenever it fits your schedule.</p>
        </div>
        <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">💸</p>
          <p className="text-sm font-semibold text-[#E8E8EA] mb-1">Fast payouts</p>
          <p className="text-xs text-[#6b6b6b]">Get paid quickly for every delivery.</p>
        </div>
        <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🛍️</p>
          <p className="text-sm font-semibold text-[#E8E8EA] mb-1">Easy drops</p>
          <p className="text-xs text-[#6b6b6b]">Small, light packages from top fashion brands.</p>
        </div>
      </section>

      {/* Application form */}
      <section className="px-8 pb-24 max-w-xl mx-auto">
        {status === "done" ? (
          <div className="bg-[#1C1C1E] border border-[#7EC8B8] rounded-2xl p-10 text-center">
            <p className="text-3xl mb-4">✅</p>
            <h2 className="text-xl font-bold mb-2">Application received</h2>
            <p className="text-[#6b6b6b] text-sm mb-6">Thanks for applying. Our team will reach out by email soon.</p>
            <Link href="/home" className="text-[#7EC8B8] hover:underline text-sm font-medium">← Back to FitDrop</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-1">Apply now</h2>
            <p className="text-[#6b6b6b] text-sm mb-6">Takes less than 2 minutes.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={e => update("name", e.target.value)}
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={e => update("phone", e.target.value)}
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
              />
              <input
                placeholder="City / neighborhood"
                value={form.city}
                onChange={e => update("city", e.target.value)}
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
              />
              <select
                value={form.vehicleType}
                onChange={e => update("vehicleType", e.target.value)}
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm text-[#E8E8EA] focus:outline-none focus:border-[#7EC8B8] transition"
              >
                <option value="">Vehicle type</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Car">Car</option>
                <option value="On foot">On foot</option>
              </select>
              <select
                value={form.availability}
                onChange={e => update("availability", e.target.value)}
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm text-[#E8E8EA] focus:outline-none focus:border-[#7EC8B8] transition"
              >
                <option value="">Availability</option>
                <option value="Weekday mornings">Weekday mornings</option>
                <option value="Weekday evenings">Weekday evenings</option>
                <option value="Weekends">Weekends</option>
                <option value="Full-time">Full-time</option>
              </select>
            </div>

            <textarea
              placeholder="Anything else we should know? (optional)"
              value={form.message}
              onChange={e => update("message", e.target.value)}
              rows={3}
              className="w-full bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition mb-4"
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-[#7EC8B8] text-[#0D0D0F] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#22b8a4] transition disabled:opacity-50"
            >
              {status === "submitting" ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </section>

    </main>
  )
}
