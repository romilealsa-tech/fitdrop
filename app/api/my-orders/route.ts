import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"

// The signed-in customer's orders, newest first. Pickups of the same checkout
// (one per store) are grouped back into a single order.
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ signedIn: false, orders: [] })

    await connectDB()
    const docs = (await Order.find({ customerUserId: userId }).sort({ createdAt: -1 }).limit(200).lean()) as any[]

    const groups = new Map<string, any[]>()
    for (const d of docs) {
      const key = d.groupId || String(d._id)
      groups.set(key, [...(groups.get(key) || []), d])
    }

    const orders = [...groups.entries()].map(([id, list]) => {
      const first = list[0]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, phone, ...address } = first.address || {}
      return {
        id,
        date: first.createdAt,
        total: first.total,
        priority: !!first.priority,
        address,
        items: list.flatMap(o => o.items || []),
        trackingToken: first.trackingToken,
        status: list.every(o => o.status === "delivered") ? "delivered" : list.some(o => o.status === "picked_up") ? "on_the_way" : "preparing",
        pickups: list.map(o => ({ trackingToken: o.trackingToken, storeName: o.pickupName, status: o.status })),
      }
    })

    return NextResponse.json({ signedIn: true, orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
