'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

const contactMethods = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Email Us',
    description: 'Send us an email anytime',
    value: 'support@nexttransport.com.au',
    link: 'mailto:support@nexttransport.com.au',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Call Us',
    description: 'Mon-Fri, 8am-6pm AEST',
    value: '1300 NEXT TRANSPORT',
    link: 'tel:1300NEXTTRANSPORT',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Business Hours',
    description: 'We\'re here to help',
    value: 'Mon - Fri, 8am - 6pm AEST',
    link: null,
  },
]

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = useCallback(async (data: ContactFormData) => {
    setSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [reset])

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
      {/* Animated blob gradients */}
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      <div className="blob-extra"></div>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-grid opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">
            Get In Touch
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {/* Contact Information Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 sm:mb-4">Let&apos;s Start a Conversation</h2>
              <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                Whether you have a question about our services, pricing, or need help with an existing booking, 
                our team is ready to assist you every step of the way.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl p-5 sm:p-6 border-2 border-white/30 hover:border-white/50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                >
                  {method.link ? (
                    <a
                      href={method.link}
                      className="flex items-start space-x-4 text-accent-900 hover:text-accent-700 transition-colors"
                    >
                      <div className="flex-shrink-0 text-accent-600 group-hover:text-accent-700 transition-colors">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold mb-1 text-accent-900">{method.title}</h3>
                        <p className="text-gray-700 text-sm mb-2">{method.description}</p>
                        <p className="text-accent-600 font-semibold text-sm sm:text-base">{method.value}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start space-x-4 text-accent-900">
                      <div className="flex-shrink-0 text-accent-600">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold mb-1 text-accent-900">{method.title}</h3>
                        <p className="text-gray-700 text-sm mb-2">{method.description}</p>
                        <p className="text-accent-900 font-semibold text-sm sm:text-base">{method.value}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Response Time Card */}
            <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl p-6 border-2 border-white/30 shadow-xl">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-accent-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-accent-900 font-semibold mb-2">Quick Response Guarantee</h3>
                  <p className="text-gray-700 text-sm">
                    We typically respond to all inquiries within 24 hours during business days. 
                    For urgent matters, please call us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-gradient-to-br from-white/95 to-accent-50/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 border-2 border-white/30">
            <h2 className="text-2xl sm:text-3xl font-semibold text-accent-900 mb-6 sm:mb-8">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  {...register('name')}
                  className="form-input-light"
                  autoComplete="name"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  {...register('email')}
                  type="email"
                  className="form-input-light"
                  autoComplete="email"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                <input
                  id="phone"
                  {...register('phone')}
                  type="tel"
                  className="form-input-light"
                  autoComplete="tel"
                  placeholder="+61 4XX XXX XXX"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  id="subject"
                  {...register('subject')}
                  className="form-input-light"
                  autoComplete="off"
                  placeholder="What's this regarding?"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.subject.message}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={6}
                  className="form-input-light resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1.5">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] text-base sm:text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
