// Placeholder imagery for FitDrop while the real brand catalogs are not synced yet.
//
// Every product already has an `images: string[]` field in MongoDB. When a real
// brand is connected (Shopify sync), those URLs are used automatically and
// nothing in this file is needed. Until then, each product gets a curated,
// deterministic set of editorial fashion photos (same product = same photos on
// every page), chosen by garment type from the product name.
//
// All photos come from Unsplash and were hand-picked to avoid visible third-party
// logos, so a "Zara" product never shows another brand's logo.

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const P = {
  hangerTees: "1523381210434-271e8be1f52b",
  whiteTee: "1521572163474-6864f9cf17ab",
  foldedTees: "1562157873-818bc0726f68",
  blackTeeHanger: "1618354691373-d851c5c3a990",
  stripedShirt: "1583496661160-fb5886a0aaaa",
  knitFlatlay: "1556905055-8f358a7a47b2",
  whiteSweatshirt: "1620799140408-edc6dcb6d633",
  knitRack: "1604644401890-0bd678c83788",
  knitPoncho: "1434389677669-e08b4cac3105",
  neutralRack: "1558769132-cb1aea458c5e",
  leatherJacket: "1551028719-00167b16eac5",
  bomber: "1591047139829-d91aecb6caea",
  leatherJacketMan: "1487222477894-8943e31ef7b2",
  plaidCoat: "1485968579580-b6d095142e6e",
  pinkCoat: "1485462537746-965f33f7f6a7",
  denimJacket: "1516257984-b1b4d707412e",
  navySuit: "1507679799987-c73779587ccf",
  blueBlazer: "1617137968427-85924c800a22",
  checkSuit: "1594938298603-c8148c4dae35",
  darkRack: "1555529669-e69e7aa0ba9a",
  chinos: "1473966968600-fa801b869a1a",
  pinkTrousers: "1594633312681-425c7b97ccd1",
  darkJeans: "1624378439575-d8705ad7ae80",
  hangingJeans: "1576995853123-5a10305d93c0",
  patchJeans: "1541099649105-f69ad21f3246",
  stripedPants: "1509631179647-0177331693ae",
  redDress: "1595777457583-95e059d581b8",
  blouseRack: "1490481651871-ab68de25d43d",
  pastelRack: "1512436991641-6745cdb1723f",
  closet: "1567401893414-76b7b1e5a7a5",
  denimShorts: "1591195853828-11db59a44f6b",
  leatherShoes: "1614252235316-8c857d38b5f4",
  warmRack: "1445205170230-053b83016050",
  heels: "1543163521-1bf539c55dd2",
  nikeRed: "1542291026-7eec264c27ff",
  nikeWhite: "1460353581641-37baddab0fa2",
  nikeAirMax: "1600185365483-26d7a4cc7519",
  redBag: "1584917865442-de89df76afd3",
  backpack: "1553062407-98eeb64c6a62",
  sunglasses: "1511499767150-a48a237f0083",
  storeWindow: "1441984904996-e0b6ba687e04",
  shoppingWoman: "1483985988355-763728e1935b",
  streetMan: "1516826957135-700dedea698c",
  graphicTee: "1503342217505-b0a15ec3261c",
} as const

type Kind =
  | "dress" | "skirt" | "shorts" | "tailoring" | "outerwear" | "knit"
  | "bottoms" | "tops" | "shoes" | "bags" | "accessories" | "general"

const POOLS: Record<Kind, string[]> = {
  dress: [P.redDress, P.blouseRack, P.pastelRack, P.closet],
  skirt: [P.stripedShirt, P.pastelRack, P.blouseRack, P.closet],
  shorts: [P.denimShorts, P.chinos, P.hangingJeans, P.closet],
  tailoring: [P.blueBlazer, P.navySuit, P.checkSuit, P.darkRack],
  outerwear: [P.leatherJacket, P.bomber, P.plaidCoat, P.pinkCoat, P.leatherJacketMan, P.denimJacket],
  knit: [P.knitFlatlay, P.whiteSweatshirt, P.knitRack, P.knitPoncho, P.neutralRack],
  bottoms: [P.chinos, P.darkJeans, P.pinkTrousers, P.hangingJeans, P.patchJeans, P.stripedPants],
  tops: [P.whiteTee, P.foldedTees, P.hangerTees, P.blackTeeHanger],
  shoes: [P.leatherShoes, P.heels, P.closet],
  bags: [P.redBag, P.backpack, P.shoppingWoman],
  accessories: [P.sunglasses, P.redBag, P.darkRack],
  general: [P.storeWindow, P.darkRack, P.neutralRack, P.warmRack, P.closet, P.pastelRack],
}

