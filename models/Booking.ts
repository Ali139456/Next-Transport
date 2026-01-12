import mongoose, { Schema, Document, Model } from 'mongoose'
import crypto from 'crypto'

export type BookingStatus = 
  | 'quote_created'
  | 'booking_pending_payment'
  | 'booked_confirmed'
  | 'awaiting_driver_assignment'
  | 'driver_assigned'
  | 'driver_en_route'
  | 'picked_up'
  | 'in_depot'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'on_hold_customer'
  | 'on_hold_operations'
  | 'failed_pickup'
  | 'failed_delivery'
  | 'rebook_required'

export interface IBooking extends Document {
  booking_number: string
  quote_id: mongoose.Types.ObjectId
  customer_id: mongoose.Types.ObjectId
  status: BookingStatus
  pickup_address_id: mongoose.Types.ObjectId
  dropoff_address_id: mongoose.Types.ObjectId
  vehicle_id: mongoose.Types.ObjectId
  pickup_timeframe: {
    start: Date
    end: Date
  }
  special_instructions?: string
  total_inc_gst: number
  deposit_required_amount: number
  balance_due_amount: number
  tracking_public_token: string
  source_channel: 'nexttransport' | 'intraffic' | 'dealer' | 'fleet'
  internal_cost_ex_gst?: number
  internal_margin_ex_gst?: number
  created_at: Date
  updated_at: Date
}

const BookingSchema: Schema = new Schema(
  {
    booking_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    quote_id: {
      type: Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
      index: true,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'quote_created',
        'booking_pending_payment',
        'booked_confirmed',
        'awaiting_driver_assignment',
        'driver_assigned',
        'driver_en_route',
        'picked_up',
        'in_depot',
        'in_transit',
        'delivered',
        'cancelled',
        'refunded',
        'on_hold_customer',
        'on_hold_operations',
        'failed_pickup',
        'failed_delivery',
        'rebook_required',
      ],
      default: 'quote_created',
      required: true,
      index: true,
    },
    pickup_address_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    dropoff_address_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    vehicle_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    pickup_timeframe: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    special_instructions: {
      type: String,
      required: false,
    },
    total_inc_gst: {
      type: Number,
      required: true,
      min: 0,
    },
    deposit_required_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balance_due_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    tracking_public_token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    source_channel: {
      type: String,
      enum: ['nexttransport', 'intraffic', 'dealer', 'fleet'],
      required: true,
      default: 'nexttransport',
      index: true,
    },
    internal_cost_ex_gst: {
      type: Number,
      required: false,
      min: 0,
    },
    internal_margin_ex_gst: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Generate unique booking number before saving
BookingSchema.pre('save', async function (next) {
  if (!this.booking_number) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`
    
    // Count bookings created today to get the sequence number
    const BookingModel = mongoose.model('Booking')
    const count = await BookingModel.countDocuments({
      booking_number: { $regex: `^BK-${datePrefix}-` }
    })
    
    const sequence = String(count + 1).padStart(4, '0')
    this.booking_number = `BK-${datePrefix}-${sequence}`
  }
  
  // Generate tracking_public_token if not set
  if (!this.tracking_public_token) {
    // Generate a secure random token for public tracking
    this.tracking_public_token = crypto.randomBytes(16).toString('hex')
  }
  
  next()
})

// Compound indexes for common queries
BookingSchema.index({ customer_id: 1, created_at: -1 })
BookingSchema.index({ status: 1, created_at: -1 })
BookingSchema.index({ source_channel: 1, created_at: -1 })
// Note: quote_id already has index: true in schema definition, so no need for duplicate index

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)

export default Booking
