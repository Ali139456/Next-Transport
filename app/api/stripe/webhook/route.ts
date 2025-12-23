import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function POST(request: NextRequest) {
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

    const booking = await Booking.findOne({
      'payment.stripePaymentIntentId': paymentIntent.id,
    })

    if (!booking) {
      console.error('Booking not found for payment intent:', paymentIntent.id)
      return
    }

    // Update payment status
    booking.payment.status = booking.payment.paymentMethod === 'full' ? 'paid' : 'partial'
    booking.payment.paidAmount += paymentIntent.amount / 100

    // Add transaction record
    booking.payment.transactions.push({
      amount: paymentIntent.amount / 100,
      transactionId: paymentIntent.id,
      date: new Date(),
      type: 'payment',
    })

    // Update booking status
    if (booking.status === 'pending') {
      booking.status = 'confirmed'
      booking.tracking.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Payment received, booking confirmed',
      })
    }

    await booking.save()
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    await connectDB()

    const booking = await Booking.findOne({
      'payment.stripePaymentIntentId': paymentIntent.id,
    })

    if (booking) {
      // Log payment failure
      console.error('Payment failed for booking:', booking.bookingId)
      // You might want to send a notification to the customer here
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

