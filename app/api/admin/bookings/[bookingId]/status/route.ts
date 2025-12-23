import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { sendEmail, getStatusUpdateEmail } from '@/lib/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectDB()

    const body = await request.json()
    const { status } = body

    const booking = await Booking.findOne({ bookingId: params.bookingId })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update status
    booking.status = status

    // Add to status history
    booking.tracking.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Status updated to ${status}`,
    })

    // Update timestamps for specific statuses
    if (status === 'picked-up' && !booking.tracking.actualPickup) {
      booking.tracking.actualPickup = new Date()
    }
    if (status === 'delivered' && !booking.tracking.actualDelivery) {
      booking.tracking.actualDelivery = new Date()
    }

    await booking.save()

    // Send notification email
    try {
      const emailContent = getStatusUpdateEmail(
        booking.bookingId,
        status,
        `Your booking status has been updated to ${status}`
      )
      await sendEmail({
        to: booking.customer.email,
        ...emailContent,
      })
    } catch (error) {
      console.error('Error sending status update email:', error)
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}

