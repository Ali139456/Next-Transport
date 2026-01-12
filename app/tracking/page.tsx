'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const trackingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  emailOrMobile: z.string().min(1, 'Email or mobile is required'),
})

type TrackingFormData = z.infer<typeof trackingSchema>

export default function TrackingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
  })

  const onSubmit = async (data: TrackingFormData) => {
    setLoading(true)
    try {
      // Verify booking access
      const response = await fetch(`/api/bookings/${data.bookingId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Booking not found or access denied')
      }

      const booking = await response.json()
      
      // Simple verification - in production, this would be more secure
      const emailMatch = booking.customer_id?.email?.toLowerCase() === data.emailOrMobile.toLowerCase()
      const phoneMatch = booking.customer_id?.phone?.replace(/\s/g, '') === data.emailOrMobile.replace(/\s/g, '')
      
      if (!emailMatch && !phoneMatch) {
        throw new Error('Email or mobile does not match this booking')
      }

      // Redirect to tracking detail page
      router.push(`/tracking/${data.bookingId}`)
    } catch (error: any) {
      alert(error.message || 'Failed to verify booking. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float-slow-reverse"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
            Track Your Booking
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Enter your booking ID and email or mobile to track your vehicle transport
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Booking ID *
              </label>
              <input
                {...register('bookingId')}
                type="text"
                placeholder="e.g., NT000001"
                className="form-input-light"
              />
              {errors.bookingId && (
                <p className="text-red-500 text-sm mt-1">{errors.bookingId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email OR Mobile *
              </label>
              <input
                {...register('emailOrMobile')}
                type="text"
                placeholder="your@email.com or 0400 000 000"
                className="form-input-light"
              />
              {errors.emailOrMobile && (
                <p className="text-red-500 text-sm mt-1">{errors.emailOrMobile.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter the email or mobile number used when booking
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Track Booking
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
