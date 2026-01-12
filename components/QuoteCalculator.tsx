'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

const quoteSchema = z.object({
  // Pickup Address
  pickupAddress: z.string().min(5, 'Address is required'),
  pickupSuburb: z.string().min(2, 'Suburb is required'),
  pickupPostcode: z.string().min(4, 'Postcode must be at least 4 characters'),
  pickupState: z.string().min(2, 'State is required'),
  pickupContactName: z.string().optional(),
  pickupContactPhone: z.string().optional(),
  
  // Delivery Address
  deliveryAddress: z.string().min(5, 'Address is required'),
  deliverySuburb: z.string().min(2, 'Suburb is required'),
  deliveryPostcode: z.string().min(4, 'Postcode must be at least 4 characters'),
  deliveryState: z.string().min(2, 'State is required'),
  deliveryContactName: z.string().optional(),
  deliveryContactPhone: z.string().optional(),
  
  // Vehicle Details
  vehicleType: z.enum(['sedan', 'suv', 'ute', 'van', 'light-truck', 'bike']),
  vehicleMake: z.string().min(2, 'Vehicle make is required'),
  vehicleModel: z.string().min(2, 'Vehicle model is required'),
  vehicleYear: z.string().min(4, 'Vehicle year is required'),
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
  const { user, loading: authLoading } = useAuth()
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
      // First calculate price for preview
      const calculateResponse = await fetch('/api/quote/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupPostcode: data.pickupPostcode,
          deliveryPostcode: data.deliveryPostcode,
          vehicleType: data.vehicleType,
          isRunning: Boolean(data.isRunning),
          transportType: data.transportType,
          insurance: data.insurance,
        }),
      })

      if (!calculateResponse.ok) {
        const errorData = await calculateResponse.json()
        throw new Error(errorData.error || 'Failed to calculate quote')
      }

      const pricingResult = await calculateResponse.json()

      // Now create the quote with full data
      const createPayload = {
        pickupAddress: {
          address: data.pickupAddress,
          suburb: data.pickupSuburb,
          postcode: data.pickupPostcode,
          state: data.pickupState,
          contactName: data.pickupContactName || '',
          contactPhone: data.pickupContactPhone || '',
        },
        dropoffAddress: {
          address: data.deliveryAddress,
          suburb: data.deliverySuburb,
          postcode: data.deliveryPostcode,
          state: data.deliveryState,
          contactName: data.deliveryContactName || '',
          contactPhone: data.deliveryContactPhone || '',
        },
        vehicle: {
          type: data.vehicleType,
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: data.vehicleYear,
          isRunning: Boolean(data.isRunning),
        },
        preferredPickupDate: data.preferredDate,
        transportType: data.transportType,
        addOns: {
          insurance: data.insurance || false,
        },
      }

      const createResponse = await fetch('/api/quote/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Failed to create quote')
      }

      const quoteResult = await createResponse.json()
      
      if (!quoteResult.success || !quoteResult.quote) {
        throw new Error('Invalid quote response')
      }

      // Combine pricing result with quote data for display
      const combinedQuote = {
        ...pricingResult,
        quote_id: quoteResult.quote.id,
        quote_number: quoteResult.quote.quote_number,
        expires_at: quoteResult.quote.expires_at,
        input: {
          pickupPostcode: data.pickupPostcode,
          deliveryPostcode: data.deliveryPostcode,
          vehicleType: data.vehicleType,
          isRunning: Boolean(data.isRunning),
          transportType: data.transportType,
        },
        preferredDate: data.preferredDate,
        addresses: {
          pickup: createPayload.pickupAddress,
          delivery: createPayload.dropoffAddress,
        },
        vehicle: createPayload.vehicle,
      }
      
      setQuote(combinedQuote)
      toast.success('Quote created successfully!')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create quote. Please try again.'
      toast.error(errorMessage)
      console.error('Quote creation error:', error)
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!quote) return
    
    // Check if user is authenticated
    if (!user || user.role !== 'customer') {
      toast.error('Please login to continue with booking')
      router.push(`/login?redirect=${encodeURIComponent('/quote')}`)
      return
    }
    
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
      
      // Quote title and number
      doc.setFontSize(18)
      doc.setFont('helvetica', 'normal')
      doc.text('VEHICLE TRANSPORT QUOTE', margin, 45)
      
      if (quote.quote_number) {
        doc.setFontSize(10)
        doc.text(`Quote #: ${quote.quote_number}`, pageWidth - margin, 45, { align: 'right' })
      }
      
      // Quote date
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`, pageWidth - margin, 30, { align: 'right' })
      
      let yPos = 70
      
      // Quote Summary Box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
      doc.roundedRect(margin, yPos, contentWidth, 80, 3, 3, 'F')
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Quote Summary', margin + 10, yPos + 15)
      
      yPos += 25
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81)
      
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
      
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
      doc.circle(margin + 15, yPos - 2, 2, 'F')
      doc.text(`Pickup Window: ${quote.estimatedPickupWindow || 'TBD'}`, margin + 22, yPos)
      yPos += 10
      
      doc.circle(margin + 15, yPos - 2, 2, 'F')
      doc.text(`Delivery Timeframe: ${quote.estimatedDeliveryTimeframe || 'TBD'}`, margin + 22, yPos)
      
      yPos += 30
      
      // Quote Details
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
        
        if (quote.vehicle) {
          doc.text(`Vehicle: ${quote.vehicle.make} ${quote.vehicle.model} (${quote.vehicle.year})`, margin, yPos)
          yPos += 7
        }
        doc.text(`Vehicle Type: ${vehicleTypeMap[quote.input.vehicleType] || quote.input.vehicleType || 'N/A'}`, margin, yPos)
        yPos += 7
        doc.text(`Condition: ${quote.input.isRunning ? 'Running' : 'Non-Running'}`, margin, yPos)
        yPos += 7
        doc.text(`Transport: ${quote.input.transportType === 'open' ? 'Open Transport' : 'Enclosed Transport'}`, margin, yPos)
        yPos += 7
        if (quote.addresses?.pickup && quote.addresses?.delivery) {
          doc.text(`Route: ${quote.addresses.pickup.suburb} ${quote.addresses.pickup.postcode} → ${quote.addresses.delivery.suburb} ${quote.addresses.delivery.postcode}`, margin, yPos)
        }
      }
      
      // Footer
      yPos = pageHeight - 25
      doc.setFillColor(243, 244, 246)
      doc.rect(0, yPos, pageWidth, 25, 'F')
      
      doc.setFontSize(8)
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
      doc.setFont('helvetica', 'normal')
      const expiryDate = quote.expires_at ? new Date(quote.expires_at).toLocaleDateString('en-AU') : '30 days'
      doc.text(`This quote is valid until ${expiryDate}.`, margin, yPos + 10)
      doc.text('Terms and conditions apply. For questions, contact support@nexttransport.com.au', margin, yPos + 17)
      
      // Page border
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
      doc.setLineWidth(0.5)
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10)
      
      // Save PDF
      const filename = quote.quote_number ? `NextTransport-Quote-${quote.quote_number}.pdf` : `NextTransport-Quote-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    })
  }

  if (quote) {
    return (
      <div className="space-y-6">
        {/* Login reminder for non-authenticated users */}
        {(!user || user.role !== 'customer') && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-2 border-yellow-400/30 rounded-xl p-4 sm:p-5 flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Login Required to Book</h4>
              <p className="text-gray-200 text-sm mb-2">
                Please login or create an account to proceed with your booking.
              </p>
              <button
                onClick={() => router.push(`/login?redirect=${encodeURIComponent('/quote')}`)}
                className="text-yellow-300 hover:text-yellow-200 font-semibold text-sm underline"
              >
                Login or Sign Up →
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-2 border-white/20 rounded-2xl p-6 sm:p-8 card-shadow relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Your Quote
                </h3>
                {quote.quote_number && (
                  <p className="text-sm text-gray-300 mt-1">Quote #{quote.quote_number}</p>
                )}
              </div>
              <div className="px-3 sm:px-4 py-2 bg-accent-500/20 rounded-full border border-accent-400/30">
                <span className="text-accent-300 font-semibold text-xs sm:text-sm">
                  {quote.expires_at ? `Valid until ${new Date(quote.expires_at).toLocaleDateString()}` : 'Valid for 30 days'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 text-base sm:text-lg bg-white/10 rounded-xl p-5 sm:p-6 mb-4 sm:mb-6 border border-white/20">
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-gray-200">Base Price</span>
                <span className="font-semibold text-white">${quote.basePrice.toFixed(2)}</span>
              </div>
              {quote.addOns?.insurance && (
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-gray-200">Insurance Coverage</span>
                  <span className="font-semibold text-white">${quote.addOns.insurance.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="text-gray-200">GST (10%)</span>
                <span className="font-semibold text-white">${quote.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-white/30">
                <span className="text-xl font-bold text-white">Total Price</span>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-accent-300 to-accent-400 bg-clip-text text-transparent">
                  ${quote.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-5 sm:p-6 mb-4 sm:mb-6 border border-white/20">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timeline Estimates
              </h4>
              <div className="space-y-2 text-gray-200 text-sm sm:text-base">
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
            disabled={authLoading}
            className="flex-1 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? 'Loading...' : (!user || user.role !== 'customer' ? 'Login to Book' : 'Book Now')}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border-2 border-white/20 hover:border-accent-400 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={() => setQuote(null)}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors duration-200 text-sm sm:text-base"
          >
            Get New Quote
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
      {/* Pickup Address Section */}
      <div className="bg-white/10 border-2 border-white/20 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Pickup Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-white mb-2">Address *</label>
            <input
              {...register('pickupAddress')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="Street address"
            />
            {errors.pickupAddress && (
              <p className="text-red-300 text-sm mt-1">{errors.pickupAddress.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Suburb *</label>
            <input
              {...register('pickupSuburb')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="Suburb"
            />
            {errors.pickupSuburb && (
              <p className="text-red-300 text-sm mt-1">{errors.pickupSuburb.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Postcode *</label>
            <input
              {...register('pickupPostcode')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="2000"
            />
            {errors.pickupPostcode && (
              <p className="text-red-300 text-sm mt-1">{errors.pickupPostcode.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">State *</label>
            <select
              {...register('pickupState')}
              className="form-input-modern [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="">Select State</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="SA">SA</option>
              <option value="WA">WA</option>
              <option value="TAS">TAS</option>
              <option value="NT">NT</option>
              <option value="ACT">ACT</option>
            </select>
            {errors.pickupState && (
              <p className="text-red-300 text-sm mt-1">{errors.pickupState.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Contact Name (Optional)</label>
            <input
              {...register('pickupContactName')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="Contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Contact Phone (Optional)</label>
            <input
              {...register('pickupContactPhone')}
              type="tel"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="0400 000 000"
            />
          </div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="bg-white/10 border-2 border-white/20 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Delivery Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-white mb-2">Address *</label>
            <input
              {...register('deliveryAddress')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="Street address"
            />
            {errors.deliveryAddress && (
              <p className="text-red-300 text-sm mt-1">{errors.deliveryAddress.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Suburb *</label>
            <input
              {...register('deliverySuburb')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="Suburb"
            />
            {errors.deliverySuburb && (
              <p className="text-red-300 text-sm mt-1">{errors.deliverySuburb.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Postcode *</label>
            <input
              {...register('deliveryPostcode')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="3000"
            />
            {errors.deliveryPostcode && (
              <p className="text-red-300 text-sm mt-1">{errors.deliveryPostcode.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">State *</label>
            <select
              {...register('deliveryState')}
              className="form-input-modern [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="">Select State</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="SA">SA</option>
              <option value="WA">WA</option>
              <option value="TAS">TAS</option>
              <option value="NT">NT</option>
              <option value="ACT">ACT</option>
            </select>
            {errors.deliveryState && (
              <p className="text-red-300 text-sm mt-1">{errors.deliveryState.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Contact Name (Optional)</label>
            <input
              {...register('deliveryContactName')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="Contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Contact Phone (Optional)</label>
            <input
              {...register('deliveryContactPhone')}
              type="tel"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="0400 000 000"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Details Section */}
      <div className="bg-white/10 border-2 border-white/20 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Vehicle Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Vehicle Type *</label>
            <select
              {...register('vehicleType')}
              className="form-input-modern [&>option]:bg-gray-800 [&>option]:text-white"
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
            <label className="block text-sm font-semibold text-white mb-2">Make *</label>
            <input
              {...register('vehicleMake')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="e.g., Toyota"
            />
            {errors.vehicleMake && (
              <p className="text-red-300 text-sm mt-1">{errors.vehicleMake.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Model *</label>
            <input
              {...register('vehicleModel')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="e.g., Camry"
            />
            {errors.vehicleModel && (
              <p className="text-red-300 text-sm mt-1">{errors.vehicleModel.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Year *</label>
            <input
              {...register('vehicleYear')}
              type="text"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
              placeholder="e.g., 2020"
            />
            {errors.vehicleYear && (
              <p className="text-red-300 text-sm mt-1">{errors.vehicleYear.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">Vehicle Condition *</label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              {...register('isRunning', { valueAsNumber: false })}
              value="true"
              className="w-5 h-5 text-accent-600 focus:ring-accent-500 focus:ring-2 border-gray-300"
            />
            <span className="ml-3 text-gray-200 font-medium group-hover:text-accent-300">Running</span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              {...register('isRunning', { valueAsNumber: false })}
              value="false"
              className="w-5 h-5 text-accent-400 focus:ring-accent-400 focus:ring-2 border-white/30"
            />
            <span className="ml-3 text-gray-200 font-medium group-hover:text-accent-300">Non-Running</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">Transport Type *</label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center p-4 border-2 border-white/20 rounded-xl cursor-pointer hover:border-accent-400 hover:bg-white/10 transition-all group">
            <input
              type="radio"
              {...register('transportType')}
              value="open"
              className="w-5 h-5 text-accent-400 focus:ring-accent-400 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-white group-hover:text-accent-300">Open Transport</span>
              <p className="text-sm text-gray-300">More economical option</p>
            </div>
          </label>
          <label className="flex items-center p-4 border-2 border-white/20 rounded-xl cursor-pointer hover:border-accent-400 hover:bg-white/10 transition-all group">
            <input
              type="radio"
              {...register('transportType')}
              value="enclosed"
              className="w-5 h-5 text-accent-400 focus:ring-accent-400 focus:ring-2"
            />
            <div className="ml-3">
              <span className="font-semibold text-white group-hover:text-accent-300">Enclosed Transport</span>
              <p className="text-sm text-gray-300">Maximum protection</p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white/10 border-2 border-white/20 rounded-lg sm:rounded-xl p-4 sm:p-5">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            {...register('insurance')}
            className="w-5 h-5 text-accent-400 focus:ring-accent-400 focus:ring-2 border-white/30 rounded"
          />
          <div className="ml-3">
            <span className="font-semibold text-white group-hover:text-accent-300">Add Insurance Coverage</span>
            <p className="text-sm text-gray-300">Additional protection for your vehicle (+$150)</p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Preferred Pickup Date *
        </label>
        <input
          {...register('preferredDate')}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none"
        />
        {errors.preferredDate && (
          <p className="text-red-300 text-sm mt-1">{errors.preferredDate.message}</p>
        )}
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
            Creating Quote...
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
