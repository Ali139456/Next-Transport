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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Pickup Location */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Pickup Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Suburb *</label>
            <input {...register('pickupSuburb')} type="text" className="form-input-light" placeholder="Suburb" />
            {errors.pickupSuburb && <p className="text-red-500 text-sm mt-1">{errors.pickupSuburb.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode *</label>
            <input {...register('pickupPostcode')} type="text" className="form-input-light" placeholder="2000" />
            {errors.pickupPostcode && <p className="text-red-500 text-sm mt-1">{errors.pickupPostcode.message}</p>}
          </div>
        </div>
      </div>

      {/* Drop-off Location */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Drop-off Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Suburb *</label>
            <input {...register('dropoffSuburb')} type="text" className="form-input-light" placeholder="Suburb" />
            {errors.dropoffSuburb && <p className="text-red-500 text-sm mt-1">{errors.dropoffSuburb.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode *</label>
            <input {...register('dropoffPostcode')} type="text" className="form-input-light" placeholder="3000" />
            {errors.dropoffPostcode && <p className="text-red-500 text-sm mt-1">{errors.dropoffPostcode.message}</p>}
          </div>
        </div>
      </div>

      {/* Vehicle Type */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 sm:p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">Vehicle Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['car', 'ute', 'van', 'bike'] as const).map((type) => (
            <label
              key={type}
              className="flex flex-col items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm hover:shadow-md"
            >
              <input type="radio" {...register('vehicleType')} value={type} className="sr-only" />
              <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">{vehicleIcons[type]}</span>
              <span className="text-xs sm:text-sm text-gray-700 font-medium capitalize group-hover:text-blue-600">{type}</span>
            </label>
          ))}
        </div>
        {errors.vehicleType && <p className="text-red-500 text-sm mt-2">{errors.vehicleType.message}</p>}
      </div>

      {/* Running / Non-Running */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 sm:p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">Vehicle Condition *</label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm">
            <input
              type="radio"
              {...register('isRunning')}
              value="true"
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-900 group-hover:text-blue-600">Running</span>
              <p className="text-sm text-gray-600">Vehicle starts and drives</p>
            </div>
          </label>

          <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm">
            <input
              type="radio"
              {...register('isRunning')}
              value="false"
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-900 group-hover:text-blue-600">Non-Running</span>
              <p className="text-sm text-gray-600">Vehicle doesn&apos;t start or drive</p>
            </div>
          </label>
        </div>
      </div>

      {/* Open / Enclosed */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 sm:p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">Transport Type *</label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm">
            <input
              type="radio"
              {...register('transportType')}
              value="open"
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-900 group-hover:text-blue-600">Open Transport</span>
              <p className="text-sm text-gray-600">More economical option</p>
            </div>
          </label>

          <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm">
            <input
              type="radio"
              {...register('transportType')}
              value="enclosed"
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-900 group-hover:text-blue-600">Enclosed Transport</span>
              <p className="text-sm text-gray-600">Maximum protection</p>
            </div>
          </label>
        </div>
      </div>

      {/* Pickup Date */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 sm:p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Preferred Pickup Date *
        </label>
        <input
          {...register('preferredDate')}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="form-input-light"
        />
        {errors.preferredDate && <p className="text-red-500 text-sm mt-1">{errors.preferredDate.message}</p>}
      </div>

      {/* CTA Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          'Calculate Quote'
        )}
      </button>
    </form>
  )
}
