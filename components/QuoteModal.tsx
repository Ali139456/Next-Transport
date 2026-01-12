'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QuoteCalculatorPreview from './QuoteCalculatorPreview'

interface QuoteModalProps {
  onClose: () => void
}

export default function QuoteModal({ onClose }: QuoteModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-accent-900 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 relative animate-[zoomIn_0.2s_ease-out]">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-white/20 p-4 sm:p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-accent-300 to-white bg-clip-text text-transparent">
              Get Instant Quote
            </h2>
            <p className="text-sm text-gray-300 mt-1 hidden sm:block">
              Get accurate pricing in seconds. No hidden fees.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 w-10 h-10 flex items-center justify-center group"
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
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-100px)] p-4 sm:p-6 lg:p-8 relative z-10">
          <QuoteCalculatorPreview onQuoteComplete={onClose} />
        </div>
      </div>
    </div>
  )
}

