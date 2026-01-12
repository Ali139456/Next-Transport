import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeEnabled } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function POST(request: NextRequest) {
  // Return early if Stripe is not enabled
  if (!isStripeEnabled || !stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
    default:
      // Unhandled event type - log for debugging if needed
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    await connectDB()

    // Find booking via quote_id from payment intent metadata
    const quoteId = paymentIntent.metadata?.quoteId
    if (!quoteId) {
      console.error('No quoteId in payment intent metadata:', paymentIntent.id)
      return
    }

    const booking = await Booking.findOne({
      quote_id: quoteId,
    })

    if (!booking) {
      console.error('Booking not found for quote:', quoteId)
      return
    }

    const paymentMethod = paymentIntent.metadata?.paymentMethod || 'deposit'

    // Update booking status based on payment
    if (booking.status === 'booking_pending_payment') {
      // If full payment, confirm immediately; if deposit, keep as pending until balance is paid
      if (paymentMethod === 'full') {
        booking.status = 'booked_confirmed'
      }
      // For deposit payments, status remains 'booking_pending_payment' until balance is paid
    }

    await booking.save()
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    await connectDB()

    // Find booking via quote_id from payment intent metadata
    const quoteId = paymentIntent.metadata?.quoteId
    if (!quoteId) {
      console.error('No quoteId in payment intent metadata:', paymentIntent.id)
      return
    }

    const booking = await Booking.findOne({
      quote_id: quoteId,
    })

    if (booking) {
      // Log payment failure
      console.error('Payment failed for booking:', booking.booking_number)
      // You might want to send a notification to the customer here
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

