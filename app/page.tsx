"use client"
import { useState } from "react"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { signIn, setActive: setActiveSignIn } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  const router = useRouter()

  const handleSubmit = async () => {
    setError("")
    setLoading(true)

    try {
      if (mode === "signin") {
        const result = await signIn?.create({
          identifier: email,
          password,
        })
        if (result?.status === "complete") {
          await setActiveSignIn?.({ session: result.createdSessionId })
          router.push("/home")
        }
      } else {
        const result = await signUp?.create({
          emailAddress: email,
          password,
          firstName: name.split(" ")[0],
          lastName: name.split(" ")[1] || "",
        })
        if (result?.status === "complete") {
          await setActiveSignUp?.({ session: result.createdSessionId })
          router.push("/home")
        } else {
          await signUp?.prepareEmailAddressVerification()
          setError("Check your email to verify your account!")
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Something went wrong. Try again.")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-widest mb-2">FIT DROP</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Fashion. Delivered.</p>
        </div>

        <div className="flex bg-zinc-900 rounded-full p-1 mb-8">
          <button
            onClick={() => { setMode("signin"); setError("") }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${mode === "signin" ? "bg-white text-black" : "text-zinc-400"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("signup"); setError("") }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${mode === "signup" ? "bg-white text-black" : "text-zinc-400"}`}
          >
            Sign Up
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-white text-black py-3 rounded-full font-bold hover:bg-zinc-200 transition mt-2 disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </div>

        {mode === "signin" && (
          <p className="text-center text-zinc-500 text-xs mt-6">
            Don't have an account?{" "}
            <button onClick={() => setMode("signup")} className="text-white underline">Sign Up</button>
          </p>
        )}
        {mode === "signup" && (
          <p className="text-center text-zinc-500 text-xs mt-6">
            Already have an account?{" "}
            <button onClick={() => setMode("signin")} className="text-white underline">Sign In</button>
          </p>
        )}
      </div>
    </main>
  )
}