'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const quoteSchema = z.object({
  pickupPostcode: z.string().min(4, 'Postcode must be at least 4 characters'),
  deliveryPostcode: z.string().min(4, 'Postcode must be at least 4 characters'),
  vehicleType: z.enum(['sedan', 'suv', 'ute', 'van', 'light-truck', 'bike']),
  isRunning: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true'),
  transportType: z.enum(['open', 'enclosed']),
  insurance: z.boolean().optional(),
  preferredDate: z.string().min(1, 'Preferred date is required'),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteCalculatorProps {
  onQuoteComplete?: () => void
}

export default function QuoteCalculator({ onQuoteComplete }: QuoteCalculatorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      isRunning: true,
      transportType: 'open',
      insurance: false,
    },
  })

  const onSubmit = async (data: QuoteFormData) => {
    setLoading(true)
    try {
      // Transform form data for API - zod schema already transforms isRunning to boolean
      const payload = {
        ...data,
        isRunning: Boolean(data.isRunning),
      }
      
      const response = await fetch('/api/quote/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate quote')
      }

      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (!result || !result.totalPrice) {
        throw new Error('Invalid quote response')
      }
      
      setQuote(result)
      toast.success('Quote calculated successfully!')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to calculate quote. Please try again.'
      toast.error(errorMessage)
      console.error('Quote calculation error:', error)
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!quote) return
    
    // Store quote in sessionStorage and navigate to booking page
    sessionStorage.setItem('quote', JSON.stringify(quote))
    router.push('/booking')
    onQuoteComplete?.()
  }

  const handleDownloadPDF = () => {
    if (!quote) return
    
    // Dynamic import to avoid SSR issues
    import('jspdf').then((jsPDFModule) => {
      const { default: jsPDF } = jsPDFModule
      const doc = new jsPDF()
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      // Accent color (orange) - RGB: 249, 115, 22
      const accentColor = [249, 115, 22]
      const accentDark = [234, 88, 12]
      const grayColor = [107, 114, 128]
      const lightGray = [243, 244, 246]
      
      // Header with colored background
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
      doc.rect(0, 0, pageWidth, 50, 'F')
      
      // Company name in header
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('NextTransport.com.au', margin, 30)
      
      // Quote title
      doc.setFontSize(18)
      doc.setFont('helvetica', 'normal')
      doc.text('VEHICLE TRANSPORT QUOTE', margin, 45)
      
      // Quote date
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`, pageWidth - margin, 45, { align: 'right' })
      
      let yPos = 70
      
      // Quote Summary Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
      doc.roundedRect(margin, yPos, contentWidth, 80, 3, 3, 'F')
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55) // gray-800
      doc.text('Quote Summary', margin + 10, yPos + 15)
      
      yPos += 25
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81) // gray-700
      
      // Base Price
      doc.text('Base Price', margin + 15, yPos)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(`$${quote.basePrice?.toFixed(2) || '0.00'}`, pageWidth - margin - 10, yPos, { align: 'right' })
      yPos += 10
      
      // Insurance (if applicable)
      if (quote.addOns?.insurance) {
        doc.setTextColor(55, 65, 81)
        doc.setFont('helvetica', 'normal')
        doc.text('Insurance Coverage', margin + 15, yPos)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'bold')
        doc.text(`$${quote.addOns.insurance.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: 'right' })
        yPos += 10
      }
      
      // GST
      doc.setTextColor(55, 65, 81)
      doc.setFont('helvetica', 'normal')
      doc.text('GST (10%)', margin + 15, yPos)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(`$${quote.gst?.toFixed(2) || '0.00'}`, pageWidth - margin - 10, yPos, { align: 'right' })
      yPos += 12
      
      // Divider line
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
      doc.setLineWidth(0.5)
      doc.line(margin + 15, yPos, pageWidth - margin - 10, yPos)
      yPos += 10
      
      // Total Price - highlighted
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
      doc.roundedRect(margin + 10, yPos - 8, contentWidth - 20, 12, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Total Price', margin + 15, yPos + 2)
      doc.text(`$${quote.totalPrice?.toFixed(2) || '0.00'}`, pageWidth - margin - 10, yPos + 2, { align: 'right' })
      
      yPos += 35
      
      // Timeline Section
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
      doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F')
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Estimated Timeline', margin + 10, yPos + 15)
      
      yPos += 25
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81)
      
      // Timeline items with icons (represented as bullets)
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
      doc.circle(margin + 15, yPos - 2, 2, 'F')
      doc.text(`Pickup Window: ${quote.estimatedPickupWindow || 'TBD'}`, margin + 22, yPos)
      yPos += 10
      
      doc.circle(margin + 15, yPos - 2, 2, 'F')
      doc.text(`Delivery Timeframe: ${quote.estimatedDeliveryTimeframe || 'TBD'}`, margin + 22, yPos)
      
      yPos += 30
      
      // Quote Details (if available)
      if (quote.input) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(31, 41, 55)
        doc.text('Transport Details', margin, yPos)
        yPos += 10
        
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(55, 65, 81)
        
        const vehicleTypeMap: { [key: string]: string } = {
          'sedan': 'Sedan',
          'suv': 'SUV',
          'ute': 'Ute',
          'van': 'Van',
          'light-truck': 'Light Truck',
          'bike': 'Bike'
        }
        
        doc.text(`Vehicle Type: ${vehicleTypeMap[quote.input.vehicleType] || quote.input.vehicleType || 'N/A'}`, margin, yPos)
        yPos += 7
        doc.text(`Condition: ${quote.input.isRunning ? 'Running' : 'Non-Running'}`, margin, yPos)
        yPos += 7
        doc.text(`Transport: ${quote.input.transportType === 'open' ? 'Open Transport' : 'Enclosed Transport'}`, margin, yPos)
        yPos += 7
        if (quote.input.pickupPostcode && quote.input.deliveryPostcode) {
          doc.text(`Route: ${quote.input.pickupPostcode} → ${quote.input.deliveryPostcode}`, margin, yPos)
        }
      }
      
      // Footer
      yPos = pageHeight - 25
      doc.setFillColor(243, 244, 246)
      doc.rect(0, yPos, pageWidth, 25, 'F')
      
      doc.setFontSize(8)
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
      doc.setFont('helvetica', 'normal')
      doc.text('This quote is valid for 30 days from the date of generation.', margin, yPos + 10)
      doc.text('Terms and conditions apply. For questions, contact support@nexttransport.com.au', margin, yPos + 17)
      
      // Page border (optional decorative element)
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
      doc.setLineWidth(0.5)
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10)
      
      // Save PDF
      doc.save(`NextTransport-Quote-${new Date().toISOString().split('T')[0]}.pdf`)
    })
  }

  if (quote) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-accent-200/50 rounded-2xl p-6 sm:p-8 card-shadow relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Your Quote
              </h3>
              <div className="px-3 sm:px-4 py-2 bg-accent-100 rounded-full">
                <span className="text-accent-700 font-semibold text-xs sm:text-sm">Valid for 30 days</span>
              </div>
            </div>
            
            <div className="space-y-4 text-base sm:text-lg bg-gray-50 rounded-xl p-5 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Base Price</span>
                <span className="font-semibold text-gray-900">${quote.basePrice.toFixed(2)}</span>
              </div>
              {quote.addOns?.insurance && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Insurance Coverage</span>
                  <span className="font-semibold text-gray-900">${quote.addOns.insurance.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">GST (10%)</span>
                <span className="font-semibold text-gray-900">${quote.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-300">
                <span className="text-xl font-bold text-gray-900">Total Price</span>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">
                  ${quote.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-5 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timeline Estimates
              </h4>
              <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                <p className="flex justify-between">
                  <span className="font-medium">Estimated Pickup:</span>
                  <span>{quote.estimatedPickupWindow}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Estimated Delivery:</span>
                  <span>{quote.estimatedDeliveryTimeframe}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleBookNow}
            className="flex-1 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-base sm:text-lg"
          >
            Book Now
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-accent-400 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={() => setQuote(null)}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            Get New Quote
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pickup Postcode *
          </label>
          <input
            {...register('pickupPostcode')}
            type="text"
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all outline-none text-base"
            placeholder="e.g., 2000"
          />
          {errors.pickupPostcode && (
            <p className="text-red-600 text-sm mt-1.5">{errors.pickupPostcode.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Delivery Postcode *
          </label>
          <input
            {...register('deliveryPostcode')}
            type="text"
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all outline-none text-base"
            placeholder="e.g., 3000"
          />
          {errors.deliveryPostcode && (
            <p className="text-red-600 text-sm mt-1.5">{errors.deliveryPostcode.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Vehicle Type *
        </label>
        <select
          {...register('vehicleType')}
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all outline-none text-base"
        >
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="ute">Ute</option>
          <option value="van">Van</option>
          <option value="light-truck">Light Truck</option>
          <option value="bike">Bike</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Vehicle Condition *
        </label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              {...register('isRunning', { valueAsNumber: false })}
              value="true"
              className="w-5 h-5 text-accent-600 focus:ring-accent-500 focus:ring-2 border-gray-300"
            />
            <span className="ml-3 text-gray-700 font-medium group-hover:text-accent-600">Running</span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              {...register('isRunning', { valueAsNumber: false })}
              value="false"
              className="w-5 h-5 text-accent-600 focus:ring-accent-500 focus:ring-2 border-gray-300"
            />
            <span className="ml-3 text-gray-700 font-medium group-hover:text-accent-600">Non-Running</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Transport Type *
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-accent-400 hover:bg-accent-50/50 transition-all group">
            <input
              type="radio"
              {...register('transportType')}
              value="open"
              className="w-5 h-5 text-accent-600 focus:ring-accent-500 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-900 group-hover:text-accent-700">Open Transport</span>
              <p className="text-sm text-gray-600">More economical option</p>
            </div>
          </label>
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-accent-400 hover:bg-accent-50/50 transition-all group">
            <input
              type="radio"
              {...register('transportType')}
              value="enclosed"
              className="w-5 h-5 text-accent-600 focus:ring-accent-500 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-gray-900 group-hover:text-accent-700">Enclosed Transport</span>
              <p className="text-sm text-gray-600">Maximum protection</p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-accent-50/50 border-2 border-accent-200 rounded-lg sm:rounded-xl p-4 sm:p-5">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            {...register('insurance')}
            className="w-5 h-5 text-accent-600 focus:ring-accent-500 focus:ring-2 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="font-semibold text-gray-900 group-hover:text-accent-700">Add Insurance Coverage</span>
            <p className="text-sm text-gray-600">Additional protection for your vehicle (+$150)</p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Preferred Pickup Date *
        </label>
        <input
          {...register('preferredDate')}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all outline-none text-base"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Get Instant Quote
          </>
        )}
      </button>
    </form>
  )
}

