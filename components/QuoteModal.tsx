'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuoteCalculator from './QuoteCalculator'

interface QuoteModalProps {
  onClose: () => void
}

export default function QuoteModal({ onClose }: QuoteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Get Instant Quote</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <QuoteCalculator onQuoteComplete={onClose} />
        </div>
      </div>
    </div>
  )
}

