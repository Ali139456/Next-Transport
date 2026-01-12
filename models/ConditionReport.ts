import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IConditionReport extends Document {
  booking_id: mongoose.Types.ObjectId
  type: 'pickup' | 'delivery'
  inspector_type: 'driver' | 'depot' | 'customer'
  odometer?: number
  fuel_level?: string
  checklist_json: Record<string, any>
  signed_at?: Date
  created_at: Date
  updated_at: Date
}

const ConditionReportSchema: Schema = new Schema(
  {
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true,
      index: true,
    },
    inspector_type: {
      type: String,
      enum: ['driver', 'depot', 'customer'],
      required: true,
      index: true,
    },
    odometer: {
      type: Number,
      required: false,
      min: 0,
    },
    fuel_level: {
      type: String,
      required: false,
    },
    checklist_json: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    signed_at: {
      type: Date,
      required: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Compound index for finding reports by booking and type
ConditionReportSchema.index({ booking_id: 1, type: 1 }, { unique: true })

// Index for finding unsigned reports
ConditionReportSchema.index({ booking_id: 1, signed_at: 1 })

// Index for finding reports by inspector
ConditionReportSchema.index({ inspector_type: 1, created_at: -1 })

// Compound index for operational queries (booking + type + signed status)
ConditionReportSchema.index({ booking_id: 1, type: 1, signed_at: 1 })

const ConditionReport: Model<IConditionReport> =
  mongoose.models.ConditionReport || mongoose.model<IConditionReport>('ConditionReport', ConditionReportSchema)

export default ConditionReport
