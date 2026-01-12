import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user by username (allow both admin and customer roles)
    const user = await User.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    }).select('+password')

    if (!user) {
      console.error(`Login failed: User not found - username: ${username.toLowerCase()}`)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.error(`Login failed: Invalid password - username: ${username.toLowerCase()}, role: ${user.role}`)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    console.log(`Login successful: username: ${user.username}, role: ${user.role}`)

    // Generate token
    const token = generateToken({
      _id: user._id.toString(),
      username: user.username,
      role: user.role,
      name: user.name,
    })

    // Create response and set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    })

    return setAuthCookie(response, token)
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('MongoDB') || error.message?.includes('MONGODB_URI')) {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to login. Please try again.' },
      { status: 500 }
    )
  }
}
