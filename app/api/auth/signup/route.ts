import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { username, email, password, name, phone } = body

    // Validation
    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }

    // Create new user with customer role
    const user = new User({
      username: username.toLowerCase(),
      email: email?.toLowerCase() || undefined,
      password,
      name,
      phone: phone || undefined,
      role: 'customer',
      isActive: true,
    })

    await user.save()

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
        email: user.email,
        role: user.role,
      },
    })

    return setAuthCookie(response, token)
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
