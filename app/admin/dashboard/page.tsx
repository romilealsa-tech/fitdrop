"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser, useClerk } from "@clerk/nextjs"

type Product = {
  _id: string
  name: string
  price: string
  tag: string
  inStock: boolean
  category: string
  slug: string
  store: string
}

const STORES: { slug: string; name: string }[] = [
  { slug: "zara", name: "Zara" },
  { slug: "uniqlo", name: "Uniqlo" },
  { slug: "hm", name: "H&M" },
  { slug: "nike", name: "Nike" },
  { slug: "cos", name: "COS" },
  { slug: "mango", name: "Mango" },
  { slug: "marlow", name: "Marlow" },
]

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role

  const [storeSlug, setStoreSlug] = useState(STORES[0].slug)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", price: "", tag: "", category: "" })
  const [toast, setToast] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [shopifyToken, setShopifyToken] = useState("")
  const [showSyncForm, setShowSyncForm] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (role !== "admin") {
      router.push("/admin/login")
      return
    }
    fetchProducts(storeSlug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, role, storeSlug])

  const currentStore = STORES.find(s => s.slug === storeSlug) ?? STORES[0]

  const fetchProducts = async (slug: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin?slug=${slug}`)
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const toggleStock = async (product: Product) => {
    setSaving(product._id)
    await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product._id, updates: { inStock: !product.inStock } }),
    })
    setProducts(prev => prev.map(p => p._id === product._id ? { ...p, inStock: !p.inStock } : p))
    setSaving(null)
    showToast(`${product.name} marked as ${!product.inStock ? "in stock" : "out of stock"}`)
  }

  const updatePrice = async (product: Product, newPrice: string) => {
    setSaving(product._id)
    await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product._id, updates: { price: newPrice } }),
    })
    setProducts(prev => prev.map(p => p._id === product._id ? { ...p, price: newPrice } : p))
    setSaving(null)
    showToast(`${product.name} price updated`)
  }

  const updateTag = async (product: Product, newTag: string) => {
    await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product._id, updates: { tag: newTag } }),
    })
    setProducts(prev => prev.map(p => p._id === product._id ? { ...p, tag: newTag } : p))
    showToast(`${product.name} tag updated`)
  }

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete ${product.name}?`)) return
    await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product._id }),
    })
    setProducts(prev => prev.filter(p => p._id !== product._id))
    showToast(`${product.name} deleted`)
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProduct,
        store: currentStore.name,
        slug: currentStore.slug,
        inStock: true,
      }),
    })
    const data = await res.json()
    setProducts(prev => [...prev, data.product])
    setNewProduct({ name: "", price: "", tag: "", category: "" })
    setShowAddForm(false)
    showToast(`${newProduct.name} added successfully`)
  }

  const handleLogout = () => {
    signOut(() => router.push("/home"))
  }

  if (!isLoaded || role !== "admin" || loading) return (
    <main className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
      <div className="text-[#7EC8B8] text-sm uppercase tracking-widest animate-pulse">Loading inventory...</div>
    </main>
  )

  const inStockCount = products.filter(p => p.inStock).length
  const outOfStockCount = products.filter(p => !p.inStock).length

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-[#7EC8B8] text-[#0D0D0F] px-5 py-3 rounded-full text-sm font-bold z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FitDrop</span>
          <span className="text-[#2B2B2E]">|</span>
          <span className="text-sm text-[#7EC8B8] font-medium">Admin Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/applications" className="text-xs text-[#6b6b6b] hover:text-[#E8E8EA] transition">Applications</Link>
          <Link href="/home" className="text-xs text-[#6b6b6b] hover:text-[#E8E8EA] transition">View Store</Link>
          <button onClick={handleLogout} className="text-xs text-[#6b6b6b] hover:text-red-400 transition">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[#7EC8B8] text-xs uppercase tracking-widest mb-1 font-medium">Inventory Management</p>
            <select
              value={storeSlug}
              onChange={e => setStoreSlug(e.target.value)}
              className="bg-transparent text-3xl font-bold text-[#E8E8EA] focus:outline-none -ml-1"
            >
              {STORES.map(s => (
                <option key={s.slug} value={s.slug} className="bg-[#1C1C1E]">{s.name}</option>
              ))}
            </select>
            <p className="text-[#6b6b6b] text-sm mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowSyncForm(!showSyncForm); setShowAddForm(false) }}
              className="border border-[#7EC8B8] text-[#7EC8B8] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#7EC8B8] hover:text-[#0D0D0F] transition"
            >
              ⚡ Sync Shopify
            </button>
            <button
              onClick={() => { setShowAddForm(!showAddForm); setShowSyncForm(false) }}
              className="bg-[#7EC8B8] text-[#0D0D0F] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#22b8a4] transition"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5">
            <p className="text-[#6b6b6b] text-xs uppercase tracking-widest mb-1">Total Products</p>
            <p className="text-3xl font-bold text-[#E8E8EA]">{products.length}</p>
          </div>
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5">
            <p className="text-[#6b6b6b] text-xs uppercase tracking-widest mb-1">In Stock</p>
            <p className="text-3xl font-bold text-[#7EC8B8]">{inStockCount}</p>
          </div>
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5">
            <p className="text-[#6b6b6b] text-xs uppercase tracking-widest mb-1">Out of Stock</p>
            <p className="text-3xl font-bold text-red-400">{outOfStockCount}</p>
          </div>
        </div>

        {/* Shopify Sync Form */}
        {showSyncForm && (
          <div className="bg-[#1C1C1E] border border-[#7EC8B8] rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-[#E8E8EA] mb-1">Sync from Shopify</h3>
            <p className="text-[#6b6b6b] text-sm mb-4">Enter your Shopify access token to sync inventory automatically</p>
            <div className="flex gap-3">
              <input
                className="flex-1 bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
                placeholder="shpat_xxxxxxxxxxxx"
                value={shopifyToken}
                onChange={e => setShopifyToken(e.target.value)}
              />
              <button
                onClick={async () => {
                  setSyncing(true)
                  const res = await fetch("/api/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug: currentStore.slug, accessToken: shopifyToken }),
                  })
                  const data = await res.json()
                  if (data.success) {
                    showToast(`Synced ${data.synced} products from Shopify!`)
                    fetchProducts(currentStore.slug)
                  } else {
                    showToast("Sync failed: " + data.error)
                  }
                  setSyncing(false)
                  setShowSyncForm(false)
                  setShopifyToken("")
                }}
                disabled={syncing || !shopifyToken}
                className="bg-[#7EC8B8] text-[#0D0D0F] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#22b8a4] transition disabled:opacity-50"
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          </div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-[#1C1C1E] border border-[#7EC8B8] rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-[#E8E8EA] mb-4">New Product</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
                placeholder="Product name"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
                placeholder="Price (e.g. $49.99)"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <input
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
                placeholder="Tag (e.g. New, Trending)"
                value={newProduct.tag}
                onChange={e => setNewProduct({ ...newProduct, tag: e.target.value })}
              />
              <input
                className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] transition"
                placeholder="Category"
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={addProduct}
                className="bg-[#7EC8B8] text-[#0D0D0F] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#22b8a4] transition">
                Add Product
              </button>
              <button onClick={() => setShowAddForm(false)}
                className="border border-[#2B2B2E] text-[#6b6b6b] px-6 py-2.5 rounded-full text-sm hover:border-[#E8E8EA] hover:text-[#E8E8EA] transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#2B2B2E] text-xs text-[#6b6b6b] uppercase tracking-widest">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Tag</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {products.map((product) => (
            <div key={product._id} className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#2B2B2E] items-center last:border-0 ${!product.inStock ? "opacity-50" : ""}`}>

              <div className="col-span-4">
                <p className="font-medium text-[#E8E8EA] text-sm">{product.name}</p>
                <p className="text-xs text-[#6b6b6b] mt-0.5">{product.category}</p>
              </div>

              <div className="col-span-2">
                <input
                  defaultValue={product.price}
                  onBlur={e => { if (e.target.value !== product.price) updatePrice(product, e.target.value) }}
                  className="bg-transparent border border-transparent hover:border-[#2B2B2E] focus:border-[#7EC8B8] rounded-lg px-2 py-1 text-sm text-[#E8E8EA] focus:outline-none transition w-full"
                />
              </div>

              <div className="col-span-2">
                <select
                  value={product.tag}
                  onChange={e => updateTag(product, e.target.value)}
                  className="bg-[#0D0D0F] border border-[#2B2B2E] rounded-lg px-2 py-1 text-xs text-[#E8E8EA] focus:outline-none focus:border-[#7EC8B8] transition w-full"
                >
                  <option value="">None</option>
                  <option value="New">New</option>
                  <option value="Trending">Trending</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>

              <div className="col-span-2">
                <button
                  onClick={() => toggleStock(product)}
                  disabled={saving === product._id}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    product.inStock
                      ? "bg-[#7EC8B8]/10 text-[#7EC8B8] hover:bg-[#7EC8B8]/20"
                      : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  {saving === product._id ? "..." : product.inStock ? "In Stock" : "Out of Stock"}
                </button>
              </div>

              <div className="col-span-2">
                <button
                  onClick={() => deleteProduct(product)}
                  className="text-xs text-[#6b6b6b] hover:text-red-400 transition"
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
