import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVehicle extends Document {
  type: 'sedan' | 'suv' | 'ute' | 'van' | 'light-truck' | 'bike'
  make: string
  model: string
  year: string
  is_running: boolean
  transport_type: 'open' | 'enclosed'
  created_at: Date
  updated_at: Date
}

const VehicleSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['sedan', 'suv', 'ute', 'van', 'light-truck', 'bike'],
      required: true,
      index: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    is_running: {
      type: Boolean,
      required: true,
      default: true,
    },
    transport_type: {
      type: String,
      enum: ['open', 'enclosed'],
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema)

export default Vehicle
