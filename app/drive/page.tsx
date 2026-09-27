"use client"
import { useState } from "react"
import Link from "next/link"
import { DRIVER_AREAS, DRIVER_STATES, VEHICLE_TYPES } from "@/lib/driverAreas"

export default function DrivePage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", state: "", neighborhood: "", vehicleType: "", availability: "", message: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle")
  const [error, setError] = useState("")

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))
  const selectClass = (empty: boolean) =>
    `bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm ${empty ? "text-[#6b6b6b]" : "text-[#E8E8EA]"} focus:outline-none focus:border-[#7EC8B8] transition disabled:opacity-40`

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in your name, email, and phone.")
      return
    }
    if (!form.state || !form.neighborhood) {
      setError("Please choose your state and neighborhood.")
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
              <select
                value={form.state}
                onChange={e => setForm(prev => ({ ...prev, state: e.target.value, neighborhood: "" }))}
                className={selectClass(!form.state)}
              >
                <option value="">State</option>
                {DRIVER_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <select
                value={form.neighborhood}
                onChange={e => update("neighborhood", e.target.value)}
                disabled={!form.state}
                className={selectClass(!form.neighborhood)}
              >
                <option value="">{form.state ? "Neighborhood" : "Choose a state first"}</option>
                {(DRIVER_AREAS[form.state] || []).map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                  </optgroup>
                ))}
              </select>
              <select
                value={form.vehicleType}
                onChange={e => update("vehicleType", e.target.value)}
                className={selectClass(!form.vehicleType)}
              >
                <option value="">Vehicle type</option>
                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
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
