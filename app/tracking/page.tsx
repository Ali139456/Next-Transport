'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrackingPage() {
  const router = useRouter()
  const [bookingId, setBookingId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bookingId.trim()) {
      router.push(`/tracking/${bookingId.trim()}`)
    }
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-accent-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-white via-accent-300 to-white bg-clip-text text-transparent px-2">
            Track Your Booking
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            Enter your booking ID to track your vehicle transport in real-time
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl card-shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Enter Your Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g., NT000001"
                className="w-full px-5 py-4 border-2 border-white/20 bg-white/10 rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all shadow-sm hover:shadow-md text-center text-base sm:text-lg font-semibold text-white placeholder-gray-300"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Track Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

