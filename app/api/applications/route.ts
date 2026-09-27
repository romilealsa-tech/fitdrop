import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import DriverApplication from "@/models/DriverApplication"
import { requireAdmin } from "@/lib/adminAuth"
import { formatDriverArea, VEHICLE_TYPES } from "@/lib/driverAreas"

// Public: submit a driver application.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { name, email, phone, state, neighborhood, vehicleType, availability, message } = await req.json()

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 })
    }
    // Only accept areas and vehicles from the lists shown in the form
    const city = formatDriverArea(state, neighborhood)
    if (!city) {
      return NextResponse.json({ error: "Please choose a valid state and neighborhood" }, { status: 400 })
    }
    if (vehicleType && !(VEHICLE_TYPES as readonly string[]).includes(vehicleType)) {
      return NextResponse.json({ error: "Please choose a valid vehicle type" }, { status: 400 })
    }

    const application = await DriverApplication.create({
      name, email, phone, city, vehicleType, availability, message,
    })

    return NextResponse.json({ success: true, id: application._id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Admin-only: list applications.
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await connectDB()
    const applications = await DriverApplication.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ applications })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Admin-only: update an application's status.
export async function PUT(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await connectDB()
    const { id, status } = await req.json()
    const application = await DriverApplication.findByIdAndUpdate(id, { status }, { new: true })
    return NextResponse.json({ application })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
