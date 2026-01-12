import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import ConditionReport from '@/models/ConditionReport'
import { sendEmail, getStatusUpdateEmail } from '@/lib/notifications'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
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

    const body = await request.json()
    const { status } = body

    // Try booking_number first, then tracking_public_token
    const booking = await Booking.findOne({
      $or: [
        { booking_number: params.bookingId },
        { tracking_public_token: params.bookingId },
      ],
    }).populate('customer_id', 'name email phone')

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check for mandatory ConditionReport before status changes
    if (status === 'picked_up') {
      const pickupReport = await ConditionReport.findOne({
        booking_id: booking._id,
        type: 'pickup',
        signed_at: { $exists: true, $ne: null },
      })
      if (!pickupReport) {
        return NextResponse.json(
          { error: 'Pickup condition report must be signed before status can be changed to picked_up' },
          { status: 400 }
        )
      }
    }

    if (status === 'delivered') {
      const deliveryReport = await ConditionReport.findOne({
        booking_id: booking._id,
        type: 'delivery',
        signed_at: { $exists: true, $ne: null },
      })
      if (!deliveryReport) {
        return NextResponse.json(
          { error: 'Delivery condition report must be signed before status can be changed to delivered' },
          { status: 400 }
        )
      }
    }

    // Update status
    booking.status = status as any
    await booking.save()

    // Send notification email
    try {
      const customer = booking.customer_id as any
      if (customer?.email) {
        const emailContent = getStatusUpdateEmail(
          booking.booking_number,
          status,
          `Your booking status has been updated to ${status}`
        )
        await sendEmail({
          to: customer.email,
          ...emailContent,
        })
      }
    } catch (error) {
      console.error('Error sending status update email:', error)
    }

    return NextResponse.json({
      success: true,
      booking: {
        booking_number: booking.booking_number,
        status: booking.status,
      },
    })
  } catch (error: any) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update booking status' },
      { status: 500 }
    )
  }
}

