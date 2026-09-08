import mongoose from "mongoose"

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
  dropoffAddress: { type: String, default: "" },
  status: { type: String, default: "placed" }, // placed | assigned | picked_up | delivered
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "DriverApplication", default: null },
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
