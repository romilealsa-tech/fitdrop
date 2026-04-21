"use client"
import { useCart } from "../CartContext"

export default function CartPage() {
  const { cart, removeFromCart, total } = useCart()

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-zinc-800">
        <a href="/" className="text-2xl font-bold tracking-widest">FIT DROP</a>
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="/">Stores</a>
          <a href="#">New Drops</a>
          <a href="/cart" className="text-white">Cart</a>
        </div>
      </nav>

      <div className="px-8 py-8 max-w-2xl mx-auto">
        <a href="/" className="text-zinc-500 text-sm hover:text-white mb-6 inline-block">← Back to Stores</a>
        <h2 className="text-3xl font-bold mb-8">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg mb-4">Your cart is empty</p>
            <a href="/" className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-zinc-200 inline-block">
              Browse Stores
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-8">
              {cart.map((item: any) => (
                <div key={`${item.store}-${item.id}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-zinc-400 text-sm">{item.store} · Qty: {item.qty}</p>
                    <p className="text-white text-sm mt-1">{item.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.store)}
                    className="text-zinc-500 hover:text-white text-sm transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="flex justify-between text-lg font-semibold mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition">
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}