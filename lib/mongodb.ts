import mongoose from "mongoose"

let cached = (global as any).mongoose || { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    // Checked lazily (inside the function, not at module load) so that
    // simply *importing* this file — which Next.js does for every route
    // during `next build` — never crashes the whole build if the env var
    // is missing. The error now only surfaces on an actual request that
    // needs the database.
    throw new Error("Please define MONGODB_URI in your environment variables")
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}
