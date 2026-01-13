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

// Make all fields optional in the base schema to allow step-by-step validation
const bookingSchema = z.object({
  // Step 2: Customer Details
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  // Step 3: Vehicle Details
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  vehicleRegistration: z.string().optional(),
  vehicleNotes: z.string().optional(),
  // Step 4: Pickup & Delivery Contacts
  pickupContactName: z.string().optional(),
  pickupContactPhone: z.string().optional(),
  deliveryContactName: z.string().optional(),
  deliveryContactPhone: z.string().optional(),
  // Step 5: Payment
  paymentMethod: z.enum(['full', 'deposit']).optional().default('full'),
})

// Step-specific validation schemas for manual validation
const customerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

const vehicleSchema = z.object({
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.string().min(4, 'Vehicle year must be 4 digits'),
  vehicleRegistration: z.string().optional(),
  vehicleNotes: z.string().optional(),
})

const contactsSchema = z.object({
  pickupContactName: z.string().min(2, 'Pickup contact name is required'),
  pickupContactPhone: z.string().min(10, 'Pickup contact phone must be at least 10 digits'),
  deliveryContactName: z.string().min(2, 'Delivery contact name is required'),
  deliveryContactPhone: z.string().min(10, 'Delivery contact phone must be at least 10 digits'),
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setError,
    clearErrors,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onBlur',
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-extra"></div>
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
    // Safely log data without circular references
    const safeData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      paymentMethod: data.paymentMethod,
    }
    console.log('Form submitted for step:', step, 'Data:', safeData)
    
    if (isSubmitting) {
      console.log('Already submitting, ignoring...')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Clear previous errors for fields not in current step
      clearErrors()
      
      // Validate only current step fields using step-specific schema
      let validationResult: any = { success: true, errors: {} }
      
      if (step === 'customer') {
        const result = customerSchema.safeParse({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        })
        if (!result.success) {
          validationResult.success = false
          result.error.errors.forEach((err) => {
            const field = err.path[0] as string
            validationResult.errors[field] = err.message
            setError(field as any, { message: err.message })
          })
        }
      } else if (step === 'vehicle') {
        const result = vehicleSchema.safeParse({
          vehicleMake: data.vehicleMake,
          vehicleModel: data.vehicleModel,
          vehicleYear: data.vehicleYear,
          vehicleRegistration: data.vehicleRegistration,
          vehicleNotes: data.vehicleNotes,
        })
        if (!result.success) {
          validationResult.success = false
          result.error.errors.forEach((err) => {
            const field = err.path[0] as string
            validationResult.errors[field] = err.message
            setError(field as any, { message: err.message })
          })
        }
      } else if (step === 'contacts') {
        const result = contactsSchema.safeParse({
          pickupContactName: data.pickupContactName,
          pickupContactPhone: data.pickupContactPhone,
          deliveryContactName: data.deliveryContactName,
          deliveryContactPhone: data.deliveryContactPhone,
          paymentMethod: data.paymentMethod,
        })
        if (!result.success) {
          validationResult.success = false
          result.error.errors.forEach((err) => {
            const field = err.path[0] as string
            validationResult.errors[field] = err.message
            setError(field as any, { message: err.message })
          })
        }
      }
      
      if (!validationResult.success) {
        console.log('Validation failed for step:', step, validationResult.errors)
        const errorMessages = Object.values(validationResult.errors).join(', ')
        toast.error(`Please fix: ${errorMessages}`)
        setIsSubmitting(false)
        return
      }
      
      if (step === 'customer') {
        // Save customer data to database
        try {
          console.log('Saving customer data...')
          const response = await fetch('/api/auth/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              phone: data.phone,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to save customer data:', errorData)
            throw new Error(errorData.error || 'Failed to save customer data')
          }

          const result = await response.json()
          console.log('Customer data saved successfully:', result)
          toast.success('Customer details saved')
          setStep('vehicle')
        } catch (error: any) {
          console.error('Error saving customer data:', error)
          toast.error(error.message || 'Failed to save customer data')
          // Still proceed to next step even if save fails
          setStep('vehicle')
        }
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

        // Get quote ID - check multiple possible locations
        const quoteId = quote.quote?.id || quote.quote?._id || quote.quote_id || quote.id || quote._id
        
        if (!quoteId) {
          console.error('Quote object:', quote)
          toast.error('Quote ID not found. Please create a new quote.')
          return
        }
        
        console.log('Using quote ID:', quoteId)

        const bookingPayload = {
          quote_id: quoteId,
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
      } finally {
        setIsSubmitting(false)
      }
      return
      }
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
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
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-extra"></div>
        <div className="absolute inset-0 bg-pattern-grid opacity-10 z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
          <ProgressBar />
          
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 relative z-10 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-accent-200/50">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Quote Summary</h2>
                <p className="text-sm text-gray-600 mt-1">Review your quote details</p>
              </div>
            </div>
            
            <div className="space-y-6 mb-6">
              {/* Total Price - Highlighted */}
              <div className="relative overflow-hidden bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="text-white/90 text-sm font-medium mb-2">Total Price (incl. GST)</div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
                    ${quote.pricing?.totalPrice?.toFixed(2) || quote.totalPrice?.toFixed(2) || quote.total_inc_gst?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-white/80 text-xs mt-2">All fees included • No surprises</div>
                </div>
              </div>
              
              {/* Pickup and Delivery Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.293 12.293a1.999 1.999 0 010-2.827l4.364-4.364a8 8 0 110 11.314z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Pickup Location</div>
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    {quote.pickupSuburb || quote.pickupAddress?.suburb || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {quote.pickupPostcode || quote.pickupAddress?.postcode || ''}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-5 border-2 border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Delivery Location</div>
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    {quote.dropoffSuburb || quote.dropoffAddress?.suburb || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {quote.dropoffPostcode || quote.dropoffAddress?.postcode || ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleEditQuote}
                className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] border border-gray-300"
              >
                Edit Quote
              </button>
              <button
                onClick={() => setStep('customer')}
                className="flex-1 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                <span>Continue</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
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
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-extra"></div>
        <div className="absolute inset-0 bg-pattern-grid opacity-10 z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl relative z-10">
          <ProgressBar />
          
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Complete Payment</h2>
            
            <div className="mb-6 p-6 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Booking ID</p>
              <p className="text-lg font-bold text-gray-900">{bookingId}</p>
              <p className="text-sm text-gray-600 mt-4 mb-1">Payment Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ${watch('paymentMethod') === 'full' 
                  ? (quote.pricing?.totalPrice || quote.totalPrice || quote.total_inc_gst || 0).toFixed(2)
                  : ((quote.pricing?.totalPrice || quote.totalPrice || quote.total_inc_gst || 0) * 0.15).toFixed(2)
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
                    ? (quote.pricing?.totalPrice || quote.totalPrice || quote.total_inc_gst || 0)
                    : ((quote.pricing?.totalPrice || quote.totalPrice || quote.total_inc_gst || 0) * 0.15),
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
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-extra"></div>
        <div className="absolute inset-0 bg-pattern-grid opacity-10 z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl relative z-10">
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
        
        <form onSubmit={handleSubmit(
          handleStepSubmit,
          (errors) => {
            // Safely extract error messages without circular references
            const errorMessages: string[] = []
            Object.keys(errors).forEach((key) => {
              const error = errors[key as keyof typeof errors]
              if (error && typeof error === 'object' && 'message' in error) {
                errorMessages.push(`${key}: ${error.message}`)
              } else {
                errorMessages.push(`${key}: Invalid`)
              }
            })
            if (errorMessages.length > 0) {
              toast.error(`Please fix: ${errorMessages.join(', ')}`)
            }
          }
        )} className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 relative z-10">
          {/* Step 2: Customer Details */}
          {step === 'customer' && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Customer Details</h2>
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-800 font-semibold mb-2">Please fix the following errors:</p>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {errors.firstName && <li>First Name: {errors.firstName.message || 'Required'}</li>}
                    {errors.lastName && <li>Last Name: {errors.lastName.message || 'Required'}</li>}
                    {errors.email && <li>Email: {errors.email.message || 'Required'}</li>}
                    {errors.phone && <li>Mobile: {errors.phone.message || 'Required'}</li>}
                  </ul>
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">Debug Info</summary>
                    <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto">
                      {Object.keys(errors).map(key => {
                        const error = errors[key as keyof typeof errors]
                        return `${key}: ${error?.message || 'Invalid'}`
                      }).join('\n')}
                    </pre>
                  </details>
                </div>
              )}
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
                        <div className="text-sm text-gray-600">${(quote.pricing?.totalPrice || quote.totalPrice || quote.total_inc_gst || 0).toFixed(2)}</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 bg-gradient-to-br from-accent-50/80 to-white rounded-lg cursor-pointer hover:bg-accent-100/50 border border-accent-200/50">
                      <input type="radio" {...register('paymentMethod')} value="deposit" className="mr-3" />
                      <div>
                        <div className="font-semibold text-gray-900">Deposit + Balance Later</div>
                        <div className="text-sm text-gray-600">${((quote.pricing?.totalPrice || quote.totalPrice || quote.total_inc_gst || 0) * 0.15).toFixed(2)} deposit</div>
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
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                step === 'contacts' ? 'Create Booking' : 'Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
