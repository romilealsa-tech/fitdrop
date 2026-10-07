import mongoose from "mongoose"

const DriverApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, default: "" }, // "Neighborhood, Borough, State" e.g. "SoHo, Manhattan, New York"
  vehicleType: { type: String, default: "" }, // "Bike" | "Motorcycle" | "Car" (older applications may say Scooter / On foot)
  availability: { type: String, default: "" },
  message: { type: String, default: "" },
  status: { type: String, default: "pending" }, // pending | reviewed | approved | rejected
  notifiedStatus: { type: String, default: "" }, // last decision emailed to the driver (approved | rejected)
  available: { type: Boolean, default: true }, // toggled off once assigned an active delivery
  pushSubscription: { type: mongoose.Schema.Types.Mixed, default: null },
  // Login with an emailed 6-digit code (only the hash is stored)
  loginCodeHash: { type: String, default: "" },
  loginCodeExpires: { type: Date, default: null },
  loginCodeAttempts: { type: Number, default: 0 },
  loginCodeSentAt: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.models.DriverApplication || mongoose.model("DriverApplication", DriverApplicationSchema)
