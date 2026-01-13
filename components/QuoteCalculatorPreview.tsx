'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

// Custom Dropdown Component
interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; icon?: string }[]
  placeholder?: string
  className?: string
}

function CustomSelect({ value, onChange, options, placeholder, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 pr-12 text-left text-base font-medium bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:ring-4 focus:ring-accent-400/30 focus:border-accent-500 transition-all duration-300 outline-none shadow-md hover:shadow-lg hover:border-accent-400 transform hover:-translate-y-0.5 hover:scale-[1.01] flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && <span className="text-base">{selectedOption.icon}</span>}
          <span>{selectedOption?.label || placeholder || 'Select...'}</span>
        </span>
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-md transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-fadeIn animate-slideDown">
          <div className="py-1 max-h-60 overflow-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3.5 text-left text-base font-medium transition-all duration-200 flex items-center gap-3 relative ${
                  value === option.value
                    ? 'bg-gradient-to-r from-accent-50 via-accent-100 to-accent-50 text-accent-900 border-l-4 border-accent-500 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:pl-5'
                }`}
              >
                {option.icon && <span className="text-base">{option.icon}</span>}
                <span className="flex-1">{option.label}</span>
                {value === option.value && (
                      <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const previewQuoteSchema = z.object({
  pickupSuburb: z.string().min(2, 'Suburb is required'),
  pickupPostcode: z.string().min(4, 'Postcode is required'),
  dropoffSuburb: z.string().min(2, 'Suburb is required'),
  dropoffPostcode: z.string().min(4, 'Postcode is required'),
  vehicleType: z.enum(['car', 'ute', 'van', 'bike']),
  isRunning: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === 'true'),
  transportType: z.enum(['open', 'enclosed']),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  expressDelivery: z.boolean().optional(),
  packaging: z.boolean().optional(),
  insurance: z.boolean().optional(),
})

type PreviewQuoteFormData = z.infer<typeof previewQuoteSchema>

interface QuoteCalculatorPreviewProps {
  onQuoteComplete?: (formData?: PreviewQuoteFormData) => void
  isPageMode?: boolean
}

export default function QuoteCalculatorPreview({
  onQuoteComplete,
  isPageMode = false,
}: QuoteCalculatorPreviewProps) {
  const [loading, setLoading] = useState(false)
  const [vehicleType, setVehicleType] = useState('car')
  const [isRunning, setIsRunning] = useState('true')
  const [transportType, setTransportType] = useState('open')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PreviewQuoteFormData>({
    resolver: zodResolver(previewQuoteSchema),
    defaultValues: {
      isRunning: true,
      transportType: 'open',
      vehicleType: 'car',
      expressDelivery: false,
      packaging: false,
      insurance: false,
    },
  })

  // Sync local state with form
  useEffect(() => {
    setValue('vehicleType', vehicleType as any)
  }, [vehicleType, setValue])

  useEffect(() => {
    setValue('isRunning', isRunning === 'true')
  }, [isRunning, setValue])

  useEffect(() => {
    setValue('transportType', transportType as any)
  }, [transportType, setValue])

  const onSubmit = async (data: PreviewQuoteFormData) => {
    setLoading(true)
    try {
      // Ensure all values are properly set and mapped correctly
      const formData = {
        pickupSuburb: data.pickupSuburb,
        pickupPostcode: data.pickupPostcode,
        dropoffSuburb: data.dropoffSuburb,
        dropoffPostcode: data.dropoffPostcode,
        vehicleType: vehicleType as any,
        isRunning: isRunning === 'true' || (typeof isRunning === 'boolean' && isRunning),
        transportType: transportType as any,
        preferredDate: data.preferredDate,
        expressDelivery: data.expressDelivery || false,
        packaging: data.packaging || false,
        insurance: data.insurance || false,
      }
      
      // Validate required fields
      if (!formData.pickupSuburb || !formData.pickupPostcode || !formData.dropoffSuburb || !formData.dropoffPostcode || !formData.preferredDate) {
        toast.error('Please fill in all required fields')
        setLoading(false)
        return
      }
      
      if (isPageMode && onQuoteComplete) {
        onQuoteComplete(formData)
      } else {
        toast.success('Quote calculation coming soon!')
        onQuoteComplete?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to calculate quote')
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`w-full h-full flex flex-col p-4 sm:p-5 relative overflow-hidden ${isPageMode ? 'bg-white' : ''}`} style={{ borderRadius: '12px' }}>
      {/* Decorative background elements */}
      {!isPageMode && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-100/30 to-transparent rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent-100/20 to-transparent rounded-full blur-xl -ml-12 -mb-12"></div>
        </>
      )}
      
      {/* Header Section */}
      <div className={`mb-3 pb-3 flex-shrink-0 relative z-10 ${isPageMode ? 'border-b-2 border-accent-200' : 'border-b-2 border-white/20'}`}>
        <div className="flex items-center gap-3 mb-1.5">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/30 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-400 to-accent-600 rounded-xl opacity-20 blur animate-pulse"></div>
          </div>
          <div>
            <h2 className={`text-2xl font-extrabold ${isPageMode ? 'text-accent-900' : 'text-white'}`}>
              Calculate Quote
            </h2>
          </div>
        </div>
        <p className={`text-xs ml-14 font-medium ${isPageMode ? 'text-gray-600' : 'text-white/70'}`}>Please Fill All Inquiry To Get Your Total Price</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        {/* Responsive Grid Layout - 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Column 1 */}
          <div className="space-y-2 flex flex-col min-w-0">
            {/* Select Service / Vehicle Type */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-1.5 ${isPageMode ? 'text-gray-800' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Select Service *
              </label>
              <CustomSelect
                value={vehicleType}
                onChange={setVehicleType}
                options={[
                  { value: 'car', label: 'Car Transport', icon: '🚗' },
                  { value: 'ute', label: 'Ute Transport', icon: '🛻' },
                  { value: 'van', label: 'Van Transport', icon: '🚐' },
                  { value: 'bike', label: 'Bike Transport', icon: '🏍️' },
                ]}
                placeholder="Select Service"
              />
              <input type="hidden" {...register('vehicleType')} value={vehicleType} />
              {errors.vehicleType && <p className="text-red-500 text-xs mt-0.5">{errors.vehicleType.message}</p>}
            </div>

            {/* Picked up at / Pickup Location */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-1.5 ${isPageMode ? 'text-gray-800' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Picked up at *
              </label>
              <div className="space-y-2">
                <input
                  {...register('pickupSuburb')}
                  type="text"
                  className="w-full px-4 py-3 text-base bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-400 focus:border-accent-500 transition-all duration-300 outline-none shadow-sm hover:shadow-md hover:border-accent-400 hover:bg-white transform hover:-translate-y-0.5"
                  placeholder="Suburb"
                />
                {errors.pickupSuburb && <p className="text-red-500 text-xs font-medium animate-pulse">{errors.pickupSuburb.message}</p>}
                <input
                  {...register('pickupPostcode')}
                  type="text"
                  className="w-full px-4 py-3 text-base bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-400 focus:border-accent-500 transition-all duration-300 outline-none shadow-sm hover:shadow-md hover:border-accent-400 hover:bg-white transform hover:-translate-y-0.5"
                  placeholder="Postcode"
                />
                {errors.pickupPostcode && <p className="text-red-500 text-xs">{errors.pickupPostcode.message}</p>}
              </div>
            </div>

            {/* Vehicle Condition */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-1.5 ${isPageMode ? 'text-gray-800' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Vehicle Condition *
              </label>
              <CustomSelect
                value={isRunning}
                onChange={setIsRunning}
                options={[
                  { value: 'true', label: 'Running', icon: '✅' },
                  { value: 'false', label: 'Non-Running', icon: '⚠️' },
                ]}
                placeholder="Select Condition"
              />
              <input type="hidden" {...register('isRunning')} value={isRunning} />
              {errors.isRunning && <p className="text-red-500 text-xs mt-0.5">{errors.isRunning.message}</p>}
            </div>

          </div>

          {/* Column 2 */}
          <div className="space-y-2 flex flex-col min-w-0">
            {/* Transport Type */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-1.5 ${isPageMode ? 'text-gray-800' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Transport Type *
              </label>
              <CustomSelect
                value={transportType}
                onChange={setTransportType}
                options={[
                  { value: 'open', label: 'Open Transport', icon: '🚚' },
                  { value: 'enclosed', label: 'Enclosed Transport', icon: '📦' },
                ]}
                placeholder="Select Transport Type"
              />
              <input type="hidden" {...register('transportType')} value={transportType} />
              {errors.transportType && <p className="text-red-500 text-xs mt-0.5">{errors.transportType.message}</p>}
            </div>

            {/* Preferred Date */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-1.5 ${isPageMode ? 'text-gray-800' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Preferred Pickup Date *
              </label>
              <input
                {...register('preferredDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 text-sm bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-400 focus:border-accent-500 transition-all duration-300 outline-none shadow-sm hover:shadow-md hover:border-accent-400 hover:bg-white transform hover:-translate-y-0.5"
              />
              {errors.preferredDate && <p className="text-red-500 text-xs mt-0.5">{errors.preferredDate.message}</p>}
            </div>

            {/* Delivery to / Drop-off Location */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 flex items-center gap-1.5 ${isPageMode ? 'text-gray-800' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Delivery to *
              </label>
              <div className="space-y-2">
                <input
                  {...register('dropoffSuburb')}
                  type="text"
                  className="w-full px-4 py-3 text-base bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-400 focus:border-accent-500 transition-all duration-300 outline-none shadow-sm hover:shadow-md hover:border-accent-400 hover:bg-white transform hover:-translate-y-0.5"
                  placeholder="Suburb"
                />
                {errors.dropoffSuburb && <p className="text-red-500 text-xs font-medium animate-pulse">{errors.dropoffSuburb.message}</p>}
                <input
                  {...register('dropoffPostcode')}
                  type="text"
                  className="w-full px-4 py-3 text-base bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-400 focus:border-accent-500 transition-all duration-300 outline-none shadow-sm hover:shadow-md hover:border-accent-400 hover:bg-white transform hover:-translate-y-0.5"
                  placeholder="Postcode"
                />
                {errors.dropoffPostcode && <p className="text-red-500 text-xs">{errors.dropoffPostcode.message}</p>}
              </div>
            </div>

            {/* Get Calculate Button */}
            <div className="flex-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-accent-500 via-accent-600 to-accent-500 hover:from-accent-600 hover:via-accent-700 hover:to-accent-600 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base group transform hover:scale-105 active:scale-95 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Get Calculate
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Column 3 - Extra Services */}
          <div className="space-y-2 flex flex-col min-w-0">

            {/* Extra Services Section */}
            <div className="bg-gradient-to-br from-accent-50 via-accent-50/90 to-white border-2 border-accent-300/70 rounded-xl p-3 flex flex-col shadow-md relative overflow-hidden w-full" style={{ marginTop: '25px' }}>
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-200/40 to-transparent rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-accent-100/30 to-transparent rounded-full blur-lg"></div>
              
              <h3 className="text-sm font-extrabold text-accent-900 mb-2.5 flex items-center gap-2 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse shadow-sm shadow-accent-500/50"></div>
                <span>Extra Services</span>
              </h3>
              <div className="space-y-1.5 relative z-10">
                <label className="flex items-center px-3 py-2 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-lg hover:border-accent-400 hover:shadow-sm cursor-pointer transition-all duration-300 group shadow-sm hover:bg-white">
                  <input
                    type="checkbox"
                    {...register('expressDelivery')}
                    className="w-4 h-4 text-accent-600 focus:ring-accent-500 focus:ring-1 border-gray-300 rounded cursor-pointer transition-all accent-accent-600"
                  />
                  <div className="ml-2.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900 group-hover:text-accent-700 transition-colors">Express Delivery</span>
                      <span className="text-accent-600 font-bold text-xs bg-accent-100 px-1.5 py-0.5 rounded-full">+$40</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">Faster service</p>
                  </div>
                </label>

                <label className="flex items-center px-3 py-2 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-lg hover:border-accent-400 hover:shadow-sm cursor-pointer transition-all duration-300 group shadow-sm hover:bg-white">
                  <input
                    type="checkbox"
                    {...register('packaging')}
                    className="w-4 h-4 text-accent-600 focus:ring-accent-500 focus:ring-1 border-gray-300 rounded cursor-pointer transition-all accent-accent-600"
                  />
                  <div className="ml-2.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900 group-hover:text-accent-700 transition-colors">Premium Handling</span>
                      <span className="text-accent-600 font-bold text-xs bg-accent-100 px-1.5 py-0.5 rounded-full">+$15</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">Extra care</p>
                  </div>
                </label>

                <label className="flex items-center px-3 py-2 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-lg hover:border-accent-400 hover:shadow-sm cursor-pointer transition-all duration-300 group shadow-sm hover:bg-white">
                  <input
                    type="checkbox"
                    {...register('insurance')}
                    className="w-4 h-4 text-accent-600 focus:ring-accent-500 focus:ring-1 border-gray-300 rounded cursor-pointer transition-all accent-accent-600"
                  />
                  <div className="ml-2.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900 group-hover:text-accent-700 transition-colors">Add Insurance</span>
                      <span className="text-accent-600 font-bold text-xs bg-accent-100 px-1.5 py-0.5 rounded-full">+$20</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">Additional coverage</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
