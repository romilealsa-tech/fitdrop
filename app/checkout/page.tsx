"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "../CartContext"

type Step = "address" | "payment" | "review"

export default function CheckoutPage() {
  const { cart, total } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<Step>("address")

  const [address, setAddress] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    street: "", apt: "", city: "New York", state: "NY", zip: "",
  })

  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true)

  const [billing, setBilling] = useState({
    firstName: "", lastName: "",
    street: "", apt: "", city: "New York", state: "NY", zip: "",
  })

  const [payment, setPayment] = useState({
    cardNumber: "", cardName: "", expiry: "", cvv: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAddress = () => {
    const e: Record<string, string> = {}
    if (!address.firstName) e.firstName = "Required"
    if (!address.lastName) e.lastName = "Required"
    if (!address.email || !address.email.includes("@")) e.email = "Valid email required"
    if (!address.phone) e.phone = "Required"
    if (!address.street) e.street = "Required"
    if (!address.zip || address.zip.length < 5) e.zip = "Valid ZIP required"
    if (!billingSameAsDelivery) {
      if (!billing.firstName) e.billingFirstName = "Required"
      if (!billing.lastName) e.billingLastName = "Required"
      if (!billing.street) e.billingStreet = "Required"
      if (!billing.zip || billing.zip.length < 5) e.billingZip = "Valid ZIP required"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePayment = () => {
    const e: Record<string, string> = {}
    if (!payment.cardName) e.cardName = "Required"
    if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Valid card number required"
    if (!payment.expiry || !payment.expiry.includes("/")) e.expiry = "Format: MM/YY"
    if (!payment.cvv || payment.cvv.length < 3) e.cvv = "Valid CVV required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const formatCard = (val: string) => {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
  }

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4)
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2)
    return clean
  }

  const effectiveBilling = billingSameAsDelivery ? {
    firstName: address.firstName,
    lastName: address.lastName,
    street: address.street,
    apt: address.apt,
    city: address.city,
    state: address.state,
    zip: address.zip,
  } : billing

  const handlePlaceOrder = () => {
    localStorage.setItem("fitdrop_order", JSON.stringify({
      items: cart,
      total: total.toFixed(2),
      address,
      billing: effectiveBilling,
    }))
    router.push("/order")
  }

  const delivery = 3.99
  const tax = total * 0.08875
  const orderTotal = total + delivery + tax

  const inputClass = (field: string) =>
    `w-full bg-zinc-900 border ${errors[field] ? "border-red-500" : "border-zinc-700"} rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-white transition`

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest">FIT DROP</Link>
        <Link href="/cart" className="text-zinc-500 text-sm hover:text-white transition">← Back to Cart</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Steps */}
        <div className="lg:col-span-2">

          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-10">
            {(["address", "payment", "review"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-sm font-semibold ${
                  step === s ? "text-white" :
                  (s === "payment" && step === "review") ? "text-zinc-400" :
                  "text-zinc-600"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s ? "bg-white text-black" :
                    (s === "payment" && step === "review") ? "bg-zinc-700 text-white" :
                    "bg-zinc-800 text-zinc-500"
                  }`}>{i + 1}</div>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </div>
                {i < 2 && <div className="w-8 h-px bg-zinc-700" />}
              </div>
            ))}
          </div>

          {/* ADDRESS STEP */}
          {step === "address" && (
            <div>
              {/* Delivery Address */}
              <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    className={inputClass("firstName")}
                    placeholder="First name"
                    value={address.firstName}
                    onChange={e => setAddress({ ...address, firstName: e.target.value })}
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <input
                    className={inputClass("lastName")}
                    placeholder="Last name"
                    value={address.lastName}
                    onChange={e => setAddress({ ...address, lastName: e.target.value })}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    className={inputClass("email")}
                    placeholder="Email"
                    type="email"
                    value={address.email}
                    onChange={e => setAddress({ ...address, email: e.target.value })}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input
                    className={inputClass("phone")}
                    placeholder="Phone number"
                    value={address.phone}
                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="mb-4">
                <input
                  className={inputClass("street")}
                  placeholder="Street address"
                  value={address.street}
                  onChange={e => setAddress({ ...address, street: e.target.value })}
                />
                {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <input
                  className={inputClass("apt")}
                  placeholder="Apt / Unit (optional)"
                  value={address.apt}
                  onChange={e => setAddress({ ...address, apt: e.target.value })}
                />
                <input
                  className={inputClass("city")}
                  placeholder="City"
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                />
                <div>
                  <input
                    className={inputClass("zip")}
                    placeholder="ZIP code"
                    value={address.zip}
                    onChange={e => setAddress({ ...address, zip: e.target.value })}
                  />
                  {errors.zip && <p className="text-red-400 text-xs mt-1">{errors.zip}</p>}
                </div>
              </div>

              {/* Billing Address */}
              <div className="border-t border-zinc-800 pt-8 mb-6">
                <h2 className="text-2xl font-bold mb-4">Billing Address</h2>

                {/* Same as delivery checkbox */}
                <label className="flex items-center gap-3 cursor-pointer mb-6 group">
                  <div
                    onClick={() => {
                      setBillingSameAsDelivery(!billingSameAsDelivery)
                      setErrors({})
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      billingSameAsDelivery
                        ? "bg-white border-white"
                        : "bg-transparent border-zinc-500 group-hover:border-zinc-300"
                    }`}
                  >
                    {billingSameAsDelivery && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => {
                      setBillingSameAsDelivery(!billingSameAsDelivery)
                      setErrors({})
                    }}
                    className="text-sm text-zinc-300"
                  >
                    Same as delivery address
                  </span>
                </label>

                {/* Billing fields — only show if different */}
                {!billingSameAsDelivery && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <input
                          className={inputClass("billingFirstName")}
                          placeholder="First name"
                          value={billing.firstName}
                          onChange={e => setBilling({ ...billing, firstName: e.target.value })}
                        />
                        {errors.billingFirstName && <p className="text-red-400 text-xs mt-1">{errors.billingFirstName}</p>}
                      </div>
                      <div>
                        <input
                          className={inputClass("billingLastName")}
                          placeholder="Last name"
                          value={billing.lastName}
                          onChange={e => setBilling({ ...billing, lastName: e.target.value })}
                        />
                        {errors.billingLastName && <p className="text-red-400 text-xs mt-1">{errors.billingLastName}</p>}
                      </div>
                    </div>
                    <div className="mb-4">
                      <input
                        className={inputClass("billingStreet")}
                        placeholder="Street address"
                        value={billing.street}
                        onChange={e => setBilling({ ...billing, street: e.target.value })}
                      />
                      {errors.billingStreet && <p className="text-red-400 text-xs mt-1">{errors.billingStreet}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        className={inputClass("billingApt")}
                        placeholder="Apt / Unit (optional)"
                        value={billing.apt}
                        onChange={e => setBilling({ ...billing, apt: e.target.value })}
                      />
                      <input
                        className={inputClass("billingCity")}
                        placeholder="City"
                        value={billing.city}
                        onChange={e => setBilling({ ...billing, city: e.target.value })}
                      />
                      <div>
                        <input
                          className={inputClass("billingZip")}
                          placeholder="ZIP code"
                          value={billing.zip}
                          onChange={e => setBilling({ ...billing, zip: e.target.value })}
                        />
                        {errors.billingZip && <p className="text-red-400 text-xs mt-1">{errors.billingZip}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { if (validateAddress()) setStep("payment") }}
                className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* PAYMENT STEP */}
          {step === "payment" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment</h2>

              {/* Live card preview */}
              <div className="bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 rounded-2xl p-6 mb-8 h-44 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">FIT DROP</p>
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
                    <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80 -ml-4" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-mono tracking-widest mb-2">
                    {payment.cardNumber || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{payment.cardName || "FULL NAME"}</span>
                    <span>{payment.expiry || "MM/YY"}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <input
                  className={inputClass("cardName")}
                  placeholder="Name on card"
                  value={payment.cardName}
                  onChange={e => setPayment({ ...payment, cardName: e.target.value.toUpperCase() })}
                />
                {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName}</p>}
              </div>
              <div className="mb-4">
                <input
                  className={inputClass("cardNumber")}
                  placeholder="Card number"
                  value={payment.cardNumber}
                  onChange={e => setPayment({ ...payment, cardNumber: formatCard(e.target.value) })}
                />
                {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <input
                    className={inputClass("expiry")}
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={e => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                  />
                  {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <input
                    className={inputClass("cvv")}
                    placeholder="CVV"
                    maxLength={4}
                    value={payment.cvv}
                    onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  />
                  {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep("address")}
                  className="w-full border border-zinc-700 text-white py-4 rounded-full font-bold text-lg hover:border-white transition"
                >
                  Back
                </button>
                <button
                  onClick={() => { if (validatePayment()) setStep("review") }}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* REVIEW STEP */}
          {step === "review" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Review Order</h2>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-zinc-300">Delivery Address</p>
                  <button onClick={() => setStep("address")} className="text-xs text-zinc-500 hover:text-white transition">Edit</button>
                </div>
                <p className="text-sm text-zinc-400">{address.firstName} {address.lastName}</p>
                <p className="text-sm text-zinc-400">{address.street}{address.apt ? `, ${address.apt}` : ""}</p>
                <p className="text-sm text-zinc-400">{address.city}, {address.state} {address.zip}</p>
                <p className="text-sm text-zinc-400 mt-1">{address.phone}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-zinc-300">Billing Address</p>
                  <button onClick={() => setStep("address")} className="text-xs text-zinc-500 hover:text-white transition">Edit</button>
                </div>
                {billingSameAsDelivery ? (
                  <p className="text-sm text-zinc-400">Same as delivery address</p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-400">{billing.firstName} {billing.lastName}</p>
                    <p className="text-sm text-zinc-400">{billing.street}{billing.apt ? `, ${billing.apt}` : ""}</p>
                    <p className="text-sm text-zinc-400">{billing.city}, {billing.state} {billing.zip}</p>
                  </>
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-zinc-300">Payment</p>
                  <button onClick={() => setStep("payment")} className="text-xs text-zinc-500 hover:text-white transition">Edit</button>
                </div>
                <p className="text-sm text-zinc-400">•••• •••• •••• {payment.cardNumber.slice(-4)}</p>
                <p className="text-sm text-zinc-400">{payment.cardName}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("payment")}
                  className="w-full border border-zinc-700 text-white py-4 rounded-full font-bold text-lg hover:border-white transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-5">Order Summary</h3>
            <div className="flex flex-col gap-3 mb-5">
              {cart.map((item: any) => (
                <div key={`${item.store}-${item.id}`} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{item.name} <span className="text-zinc-600">×{item.qty}</span></span>
                  <span>${(parseFloat(item.price.replace("$", "")) * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-700 pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span><span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Delivery</span><span>${delivery.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax (NYC)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-base mt-2 border-t border-zinc-700 pt-3">
                <span>Total</span><span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
              <span>🔒</span>
              <span>Payments are secured and encrypted</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}