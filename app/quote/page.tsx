'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import QuoteCalculatorPreview from '@/components/QuoteCalculatorPreview'

export default function QuotePage() {
  const router = useRouter()
  const [quote, setQuote] = useState<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  const handleQuoteCalculated = async (formData: any) => {
    try {
      // Map vehicle type to valid enum values for pricing
      const mapVehicleType = (type: string): string => {
        const typeMap: { [key: string]: string } = {
          'car': 'sedan',
          'sedan': 'sedan',
          'suv': 'suv',
          'ute': 'ute',
          'van': 'van',
          'light-truck': 'light-truck',
          'bike': 'bike',
        }
        return typeMap[type.toLowerCase()] || 'sedan'
      }

      // Calculate quote
      const response = await fetch('/api/quote/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupPostcode: formData.pickupPostcode,
          deliveryPostcode: formData.dropoffPostcode,
          vehicleType: mapVehicleType(formData.vehicleType),
          isRunning: Boolean(formData.isRunning),
          transportType: formData.transportType,
          insurance: formData.insurance || false,
          expressDelivery: formData.expressDelivery || false,
          packaging: formData.packaging || false,
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
            address: '', // Not provided in form
            suburb: formData.pickupSuburb,
            postcode: formData.pickupPostcode,
            state: '', // Not provided in form
            contactName: '', // Not provided in form
            contactPhone: '', // Not provided in form
          },
          dropoffAddress: {
            address: '', // Not provided in form
            suburb: formData.dropoffSuburb,
            postcode: formData.dropoffPostcode,
            state: '', // Not provided in form
            contactName: '', // Not provided in form
            contactPhone: '', // Not provided in form
          },
          vehicle: {
            type: formData.vehicleType,
            make: '', // Not provided in form
            model: '', // Not provided in form
            year: '', // Not provided in form
            isRunning: Boolean(formData.isRunning),
          },
          preferredPickupDate: formData.preferredDate,
          transportType: formData.transportType,
          addOns: {
            expressDelivery: formData.expressDelivery || false,
            packaging: formData.packaging || false,
            insurance: formData.insurance || false,
          },
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({ error: 'Failed to create quote' }))
        throw new Error(errorData.error || 'Failed to create quote')
      }

      const quoteResult = await createResponse.json()
      
      // Extract quote ID from the response
      const quoteId = quoteResult.quote?.id || quoteResult.quote?._id || quoteResult.id
      
      setQuote({
        ...result,
        ...quoteResult,
        pricing: result,
        // Ensure quote ID is available in multiple formats for compatibility
        id: quoteId,
        quote_id: quoteId,
        _id: quoteId,
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
      setShowQuoteModal(true)
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

  // Handle escape key and body scroll for modal
  useEffect(() => {
    if (showQuoteModal) {
      document.body.style.overflow = 'hidden'
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowQuoteModal(false)
        }
      }
      window.addEventListener('keydown', handleEscape)
      return () => {
        document.body.style.overflow = 'unset'
        window.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [showQuoteModal])

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
      </div>

      {/* Form and How We Calculate Section - Outside container for page-level margins */}
      <div className="w-full relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-[150px]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8 lg:justify-center">
          {/* Form Container - Left Side */}
          <div className="w-full lg:max-w-[1200px]">
            <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-0 border-2 border-white/30 hover:shadow-3xl transition-all duration-300">
              <div 
                className="w-full flex flex-col h-auto lg:h-[600px]"
                style={{ width: '100%', minHeight: '500px' }}
              >
                <QuoteCalculatorPreview 
                  onQuoteComplete={handleQuoteCalculated}
                  isPageMode={true}
                />
              </div>
            </div>
          </div>

          {/* How We Calculate Your Quote Section - Right Side, Vertical, Centered */}
          <div className="w-full lg:w-96 xl:w-[420px] lg:flex-shrink-0 lg:self-center">
            <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-xl p-5 sm:p-6 border-2 border-white/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-accent-900">How We Calculate Your Quote</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                  <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.293 12.293a1.999 1.999 0 010-2.827l4.364-4.364a8 8 0 110 11.314z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">Distance between pickup and delivery locations</h3>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                  <div className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">Vehicle type and size</h3>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                  <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">Transport type (open or enclosed)</h3>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                  <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">Vehicle condition (running or non-running)</h3>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-100 hover:border-pink-200 transition-all hover:shadow-md">
                  <div className="w-9 h-9 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">Optional add-ons (insurance, etc.)</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Modal */}
          {showQuoteModal && quote && (
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowQuoteModal(false)
                }
              }}
            >
              <div className={`bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 transition-all duration-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isAnimating ? 'animate-zoom-in' : ''}`}>
                {/* Close Button */}
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-white/10 rounded-full p-2 transition-all duration-200 w-10 h-10 flex items-center justify-center group z-10"
                  aria-label="Close modal"
                >
                  <svg 
                    className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

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
                        ${quote.pricing?.totalPrice?.toFixed(2) || quote.totalPrice?.toFixed(2) || quote.total_inc_gst?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-white/80 text-xs mt-2">All fees included • No surprises</div>
                    </div>
                  </div>
                  
                  {/* Timeline Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        {quote.pricing?.estimatedPickupWindow || '3-5 business days'}
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
                        {quote.pricing?.estimatedDeliveryTimeframe || '2-3 days after pickup'}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
