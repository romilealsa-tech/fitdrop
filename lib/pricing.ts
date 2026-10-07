// Server-side order pricing. The browser never decides how much is charged:
// prices come from the database, fees from lib/stores.ts.
import mongoose from "mongoose"
import Product from "@/models/Product"
import { deliveryFeeFor, PRIORITY_FEE } from "@/lib/stores"

export const NYC_TAX_RATE = 0.08875
const MAX_QTY_PER_ITEM = 20

export type CartLine = { id: string; qty: number }

const toCents = (dollars: number) => Math.round(dollars * 100)
const parsePrice = (p: string) => parseFloat(String(p).replace(/[^0-9.]/g, "")) || 0

/** Turn whatever the browser sent into clean { id, qty } lines (merging duplicates). */
export function normalizeCart(items: any[]): CartLine[] {
  const qty = new Map<string, number>()
  for (const item of Array.isArray(items) ? items : []) {
    const id = String(item?._id || item?.id || "")
    if (!mongoose.isValidObjectId(id)) continue
    const n = Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.floor(Number(item?.qty) || 1)))
    qty.set(id, Math.min(MAX_QTY_PER_ITEM, (qty.get(id) || 0) + n))
  }
  return [...qty.entries()].map(([id, q]) => ({ id, qty: q })).sort((a, b) => a.id.localeCompare(b.id))
}

export type PricedOrder = {
  lines: (CartLine & { name: string; slug: string; store: string; priceCents: number })[]
  subtotalCents: number
  deliveryCents: number
  priorityCents: number
  taxCents: number
  totalCents: number
}

/**
 * Price a cart from the database. Throws if a product doesn't exist or is out of stock.
 * Same math the checkout shows: items + delivery (per store) + fast delivery + NYC tax on items.
 */
export async function priceCart(lines: CartLine[], priority: boolean): Promise<PricedOrder> {
  if (lines.length === 0) throw new PricingError("Your cart is empty.")
  const products = (await Product.find({ _id: { $in: lines.map(l => l.id) } }).lean()) as any[]
  const byId = new Map(products.map(p => [String(p._id), p]))

  const priced = lines.map(line => {
    const p = byId.get(line.id)
    if (!p) throw new PricingError("An item in your cart is no longer available. Please remove it and try again.")
    if (p.inStock === false) throw new PricingError(`${p.name} is out of stock. Please remove it and try again.`)
    return { ...line, name: p.name, slug: p.slug, store: p.store, priceCents: toCents(parsePrice(p.price)) }
  })

  const subtotalCents = priced.reduce((sum, l) => sum + l.priceCents * l.qty, 0)
  const deliveryCents = toCents(deliveryFeeFor(priced.map(l => ({ slug: l.slug, store: l.store }))))
  const priorityCents = priority ? toCents(PRIORITY_FEE) : 0
  const taxCents = Math.round(subtotalCents * NYC_TAX_RATE)

  return {
    lines: priced,
    subtotalCents,
    deliveryCents,
    priorityCents,
    taxCents,
    totalCents: subtotalCents + deliveryCents + priorityCents + taxCents,
  }
}

export class PricingError extends Error {}

// Stripe metadata values are limited to 500 characters, so the cart is stored
// as "id:qty,id:qty" split across cart_0, cart_1, ... keys.
export function cartToMetadata(lines: CartLine[]): Record<string, string> {
  const encoded = lines.map(l => `${l.id}:${l.qty}`)
  const chunks: string[] = []
  let current = ""
  for (const part of encoded) {
    const next = current ? `${current},${part}` : part
    if (next.length > 490) { chunks.push(current); current = part } else current = next
  }
  if (current) chunks.push(current)
  return Object.fromEntries(chunks.map((c, i) => [`cart_${i}`, c]))
}

export function cartFromMetadata(metadata: Record<string, string>): CartLine[] {
  return Object.keys(metadata)
    .filter(k => k.startsWith("cart_"))
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)))
    .flatMap(k => metadata[k].split(","))
    .filter(Boolean)
    .map(part => {
      const [id, qty] = part.split(":")
      return { id, qty: Number(qty) }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}
