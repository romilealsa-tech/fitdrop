import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getStripe } from "@/lib/stripe"
import { normalizeCart, priceCart, cartToMetadata, PricingError } from "@/lib/pricing"

// Creates the Stripe payment for a cart. The amount is calculated HERE from the
// database — the browser only says which products and how many, never the price.
export async function POST(req: NextRequest) {
  try {
    const { items, priority } = await req.json()
    await connectDB()

    const lines = normalizeCart(items)
    const priced = await priceCart(lines, priority === true)

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: priced.totalCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      // What was paid for — /api/orders checks the order against this after payment
      metadata: { ...cartToMetadata(lines), priority: priority === true ? "1" : "0" },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amounts: {
        subtotal: priced.subtotalCents / 100,
        delivery: priced.deliveryCents / 100,
        priority: priced.priorityCents / 100,
        tax: priced.taxCents / 100,
        total: priced.totalCents / 100,
      },
    })
  } catch (error: any) {
    const status = error instanceof PricingError ? 400 : 500
    return NextResponse.json({ error: error.message }, { status })
  }
}
