'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const redirectTo = searchParams.get('redirect') || '/'

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onLogin = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      toast.success('Login successful!')
      
      // Redirect based on user role or redirect parameter
      if (result.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push(redirectTo)
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSignup = async (data: SignupFormData) => {
    setLoading(true)
    try {
      const { confirmPassword, ...signupData } = data
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signupData,
          email: signupData.email || undefined,
          phone: signupData.phone || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Sign up failed')
      }

      toast.success('Account created successfully!')
      router.push(redirectTo)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-accent-900 px-4 sm:px-6 py-8 sm:py-12">
      {/* Background decorative elements - optimized for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-accent-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-accent-600/10 rounded-full blur-2xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-4 sm:mb-5 shadow-lg">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {isSignup ? 'Create Account' : 'Login'}
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              {isSignup ? 'Sign up to book your vehicle transport' : 'Enter your credentials to continue'}
            </p>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="flex gap-2 mb-6 bg-white/5 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                !isSignup
                  ? 'bg-accent-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                isSignup
                  ? 'bg-accent-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {!isSignup ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 sm:space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-white mb-2">
                Username
              </label>
              <input
                id="username"
                {...loginForm.register('username')}
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
              />
              {loginForm.formState.errors.username && (
                <p className="text-red-300 text-sm mt-1.5">{loginForm.formState.errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                id="password"
                {...loginForm.register('password')}
                type="password"
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {loginForm.formState.errors.password && (
                <p className="text-red-300 text-sm mt-1.5">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-3.5 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base sm:text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
          ) : (
          /* Signup Form */
          <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4 sm:space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                Full Name *
              </label>
              <input
                id="name"
                {...signupForm.register('name')}
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="John Doe"
                autoComplete="name"
                autoFocus
              />
              {signupForm.formState.errors.name && (
                <p className="text-red-300 text-sm mt-1.5">{signupForm.formState.errors.name.message}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="signup-username" className="block text-sm font-semibold text-white mb-2">
                Username *
              </label>
              <input
                id="signup-username"
                {...signupForm.register('username')}
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="johndoe"
                autoComplete="username"
              />
              {signupForm.formState.errors.username && (
                <p className="text-red-300 text-sm mt-1.5">{signupForm.formState.errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                id="email"
                {...signupForm.register('email')}
                type="email"
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="john@example.com"
                autoComplete="email"
              />
              {signupForm.formState.errors.email && (
                <p className="text-red-300 text-sm mt-1.5">{signupForm.formState.errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                Phone <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                id="phone"
                {...signupForm.register('phone')}
                type="tel"
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="+61 4XX XXX XXX"
                autoComplete="tel"
              />
              {signupForm.formState.errors.phone && (
                <p className="text-red-300 text-sm mt-1.5">{signupForm.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-semibold text-white mb-2">
                Password *
              </label>
              <input
                id="signup-password"
                {...signupForm.register('password')}
                type="password"
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              {signupForm.formState.errors.password && (
                <p className="text-red-300 text-sm mt-1.5">{signupForm.formState.errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                {...signupForm.register('confirmPassword')}
                type="password"
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all outline-none text-base"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {signupForm.formState.errors.confirmPassword && (
                <p className="text-red-300 text-sm mt-1.5">{signupForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-3.5 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base sm:text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          )}

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center text-sm sm:text-base text-gray-300 hover:text-accent-300 transition-colors font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-accent-900"><div className="text-white text-lg">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
