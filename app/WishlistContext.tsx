"use client"
import { createContext, useContext, useState, useEffect } from "react"

const WishlistContext = createContext<any>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("fitdrop_wishlist")
    if (saved) setWishlist(JSON.parse(saved))
  }, [])

  const addToWishlist = (product: any) => {
    const already = wishlist.find(p => p._id === product._id)
    if (already) return
    const newList = [...wishlist, product]
    setWishlist(newList)
    localStorage.setItem("fitdrop_wishlist", JSON.stringify(newList))
  }

  const removeFromWishlist = (productId: string) => {
    const newList = wishlist.filter(p => p._id !== productId)
    setWishlist(newList)
    localStorage.setItem("fitdrop_wishlist", JSON.stringify(newList))
  }

  const isWishlisted = (productId: string) => wishlist.some(p => p._id === productId)

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted, open, setOpen }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}