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
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/30 relative animate-[zoomIn_0.3s_ease-out]">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900/98 via-gray-800/98 to-black/98 backdrop-blur-xl border-b border-white/30 p-5 sm:p-6 flex justify-between items-center z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-accent-300 to-white bg-clip-text text-transparent">
                Get Instant Quote
              </h2>
              <p className="text-sm text-gray-300 mt-1 hidden sm:block">
                Get accurate pricing in seconds. No hidden fees.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 w-10 h-10 flex items-center justify-center group border border-white/20 hover:border-white/40"
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
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-4 sm:p-6 lg:p-8 relative z-10 custom-scrollbar">
          <QuoteCalculatorPreview onQuoteComplete={onClose} />
        </div>
      </div>
    </div>
  )
}

