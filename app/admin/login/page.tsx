"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function AdminLogin() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const role = (user?.publicMetadata as { role?: string } | undefined)?.role

  useEffect(() => {
    if (isLoaded && role === "admin") {
      router.push("/admin/dashboard")
    }
  }, [isLoaded, role, router])

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <div className="text-[#7EC8B8] text-sm uppercase tracking-widest animate-pulse">Loading...</div>
      </main>
    )
  }

  if (role === "admin") {
    return (
      <main className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <div className="text-[#7EC8B8] text-sm uppercase tracking-widest animate-pulse">Redirecting to dashboard...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-widest mb-4">FitDrop Admin</h1>
        <p className="text-[#6b6b6b] text-sm leading-relaxed">
          {user
            ? <>The account <span className="text-[#E8E8EA]">{user.primaryEmailAddress?.emailAddress}</span> doesn&apos;t have admin access yet.</>
            : "You need to sign in first."}
          <br />Contact the FitDrop team to request access.
        </p>
      </div>
    </main>
  )
}
