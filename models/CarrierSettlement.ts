import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICarrierSettlement extends Document {
  carrier_id: mongoose.Types.ObjectId
  booking_id: mongoose.Types.ObjectId
  amount_ex_gst: number
  due_date: Date
  paid_at?: Date
  status: 'pending' | 'paid' | 'held'
  created_at: Date
  updated_at: Date
}

const CarrierSettlementSchema: Schema = new Schema(
  {
    carrier_id: {
      type: Schema.Types.ObjectId,
      ref: 'Carrier',
      required: true,
      index: true,
    },
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    amount_ex_gst: {
      type: Number,
      required: true,
      min: 0,
    },
    due_date: {
      type: Date,
      required: true,
      index: true,
    },
    paid_at: {
      type: Date,
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'held'],
      required: true,
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Compound index for finding settlements by carrier and status
CarrierSettlementSchema.index({ carrier_id: 1, status: 1, due_date: 1 })

// Compound index for finding settlements by booking
CarrierSettlementSchema.index({ booking_id: 1 })

// Index for finding overdue settlements
CarrierSettlementSchema.index({ due_date: 1, status: 1 })

// Index for finding pending settlements by due date
CarrierSettlementSchema.index({ status: 1, due_date: 1 })

// Unique index to ensure one settlement per booking per carrier
CarrierSettlementSchema.index({ carrier_id: 1, booking_id: 1 }, { unique: true })

const CarrierSettlement: Model<ICarrierSettlement> =
  mongoose.models.CarrierSettlement ||
  mongoose.model<ICarrierSettlement>('CarrierSettlement', CarrierSettlementSchema)

export default CarrierSettlement
