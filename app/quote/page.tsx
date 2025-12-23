'use client'

import QuoteCalculator from '@/components/QuoteCalculator'

export default function QuotePage() {
  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-300/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">
            Get Instant Quote
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get accurate pricing in seconds. No hidden fees, transparent pricing.
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl card-shadow-lg p-8 md:p-12 border border-white/20">
          <QuoteCalculator />
        </div>
      </div>
    </div>
  )
}

