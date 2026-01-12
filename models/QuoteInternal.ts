import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IQuoteInternal extends Document {
  quote_id: mongoose.Types.ObjectId
  estimated_internal_cost_ex_gst: number
  estimated_margin_ex_gst: number
  pricing_notes?: string
  created_at: Date
  updated_at: Date
}

const QuoteInternalSchema: Schema = new Schema(
  {
    quote_id: {
      type: Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
      unique: true,
      index: true,
    },
    estimated_internal_cost_ex_gst: {
      type: Number,
      required: true,
      min: 0,
    },
    estimated_margin_ex_gst: {
      type: Number,
      required: true,
    },
    pricing_notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Ensure one-to-one relationship with Quote
QuoteInternalSchema.index({ quote_id: 1 }, { unique: true })

const QuoteInternal: Model<IQuoteInternal> =
  mongoose.models.QuoteInternal || mongoose.model<IQuoteInternal>('QuoteInternal', QuoteInternalSchema)

export default QuoteInternal
