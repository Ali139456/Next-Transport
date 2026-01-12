'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import QuoteCalculatorPreview from '@/components/QuoteCalculatorPreview'

export default function QuotePage() {
  const router = useRouter()
  const [quote, setQuote] = useState<any>(null)

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
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float-slow-reverse"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
            Get Instant Quote
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Get accurate pricing in seconds. No hidden fees, transparent pricing.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Input Form */}
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30">
            <QuoteCalculatorPreview 
              onQuoteComplete={handleQuoteCalculated}
              isPageMode={true}
            />
          </div>

          {/* Right: Pricing Explanation & Output Panel */}
          <div className="space-y-6">
            {/* Pricing Explanation */}
            <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-white/30 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-accent-900">
                How We Calculate Your Quote
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Distance between pickup and delivery locations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Vehicle type and size</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Transport type (open or enclosed)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Vehicle condition (running or non-running)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Optional add-ons (insurance, etc.)</span>
                </li>
              </ul>
            </div>

            {/* Output Panel */}
            {quote ? (
              <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-accent-900">
                  Your Quote
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-4 border-b-2 border-accent-200/50">
                    <span className="text-lg font-semibold text-gray-700">Total Price (incl. GST)</span>
                    <span className="text-3xl font-extrabold text-accent-600">
                      ${quote.pricing?.total_inc_gst?.toFixed(2) || quote.total_inc_gst?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-accent-100/50 to-white rounded-lg p-4 border border-accent-200/50">
                    <div className="text-sm text-gray-600 mb-2">Estimated Pickup Window</div>
                    <div className="font-semibold text-accent-900">
                      {quote.pricing?.pickup_window_days_min || 3} - {quote.pricing?.pickup_window_days_max || 7} days
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-accent-100/50 to-white rounded-lg p-4 border border-accent-200/50">
                    <div className="text-sm text-gray-600 mb-2">Estimated Delivery Timeframe</div>
                    <div className="font-semibold text-accent-900">
                      {quote.pricing?.duration_estimate_days_min || 5} - {quote.pricing?.duration_estimate_days_max || 10} days
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Book Now
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-white/30 text-center">
                <div className="text-accent-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Fill out the form to see your instant quote
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
