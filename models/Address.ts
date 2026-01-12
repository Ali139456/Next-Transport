import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAddress extends Document {
  address: string
  suburb: string
  postcode: string
  state: string
  contact_name?: string
  contact_phone?: string
  created_at: Date
  updated_at: Date
}

const AddressSchema: Schema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
    suburb: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    contact_name: {
      type: String,
      required: false,
    },
    contact_phone: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

// Index for location-based queries
AddressSchema.index({ postcode: 1, state: 1 })

const Address: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema)

export default Address
