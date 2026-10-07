import mongoose from "mongoose"

const PointSchema = new mongoose.Schema({ lat: Number, lng: Number }, { _id: false })

const OrderSchema = new mongoose.Schema({
  items: [{
    store: String, slug: String, name: String, price: String, qty: Number,
  }],
  total: { type: String, required: true },
  address: {
    firstName: String, lastName: String, email: String, phone: String,
    street: String, apt: String, city: String, state: String, zip: String,
  },
  store: { type: String, default: "" }, // slug of the pickup store (MVP: first item's store)
  pickupAddress: { type: String, default: "" },
  pickupLocationId: { type: String, default: "" }, // e.g. "zara-hudson-yards" (nearest location with stock)
  pickupName: { type: String, default: "" },       // e.g. "Zara Hudson Yards"
  dropoffAddress: { type: String, default: "" },
  // Map coordinates (Google Maps). dropoffLocation comes from Places autocomplete at checkout.
  pickupLocation: { type: PointSchema, default: null },
  dropoffLocation: { type: PointSchema, default: null },
  // Last position shared by the driver's phone while the delivery is active
  driverLocation: {
    type: new mongoose.Schema({ lat: Number, lng: Number, updatedAt: Date }, { _id: false }),
    default: null,
  },
  // Unguessable id for the customer's public tracking link (/track/<token>)
  trackingToken: { type: String, index: true, default: null },
  // One checkout with items from several stores = several pickup orders sharing a groupId
  groupId: { type: String, index: true, default: "" }, // = Stripe PaymentIntent id for paid orders
  pickupCount: { type: Number, default: 1 },
  // "Fast delivery" add-on: shown as PRIORITY and first in the driver's list
  priority: { type: Boolean, default: false },
  // Clerk user id of the customer who paid (empty for guest checkouts)
  customerUserId: { type: String, index: true, default: "" },
  status: { type: String, default: "placed" }, // placed | assigned | picked_up | delivered
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "DriverApplication", default: null },
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
