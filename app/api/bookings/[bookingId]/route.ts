import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import JobAssignment from '@/models/JobAssignment'
import User from '@/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectDB()

    // Try booking_number first, then tracking_public_token
    const booking = await Booking.findOne({
      $or: [
        { booking_number: params.bookingId },
        { tracking_public_token: params.bookingId },
      ],
    })
      .populate('pickup_address_id')
      .populate('dropoff_address_id')
      .populate('vehicle_id')
      .populate('customer_id', 'name email phone')
      .populate('quote_id')

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Get driver assignment if exists (carrier is internal only, never exposed)
    const assignment = await JobAssignment.findOne({
      booking_id: booking._id,
      status: { $in: ['assigned', 'accepted'] },
    })
      .populate('driver_id', 'name phone driverInfo')
      .select('-carrier_id') // Never expose carrier to customers or public APIs

    // Format response for frontend
    const response: any = {
      booking_number: booking.booking_number,
      tracking_token: booking.tracking_public_token,
      status: booking.status,
      customer: booking.customer_id
        ? {
            name: (booking.customer_id as any).name,
            email: (booking.customer_id as any).email,
            phone: (booking.customer_id as any).phone,
          }
        : null,
      vehicle: booking.vehicle_id
        ? {
            type: (booking.vehicle_id as any).type,
            make: (booking.vehicle_id as any).make,
            model: (booking.vehicle_id as any).model,
            year: (booking.vehicle_id as any).year,
            transportType: (booking.vehicle_id as any).transport_type,
          }
        : null,
      pickup: booking.pickup_address_id
        ? {
            address: (booking.pickup_address_id as any).address,
            suburb: (booking.pickup_address_id as any).suburb,
            postcode: (booking.pickup_address_id as any).postcode,
            state: (booking.pickup_address_id as any).state,
            contactName: (booking.pickup_address_id as any).contact_name,
            contactPhone: (booking.pickup_address_id as any).contact_phone,
          }
        : null,
      delivery: booking.dropoff_address_id
        ? {
            address: (booking.dropoff_address_id as any).address,
            suburb: (booking.dropoff_address_id as any).suburb,
            postcode: (booking.dropoff_address_id as any).postcode,
            state: (booking.dropoff_address_id as any).state,
            contactName: (booking.dropoff_address_id as any).contact_name,
            contactPhone: (booking.dropoff_address_id as any).contact_phone,
          }
        : null,
      pickup_timeframe: booking.pickup_timeframe,
      special_instructions: booking.special_instructions,
      total_inc_gst: booking.total_inc_gst,
      deposit_required_amount: booking.deposit_required_amount,
      balance_due_amount: booking.balance_due_amount,
      created_at: booking.created_at,
    }

    // Calculate estimated dates based on status and quote
    const quote = booking.quote_id as any
    if (quote) {
      // Estimated pickup date (from preferred pickup date or pickup timeframe start)
      if (booking.pickup_timeframe?.start) {
        response.estimated_pickup_date = booking.pickup_timeframe.start
      } else if (quote.preferred_pickup_date) {
        response.estimated_pickup_date = quote.preferred_pickup_date
      }

      // Estimated delivery date (pickup date + duration estimate)
      if (quote.duration_estimate_days_max && response.estimated_pickup_date) {
        const pickupDate = new Date(response.estimated_pickup_date)
        const deliveryDate = new Date(pickupDate)
        deliveryDate.setDate(deliveryDate.getDate() + quote.duration_estimate_days_max)
        response.estimated_delivery_date = deliveryDate.toISOString()
      }
    }

    // Add driver info if assigned
    if (assignment && assignment.driver_id) {
      const driver = assignment.driver_id as any
      response.driver = {
        name: driver.name,
        phone: driver.phone,
        vehicle: driver.driverInfo?.vehicle || 'N/A',
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

