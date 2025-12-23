import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'

    const query: any = {}
    if (filter !== 'all') {
      query.status = filter
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 }).limit(100)

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

