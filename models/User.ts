import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  username: string
  email?: string
  password: string
  role: 'admin' | 'driver' | 'customer'
  name: string
  phone?: string
  isActive: boolean
  driverInfo?: {
    vehicle: string
    licenseNumber: string
    currentLocation?: {
      lat: number
      lng: number
      timestamp: Date
    }
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'driver', 'customer'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    driverInfo: {
      vehicle: String,
      licenseNumber: String,
      currentLocation: {
        lat: Number,
        lng: Number,
        timestamp: Date,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(String(this.password), salt)
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

