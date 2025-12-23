'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Booking {
  bookingId: string
  status: string
  customer: {
    firstName: string
    lastName: string
    email: string
  }
  vehicle: {
    type: string
    make: string
    model: string
  }
  pickup: {
    address: string
    suburb: string
    postcode: string
    state: string
  }
  delivery: {
    address: string
    suburb: string
    postcode: string
    state: string
  }
  driver?: {
    name: string
    phone: string
    vehicle: string
  }
  tracking: {
    currentLocation?: {
      lat: number
      lng: number
      timestamp: Date
    }
    estimatedPickup?: Date
    estimatedDelivery?: Date
    actualPickup?: Date
    actualDelivery?: Date
    statusHistory: Array<{
      status: string
      timestamp: Date
      note?: string
    }>
  }
  pricing: {
    totalPrice: number
  }
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'driver-assigned', label: 'Driver Assigned', icon: '👤' },
  { key: 'picked-up', label: 'Picked Up', icon: '🚗' },
  { key: 'in-transit', label: 'In Transit', icon: '🚛' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
]

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
      if (!response.ok) {
        throw new Error('Failed to fetch booking')
      }
      const data = await response.json()
      setBooking(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching booking:', error)
      setError('Failed to load booking. Please try again.')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchBooking()
    // Poll for updates every 30 seconds
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

  const currentStatusIndex = statusSteps.findIndex((step) => step.key === booking.status)
  const statusDisplay = statusSteps[currentStatusIndex] || statusSteps[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tracking Your Booking</h1>
            <p className="text-2xl font-semibold text-accent-600">#{booking.bookingId}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-xl font-bold">{statusDisplay.icon} {statusDisplay.label}</div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Booking Status</h2>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex
            const isCurrent = index === currentStatusIndex

            return (
              <div key={step.key} className="flex items-start">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-accent-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <div
                    className={`font-semibold ${
                      isCurrent ? 'text-accent-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isCurrent && booking.tracking?.statusHistory && booking.tracking.statusHistory.length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      {booking.tracking.statusHistory[booking.tracking.statusHistory.length - 1]?.note || ''}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Booking Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pickup Location</h2>
          <div className="space-y-2 text-gray-700">
            <p>{booking.pickup.address}</p>
            <p>
              {booking.pickup.suburb} {booking.pickup.postcode}, {booking.pickup.state}
            </p>
            {booking.tracking?.estimatedPickup && (
              <p className="text-sm text-gray-600 mt-2">
                Estimated: {new Date(booking.tracking.estimatedPickup).toLocaleDateString()}
              </p>
            )}
            {booking.tracking?.actualPickup && (
              <p className="text-sm text-green-600 mt-2">
                Picked up: {new Date(booking.tracking.actualPickup).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Location</h2>
          <div className="space-y-2 text-gray-700">
            <p>{booking.delivery.address}</p>
            <p>
              {booking.delivery.suburb} {booking.delivery.postcode}, {booking.delivery.state}
            </p>
            {booking.tracking?.estimatedDelivery && (
              <p className="text-sm text-gray-600 mt-2">
                Estimated: {new Date(booking.tracking.estimatedDelivery).toLocaleDateString()}
              </p>
            )}
            {booking.tracking?.actualDelivery && (
              <p className="text-sm text-green-600 mt-2">
                Delivered: {new Date(booking.tracking.actualDelivery).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle & Driver Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Type:</strong> {booking.vehicle.type}
            </p>
            <p>
              <strong>Make/Model:</strong> {booking.vehicle.make} {booking.vehicle.model}
            </p>
          </div>
        </div>

        {booking.driver && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Driver Information</h2>
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

      {/* Map (placeholder - integrate with Google Maps) */}
      {booking.tracking?.currentLocation && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Location</h2>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              Map integration - Current location: {booking.tracking.currentLocation.lat},{' '}
              {booking.tracking.currentLocation.lng}
            </p>
          </div>
        </div>
      )}

      {/* Status History */}
      {booking.tracking?.statusHistory && booking.tracking.statusHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Status History</h2>
          <div className="space-y-3">
            {booking.tracking.statusHistory
              .slice()
              .reverse()
              .map((history, index) => {
                try {
                  return (
                    <div key={index} className="border-l-2 border-primary-200 pl-4 py-2">
                      <div className="font-semibold">{history.status || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">
                        {history.timestamp ? new Date(history.timestamp).toLocaleString() : 'N/A'}
                      </div>
                      {history.note && <div className="text-sm text-gray-700 mt-1">{history.note}</div>}
                    </div>
                  )
                } catch (error) {
                  console.error('Error rendering history item:', error)
                  return null
                }
              })}
          </div>
        </div>
      )}
    </div>
  )
}

