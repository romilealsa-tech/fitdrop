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
  status: { type: String, default: "placed" }, // placed | assigned | picked_up | delivered
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "DriverApplication", default: null },
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
