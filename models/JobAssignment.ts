import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IJobAssignment extends Document {
  booking_id: mongoose.Types.ObjectId
  carrier_id?: mongoose.Types.ObjectId
  driver_id: mongoose.Types.ObjectId
  assigned_by_admin_id: mongoose.Types.ObjectId
  assigned_at: Date
  status: 'assigned' | 'accepted' | 'rejected' | 'cancelled'
  created_at: Date
  updated_at: Date
}

const JobAssignmentSchema: Schema = new Schema(
  {
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    carrier_id: {
      type: Schema.Types.ObjectId,
      ref: 'Carrier',
      required: false,
      index: true,
    },
    driver_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assigned_by_admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assigned_at: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'rejected', 'cancelled'],
      required: true,
      default: 'assigned',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Compound index for finding active assignments by booking
JobAssignmentSchema.index({ booking_id: 1, status: 1 })

// Compound index for driver assignments
JobAssignmentSchema.index({ driver_id: 1, status: 1, assigned_at: -1 })

// Compound index for admin assignment tracking
JobAssignmentSchema.index({ assigned_by_admin_id: 1, assigned_at: -1 })

// Index for finding active assignments (not cancelled/rejected)
JobAssignmentSchema.index({ status: 1, assigned_at: -1 })

// Unique index to ensure one active assignment per booking
// (allows multiple if previous ones are cancelled/rejected)
JobAssignmentSchema.index(
  { booking_id: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['assigned', 'accepted'] } },
  }
)

const JobAssignment: Model<IJobAssignment> =
  mongoose.models.JobAssignment || mongoose.model<IJobAssignment>('JobAssignment', JobAssignmentSchema)

export default JobAssignment
