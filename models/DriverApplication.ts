import mongoose from "mongoose"

const DriverApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, default: "" },
  vehicleType: { type: String, default: "" }, // "Bike", "Car", "Scooter", "On foot"
  availability: { type: String, default: "" },
  message: { type: String, default: "" },
  status: { type: String, default: "pending" }, // pending | reviewed | approved | rejected
}, { timestamps: true })

export default mongoose.models.DriverApplication || mongoose.model("DriverApplication", DriverApplicationSchema)
