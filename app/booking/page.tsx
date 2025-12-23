'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.string().min(4, 'Vehicle year is required'),
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  pickupSuburb: z.string().min(2, 'Pickup suburb is required'),
  pickupPostcode: z.string().min(4, 'Pickup postcode is required'),
  pickupState: z.string().min(2, 'Pickup state is required'),
  pickupContactName: z.string().min(2, 'Pickup contact name is required'),
  pickupContactPhone: z.string().min(10, 'Pickup contact phone is required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  deliverySuburb: z.string().min(2, 'Delivery suburb is required'),
  deliveryPostcode: z.string().min(4, 'Delivery postcode is required'),
  deliveryState: z.string().min(2, 'Delivery state is required'),
  deliveryContactName: z.string().min(2, 'Delivery contact name is required'),
  deliveryContactPhone: z.string().min(10, 'Delivery contact phone is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  paymentMethod: z.enum(['full', 'deposit']),
})

type BookingFormData = z.infer<typeof bookingSchema>

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  (typeof window !== 'undefined' ? (window as any).__STRIPE_PUBLISHABLE_KEY__ : '') ||
  ''
)

function CheckoutForm({ bookingData, onSuccess }: { bookingData: any; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!')
        onSuccess()
      }
    } catch (error) {
      toast.error('An error occurred during payment')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
      >
        {loading ? 'Processing...' : `Pay $${bookingData.paymentAmount.toFixed(2)}`}
      </button>
    </form>
  )
}

