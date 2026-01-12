'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import QuoteCalculatorPreview from '@/components/QuoteCalculatorPreview'

export default function QuotePage() {
  const router = useRouter()
  const [quote, setQuote] = useState<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleQuoteCalculated = async (formData: any) => {
    try {
      // Calculate quote
      const response = await fetch('/api/quote/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupPostcode: formData.pickupPostcode,
          deliveryPostcode: formData.dropoffPostcode,
          vehicleType: formData.vehicleType,
          isRunning: Boolean(formData.isRunning),
          transportType: formData.transportType,
          insurance: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate quote')
      }

      const result = await response.json()
      
      // Create quote
      const createResponse = await fetch('/api/quote/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupAddress: {
            suburb: formData.pickupSuburb,
            postcode: formData.pickupPostcode,
          },
          dropoffAddress: {
            suburb: formData.dropoffSuburb,
            postcode: formData.dropoffPostcode,
          },
          vehicle: {
            type: formData.vehicleType,
            isRunning: Boolean(formData.isRunning),
            transportType: formData.transportType,
          },
          preferredDate: formData.preferredDate,
          insurance: false,
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create quote')
      }

      const quoteResult = await createResponse.json()
      
      setQuote({
        ...result,
        ...quoteResult,
        pricing: result,
        pickupSuburb: formData.pickupSuburb,
        pickupPostcode: formData.pickupPostcode,
        dropoffSuburb: formData.dropoffSuburb,
        dropoffPostcode: formData.dropoffPostcode,
        vehicleType: formData.vehicleType,
        isRunning: formData.isRunning,
        transportType: formData.transportType,
        preferredDate: formData.preferredDate,
      })
      
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
      toast.success('Quote calculated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate quote')
    }
  }

  const handleBookNow = () => {
    if (quote) {
      sessionStorage.setItem('quote', JSON.stringify(quote))
      router.push('/booking')
    }
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
      {/* Animated blob gradients */}
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      <div className="blob-extra"></div>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10 z-0"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float-slow pointer-events-none z-0"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent-300/10 rounded-full blur-3xl animate-float-slow-reverse pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Hero Section with Animation */}
        <div className="text-center mb-8 sm:mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-white drop-shadow-lg bg-gradient-to-r from-white via-white to-accent-100 bg-clip-text text-transparent">
            Get Instant Quote
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6">
            Get accurate pricing in seconds. No hidden fees, transparent pricing.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-white font-medium">Instant Pricing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-white font-medium">No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-white font-medium">GST Included</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Input Form */}
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 hover:shadow-3xl transition-all duration-300 hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-accent-200/50">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-accent-900">Quote Calculator</h2>
                <p className="text-sm text-gray-600">Fill in your details below</p>
              </div>
            </div>
            <QuoteCalculatorPreview 
              onQuoteComplete={handleQuoteCalculated}
              isPageMode={true}
            />
          </div>

          {/* Right: Pricing Explanation & Output Panel - Sticky */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-6">
            {/* Pricing Explanation */}
            <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-accent-900">
                  How We Calculate Your Quote
                </h2>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent-50/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Distance between pickup and delivery locations</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent-50/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <span className="font-medium">Vehicle type and size</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent-50/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="font-medium">Transport type (open or enclosed)</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent-50/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">Vehicle condition (running or non-running)</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent-50/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="font-medium">Optional add-ons (insurance, etc.)</span>
                </li>
              </ul>
            </div>

            {/* How It Works Card */}
            <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-accent-900">
                  How It Works
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">Get Your Quote</div>
                    <div className="text-sm text-gray-600">Fill out the form and receive an instant quote</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">Book & Pay</div>
                    <div className="text-sm text-gray-600">Secure your booking with a deposit or full payment</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">We Pick Up</div>
                    <div className="text-sm text-gray-600">Our driver collects your vehicle at the scheduled time</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">Track & Deliver</div>
                    <div className="text-sm text-gray-600">Track in real-time and receive your vehicle safely</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            {quote ? (
              <div className={`bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 transition-all duration-500 ${isAnimating ? 'animate-zoom-in' : ''}`}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-accent-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-accent-900">
                      Your Quote is Ready!
                    </h2>
                    <p className="text-sm text-gray-600">Valid for 30 days</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  {/* Total Price - Highlighted */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    <div className="relative z-10">
                      <div className="text-white/90 text-sm font-medium mb-2">Total Price (incl. GST)</div>
                      <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
                        ${quote.pricing?.total_inc_gst?.toFixed(2) || quote.total_inc_gst?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-white/80 text-xs mt-2">All fees included • No surprises</div>
                    </div>
                  </div>
                  
                  {/* Timeline Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border-2 border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Pickup Window</div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {quote.pricing?.pickup_window_days_min || 3} - {quote.pricing?.pickup_window_days_max || 7} days
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border-2 border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Delivery Time</div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {quote.pricing?.duration_estimate_days_min || 5} - {quote.pricing?.duration_estimate_days_max || 10} days
                      </div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="bg-gradient-to-br from-accent-50/80 to-white rounded-xl p-4 border border-accent-200/50">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                      <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">What&apos;s Included:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Door-to-door service
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Insurance included
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Real-time tracking
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        24/7 Support
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  <span>Book Now</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-xl p-8 sm:p-12 border-2 border-white/30 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-accent-100 rounded-full animate-pulse"></div>
                  </div>
                  <div className="relative text-accent-400">
                    <svg className="w-20 h-20 mx-auto animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-accent-900 mb-2">Ready to Get Started?</h3>
                <p className="text-gray-700 mb-4">
                  Fill out the form to see your instant quote
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
