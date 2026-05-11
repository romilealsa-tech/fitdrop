"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const steps = [
  { id: 1, label: "Order Placed", icon: "🛍️", desc: "Your order has been received" },
  { id: 2, label: "Preparing", icon: "👗", desc: "The store is getting your items ready" },
  { id: 3, label: "Out for Delivery", icon: "🛵", desc: "Your rider is on the way" },
  { id: 4, label: "Delivered", icon: "✅", desc: "Enjoy your new fit!" },
]

export default function OrderPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem("fitdrop_order")
    if (saved) setOrderDetails(JSON.parse(saved))

    const timers = [
      setTimeout(() => setCurrentStep(2), 3000),
      setTimeout(() => setCurrentStep(3), 7000),
      setTimeout(() => setCurrentStep(4), 12000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</Link>
        <Link href="/home" className="text-[#6b6b6b] text-sm hover:text-[#E8E8EA] transition">Back to Stores</Link>
      </nav>

      <div className="max-w-lg mx-auto px-8 py-12">
        <p className="text-[#2DD4BF] uppercase tracking-widest text-xs mb-2 font-medium">Order Confirmed</p>
        <h2 className="text-3xl font-bold mb-2 text-[#E8E8EA]">Track Your Drop 🛵</h2>
        <p className="text-[#6b6b6b] text-sm mb-10">Estimated delivery: 30-45 minutes</p>

        {/* Order summary card */}
        {orderDetails && (
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 mb-8">
            <h3 className="font-semibold mb-4 text-[#E8E8EA]">Order Summary</h3>
            {orderDetails.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm mb-2">
                <span className="text-[#6b6b6b]">{item.name} × {item.qty}</span>
                <span className="text-[#E8E8EA]">${(parseFloat(item.price.replace("$", "")) * item.qty).toFixed(2)}</span>
              </div>
            ))}
            {orderDetails.address && (
              <div className="border-t border-[#2B2B2E] mt-4 pt-4 text-sm text-[#6b6b6b]">
                <p className="text-[#E8E8EA] font-semibold mb-1">Delivering to</p>
                <p>{orderDetails.address.firstName} {orderDetails.address.lastName}</p>
                <p>{orderDetails.address.street}{orderDetails.address.apt ? `, ${orderDetails.address.apt}` : ""}</p>
                <p>{orderDetails.address.city}, {orderDetails.address.state} {orderDetails.address.zip}</p>
              </div>
            )}
            <div className="border-t border-[#2B2B2E] mt-4 pt-4 flex justify-between font-bold">
              <span className="text-[#E8E8EA]">Total</span>
              <span className="text-[#2DD4BF]">${orderDetails.total}</span>
            </div>
          </div>
        )}

        {/* Progress tracker */}
        <div className="flex flex-col gap-0">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id
            const isActive = currentStep === step.id
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                    isCompleted ? "bg-[#2DD4BF] text-[#0D0D0F]" :
                    isActive ? "bg-[#2DD4BF] text-[#0D0D0F] animate-pulse" :
                    "bg-[#1C1C1E] text-[#6b6b6b]"
                  }`}>
                    {step.icon}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-12 transition-all duration-500 ${
                      isCompleted ? "bg-[#2DD4BF]" : "bg-[#2B2B2E]"
                    }`} />
                  )}
                </div>
                <div className="pt-2 pb-12">
                  <p className={`font-semibold transition-all duration-500 ${
                    isActive ? "text-[#E8E8EA]" :
                    isCompleted ? "text-[#6b6b6b]" :
                    "text-[#2B2B2E]"
                  }`}>{step.label}</p>
                  <p className={`text-sm transition-all duration-500 ${
                    isActive ? "text-[#6b6b6b]" : "text-[#2B2B2E]"
                  }`}>{step.desc}</p>
                  {isActive && (
                    <span className="inline-block mt-1 text-xs bg-[#2DD4BF] text-[#0D0D0F] px-2 py-0.5 rounded-full font-bold">
                      In progress
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <Link
          href="/home"
          className="block w-full bg-[#2DD4BF] text-[#0D0D0F] py-4 rounded-full font-bold text-center hover:bg-[#22b8a4] transition mt-4"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}