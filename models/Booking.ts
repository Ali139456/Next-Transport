import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBooking extends Document {
  bookingId: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  vehicle: {
    type: 'sedan' | 'suv' | 'ute' | 'van' | 'light-truck' | 'bike'
    make: string
    model: string
    year: string
    isRunning: boolean
    transportType: 'open' | 'enclosed'
  }
  pickup: {
    address: string
    suburb: string
    postcode: string
    state: string
    contactName: string
    contactPhone: string
    preferredDate: Date
    preferredTime: string
  }
  delivery: {
    address: string
    suburb: string
    postcode: string
    state: string
    contactName: string
    contactPhone: string
  }
  pricing: {
    basePrice: number
    gst: number
    totalPrice: number
    depositAmount: number
    balanceAmount: number
    addOns: {
      insurance?: number
      [key: string]: number | undefined
    }
  }
  payment: {
    stripePaymentIntentId?: string
    stripeCustomerId?: string
    paymentMethod: 'full' | 'deposit'
    status: 'pending' | 'paid' | 'partial' | 'refunded'
    paidAmount: number
    transactions: Array<{
      amount: number
      transactionId: string
      date: Date
      type: 'payment' | 'refund'
    }>
  }
  status: 'pending' | 'confirmed' | 'driver-assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled'
  driver?: {
    driverId: string
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
  documents: Array<{
    url: string
    type: string
    uploadedAt: Date
  }>
  notes: string
  createdAt: Date
  updatedAt: Date
}

const BookingSchema: Schema = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
    },
    vehicle: {
      type: {
        type: String,
        enum: ['sedan', 'suv', 'ute', 'van', 'light-truck', 'bike'],
        required: true,
      },
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: String, required: true },
      isRunning: { type: Boolean, required: true },
      transportType: {
        type: String,
        enum: ['open', 'enclosed'],
        required: true,
      },
    },
    pickup: {
      address: { type: String, required: true },
      suburb: { type: String, required: true },
      postcode: { type: String, required: true },
      state: { type: String, required: true },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
      preferredDate: { type: Date, required: true },
      preferredTime: { type: String, required: true },
    },
    delivery: {
      address: { type: String, required: true },
      suburb: { type: String, required: true },
      postcode: { type: String, required: true },
      state: { type: String, required: true },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
    },
    pricing: {
      basePrice: { type: Number, required: true },
      gst: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      depositAmount: { type: Number, required: true },
      balanceAmount: { type: Number, required: true },
      addOns: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    payment: {
      stripePaymentIntentId: String,
      stripeCustomerId: String,
      paymentMethod: {
        type: String,
        enum: ['full', 'deposit'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'refunded'],
        default: 'pending',
      },
      paidAmount: { type: Number, default: 0 },
      transactions: [
        {
          amount: Number,
          transactionId: String,
          date: Date,
          type: { type: String, enum: ['payment', 'refund'] },
        },
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'driver-assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    driver: {
      driverId: String,
      name: String,
      phone: String,
      vehicle: String,
    },
    tracking: {
      currentLocation: {
        lat: Number,
        lng: Number,
        timestamp: Date,
      },
      estimatedPickup: Date,
      estimatedDelivery: Date,
      actualPickup: Date,
      actualDelivery: Date,
      statusHistory: [
        {
          status: String,
          timestamp: Date,
          note: String,
        },
      ],
    },
    documents: [
      {
        url: String,
        type: String,
        uploadedAt: Date,
      },
    ],
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Generate unique booking ID before saving
BookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments()
    this.bookingId = `NT${String(count + 1).padStart(6, '0')}`
  }
  next()
})

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)

export default Booking

