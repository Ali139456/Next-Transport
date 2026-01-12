import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ConditionReport from '@/models/ConditionReport'
import Booking from '@/models/Booking'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      booking_id,
      type,
      inspector_type,
      odometer,
      fuel_level,
      checklist_json,
      signed_at,
    } = body

    // Validate required fields
    if (!booking_id || !type || !inspector_type) {
      return NextResponse.json(
        { error: 'Booking ID, type, and inspector type are required' },
        { status: 400 }
      )
    }

    // Verify booking exists
    const booking = await Booking.findOne({
      $or: [
        { booking_number: booking_id },
        { tracking_public_token: booking_id },
        { _id: booking_id },
      ],
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if report already exists for this booking and type
    const existingReport = await ConditionReport.findOne({
      booking_id: booking._id,
      type: type,
    })

    if (existingReport) {
      // Update existing report
      existingReport.inspector_type = inspector_type
      if (odometer) existingReport.odometer = parseInt(odometer)
      if (fuel_level) existingReport.fuel_level = fuel_level
      existingReport.checklist_json = checklist_json || {}
      if (signed_at) existingReport.signed_at = new Date(signed_at)
      await existingReport.save()

      return NextResponse.json({
        success: true,
        report: existingReport,
      })
    }

    // Create new report
    const report = new ConditionReport({
      booking_id: booking._id,
      type: type,
      inspector_type: inspector_type,
      odometer: odometer ? parseInt(odometer) : undefined,
      fuel_level: fuel_level || undefined,
      checklist_json: checklist_json || {},
      signed_at: signed_at ? new Date(signed_at) : undefined,
    })

    await report.save()

    return NextResponse.json({
      success: true,
      report: {
        id: report._id,
        booking_id: report.booking_id,
        type: report.type,
        signed_at: report.signed_at,
      },
    })
  } catch (error: any) {
    console.error('Error creating condition report:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create condition report' },
      { status: 500 }
    )
  }
}
