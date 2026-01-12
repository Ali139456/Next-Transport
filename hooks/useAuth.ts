'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  username: string
  name: string
  email?: string
  role: 'admin' | 'customer' | 'driver'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // 401 is expected when user is not logged in, don't log as error
        if (response.status !== 401) {
          console.error('Auth check failed with status:', response.status)
        }
        setUser(null)
      }
    } catch (error) {
      // Only log network errors, not expected 401s
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Refresh auth state when route changes (useful after login/logout)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth()
    }, 100) // Small delay to ensure cookie is set

    return () => clearTimeout(timer)
  }, [pathname, checkAuth])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return { user, loading, checkAuth, logout }
}
