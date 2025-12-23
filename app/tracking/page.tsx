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
    <div className="min-h-screen py-12 bg-gradient-to-br from-teal-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Track Your Booking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your booking ID to track your vehicle transport in real-time
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl card-shadow-lg p-8 md:p-12 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Enter Your Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g., NT000001"
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white shadow-sm hover:shadow-md text-center text-lg font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] transform duration-200 flex items-center justify-center gap-2"
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

