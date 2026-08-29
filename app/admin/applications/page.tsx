"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser, useClerk } from "@clerk/nextjs"

type Application = {
  _id: string
  name: string
  email: string
  phone: string
  city: string
  vehicleType: string
  availability: string
  message: string
  status: string
  createdAt: string
}

const STATUS_OPTIONS = ["pending", "reviewed", "approved", "rejected"]

export default function AdminApplications() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (!isLoaded) return
    if (role !== "admin") {
      router.push("/admin/login")
      return
    }
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, role])

  const fetchApplications = async () => {
    setLoading(true)
    const res = await fetch("/api/applications")
    const data = await res.json()
    setApplications(data.applications || [])
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const updateStatus = async (app: Application, status: string) => {
    await fetch("/api/applications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: app._id, status }),
    })
    setApplications(prev => prev.map(a => a._id === app._id ? { ...a, status } : a))
    showToast(`${app.name} marked as ${status}`)
  }

  const handleLogout = () => {
    signOut(() => router.push("/home"))
  }

  if (!isLoaded || role !== "admin" || loading) return (
    <main className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
      <div className="text-[#7EC8B8] text-sm uppercase tracking-widest animate-pulse">Loading applications...</div>
    </main>
  )

  const pendingCount = applications.filter(a => a.status === "pending").length

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-[#7EC8B8]/10 text-[#7EC8B8]"
    if (status === "rejected") return "bg-red-500/10 text-red-400"
    if (status === "reviewed") return "bg-blue-500/10 text-blue-300"
    return "bg-[#2B2B2E] text-[#6b6b6b]"
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {toast && (
        <div className="fixed top-6 right-6 bg-[#7EC8B8] text-[#0D0D0F] px-5 py-3 rounded-full text-sm font-bold z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FitDrop</span>
          <span className="text-[#2B2B2E]">|</span>
          <span className="text-sm text-[#7EC8B8] font-medium">Admin Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-xs text-[#6b6b6b] hover:text-[#E8E8EA] transition">Inventory</Link>
          <Link href="/home" className="text-xs text-[#6b6b6b] hover:text-[#E8E8EA] transition">View Store</Link>
          <button onClick={handleLogout} className="text-xs text-[#6b6b6b] hover:text-red-400 transition">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[#7EC8B8] text-xs uppercase tracking-widest mb-1 font-medium">Driver Applications</p>
            <h2 className="text-3xl font-bold text-[#E8E8EA]">Applicants</h2>
            <p className="text-[#6b6b6b] text-sm mt-1">{applications.length} total · {pendingCount} pending review</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl">
            <p className="text-[#6b6b6b]">No applications yet.</p>
          </div>
        ) : (
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#2B2B2E] text-xs text-[#6b6b6b] uppercase tracking-widest">
              <div className="col-span-3">Applicant</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Vehicle / Availability</div>
              <div className="col-span-1">Applied</div>
              <div className="col-span-2">Status</div>
            </div>

            {applications.map((app) => (
              <div key={app._id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#2B2B2E] items-center last:border-0">
                <div className="col-span-3">
                  <p className="font-medium text-[#E8E8EA] text-sm">{app.name}</p>
                  {app.message && <p className="text-xs text-[#6b6b6b] mt-0.5 truncate">{app.message}</p>}
                </div>
                <div className="col-span-2 text-xs text-[#6b6b6b]">
                  <p>{app.email}</p>
                  <p>{app.phone}</p>
                </div>
                <div className="col-span-2 text-xs text-[#6b6b6b]">{app.city || "—"}</div>
                <div className="col-span-2 text-xs text-[#6b6b6b]">
                  <p>{app.vehicleType || "—"}</p>
                  <p>{app.availability || "—"}</p>
                </div>
                <div className="col-span-1 text-xs text-[#6b6b6b]">
                  {new Date(app.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  <select
                    value={app.status}
                    onChange={e => updateStatus(app, e.target.value)}
                    className={`rounded-full px-3 py-1 text-xs font-bold focus:outline-none transition ${statusColor(app.status)}`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} className="bg-[#1C1C1E] text-[#E8E8EA]">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