export default function BookingPage() {
  const router = useRouter()
  const [quote, setQuote] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [step, setStep] = useState<'details' | 'payment'>('details')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const storedQuote = sessionStorage.getItem('quote')
      if (!storedQuote) {
        router.push('/')
        return
      }
      const parsedQuote = JSON.parse(storedQuote)
      setQuote(parsedQuote)
    } catch (error) {
      console.error('Error parsing stored quote:', error)
      router.push('/')
    }
  }, [router])

  const onSubmitDetails = async (data: BookingFormData) => {
    if (!quote) {
      toast.error('Quote data is missing. Please start over.')
      router.push('/')
      return
    }

    try {
      const bookingPayload = {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        vehicle: {
          ...(quote.input || {}),
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: data.vehicleYear,
        },
        pickup: {
          address: data.pickupAddress,
          suburb: data.pickupSuburb,
          postcode: data.pickupPostcode,
          state: data.pickupState,
          contactName: data.pickupContactName,
          contactPhone: data.pickupContactPhone,
        },
        delivery: {
          address: data.deliveryAddress,
          suburb: data.deliverySuburb,
          postcode: data.deliveryPostcode,
          state: data.deliveryState,
          contactName: data.deliveryContactName,
          contactPhone: data.deliveryContactPhone,
        },
        pricing: quote,
        paymentMethod: data.paymentMethod,
        preferredDate: quote.preferredDate || new Date(),
      }

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create booking')
      }

      const result = await response.json()
      
      if (!result.clientSecret || !result.bookingId) {
        throw new Error('Invalid response from server')
      }

      setClientSecret(result.clientSecret)
      setBookingId(result.bookingId)
      setStep('payment')
      toast.success('Booking created! Please complete payment.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking. Please try again.')
      console.error('Booking error:', error)
    }
  }

  const handlePaymentSuccess = () => {
    if (!bookingId) {
      toast.error('Booking ID is missing')
      return
    }
    router.push(`/tracking/${bookingId}`)
  }

  if (!quote) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (step === 'payment' && clientSecret) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Complete Payment
            </h1>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl card-shadow-lg mb-6 border border-white/20">
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
              <p className="text-lg font-semibold text-gray-900 mb-2">Booking ID: <span className="text-blue-600">{bookingId}</span></p>
              <p className="text-xl font-bold text-gray-900">
                Payment Amount: <span className="text-indigo-600">${quote && (watch('paymentMethod') === 'full' ? (quote.totalPrice || 0) : (quote.depositAmount || 0)).toFixed(2)}</span>
              </p>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <CheckoutForm
                bookingData={{
                  paymentAmount: quote ? (watch('paymentMethod') === 'full' ? (quote.totalPrice || 0) : (quote.depositAmount || 0)) : 0,
                }}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Complete Your Booking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fill in your details to finalize your vehicle transport booking
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 rounded-2xl card-shadow-lg mb-8 border-2 border-green-200/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quote Summary
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-sm text-gray-600 mb-2">Total Price</div>
              <div className="text-3xl font-extrabold text-green-700">${quote.totalPrice.toFixed(2)}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-sm text-gray-600 mb-2">Deposit (15%)</div>
              <div className="text-3xl font-extrabold text-emerald-700">${quote.depositAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

      <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-8">
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl card-shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Details
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                First Name *
              </label>
              <input
                {...register('firstName')}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Last Name *
              </label>
              <input
                {...register('lastName')}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Phone *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl card-shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Vehicle Details
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Make *
              </label>
              <input
                {...register('vehicleMake')}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.vehicleMake && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.vehicleMake.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Model *
              </label>
              <input
                {...register('vehicleModel')}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.vehicleModel && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleModel.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Year *
              </label>
              <input
                {...register('vehicleYear')}
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.vehicleYear && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleYear.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl card-shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pickup Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Address *
              </label>
              <input
                {...register('pickupAddress')}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.pickupAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.pickupAddress.message}</p>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Suburb *
                </label>
                <input
                  {...register('pickupSuburb')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.pickupSuburb && (
                  <p className="text-red-500 text-sm mt-1">{errors.pickupSuburb.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Postcode *
                </label>
                <input
                  {...register('pickupPostcode')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.pickupPostcode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pickupPostcode.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  State *
                </label>
                <input
                  {...register('pickupState')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.pickupState && (
                  <p className="text-red-500 text-sm mt-1">{errors.pickupState.message}</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Contact Name *
                </label>
                <input
                  {...register('pickupContactName')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.pickupContactName && (
                  <p className="text-red-500 text-sm mt-1">{errors.pickupContactName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Contact Phone *
                </label>
                <input
                  {...register('pickupContactPhone')}
                  type="tel"
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.pickupContactPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.pickupContactPhone.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Preferred Time *
              </label>
              <select
                {...register('preferredTime')}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              >
                <option value="morning">Morning (8am - 12pm)</option>
                <option value="afternoon">Afternoon (12pm - 5pm)</option>
                <option value="evening">Evening (5pm - 8pm)</option>
              </select>
              {errors.preferredTime && (
                <p className="text-red-500 text-sm mt-1">{errors.preferredTime.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl card-shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Delivery Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Address *
              </label>
              <input
                {...register('deliveryAddress')}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
              />
              {errors.deliveryAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress.message}</p>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Suburb *
                </label>
                <input
                  {...register('deliverySuburb')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.deliverySuburb && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliverySuburb.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Postcode *
                </label>
                <input
                  {...register('deliveryPostcode')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.deliveryPostcode && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliveryPostcode.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  State *
                </label>
                <input
                  {...register('deliveryState')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.deliveryState && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliveryState.message}</p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Contact Name *
                </label>
                <input
                  {...register('deliveryContactName')}
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.deliveryContactName && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliveryContactName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Contact Phone *
                </label>
                <input
                  {...register('deliveryContactPhone')}
                  type="tel"
                  className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                />
                {errors.deliveryContactPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliveryContactPhone.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl card-shadow-lg border border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Method
          </h2>
          <div className="space-y-4">
            <label className="flex items-center p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="full"
                defaultChecked
                className="w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-2"
              />
              <div className="ml-4">
                <span className="font-semibold text-gray-900 group-hover:text-purple-700">Pay Full Amount</span>
                <p className="text-lg font-bold text-purple-600">${quote.totalPrice.toFixed(2)}</p>
              </div>
            </label>
            <label className="flex items-center p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="deposit"
                className="w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-2"
              />
              <div className="ml-4">
                <span className="font-semibold text-gray-900 group-hover:text-purple-700">Pay Deposit (15%)</span>
                <p className="text-lg font-bold text-purple-600">${quote.depositAmount.toFixed(2)} <span className="text-sm font-normal text-gray-600">- Balance on delivery</span></p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] transform duration-200"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  )
}

