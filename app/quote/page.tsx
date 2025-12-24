'use client'

import QuoteCalculator from '@/components/QuoteCalculator'

export default function QuotePage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-accent-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-white via-accent-300 to-white bg-clip-text text-transparent px-2">
            Get Instant Quote
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            Get accurate pricing in seconds. No hidden fees, transparent pricing.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl card-shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-200">
          <QuoteCalculator />
        </div>
      </div>
    </div>
  )
}

