import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { createPaymentIntent, createCustomer, isStripeEnabled } from '@/lib/stripe'
import { sendEmail, getBookingConfirmationEmail } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      customer,
      vehicle,
      pickup,
      delivery,
      pricing,
      paymentMethod,
      preferredDate,
    } = body

    // Stripe payment handling (only if Stripe is enabled)
    let stripeCustomerId: string | undefined
    let paymentIntentId: string | undefined
    let clientSecret: string | undefined

    if (isStripeEnabled) {
    // Create or get Stripe customer
    try {
        const stripeCustomer = await createCustomer(
        body.customer.email,
        `${body.customer.firstName} ${body.customer.lastName}`,
        body.customer.phone
      )
        stripeCustomerId = stripeCustomer.id
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
    }

    // Create payment intent
      try {
    const paymentAmount = paymentMethod === 'full' ? pricing.totalPrice : pricing.depositAmount
    const paymentIntent = await createPaymentIntent({
      amount: paymentAmount,
      customerId: stripeCustomerId,
      metadata: {
        bookingType: 'vehicle-transport',
        paymentMethod,
      },
      paymentMethod,
    })
        paymentIntentId = paymentIntent.id
        clientSecret = paymentIntent.client_secret || undefined
      } catch (error) {
        console.error('Error creating payment intent:', error)
      }
    }

    // Create booking
    const booking = new Booking({
      customer,
      vehicle,
      pickup: {
        ...pickup,
        preferredDate: new Date(preferredDate),
      },
      delivery,
      pricing,
      payment: isStripeEnabled && paymentIntentId ? {
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId,
        paymentMethod,
        status: 'pending',
        paidAmount: 0,
        transactions: [],
      } : undefined,
      status: 'pending',
      tracking: {
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(),
            note: 'Booking created',
          },
        ],
      },
    })

    await booking.save()

    // Send confirmation email
    try {
      const emailContent = getBookingConfirmationEmail(
        booking.bookingId,
        `${customer.firstName} ${customer.lastName}`,
        pricing.totalPrice
      )
      await sendEmail({
        to: customer.email,
        ...emailContent,
      })
    } catch (error) {
      console.error('Error sending confirmation email:', error)
    }

    return NextResponse.json({
      bookingId: booking.bookingId,
      ...(paymentIntentId && { paymentIntentId }),
      ...(clientSecret && { clientSecret }),
      stripeEnabled: isStripeEnabled,
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

