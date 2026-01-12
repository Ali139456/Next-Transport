'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

interface JobAssignment {
  _id: string
  booking_number: string
  driver_name: string
  driver_phone: string
  assigned_by: string
  assigned_at: string
  status: string
}

export default function JobAssignmentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [assignments, setAssignments] = useState<JobAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }
    fetchAssignments()
  }, [user, authLoading, router])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/admin/job-assignments')
      if (!response.ok) throw new Error('Failed to fetch assignments')
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load job assignments')
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
            Job Assignments
          </h1>
          <p className="text-gray-600">Manage driver assignments for bookings</p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Booking</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Driver</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Assigned By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Assigned At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    No job assignments found
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/tracking/${assignment.booking_number}`}
                        className="text-accent-600 hover:underline font-bold"
                      >
                        {assignment.booking_number}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold">{assignment.driver_name}</div>
                        <div className="text-sm text-gray-500">{assignment.driver_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {assignment.assigned_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        assignment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        assignment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
