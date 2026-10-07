import Stripe from "stripe"

let stripe: Stripe | null = null

/** Lazily created so a missing key only fails the request that needs it, not the build. */
export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("Please define STRIPE_SECRET_KEY in your environment variables")
    stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" })
  }
  return stripe
}
