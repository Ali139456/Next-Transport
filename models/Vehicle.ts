import mongoose, { Schema, Model, InferSchemaType, HydratedDocument } from 'mongoose'

const VehicleSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['sedan', 'suv', 'ute', 'van', 'light-truck', 'bike'],
      required: true,
    },
    make: { type: String, required: true },
    model: { type: String, required: true }, // keep as "model" safely (no Document conflict now)
    year: { type: String, required: true },
    transportType: { type: String, enum: ['open', 'enclosed'], required: true },
    isRunning: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// ✅ TS type from schema (no extending Document)
export type IVehicle = InferSchemaType<typeof VehicleSchema>

// ✅ If you ever need the document type:
export type VehicleDocument = HydratedDocument<IVehicle>

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema)

export default Vehicle
