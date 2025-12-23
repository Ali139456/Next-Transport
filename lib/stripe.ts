import Stripe from 'stripe'

// Stripe is optional - only initialize if STRIPE_SECRET_KEY is set
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})
  : null

export const isStripeEnabled = !!process.env.STRIPE_SECRET_KEY

export interface CreatePaymentIntentParams {
  amount: number
  currency?: string
  customerId?: string
  metadata?: Record<string, string>
  paymentMethod?: 'full' | 'deposit'
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const { amount, currency = 'aud', customerId, metadata, paymentMethod } = params

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    customer: customerId,
    metadata: {
      ...metadata,
      paymentMethod: paymentMethod || 'full',
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

export async function createCustomer(email: string, name: string, phone?: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const customer = await stripe.customers.create({
    email,
    name,
    phone,
  })

  return customer
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  })

  return refund
}

