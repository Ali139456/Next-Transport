import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDocument extends Document {
  owner_type: 'booking' | 'vehicle' | 'customer' | 'condition_report'
  owner_id: mongoose.Types.ObjectId
  type: 'photo' | 'rego' | 'id'
  file_url: string
  uploaded_by: 'customer' | 'admin' | 'driver'
  condition_report_id?: mongoose.Types.ObjectId | null
  created_at: Date
  updated_at: Date
}

const DocumentSchema: Schema = new Schema(
  {
    owner_type: {
      type: String,
      enum: ['booking', 'vehicle', 'customer', 'condition_report'],
      required: true,
      index: true,
    },
    owner_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['photo', 'rego', 'id'],
      required: true,
      index: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    uploaded_by: {
      type: String,
      enum: ['customer', 'admin', 'driver'],
      required: true,
      index: true,
    },
    condition_report_id: {
      type: Schema.Types.ObjectId,
      ref: 'ConditionReport',
      required: false,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Compound index for polymorphic queries (owner_type + owner_id)
DocumentSchema.index({ owner_type: 1, owner_id: 1 })

// Compound index for condition report documents
DocumentSchema.index({ condition_report_id: 1, created_at: -1 })

// Compound index for finding documents by owner and type
DocumentSchema.index({ owner_type: 1, owner_id: 1, type: 1 })

// Compound index for uploaded_by queries
DocumentSchema.index({ uploaded_by: 1, created_at: -1 })

const Document: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)

export default Document
