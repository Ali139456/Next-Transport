// Pricing engine based on distance, vehicle type, and add-ons

export interface PricingInput {
  pickupPostcode: string
  deliveryPostcode: string
  vehicleType: 'sedan' | 'suv' | 'ute' | 'van' | 'light-truck' | 'bike'
  isRunning: boolean
  transportType: 'open' | 'enclosed'
  addOns?: {
    insurance?: boolean
    [key: string]: boolean | undefined
  }
}

export interface PricingResult {
  basePrice: number
  gst: number
  totalPrice: number
  depositAmount: number
  balanceAmount: number
  addOns: {
    insurance?: number
    [key: string]: number | undefined
  }
  estimatedPickupWindow: string
  estimatedDeliveryTimeframe: string
}

// Base rates per km (these should be configurable in admin)
const BASE_RATES = {
  sedan: 1.2,
  suv: 1.5,
  ute: 1.8,
  van: 2.0,
  'light-truck': 2.5,
  bike: 0.8,
}

// Multipliers
const RUNNING_MULTIPLIER = 1.0
const NON_RUNNING_MULTIPLIER = 1.3
const ENCLOSED_MULTIPLIER = 1.5
const OPEN_MULTIPLIER = 1.0

// Add-on prices
const ADDON_PRICES = {
  insurance: 150, // Base insurance cost
  expressDelivery: 40, // Express delivery
  packaging: 15, // Premium handling/packaging
}

// Minimum distance in km (for short trips)
const MIN_DISTANCE = 50
const MIN_BASE_PRICE = 300

// Get distance between postcodes (simplified - in production, use Google Maps API or similar)
async function getDistance(postcode1: string, postcode2: string): Promise<number> {
  // This is a placeholder - in production, integrate with Google Maps Distance Matrix API
  // For now, return a mock distance based on postcode difference
  const p1 = parseInt(postcode1) || 0
  const p2 = parseInt(postcode2) || 0
  const diff = Math.abs(p1 - p2)
  
  // Rough estimate: 1 postcode difference ≈ 10km
  // This is very simplified - use real geocoding in production
  return Math.max(diff * 10, MIN_DISTANCE)
}

export async function calculatePrice(input: PricingInput): Promise<PricingResult> {
  // Get distance
  const distance = await getDistance(input.pickupPostcode, input.deliveryPostcode)
  
  // Base price calculation
  const baseRate = BASE_RATES[input.vehicleType]
  let basePrice = distance * baseRate
  
  // Apply multipliers
  if (!input.isRunning) {
    basePrice *= NON_RUNNING_MULTIPLIER
  }
  
  if (input.transportType === 'enclosed') {
    basePrice *= ENCLOSED_MULTIPLIER
  }
  
  // Ensure minimum price
  basePrice = Math.max(basePrice, MIN_BASE_PRICE)
  
  // Round to nearest dollar
  basePrice = Math.round(basePrice)
  
  // Calculate add-ons
  const addOns: { [key: string]: number } = {}
  let addOnsTotal = 0
  
  if (input.addOns?.insurance) {
    addOns.insurance = ADDON_PRICES.insurance
    addOnsTotal += ADDON_PRICES.insurance
  }
  
  if (input.addOns?.expressDelivery) {
    addOns.expressDelivery = ADDON_PRICES.expressDelivery
    addOnsTotal += ADDON_PRICES.expressDelivery
  }
  
  if (input.addOns?.packaging) {
    addOns.packaging = ADDON_PRICES.packaging
    addOnsTotal += ADDON_PRICES.packaging
  }
  
  // Calculate totals
  const subtotal = basePrice + addOnsTotal
  const gst = Math.round(subtotal * 0.1)
  const totalPrice = subtotal + gst
  
  // Deposit calculation (10-20% of total)
  const depositPercentage = 0.15 // 15% default
  const depositAmount = Math.round(totalPrice * depositPercentage)
  const balanceAmount = totalPrice - depositAmount
  
  // Estimate timeframes
  const estimatedPickupWindow = calculatePickupWindow(distance)
  const estimatedDeliveryTimeframe = calculateDeliveryTimeframe(distance)
  
  return {
    basePrice,
    gst,
    totalPrice,
    depositAmount,
    balanceAmount,
    addOns,
    estimatedPickupWindow,
    estimatedDeliveryTimeframe,
  }
}

function calculatePickupWindow(distance: number): string {
  // Within same city: 1-2 days
  // Interstate: 3-5 days
  // Long distance: 5-7 days
  if (distance < 100) return '1-2 business days'
  if (distance < 500) return '2-3 business days'
  if (distance < 1000) return '3-5 business days'
  return '5-7 business days'
}

function calculateDeliveryTimeframe(distance: number): string {
  // Delivery typically takes 1-3 days after pickup
  if (distance < 100) return 'Same day'
  if (distance < 500) return '1-2 days after pickup'
  if (distance < 1000) return '2-3 days after pickup'
  return '3-5 days after pickup'
}

