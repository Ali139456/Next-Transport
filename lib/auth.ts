import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_NAME = 'admin-token'
const TOKEN_EXPIRY = '7d'

export interface AuthUser {
  id: string
  username: string
  role: string
  name: string
}

export function generateToken(user: { _id: string; username: string; role: string; name: string }): string {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(TOKEN_NAME)?.value
    
    if (!token) {
      return null
    }
    
    return verifyToken(token)
  } catch (error) {
    return null
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(TOKEN_NAME)
  return response
}
