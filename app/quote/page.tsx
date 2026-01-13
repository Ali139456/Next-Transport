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
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* White Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Form */}
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calculate Shipping</h1>
              </div>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">Please Fill All Inquiry To Get Your Total Price.</p>
              
              <QuoteCalculatorPreview 
                onQuoteComplete={handleQuoteCalculated}
                isPageMode={true}
              />
            </div>
            
            {/* Right: Image */}
            <div className="hidden lg:block relative">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/images/quote/delivery-person.jpg)',
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
