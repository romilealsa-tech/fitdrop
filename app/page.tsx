"use client"
import { SignIn, SignUp } from "@clerk/nextjs"
import { useState } from "react"

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="flex bg-zinc-900 rounded-full p-1 mb-4">
        <button
          onClick={() => setMode("signin")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition ${mode === "signin" ? "bg-white text-black" : "text-zinc-400"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition ${mode === "signup" ? "bg-white text-black" : "text-zinc-400"}`}
        >
          Sign Up
        </button>
      </div>

      {mode === "signin" ? (
        <SignIn routing="hash" forceRedirectUrl="/home" />
      ) : (
        <SignUp routing="hash" forceRedirectUrl="/home" />
      )}
    </main>
  )
}