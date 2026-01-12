import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IQuote extends Document {
  quote_number: string
  customer_id?: mongoose.Types.ObjectId | null
  pickup_address_id: mongoose.Types.ObjectId
  dropoff_address_id: mongoose.Types.ObjectId
  vehicle_id: mongoose.Types.ObjectId
  preferred_pickup_date: Date
  transport_type: 'open' | 'enclosed'
  distance_km: number
  duration_estimate_days_min: number
  duration_estimate_days_max: number
  pickup_window_days_min: number
  pickup_window_days_max: number
  subtotal_ex_gst: number
  gst_amount: number
  total_inc_gst: number
  currency: string
  expires_at: Date
  pricing_breakdown_json: Record<string, any>
  source: 'web' | 'admin'
  created_at: Date
  updated_at: Date
}

const QuoteSchema: Schema = new Schema(
  {
    quote_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
      validate: {
        validator: function(v: string) {
          return v != null && v.length > 0
        },
        message: 'quote_number is required'
      }
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
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
    preferred_pickup_date: {
      type: Date,
      required: true,
    },
    transport_type: {
      type: String,
      enum: ['open', 'enclosed'],
      required: true,
    },
    distance_km: {
      type: Number,
      required: true,
      min: 0,
    },
    duration_estimate_days_min: {
      type: Number,
      required: true,
      min: 0,
    },
    duration_estimate_days_max: {
      type: Number,
      required: true,
      min: 0,
    },
    pickup_window_days_min: {
      type: Number,
      required: true,
      min: 0,
    },
    pickup_window_days_max: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal_ex_gst: {
      type: Number,
      required: true,
      min: 0,
    },
    gst_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    total_inc_gst: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'AUD',
      enum: ['AUD'],
    },
    expires_at: {
      type: Date,
      required: true,
    },
    pricing_breakdown_json: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    source: {
      type: String,
      enum: ['web', 'admin'],
      required: true,
      default: 'web',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Generate human-readable quote number before validation
QuoteSchema.pre('validate', async function (next) {
  // Only generate quote_number for new documents that don't have one
  if (!this.isNew || this.quote_number) {
    return next()
  }
  
  try {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`
    
    // Count quotes created today to get the sequence number
    // Access model through connection or mongoose.models
    let QuoteModel: Model<IQuote>
    if (this.db && this.db.models && this.db.models.Quote) {
      QuoteModel = this.db.models.Quote as Model<IQuote>
    } else if (mongoose.models.Quote) {
      QuoteModel = mongoose.models.Quote as Model<IQuote>
    } else {
      // Fallback: use mongoose.model (will work if model is already registered)
      QuoteModel = mongoose.model<IQuote>('Quote')
    }
    
    const count = await QuoteModel.countDocuments({
      quote_number: { $regex: `^QT-${datePrefix}-` }
    })
    
    const sequence = String(count + 1).padStart(4, '0')
    this.quote_number = `QT-${datePrefix}-${sequence}`
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Backup: ensure quote_number is set before save if somehow it's still missing
QuoteSchema.pre('save', async function (next) {
  if (!this.quote_number && this.isNew) {
    try {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const datePrefix = `${year}${month}${day}`
      
      // Try to get count, but if model access fails, use timestamp
      try {
        let QuoteModel: Model<IQuote>
        if (this.db && this.db.models && this.db.models.Quote) {
          QuoteModel = this.db.models.Quote as Model<IQuote>
        } else if (mongoose.models.Quote) {
          QuoteModel = mongoose.models.Quote as Model<IQuote>
        } else {
          QuoteModel = mongoose.model<IQuote>('Quote')
        }
        
        const count = await QuoteModel.countDocuments({
          quote_number: { $regex: `^QT-${datePrefix}-` }
        })
        const sequence = String(count + 1).padStart(4, '0')
        this.quote_number = `QT-${datePrefix}-${sequence}`
      } catch {
        // Fallback to timestamp if model access fails
        const timestamp = Date.now().toString().slice(-6)
        this.quote_number = `QT-${datePrefix}-${timestamp}`
      }
    } catch (error) {
      // Last resort fallback
      this.quote_number = `QT-${Date.now()}`
    }
  }
  next()
})

// TTL index for expired quotes cleanup (removes documents after expires_at date)
QuoteSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })

// Compound index for customer quotes
QuoteSchema.index({ customer_id: 1, created_at: -1 })

const Quote: Model<IQuote> = mongoose.models.Quote || mongoose.model<IQuote>('Quote', QuoteSchema)

export default Quote
