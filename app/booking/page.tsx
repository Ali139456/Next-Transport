'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

const bookingSchema = z.object({
  // Step 2: Customer Details
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  // Step 3: Vehicle Details
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.string().min(4, 'Vehicle year is required'),
  vehicleRegistration: z.string().optional(),
  vehicleNotes: z.string().optional(),
  // Step 4: Pickup & Delivery Contacts
  pickupContactName: z.string().min(2, 'Pickup contact name is required'),
  pickupContactPhone: z.string().min(10, 'Pickup contact phone is required'),
  deliveryContactName: z.string().min(2, 'Delivery contact name is required'),
  deliveryContactPhone: z.string().min(10, 'Delivery contact phone is required'),
  // Step 5: Payment
  paymentMethod: z.enum(['full', 'deposit']),
})

type BookingFormData = z.infer<typeof bookingSchema>

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
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
        className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
      >
        {loading ? 'Processing...' : `Pay $${bookingData.paymentAmount.toFixed(2)}`}
      </button>
    </form>
  )
}

type Step = 'quote' | 'customer' | 'vehicle' | 'contacts' | 'payment' | 'confirmation'

export default function BookingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [quote, setQuote] = useState<any>(null)
  const [step, setStep] = useState<Step>('quote')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      paymentMethod: 'full',
    },
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/booking')}`)
      return
    }

    if (!authLoading && user && user.role !== 'customer') {
      router.push('/')
      return
    }
    
    try {
      const storedQuote = sessionStorage.getItem('quote')
      if (!storedQuote) {
        router.push('/quote')
        return
      }
      const parsedQuote = JSON.parse(storedQuote)
      setQuote(parsedQuote)
    } catch (error) {
      console.error('Error parsing stored quote:', error)
      router.push('/quote')
    }
  }, [router, user, authLoading])

  if (authLoading || !user || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  const steps: { id: Step; label: string }[] = [
    { id: 'quote', label: 'Quote Confirmation' },
    { id: 'customer', label: 'Customer Details' },
    { id: 'vehicle', label: 'Vehicle Details' },
    { id: 'contacts', label: 'Pickup & Delivery' },
    { id: 'payment', label: 'Payment' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)

  const handleStepSubmit = async (data: BookingFormData) => {
    if (step === 'customer') {
      setStep('vehicle')
      return
    }

    if (step === 'vehicle') {
      setStep('contacts')
      return
    }

    if (step === 'contacts') {
      // Create booking
      try {
        const preferredDate = new Date(quote.preferredDate || new Date())
        const startDate = new Date(preferredDate)
        startDate.setDate(startDate.getDate() - 2)
        const endDate = new Date(preferredDate)
        endDate.setDate(endDate.getDate() + 2)

        const bookingPayload = {
          quote_id: quote.quote_id || quote.id,
          pickupAddress: {
            address: quote.pickupAddress?.address || '',
            suburb: quote.pickupAddress?.suburb || quote.pickupSuburb || '',
            postcode: quote.pickupAddress?.postcode || quote.pickupPostcode || '',
            state: quote.pickupAddress?.state || quote.pickupState || '',
            contactName: data.pickupContactName,
            contactPhone: data.pickupContactPhone,
          },
          dropoffAddress: {
            address: quote.dropoffAddress?.address || '',
            suburb: quote.dropoffAddress?.suburb || quote.dropoffSuburb || '',
            postcode: quote.dropoffAddress?.postcode || quote.dropoffPostcode || '',
            state: quote.dropoffAddress?.state || quote.deliveryState || '',
            contactName: data.deliveryContactName,
            contactPhone: data.deliveryContactPhone,
          },
          vehicle: {
            type: quote.vehicle?.type || quote.vehicleType || 'car',
            make: data.vehicleMake,
            model: data.vehicleModel,
            year: data.vehicleYear,
            registration: data.vehicleRegistration,
            notes: data.vehicleNotes,
            isRunning: quote.vehicle?.isRunning ?? quote.isRunning ?? true,
            transportType: quote.vehicle?.transportType || quote.transportType || 'open',
          },
          pickupTimeframe: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          specialInstructions: data.vehicleNotes || '',
          paymentMethod: data.paymentMethod,
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
        
        setBookingId(result.booking_number || result.booking_id)
        setTrackingToken(result.tracking_public_token || result.tracking_token)

        if (result.stripeEnabled && result.clientSecret) {
          setClientSecret(result.clientSecret)
          setStep('payment')
        } else {
          setStep('confirmation')
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create booking')
      }
      return
    }
  }

  const handlePaymentSuccess = () => {
    setStep('confirmation')
  }

  const handleEditQuote = () => {
    router.push('/quote')
  }

  // Progress Bar
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  index <= currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStepIndex ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className={`text-xs mt-2 text-center ${index <= currentStepIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {s.label}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 transition-all ${
                  index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // Step 1: Quote Confirmation
  if (step === 'quote') {
    return (
      <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <ProgressBar />
          
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Quote Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-700">Total Price (incl. GST)</span>
                <span className="text-3xl font-extrabold text-blue-600">
                  ${quote.pricing?.total_inc_gst?.toFixed(2) || quote.total_inc_gst?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Pickup</div>
                  <div className="font-semibold text-gray-900">
                    {quote.pickupSuburb || quote.pickupAddress?.suburb}, {quote.pickupPostcode || quote.pickupAddress?.postcode}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Delivery</div>
                  <div className="font-semibold text-gray-900">
                    {quote.dropoffSuburb || quote.dropoffAddress?.suburb}, {quote.dropoffPostcode || quote.dropoffAddress?.postcode}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleEditQuote}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Edit Quote
              </button>
              <button
                onClick={() => setStep('customer')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 5: Payment
  if (step === 'payment' && clientSecret) {
    return (
      <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <ProgressBar />
          
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Complete Payment</h2>
            
            <div className="mb-6 p-6 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Booking ID</p>
              <p className="text-lg font-bold text-gray-900">{bookingId}</p>
              <p className="text-sm text-gray-600 mt-4 mb-1">Payment Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ${watch('paymentMethod') === 'full' 
                  ? (quote.pricing?.total_inc_gst || quote.total_inc_gst || 0).toFixed(2)
                  : ((quote.pricing?.total_inc_gst || quote.total_inc_gst || 0) * 0.15).toFixed(2)
                }
              </p>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: 'stripe' },
              }}
            >
              <CheckoutForm
                bookingData={{
                  paymentAmount: watch('paymentMethod') === 'full' 
                    ? (quote.pricing?.total_inc_gst || quote.total_inc_gst || 0)
                    : ((quote.pricing?.total_inc_gst || quote.total_inc_gst || 0) * 0.15),
                }}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        </div>
      </div>
    )
  }

  // Step 6: Confirmation
  if (step === 'confirmation') {
    return (
      <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Booking Confirmed!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                <div className="text-xl font-bold text-gray-900">{bookingId}</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="text-sm text-gray-600 mb-2">Confirmation sent to:</div>
                <div className="font-semibold text-gray-900">{watch('email')}</div>
                <div className="font-semibold text-gray-900">{watch('phone')}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push(`/tracking/${trackingToken || bookingId}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
              >
                Track Booking
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Steps 2-4: Form Steps
  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <ProgressBar />
        
        <form onSubmit={handleSubmit(handleStepSubmit)} className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 relative z-10">
          {/* Step 2: Customer Details */}
          {step === 'customer' && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Customer Details</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input {...register('firstName')} className="form-input-light" />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input {...register('lastName')} className="form-input-light" />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input {...register('email')} type="email" className="form-input-light" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile *</label>
                  <input {...register('phone')} type="tel" className="form-input-light" />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Vehicle Details */}
          {step === 'vehicle' && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Vehicle Details</h2>
              <div className="space-y-4 mb-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Make *</label>
                    <input {...register('vehicleMake')} className="form-input-light" />
                    {errors.vehicleMake && <p className="text-red-500 text-sm mt-1">{errors.vehicleMake.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Model *</label>
                    <input {...register('vehicleModel')} className="form-input-light" />
                    {errors.vehicleModel && <p className="text-red-500 text-sm mt-1">{errors.vehicleModel.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                    <input {...register('vehicleYear')} type="number" className="form-input-light" />
                    {errors.vehicleYear && <p className="text-red-500 text-sm mt-1">{errors.vehicleYear.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Registration</label>
                  <input {...register('vehicleRegistration')} className="form-input-light" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea {...register('vehicleNotes')} rows={3} className="form-input-light" />
                </div>
              </div>
            </>
          )}

          {/* Step 4: Pickup & Delivery Contacts */}
          {step === 'contacts' && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Pickup & Delivery Contacts</h2>
              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Contact</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                      <input {...register('pickupContactName')} className="form-input-light" />
                      {errors.pickupContactName && <p className="text-red-500 text-sm mt-1">{errors.pickupContactName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <input {...register('pickupContactPhone')} type="tel" className="form-input-light" />
                      {errors.pickupContactPhone && <p className="text-red-500 text-sm mt-1">{errors.pickupContactPhone.message}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Contact</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                      <input {...register('deliveryContactName')} className="form-input-light" />
                      {errors.deliveryContactName && <p className="text-red-500 text-sm mt-1">{errors.deliveryContactName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <input {...register('deliveryContactPhone')} type="tel" className="form-input-light" />
                      {errors.deliveryContactPhone && <p className="text-red-500 text-sm mt-1">{errors.deliveryContactPhone.message}</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 bg-gradient-to-br from-accent-50/80 to-white rounded-lg cursor-pointer hover:bg-accent-100/50 border border-accent-200/50">
                      <input type="radio" {...register('paymentMethod')} value="full" className="mr-3" defaultChecked />
                      <div>
                        <div className="font-semibold text-gray-900">Pay in Full</div>
                        <div className="text-sm text-gray-600">${(quote.pricing?.total_inc_gst || quote.total_inc_gst || 0).toFixed(2)}</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 bg-gradient-to-br from-accent-50/80 to-white rounded-lg cursor-pointer hover:bg-accent-100/50 border border-accent-200/50">
                      <input type="radio" {...register('paymentMethod')} value="deposit" className="mr-3" />
                      <div>
                        <div className="font-semibold text-gray-900">Deposit + Balance Later</div>
                        <div className="text-sm text-gray-600">${((quote.pricing?.total_inc_gst || quote.total_inc_gst || 0) * 0.15).toFixed(2)} deposit</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={() => {
                  const prevStep = steps[currentStepIndex - 1].id
                  setStep(prevStep)
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
            >
              {step === 'contacts' ? 'Create Booking' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
