import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Quote from '@/models/Quote'
import Address from '@/models/Address'
import Vehicle from '@/models/Vehicle'
import { calculatePrice, PricingInput } from '@/lib/pricing'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      pickupAddress,
      dropoffAddress,
      vehicle,
      preferredPickupDate,
      transportType,
      addOns,
    } = body

    // Validate required fields
    if (!pickupAddress || !dropoffAddress || !vehicle || !preferredPickupDate || !transportType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Helper function to get state from postcode (Australian postcodes)
    const getStateFromPostcode = (postcode: string): string => {
      const code = parseInt(postcode)
      if (code >= 2000 && code < 3000) return 'NSW'
      if (code >= 3000 && code < 4000) return 'VIC'
      if (code >= 4000 && code < 5000) return 'QLD'
      if (code >= 5000 && code < 6000) return 'SA'
      if (code >= 6000 && code < 7000) return 'WA'
      if (code >= 7000 && code < 8000) return 'TAS'
      if (code >= 800 && code < 1000) return 'NT'
      if (code >= 2600 && code < 2620) return 'ACT'
      return 'NSW' // Default to NSW
    }

    // Prepare pickup address with defaults
    const pickupAddressData = {
      address: pickupAddress.address || `${pickupAddress.suburb} (Address TBC)`,
      suburb: pickupAddress.suburb,
      postcode: pickupAddress.postcode,
      state: pickupAddress.state || getStateFromPostcode(pickupAddress.postcode),
      contact_name: pickupAddress.contactName || '',
      contact_phone: pickupAddress.contactPhone || '',
    }

    // Get or create pickup address
    let pickupAddressDoc = await Address.findOne({
      suburb: pickupAddressData.suburb,
      postcode: pickupAddressData.postcode,
      state: pickupAddressData.state,
    })

    if (!pickupAddressDoc) {
      pickupAddressDoc = new Address(pickupAddressData)
      await pickupAddressDoc.save()
    }

    // Prepare dropoff address with defaults
    const dropoffAddressData = {
      address: dropoffAddress.address || `${dropoffAddress.suburb} (Address TBC)`,
      suburb: dropoffAddress.suburb,
      postcode: dropoffAddress.postcode,
      state: dropoffAddress.state || getStateFromPostcode(dropoffAddress.postcode),
      contact_name: dropoffAddress.contactName || '',
      contact_phone: dropoffAddress.contactPhone || '',
    }

    // Get or create dropoff address
    let dropoffAddressDoc = await Address.findOne({
      suburb: dropoffAddressData.suburb,
      postcode: dropoffAddressData.postcode,
      state: dropoffAddressData.state,
    })

    if (!dropoffAddressDoc) {
      dropoffAddressDoc = new Address(dropoffAddressData)
      await dropoffAddressDoc.save()
    }

    // Map vehicle type to valid enum values
    const mapVehicleType = (type: string): 'sedan' | 'suv' | 'ute' | 'van' | 'light-truck' | 'bike' => {
      const typeMap: { [key: string]: 'sedan' | 'suv' | 'ute' | 'van' | 'light-truck' | 'bike' } = {
        'car': 'sedan',
        'sedan': 'sedan',
        'suv': 'suv',
        'ute': 'ute',
        'van': 'van',
        'light-truck': 'light-truck',
        'bike': 'bike',
      }
      return typeMap[type.toLowerCase()] || 'sedan'
    }

    // Prepare vehicle data with defaults
    const vehicleData = {
      type: mapVehicleType(vehicle.type),
      make: vehicle.make || 'TBC',
      model: vehicle.model || 'TBC',
      year: vehicle.year || new Date().getFullYear().toString(),
      transportType: transportType || 'open',
      isRunning: vehicle.isRunning !== undefined ? Boolean(vehicle.isRunning) : true,
    }

    // Get or create vehicle
    let vehicleDoc = await Vehicle.findOne({
      type: vehicleData.type,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      transportType: vehicleData.transportType,
      isRunning: vehicleData.isRunning,
    })

    if (!vehicleDoc) {
      vehicleDoc = new Vehicle(vehicleData)
      await vehicleDoc.save()
    }

    // Calculate pricing
    const pricingInput: PricingInput = {
      pickupPostcode: pickupAddressData.postcode,
      deliveryPostcode: dropoffAddressData.postcode,
      vehicleType: vehicleData.type,
      isRunning: vehicleData.isRunning,
      transportType: vehicleData.transportType,
      addOns: addOns || {},
    }

    const pricingResult = await calculatePrice(pricingInput)

    // Calculate distance (simplified - should use real geocoding)
    const distance = Math.abs(
      parseInt(pickupAddress.postcode) - parseInt(dropoffAddress.postcode)
    ) * 10
    const actualDistance = Math.max(distance, 50)

    // Get customer if authenticated
    const authUser = await getAuthUser()
    const customerId = authUser && authUser.role === 'customer' ? authUser.id : null

    // Calculate expiry (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Generate quote_number
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`
    
    // Count quotes created today to get the sequence number
    const count = await Quote.countDocuments({
      quote_number: { $regex: `^QT-${datePrefix}-` }
    })
    const sequence = String(count + 1).padStart(4, '0')
    const quoteNumber = `QT-${datePrefix}-${sequence}`

    // Create quote
    const quote = new Quote({
      quote_number: quoteNumber,
      customer_id: customerId,
      pickup_address_id: pickupAddressDoc._id,
      dropoff_address_id: dropoffAddressDoc._id,
      vehicle_id: vehicleDoc._id,
      preferred_pickup_date: new Date(preferredPickupDate),
      transport_type: transportType,
      distance_km: actualDistance,
      duration_estimate_days_min: 1,
      duration_estimate_days_max: 7,
      pickup_window_days_min: 1,
      pickup_window_days_max: 5,
      subtotal_ex_gst: pricingResult.basePrice + (pricingResult.addOns?.insurance || 0),
      gst_amount: pricingResult.gst,
      total_inc_gst: pricingResult.totalPrice,
      currency: 'AUD',
      expires_at: expiresAt,
      pricing_breakdown_json: {
        basePrice: pricingResult.basePrice,
        addOns: pricingResult.addOns,
        gst: pricingResult.gst,
        depositAmount: pricingResult.depositAmount,
        balanceAmount: pricingResult.balanceAmount,
      },
      source: 'web',
    })

    await quote.save()

    // Populate references for response
    await quote.populate('pickup_address_id')
    await quote.populate('dropoff_address_id')
    await quote.populate('vehicle_id')

    return NextResponse.json({
      success: true,
      quote: {
        id: quote._id,
        quote_number: quote.quote_number,
        pickup_address: quote.pickup_address_id,
        dropoff_address: quote.dropoff_address_id,
        vehicle: quote.vehicle_id,
        preferred_pickup_date: quote.preferred_pickup_date,
        transport_type: quote.transport_type,
        distance_km: quote.distance_km,
        subtotal_ex_gst: quote.subtotal_ex_gst,
        gst_amount: quote.gst_amount,
        total_inc_gst: quote.total_inc_gst,
        expires_at: quote.expires_at,
        pricing_breakdown: quote.pricing_breakdown_json,
      },
    })
  } catch (error: any) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create quote' },
      { status: 500 }
    )
  }
}
