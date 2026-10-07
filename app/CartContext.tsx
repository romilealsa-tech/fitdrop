"use client"
import { createContext, useContext, useEffect, useRef, useState } from "react"

const CartContext = createContext<any>(null)
const STORAGE_KEY = "fitdrop_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([])
  const loaded = useRef(false)

  // Restore the cart saved in this browser (survives reloads and closing the tab)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setCart(parsed)
      }
    } catch {}
    loaded.current = true
  }, [])

  // Save every change (after the first load, so an empty cart doesn't overwrite it)
  useEffect(() => {
    if (!loaded.current) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch {}
  }, [cart])

  // Keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      try { setCart(e.newValue ? JSON.parse(e.newValue) : []) } catch {}
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.store === item.store && i.name === item.name)
      if (existing) {
        return prev.map((i) => i === existing ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (id: any, store: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.store === store)))
  }

  // Empty the cart after a successful payment
  const clearCart = () => setCart([])

  const total = cart.reduce((sum, i) => sum + parseFloat(String(i.price).replace("$", "")) * i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
