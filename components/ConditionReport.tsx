'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const conditionReportSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID is required'),
  type: z.enum(['pickup', 'delivery']),
  inspector_type: z.enum(['driver', 'depot', 'customer']),
  odometer: z.string().optional(),
  fuel_level: z.string().optional(),
  checklist: z.record(z.any()).optional(),
})

type ConditionReportFormData = z.infer<typeof conditionReportSchema>

interface ConditionReportProps {
  bookingId: string
  type: 'pickup' | 'delivery'
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ConditionReport({ bookingId, type, onSuccess, onCancel }: ConditionReportProps) {
  const [loading, setLoading] = useState(false)
  const [signed, setSigned] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConditionReportFormData>({
    resolver: zodResolver(conditionReportSchema),
    defaultValues: {
      booking_id: bookingId,
      type: type,
      inspector_type: 'driver',
      checklist: {},
    },
  })

  const checklistItems = [
    { key: 'exterior_damage', label: 'Exterior Damage', type: 'checkbox' },
    { key: 'interior_damage', label: 'Interior Damage', type: 'checkbox' },
    { key: 'windshield_cracks', label: 'Windshield Cracks', type: 'checkbox' },
    { key: 'tires_condition', label: 'Tires Condition', type: 'select', options: ['Good', 'Fair', 'Poor'] },
    { key: 'battery_condition', label: 'Battery Condition', type: 'select', options: ['Good', 'Fair', 'Dead'] },
    { key: 'keys_provided', label: 'Keys Provided', type: 'checkbox' },
    { key: 'personal_items', label: 'Personal Items Removed', type: 'checkbox' },
  ]

  const onSubmit = async (data: ConditionReportFormData) => {
    if (!signed) {
      toast.error('Please sign the condition report before submitting')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...data,
        checklist_json: data.checklist || {},
        signed_at: new Date().toISOString(),
      }

      const response = await fetch('/api/condition-reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create condition report')
      }

      toast.success(`${type === 'pickup' ? 'Pickup' : 'Delivery'} condition report submitted successfully!`)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit condition report')
      console.error('Condition report error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChecklistChange = (key: string, value: any) => {
    const currentChecklist = watch('checklist') || {}
    setValue('checklist', {
      ...currentChecklist,
      [key]: value,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {type === 'pickup' ? 'Pickup' : 'Delivery'} Condition Report
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Inspector Type *
            </label>
            <select
              {...register('inspector_type')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              <option value="driver">Driver</option>
              <option value="depot">Depot</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Odometer Reading (km)
            </label>
            <input
              {...register('odometer')}
              type="number"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              placeholder="Enter odometer reading"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fuel Level
            </label>
            <select
              {...register('fuel_level')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              <option value="">Select fuel level</option>
              <option value="Full">Full</option>
              <option value="3/4">3/4</option>
              <option value="1/2">1/2</option>
              <option value="1/4">1/4</option>
              <option value="Empty">Empty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Vehicle Condition Checklist
            </label>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="font-medium text-gray-700">{item.label}</label>
                  {item.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      onChange={(e) => handleChecklistChange(item.key, e.target.checked)}
                      className="w-5 h-5 text-accent-600 focus:ring-accent-500"
                    />
                  ) : (
                    <select
                      onChange={(e) => handleChecklistChange(item.key, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="">Select</option>
                      {item.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={signed}
                onChange={(e) => setSigned(e.target.checked)}
                className="w-5 h-5 text-accent-600 focus:ring-accent-500"
              />
              <span className="ml-3 text-gray-700 font-semibold">
                I confirm that the above information is accurate and I sign this condition report
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading || !signed}
            className="flex-1 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Condition Report'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
