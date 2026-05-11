"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "../CartContext"

export default function CartPage() {
  const { cart, removeFromCart, total } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    router.push("/checkout")
  }

  const delivery = 3.99
  const tax = total * 0.08875
  const orderTotal = total + delivery + tax

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b]">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <Link href="/new-drops" className="hover:text-[#E8E8EA] transition">New Drops</Link>
          <Link href="/cart" className="text-[#7EC8B8]">Cart</Link>
        </div>
      </nav>

      <div className="px-8 py-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-[#E8E8EA]">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b6b6b] text-lg mb-2">Your cart is empty</p>
            <p className="text-[#2B2B2E] text-sm mb-8">Add items from your favorite stores to get started</p>
            <Link
              href="/home"
              className="bg-[#7EC8B8] text-[#0D0D0F] px-8 py-3 rounded-full font-bold hover:bg-[#22b8a4] transition inline-block"
            >
              Browse Stores
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-4 mb-8">
              {cart.map((item: any) => (
                <div
                  key={`${item.store}-${item.id}`}
                  className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-[#E8E8EA]">{item.name}</p>
                    <p className="text-[#6b6b6b] text-sm mt-0.5">{item.store} · Qty: {item.qty}</p>
                    <p className="text-[#7EC8B8] text-sm mt-1 font-medium">{item.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.store)}
                    className="text-[#6b6b6b] hover:text-red-400 text-sm transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 mb-6">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Subtotal</span><span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Delivery</span><span>${delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Tax (NYC)</span><span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#E8E8EA] text-base mt-2 border-t border-[#2B2B2E] pt-3">
                  <span>Total</span>
                  <span className="text-[#7EC8B8]">${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#7EC8B8] text-[#0D0D0F] py-4 rounded-full font-bold text-lg hover:bg-[#22b8a4] transition"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </main>
  )
}