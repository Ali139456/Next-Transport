'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'

interface Booking {
  booking_number: string
  tracking_token: string
  status: string
  customer: {
    name: string
    email: string
    phone?: string
  } | null
  vehicle: {
    type: string
    make: string
    model: string
    year: string
    transportType: string
  } | null
  pickup: {
    address: string
    suburb: string
    postcode: string
    state: string
    contactName?: string
    contactPhone?: string
  } | null
  delivery: {
    address: string
    suburb: string
    postcode: string
    state: string
    contactName?: string
    contactPhone?: string
  } | null
  pickup_timeframe: {
    start: string
    end: string
  }
  special_instructions?: string
  total_inc_gst: number
  deposit_required_amount: number
  balance_due_amount: number
  driver?: {
    name: string
    phone: string
    vehicle: string
  }
  estimated_delivery_date?: string
  estimated_pickup_date?: string
  created_at: string
}

const statusSteps = [
  { key: 'quote_created', label: 'Quote Created', icon: '📋' },
  { key: 'booking_pending_payment', label: 'Pending Payment', icon: '💳' },
  { key: 'booked_confirmed', label: 'Booked & Confirmed', icon: '✓' },
  { key: 'awaiting_driver_assignment', label: 'Awaiting Driver', icon: '⏳' },
  { key: 'driver_assigned', label: 'Driver Assigned', icon: '👤' },
  { key: 'driver_en_route', label: 'Driver En Route', icon: '🚗' },
  { key: 'picked_up', label: 'Picked Up', icon: '📦' },
  { key: 'in_depot', label: 'In Depot', icon: '🏢' },
  { key: 'in_transit', label: 'In Transit', icon: '🚛' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
] as const

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    quote_created: 'Quote Created',
    booking_pending_payment: 'Pending Payment',
    booked_confirmed: 'Booked & Confirmed',
    awaiting_driver_assignment: 'Awaiting Driver',
    driver_assigned: 'Driver Assigned',
    driver_en_route: 'Driver En Route',
    picked_up: 'Picked Up',
    in_depot: 'In Depot',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    on_hold_customer: 'On Hold (Customer)',
    on_hold_operations: 'On Hold (Operations)',
    failed_pickup: 'Failed Pickup',
    failed_delivery: 'Failed Delivery',
    rebook_required: 'Rebook Required',
  }

  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function TrackingPage() {
  const params = useParams()
  const bookingId = params?.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setError('Booking ID is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (!response.ok) throw new Error('Failed to fetch booking')

      const data = (await response.json()) as Booking
      setBooking(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching booking:', err)
      setError('Failed to load booking. Please try again.')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchBooking()
    const interval = setInterval(fetchBooking, 30000)
    return () => clearInterval(interval)
  }, [fetchBooking])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error || 'Booking not found'}</div>
      </div>
    )
  }

  const specialStatuses = useMemo(
    () => [
      'cancelled',
      'refunded',
      'on_hold_customer',
      'on_hold_operations',
      'failed_pickup',
      'failed_delivery',
      'rebook_required',
    ],
    []
  )

  const isSpecialStatus = specialStatuses.includes(booking.status)
  const currentStatusIndex = isSpecialStatus ? -1 : statusSteps.findIndex((step) => step.key === booking.status)

  const statusDisplay = useMemo(() => {
    if (currentStatusIndex >= 0 && statusSteps[currentStatusIndex]) return statusSteps[currentStatusIndex]
    return { key: booking.status, label: formatStatus(booking.status), icon: '⚠️' }
  }, [booking.status, currentStatusIndex])

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float-slow-reverse"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-white/30 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-accent-900">Tracking Your Booking</h1>
              <p className="text-xl sm:text-2xl font-semibold text-accent-600">#{booking.booking_number}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className="text-lg sm:text-xl font-bold text-accent-900">
                {statusDisplay.icon} {formatStatus(booking.status)}
              </div>
            </div>
          </div>
        </div>

        {/* ETA Information */}
        {(booking.estimated_pickup_date || booking.estimated_delivery_date) && (
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 mb-6 border-l-4 border-accent-600 border-2 border-white/30">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Estimated Timeline</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {booking.estimated_pickup_date && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-900">Estimated Pickup</span>
                  </div>
                  <p className="text-lg font-bold text-accent-600">
                    {new Date(booking.estimated_pickup_date).toLocaleDateString('en-AU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {booking.estimated_delivery_date && (
                <div className="bg-white/80 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-900">Estimated Delivery</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {new Date(booking.estimated_delivery_date).toLocaleDateString('en-AU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Map - Driver Location */}
        {(booking.status === 'driver_en_route' || booking.status === 'in_transit' || booking.status === 'picked_up') &&
          booking.driver && (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Live Tracking
              </h2>

              <div className="bg-gradient-to-br from-accent-100/50 to-white rounded-lg h-64 flex items-center justify-center relative overflow-hidden border border-accent-200/50">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">Live map tracking</p>
                  <p className="text-xs text-gray-400 mt-1">Driver location will appear here</p>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                <strong>Driver:</strong> {booking.driver.name} • <strong>Vehicle:</strong> {booking.driver.vehicle}
              </p>
            </div>
          )}

        {/* Status Timeline */}
        <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 mb-6 border-2 border-white/30">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Booking Status</h2>

          {isSpecialStatus ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{statusDisplay.icon}</div>
                <div>
                  <p className="font-semibold text-yellow-800">{statusDisplay.label}</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {booking.status === 'cancelled' && 'This booking has been cancelled.'}
                    {booking.status === 'refunded' && 'This booking has been refunded.'}
                    {booking.status === 'on_hold_customer' && 'This booking is on hold pending customer action.'}
                    {booking.status === 'on_hold_operations' && 'This booking is on hold for operational reasons.'}
                    {booking.status === 'failed_pickup' && 'Pickup was unsuccessful. Please contact support.'}
                    {booking.status === 'failed_delivery' && 'Delivery was unsuccessful. Please contact support.'}
                    {booking.status === 'rebook_required' && 'This booking needs to be rebooked. Please contact support.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex
                const isCurrent = index === currentStatusIndex

                return (
                  <div key={step.key} className="flex items-start">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          isCompleted ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
                        } ${isCurrent ? 'ring-4 ring-blue-200 scale-110' : ''}`}
                      >
                        {isCompleted ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>

                      {index < statusSteps.length - 1 && (
                        <div className={`w-1 h-12 ml-5 -mt-2 ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`} />
                      )}
                    </div>

                    <div className="ml-4 flex-1 pb-8">
                      <div
                        className={`font-semibold text-base ${
                          isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 border-2 border-white/30">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Pickup Location</h2>
            {booking.pickup ? (
              <div className="space-y-2 text-gray-800">
                <p className="font-medium">{booking.pickup.address}</p>
                <p className="text-gray-700">
                  {booking.pickup.suburb} {booking.pickup.postcode}, {booking.pickup.state}
                </p>
                {booking.pickup_timeframe && (
                  <p className="text-sm text-gray-600 mt-2">
                    Window: {new Date(booking.pickup_timeframe.start).toLocaleDateString()} -{' '}
                    {new Date(booking.pickup_timeframe.end).toLocaleDateString()}
                  </p>
                )}
                {booking.pickup.contactName && (
                  <p className="text-sm text-gray-600 mt-2">
                    Contact: {booking.pickup.contactName} {booking.pickup.contactPhone && `(${booking.pickup.contactPhone})`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Pickup location not available</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 border-2 border-white/30">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Delivery Location</h2>
            {booking.delivery ? (
              <div className="space-y-2 text-gray-800">
                <p className="font-medium">{booking.delivery.address}</p>
                <p className="text-gray-700">
                  {booking.delivery.suburb} {booking.delivery.postcode}, {booking.delivery.state}
                </p>
                {booking.delivery.contactName && (
                  <p className="text-sm text-gray-600 mt-2">
                    Contact: {booking.delivery.contactName} {booking.delivery.contactPhone && `(${booking.delivery.contactPhone})`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Delivery location not available</p>
            )}
          </div>
        </div>

        {/* Vehicle & Driver Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 border-2 border-white/30">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Vehicle Details</h2>
            {booking.vehicle ? (
              <div className="space-y-2 text-gray-800">
                <p>
                  <strong className="text-gray-900">Type:</strong> <span className="text-gray-700 capitalize">{booking.vehicle.type}</span>
                </p>
                <p>
                  <strong className="text-gray-900">Make/Model:</strong>{' '}
                  <span className="text-gray-700">
                    {booking.vehicle.make} {booking.vehicle.model}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-900">Year:</strong> <span className="text-gray-700">{booking.vehicle.year}</span>
                </p>
                <p>
                  <strong className="text-gray-900">Transport Type:</strong>{' '}
                  <span className="text-gray-700 capitalize">{booking.vehicle.transportType}</span>
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Vehicle details not available</p>
            )}
          </div>

          {booking.driver && (
            <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 border-2 border-white/30">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Driver Information</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Name:</strong> {booking.driver.name}
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${booking.driver.phone}`} className="text-accent-600 hover:underline font-semibold">
                    {booking.driver.phone}
                  </a>
                </p>
                <p>
                  <strong>Vehicle:</strong> {booking.driver.vehicle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Pricing Information</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 p-4 rounded-xl border border-accent-200">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-accent-600">${booking.total_inc_gst.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-accent-50/80 to-white p-4 rounded-xl border-2 border-accent-200/50">
              <p className="text-sm text-gray-600 mb-1">Deposit Paid</p>
              <p className="text-xl font-semibold text-gray-800">${booking.deposit_required_amount.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-accent-50/80 to-white p-4 rounded-xl border-2 border-accent-200/50">
              <p className="text-sm text-gray-600 mb-1">Balance Due</p>
              <p className="text-xl font-semibold text-gray-800">${booking.balance_due_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {booking.special_instructions && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Special Instructions</h2>
            <p className="text-gray-800 bg-gradient-to-br from-accent-50/80 to-white p-4 rounded-lg border-2 border-accent-200/50">
              {booking.special_instructions}
            </p>
          </div>
        )}

        {/* Support Contact */}
        <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 mb-6 border-2 border-white/30">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Need Help? Contact Support
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-accent-50/80 to-white rounded-lg p-4 border border-accent-200/50">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="font-semibold text-gray-900">Phone</span>
              </div>
              <a href="tel:1300000000" className="text-blue-600 hover:text-blue-700 font-semibold">
                1300 000 000
              </a>
              <p className="text-sm text-gray-600 mt-1">Mon-Fri 8am-6pm AEST</p>
            </div>

            <div className="bg-gradient-to-br from-accent-50/80 to-white rounded-lg p-4 border border-accent-200/50">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-semibold text-gray-900">Email</span>
              </div>
              <a href="mailto:support@nexttransport.com.au" className="text-blue-600 hover:text-blue-700 font-semibold">
                support@nexttransport.com.au
              </a>
              <p className="text-sm text-gray-600 mt-1">24/7 email support</p>
            </div>
          </div>
        </div>

        {/* Messaging Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Messages & Updates
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">System Update</p>
                  <p className="text-gray-900 font-medium">
                    Your booking #{booking.booking_number} is being processed. We&apos;ll keep you updated on any changes.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(booking.created_at).toLocaleDateString('en-AU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {booking.driver && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Driver Assigned</p>
                    <p className="text-gray-900 font-medium">Your driver {booking.driver.name} has been assigned to your booking.</p>
                    {booking.driver.phone && (
                      <p className="text-sm text-gray-700 mt-2">
                        Contact:{' '}
                        <a href={`tel:${booking.driver.phone}`} className="text-accent-600 hover:underline">
                          {booking.driver.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Need to contact us?</p>
              <p className="text-gray-900">
                For any questions or updates, please contact our support team at{' '}
                <a href="mailto:support@nexttransport.com.au" className="text-accent-600 hover:underline font-semibold">
                  support@nexttransport.com.au
                </a>{' '}
                or call{' '}
                <a href="tel:1300NEXTTRANSPORT" className="text-accent-600 hover:underline font-semibold">
                  1300 NEXT TRANSPORT
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
