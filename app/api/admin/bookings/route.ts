import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'
    const sourceChannel = searchParams.get('source_channel') || 'all'

    const query: any = {}
    if (filter !== 'all') {
      query.status = filter
    }
    if (sourceChannel !== 'all') {
      query.source_channel = sourceChannel
    }

    const bookings = await Booking.find(query)
      .populate('customer_id', 'name email phone')
      .populate('pickup_address_id')
      .populate('dropoff_address_id')
      .populate('vehicle_id')
      .sort({ created_at: -1 })
      .limit(100)

    // Format response for frontend
    const formattedBookings = bookings.map((booking: any) => ({
      _id: booking._id.toString(),
      booking_number: booking.booking_number,
      tracking_token: booking.tracking_public_token,
      customer: booking.customer_id
        ? {
            name: booking.customer_id.name,
            email: booking.customer_id.email,
            phone: booking.customer_id.phone,
          }
        : null,
      vehicle: booking.vehicle_id
        ? {
            type: booking.vehicle_id.type,
            make: booking.vehicle_id.make,
            model: booking.vehicle_id.model,
            year: booking.vehicle_id.year,
          }
        : null,
      status: booking.status,
      source_channel: booking.source_channel,
      total_inc_gst: booking.total_inc_gst,
      deposit_required_amount: booking.deposit_required_amount,
      balance_due_amount: booking.balance_due_amount,
      internal_cost_ex_gst: booking.internal_cost_ex_gst,
      internal_margin_ex_gst: booking.internal_margin_ex_gst,
      created_at: booking.created_at,
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