// Nike sells Nike sneakers, so its shoes can show real Nike product shots.
const NIKE_SHOES = [P.nikeAirMax, P.nikeWhite, P.nikeRed]

const RULES: [Kind, RegExp][] = [
  ["dress", /dress|gown/i],
  ["skirt", /skirt/i],
  ["shorts", /shorts?\b/i],
  ["tailoring", /blazer|suit|tailored jacket/i],
  ["shoes", /sneaker|shoe|boot|air max|air force|loafer|heel|sandal|trainer/i],
  ["outerwear", /coat|jacket|trench|puffer|parka|windrunner|bomber|overcoat|anorak/i],
  ["knit", /knit|sweater|hoodie|fleece|pullover|turtleneck|crewneck|half-zip|cardigan|merino/i],
  ["bottoms", /jean|trouser|pant|chino|cargo|legging|jogger/i],
  ["bags", /bag|tote|backpack|clutch|purse/i],
  ["accessories", /belt|sunglass|cap\b|hat\b|scarf|beanie|wallet|jewel|watch/i],
  ["tops", /tee|t-shirt|tank|shirt|blouse|top|polo|cami/i],
]

export function productKind(name = ""): Kind {
  for (const [kind, re] of RULES) if (re.test(name)) return kind
  return "general"
}

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

type ProductLike = {
  _id?: string
  id?: string | number
  name?: string
  slug?: string
  store?: string
  images?: string[]
}

/** 4 image URLs for a product: its real images if it has them, else curated placeholders. */
export function getProductImages(p: ProductLike, count = 4): string[] {
  const real = (p.images || []).filter(Boolean)
  if (real.length > 0) return real.slice(0, Math.max(count, real.length))

  const kind = productKind(p.name)
  const isNike = (p.slug || p.store || "").toLowerCase() === "nike"
  const pool = kind === "shoes" && isNike ? NIKE_SHOES : POOLS[kind]
  const start = hash(String(p._id ?? p.id ?? p.name ?? "")) % pool.length

  const picks: string[] = []
  for (let i = 0; picks.length < count && i < pool.length; i++) {
    picks.push(pool[(start + i) % pool.length])
  }
  for (let i = 0; picks.length < count; i++) {
    const extra = POOLS.general[(start + i) % POOLS.general.length]
    if (!picks.includes(extra)) picks.push(extra)
  }
  return picks.map(id => U(id))
}

/** Main image for a product card / thumbnail. */
export function getProductImage(p: ProductLike): string {
  return getProductImages(p, 1)[0]
}

/** Cover photo for each store card. */
export const STORE_COVERS: Record<string, string> = {
  zara: U(P.storeWindow, 900),
  uniqlo: U(P.foldedTees, 900),
  hm: U(P.streetMan, 900),
  nike: U(P.nikeAirMax, 900),
  cos: U(P.neutralRack, 900),
  mango: U(P.plaidCoat, 900),
  marlow: U(P.pastelRack, 900),
}

export function getStoreCover(slug: string): string {
  return STORE_COVERS[slug] || U(P.storeWindow, 900)
}

/** Editorial images for the New Drops page, keyed by store slug. */
export const DROP_IMAGES: Record<string, string> = {
  zara: U(P.shoppingWoman),
  nike: U(P.nikeWhite),
  uniqlo: U(P.hangerTees),
  hm: U(P.graphicTee),
  cos: U(P.darkRack),
  mango: U(P.redDress),
  marlow: U(P.blouseRack),
}

/** Hero / fallback image. */
export const HERO_IMAGE = U(P.storeWindow, 1600)
