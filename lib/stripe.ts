import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export interface CreatePaymentIntentParams {
  amount: number
  currency?: string
  customerId?: string
  metadata?: Record<string, string>
  paymentMethod?: 'full' | 'deposit'
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
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
  const customer = await stripe.customers.create({
    email,
    name,
    phone,
  })

  return customer
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  })

  return refund
}

