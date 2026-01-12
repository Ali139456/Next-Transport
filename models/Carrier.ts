import mongoose, { Schema, Document, Model } from 'mongoose'
import crypto from 'crypto'

export interface ICarrier extends Document {
  id: string // UUID
  legal_name: string
  trading_name: string
  abn: string
  insurance_certificate_url?: string
  service_states: string[]
  vehicle_types_supported: string[]
  active: boolean
  visibility: 'INTERNAL_ONLY'
  created_at: Date
  updated_at: Date
}

const CarrierSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    legal_name: {
      type: String,
      required: true,
    },
    trading_name: {
      type: String,
      required: true,
      index: true,
    },
    abn: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    insurance_certificate_url: {
      type: String,
      required: false,
    },
    service_states: {
      type: [String],
      required: true,
      default: [],
    },
    vehicle_types_supported: {
      type: [String],
      required: true,
      default: [],
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ['INTERNAL_ONLY'],
      required: true,
      default: 'INTERNAL_ONLY',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Carrier: Model<ICarrier> =
  mongoose.models.Carrier || mongoose.model<ICarrier>('Carrier', CarrierSchema)

export default Carrier
