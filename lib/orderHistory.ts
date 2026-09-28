// Customer order history kept in the browser (localStorage).
// One entry per order, identified by `id` (the server order id / tracking token).

const HISTORY_KEY = "fitdrop_orders"
const CURRENT_KEY = "fitdrop_order"

export type StoredOrder = {
  id: string
  date: string
  items: any[]
  total: string
  address: any
  billing?: any
  trackingToken?: string | null
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

// Older entries had no id — identify them by their contents so duplicates collapse.
const keyOf = (o: any) =>
  o.id || o.trackingToken ||
  `${o.total}|${(o.items || []).map((i: any) => `${i.name}x${i.qty}`).join(",")}|${o.address?.street || ""}`

function dedupe(list: any[]) {
  const seen = new Set<string>()
  return list.filter(o => {
    const k = keyOf(o)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Called once at checkout, right after payment succeeds. */
export function saveOrder(order: Omit<StoredOrder, "id" | "date"> & { id?: string | null }) {
  const entry: StoredOrder = {
    ...order,
    id: order.id || order.trackingToken || `local-${Date.now()}`,
    date: new Date().toISOString(),
  }
  const history = dedupe([entry, ...read<any[]>(HISTORY_KEY, [])])
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  localStorage.setItem(CURRENT_KEY, JSON.stringify(entry))
  return entry
}

/** Order history, newest first, without duplicates (also cleans up old duplicated entries). */
export function loadOrders(): StoredOrder[] {
  let history = read<any[]>(HISTORY_KEY, [])
  // Legacy: a "current order" saved by old versions that never made it into history
  const current = read<any>(CURRENT_KEY, null)
  if (current) history = [current, ...history]
  const clean = dedupe(history)
  if (clean.length !== history.length || current) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(clean))
  }
  return clean
}

/** The order just placed (for the confirmation page). */
export function loadCurrentOrder(): StoredOrder | null {
  return read<StoredOrder | null>(CURRENT_KEY, null)
}
