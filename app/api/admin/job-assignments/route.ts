import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import JobAssignment from '@/models/JobAssignment'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const assignments = await JobAssignment.find()
      .populate('booking_id', 'booking_number')
      .populate('driver_id', 'name phone')
      .populate('assigned_by_admin_id', 'name')
      .select('-carrier_id') // Never expose carrier to admin UI
      .sort({ assigned_at: -1 })
      .limit(100)

    const formatted = assignments.map((assignment: any) => ({
      _id: assignment._id.toString(),
      booking_number: assignment.booking_id?.booking_number || 'N/A',
      driver_name: assignment.driver_id?.name || 'N/A',
      driver_phone: assignment.driver_id?.phone || 'N/A',
      assigned_by: assignment.assigned_by_admin_id?.name || 'N/A',
      assigned_at: assignment.assigned_at,
      status: assignment.status,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching job assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job assignments' },
      { status: 500 }
    )
  }
}
