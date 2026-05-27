"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useWishlist } from "../WishlistContext"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const { setOpen, wishlist } = useWishlist()

  useEffect(() => {
    const current = localStorage.getItem("fitdrop_order")
    if (current) {
      const parsed = JSON.parse(current)
      if (!parsed.date) parsed.date = new Date().toISOString()
      const existing = localStorage.getItem("fitdrop_orders")
      const allOrders = existing ? JSON.parse(existing) : []
      const alreadySaved = allOrders.find((o: any) => o.total === parsed.total && o.date === parsed.date)
      if (!alreadySaved) {
        allOrders.unshift(parsed)
        localStorage.setItem("fitdrop_orders", JSON.stringify(allOrders))
      }
      setOrders(allOrders)
    } else {
      const existing = localStorage.getItem("fitdrop_orders")
      if (existing) setOrders(JSON.parse(existing))
    }
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Recent"
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b] items-center">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <Link href="/new-drops" className="hover:text-[#E8E8EA] transition">New Drops</Link>
          <button
            onClick={() => setOpen(true)}
            className="relative hover:text-[#E8E8EA] transition flex items-center gap-1"
          >
            ♡
            {wishlist.length > 0 && (
              <span className="bg-red-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                {wishlist.length}
              </span>
            )}
          </button>
          <Link href="/cart" className="hover:text-[#E8E8EA] transition">Cart</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[#7EC8B8] uppercase tracking-widest text-xs mb-2 font-medium">Your Account</p>
          <h2 className="text-4xl font-bold text-[#E8E8EA]">Order History</h2>
          <p className="text-[#6b6b6b] mt-2 text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-6xl mb-6">🛍️</p>
            <h3 className="text-xl font-semibold text-[#E8E8EA] mb-2">No orders yet</h3>
            <p className="text-[#6b6b6b] text-sm mb-8">Your order history will appear here after your first purchase</p>
            <Link
              href="/home"
              className="bg-[#7EC8B8] text-[#0D0D0F] px-6 py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition text-sm"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders list */}
        <div className="flex flex-col gap-6">
          {orders.map((order: any, i: number) => (
            <div key={i} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 hover:border-[#7EC8B8] transition">

              {/* Order header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-1">Order #{orders.length - i}</p>
                  <p className="text-sm text-[#6b6b6b]">{formatDate(order.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#7EC8B8]">${order.total}</p>
                  <span className="text-xs bg-[#7EC8B8] text-[#0D0D0F] px-2 py-0.5 rounded-full font-bold">
                    Delivered ✓
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3 mb-5">
                {order.items?.map((item: any, j: number) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2B2B2E] rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-sm">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8E8EA] truncate">{item.name}</p>
                      <p className="text-xs text-[#6b6b6b]">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#E8E8EA] shrink-0">
                      ${(parseFloat(item.price.replace("$", "")) * item.qty).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Delivery address */}
              {order.address && (
                <div className="border-t border-[#2B2B2E] pt-4 flex items-start gap-2">
                  <span className="text-sm">📍</span>
                  <p className="text-xs text-[#6b6b6b]">
                    Delivered to {order.address.firstName} {order.address.lastName} — {order.address.street}{order.address.apt ? `, ${order.address.apt}` : ""}, {order.address.city}
                  </p>
                </div>
              )}

              {/* Shop again */}
              <div className="mt-4">
                <Link
                  href="/home"
                  className="text-xs text-[#7EC8B8] border border-[#7EC8B8] px-4 py-2 rounded-full hover:bg-[#7EC8B8] hover:text-[#0D0D0F] transition font-semibold"
                >
                  Shop Again →
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  )
}