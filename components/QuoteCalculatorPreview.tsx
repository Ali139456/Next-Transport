'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const previewQuoteSchema = z.object({
  pickupSuburb: z.string().min(2, 'Suburb is required'),
  pickupPostcode: z.string().min(4, 'Postcode is required'),
  dropoffSuburb: z.string().min(2, 'Suburb is required'),
  dropoffPostcode: z.string().min(4, 'Postcode is required'),
  vehicleType: z.enum(['car', 'ute', 'van', 'bike']),
  isRunning: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === 'true'),
  transportType: z.enum(['open', 'enclosed']),
  preferredDate: z.string().min(1, 'Preferred date is required'),
})

type PreviewQuoteFormData = z.infer<typeof previewQuoteSchema>

interface QuoteCalculatorPreviewProps {
  onQuoteComplete?: (formData?: PreviewQuoteFormData) => void
  isPageMode?: boolean
}

const vehicleIcons: Record<string, string> = {
  car: '🚗',
  ute: '🛻',
  van: '🚐',
  bike: '🏍️',
}

export default function QuoteCalculatorPreview({
  onQuoteComplete,
  isPageMode = false,
}: QuoteCalculatorPreviewProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreviewQuoteFormData>({
    resolver: zodResolver(previewQuoteSchema),
    defaultValues: {
      isRunning: true,
      transportType: 'open',
      vehicleType: 'car',
    },
  })

  const onSubmit = async (data: PreviewQuoteFormData) => {
    setLoading(true)
    try {
      if (isPageMode && onQuoteComplete) {
        onQuoteComplete(data)
      } else {
        toast.success('Quote calculation coming soon!')
        onQuoteComplete?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to calculate quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Pickup Location */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Picked up at
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Suburb *</label>
            <input 
              {...register('pickupSuburb')} 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              placeholder="Suburb" 
            />
            {errors.pickupSuburb && <p className="text-red-500 text-xs mt-1">{errors.pickupSuburb.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Postcode *</label>
            <input 
              {...register('pickupPostcode')} 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              placeholder="2000" 
            />
            {errors.pickupPostcode && <p className="text-red-500 text-xs mt-1">{errors.pickupPostcode.message}</p>}
          </div>
        </div>
      </div>

      {/* Drop-off Location */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Delivery to
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Suburb *</label>
            <input 
              {...register('dropoffSuburb')} 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              placeholder="Suburb" 
            />
            {errors.dropoffSuburb && <p className="text-red-500 text-xs mt-1">{errors.dropoffSuburb.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Postcode *</label>
            <input 
              {...register('dropoffPostcode')} 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              placeholder="3000" 
            />
            {errors.dropoffPostcode && <p className="text-red-500 text-xs mt-1">{errors.dropoffPostcode.message}</p>}
          </div>
        </div>
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Vehicle Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['car', 'ute', 'van', 'bike'] as const).map((type) => (
            <label
              key={type}
              className="flex flex-col items-center p-4 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 transition-all group"
            >
              <input type="radio" {...register('vehicleType')} value={type} className="sr-only" />
              <span className="text-3xl mb-2">{vehicleIcons[type]}</span>
              <span className="text-xs text-gray-700 font-medium capitalize">{type === 'ute' ? 'Ute' : type === 'bike' ? 'Bike' : type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </label>
          ))}
        </div>
        {errors.vehicleType && <p className="text-red-500 text-xs mt-2">{errors.vehicleType.message}</p>}
      </div>

      {/* Running / Non-Running */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Vehicle Condition *</label>
        <select 
          {...register('isRunning')} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
        >
          <option value="true">Running</option>
          <option value="false">Non-Running</option>
        </select>
        {errors.isRunning && <p className="text-red-500 text-xs mt-1">{errors.isRunning.message}</p>}
      </div>

      {/* Open / Enclosed */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Transport Type *</label>
        <select 
          {...register('transportType')} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
        >
          <option value="open">Open Transport</option>
          <option value="enclosed">Enclosed Transport</option>
        </select>
        {errors.transportType && <p className="text-red-500 text-xs mt-1">{errors.transportType.message}</p>}
      </div>

      {/* Pickup Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Preferred Pickup Date *</label>
        <input
          {...register('preferredDate')}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
        />
        {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate.message}</p>}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Calculating...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Cost Calculation
            </>
          )}
        </button>
        <div className="mt-4 text-center">
          <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium inline-flex items-center gap-1">
            Contact Us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </form>
  )
}
