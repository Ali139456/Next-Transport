import { NextRequest, NextResponse } from 'next/server'
import { calculatePrice, PricingInput } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.pickupPostcode || !body.deliveryPostcode || !body.vehicleType || !body.transportType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Convert isRunning to boolean (handle both string and boolean inputs)
    const isRunning = body.isRunning === true || body.isRunning === 'true' || String(body.isRunning).toLowerCase() === 'true'
    
    const pricingInput: PricingInput = {
      pickupPostcode: String(body.pickupPostcode).trim(),
      deliveryPostcode: String(body.deliveryPostcode).trim(),
      vehicleType: body.vehicleType,
      isRunning: isRunning,
      transportType: body.transportType,
      addOns: {
        insurance: body.insurance === true || body.insurance === 'true' || String(body.insurance).toLowerCase() === 'true',
        expressDelivery: body.expressDelivery === true || body.expressDelivery === 'true' || String(body.expressDelivery).toLowerCase() === 'true',
        packaging: body.packaging === true || body.packaging === 'true' || String(body.packaging).toLowerCase() === 'true',
      },
    }

    const quote = await calculatePrice(pricingInput)

    return NextResponse.json({
      ...quote,
      input: pricingInput,
      preferredDate: body.preferredDate,
    })
  } catch (error: any) {
    console.error('Error calculating quote:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate quote' },
      { status: 500 }
    )
  }
}

