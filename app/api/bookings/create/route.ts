import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Quote from '@/models/Quote'
import Address from '@/models/Address'
import Vehicle from '@/models/Vehicle'
import { createPaymentIntent, createCustomer, isStripeEnabled } from '@/lib/stripe'
import { sendEmail, getBookingConfirmationEmail } from '@/lib/notifications'
import { getAuthUser } from '@/lib/auth'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Check authentication - require customer login
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'customer') {
      return NextResponse.json(
        { error: 'Authentication required. Please login to continue.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      quote_id,
      pickupAddress,
      dropoffAddress,
      vehicle,
      pickupTimeframe,
      specialInstructions,
      paymentMethod,
    } = body

    // Validate required fields
    if (!quote_id || !pickupAddress || !dropoffAddress || !vehicle || !pickupTimeframe) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get quote
    const quote = await Quote.findById(quote_id)
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Check if quote is expired
    if (new Date() > quote.expires_at) {
      return NextResponse.json(
        { error: 'Quote has expired. Please request a new quote.' },
        { status: 400 }
      )
    }

    // Get or create pickup address
    let pickupAddressDoc = await Address.findOne({
      address: pickupAddress.address,
      suburb: pickupAddress.suburb,
      postcode: pickupAddress.postcode,
      state: pickupAddress.state,
    })

    if (!pickupAddressDoc) {
      pickupAddressDoc = new Address({
        address: pickupAddress.address,
        suburb: pickupAddress.suburb,
        postcode: pickupAddress.postcode,
        state: pickupAddress.state,
        contact_name: pickupAddress.contactName,
        contact_phone: pickupAddress.contactPhone,
      })
      await pickupAddressDoc.save()
    }

    // Get or create dropoff address
    let dropoffAddressDoc = await Address.findOne({
      address: dropoffAddress.address,
      suburb: dropoffAddress.suburb,
      postcode: dropoffAddress.postcode,
      state: dropoffAddress.state,
    })

    if (!dropoffAddressDoc) {
      dropoffAddressDoc = new Address({
        address: dropoffAddress.address,
        suburb: dropoffAddress.suburb,
        postcode: dropoffAddress.postcode,
        state: dropoffAddress.state,
        contact_name: dropoffAddress.contactName,
        contact_phone: dropoffAddress.contactPhone,
      })
      await dropoffAddressDoc.save()
    }

    // Get or create vehicle
    let vehicleDoc = await Vehicle.findOne({
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      is_running: vehicle.isRunning,
      transport_type: vehicle.transportType,
    })

    if (!vehicleDoc) {
      vehicleDoc = new Vehicle({
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        is_running: vehicle.isRunning,
        transport_type: vehicle.transportType,
      })
      await vehicleDoc.save()
    }

    // Stripe payment handling (only if Stripe is enabled)
    let stripeCustomerId: string | undefined
    let paymentIntentId: string | undefined
    let clientSecret: string | undefined

    if (isStripeEnabled) {
      // Create or get Stripe customer
      try {
        const user = await mongoose.model('User').findById(authUser.id)
        if (user?.email) {
          const stripeCustomer = await createCustomer(
            user.email,
            user.name,
            user.phone || ''
          )
          stripeCustomerId = stripeCustomer.id
        }
      } catch (error) {
        console.error('Error creating Stripe customer:', error)
      }

      // Create payment intent
      try {
        const paymentAmount = paymentMethod === 'full' ? quote.total_inc_gst : quote.total_inc_gst * 0.15
        const paymentIntent = await createPaymentIntent({
          amount: paymentAmount,
          customerId: stripeCustomerId,
          metadata: {
            bookingType: 'vehicle-transport',
            paymentMethod,
            quoteId: quote_id.toString(),
          },
          paymentMethod,
        })
        paymentIntentId = paymentIntent.id
        clientSecret = paymentIntent.client_secret || undefined
      } catch (error) {
        console.error('Error creating payment intent:', error)
      }
    }

    // Determine initial status based on payment
    const initialStatus = paymentMethod === 'full' && !clientSecret 
      ? 'booked_confirmed' 
      : 'booking_pending_payment'

    // Create booking
    const booking = new Booking({
      quote_id: new mongoose.Types.ObjectId(quote_id),
      customer_id: new mongoose.Types.ObjectId(authUser.id),
      pickup_address_id: pickupAddressDoc._id,
      dropoff_address_id: dropoffAddressDoc._id,
      vehicle_id: vehicleDoc._id,
      status: initialStatus,
      pickup_timeframe: {
        start: new Date(pickupTimeframe.start),
        end: new Date(pickupTimeframe.end),
      },
      special_instructions: specialInstructions || '',
      total_inc_gst: quote.total_inc_gst,
      deposit_required_amount: quote.total_inc_gst * 0.15,
      balance_due_amount: quote.total_inc_gst * 0.85,
      source_channel: 'nexttransport',
    })

    await booking.save()

    // Send confirmation email
    try {
      const user = await mongoose.model('User').findById(authUser.id)
      if (user?.email) {
        const emailContent = getBookingConfirmationEmail(
          booking.booking_number,
          user.name,
          quote.total_inc_gst
        )
        await sendEmail({
          to: user.email,
          ...emailContent,
        })
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error)
    }

    return NextResponse.json({
      booking_number: booking.booking_number,
      tracking_token: booking.tracking_public_token,
      ...(paymentIntentId && { paymentIntentId }),
      ...(clientSecret && { clientSecret }),
      stripeEnabled: isStripeEnabled,
    })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}

