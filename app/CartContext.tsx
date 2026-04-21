"use client"
import { createContext, useContext, useState } from "react"

const CartContext = createContext<any>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([])

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.store === item.store)
      if (existing) {
        return prev.map((i) => i.id === item.id && i.store === item.store ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (id: number, store: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.store === store)))
  }

  const total = cart.reduce((sum, i) => sum + parseFloat(i.price.replace("$", "")) * i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}