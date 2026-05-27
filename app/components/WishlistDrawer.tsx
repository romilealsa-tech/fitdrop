"use client"
import { useWishlist } from "../WishlistContext"
import Link from "next/link"
import { useCart } from "../CartContext"

export default function WishlistDrawer() {
  const { wishlist, removeFromWishlist, open, setOpen } = useWishlist()
  const { addToCart } = useCart()

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0D0D0F] border-l border-[#2B2B2E] z-50 transform transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2B2B2E]">
          <div>
            <h2 className="text-lg font-bold text-[#E8E8EA]">Wishlist</h2>
            <p className="text-xs text-[#6b6b6b]">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-[#6b6b6b] hover:text-[#E8E8EA] transition text-xl">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-4xl mb-4">🤍</p>
              <p className="text-[#E8E8EA] font-semibold mb-2">Your wishlist is empty</p>
              <p className="text-[#6b6b6b] text-sm mb-6">Save items you love while browsing</p>
              <button
                onClick={() => setOpen(false)}
                className="bg-[#7EC8B8] text-[#0D0D0F] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#6ab5a5] transition"
              >
                Browse Stores
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {wishlist.map((product: any) => (
                <div key={product._id} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-4 flex gap-4">
                  {/* Image placeholder */}
                  <div className="w-16 h-16 bg-[#2B2B2E] rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/stores/${product.slug}/${product._id}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-semibold text-[#E8E8EA] hover:text-[#7EC8B8] transition truncate block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#6b6b6b] mt-0.5">{product.store}</p>
                    <p className="text-sm font-bold text-[#7EC8B8] mt-1">{product.price}</p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          addToCart({ ...product, id: product._id, selectedSize: product.sizes?.[0] || "", selectedColor: product.colors?.[0] || "" })
                          removeFromWishlist(product._id)
                        }}
                        className="text-xs bg-[#7EC8B8] text-[#0D0D0F] px-3 py-1.5 rounded-full font-bold hover:bg-[#6ab5a5] transition"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        className="text-xs border border-[#2B2B2E] text-[#6b6b6b] px-3 py-1.5 rounded-full hover:border-red-500 hover:text-red-400 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}