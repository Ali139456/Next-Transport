import mongoose, { Schema, Document, Model } from 'mongoose'

/**
 * Carrier Model
 * INTERNAL ONLY - Used by ops/dispatch/finance teams
 * Never exposed to retail customers
 * MongoDB automatically generates _id field (accessible as id in JSON)
 */
export interface ICarrier extends Document {
  legal_name: string
  trading_name: string
  abn: string
  insurance_certificate_url?: string
  service_states: string[] // Array of Australian states (e.g., "NSW", "VIC", "QLD")
  vehicle_types_supported: Array<'sedan' | 'suv' | 'ute' | 'van' | 'light-truck' | 'bike'>
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const CarrierSchema: Schema = new Schema(
  {
    legal_name: {
      type: String,
      required: true,
      trim: true,
    },
    trading_name: {
      type: String,
      required: true,
      trim: true,
    },
    abn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      enum: ['sedan', 'suv', 'ute', 'van', 'light-truck', 'bike'],
      required: true,
      default: [],
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Creates createdAt and updatedAt automatically
  }
)

// Index for common queries
CarrierSchema.index({ active: 1, service_states: 1 })
CarrierSchema.index({ active: 1, vehicle_types_supported: 1 })

const Carrier: Model<ICarrier> = mongoose.models.Carrier || mongoose.model<ICarrier>('Carrier', CarrierSchema)

export default Carrier
