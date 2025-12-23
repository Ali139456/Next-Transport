/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <username> <password> <name>
 * Example: node scripts/create-admin.js admin mypassword123 "Admin User"
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Simple User schema for this script
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: false },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'driver', 'customer'], required: true },
  name: { type: String, required: true },
  phone: String,
  isActive: { type: Boolean, default: true },
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function createAdmin() {
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.error('Usage: node scripts/create-admin.js <username> <password> <name>')
    console.error('Example: node scripts/create-admin.js admin mypassword123 "Admin User"')
    process.exit(1)
  }

  const [username, password, name] = args

  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not set')
    console.error('Please set it in your .env.local file')
    process.exit(1)
  }

  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() })
    if (existingUser) {
      console.log(`❌ User with username "${username}" already exists`)
      process.exit(1)
    }

    // Create admin user
    const admin = new User({
      username: username.toLowerCase(),
      password: password,
      role: 'admin',
      name: name,
      isActive: true,
    })

    await admin.save()
    console.log(`✅ Admin user created successfully!`)
    console.log(`   Username: ${admin.username}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

createAdmin()
