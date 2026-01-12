import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Document from '@/models/Document'
import Booking from '@/models/Booking'
import { getAuthUser } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const ownerType = formData.get('ownerType') as string || 'booking'
    const ownerId = formData.get('ownerId') as string
    const documentType = formData.get('type') as string || 'photo'
    const conditionReportId = formData.get('conditionReportId') as string || null

    if (!file || !ownerId) {
      return NextResponse.json(
        { error: 'File and owner ID are required' },
        { status: 400 }
      )
    }

    // Get authenticated user to determine uploader
    const authUser = await getAuthUser()
    const uploadedBy = authUser?.role === 'admin' ? 'admin' : authUser?.role === 'driver' ? 'driver' : 'customer'

    // Validate owner exists
    if (ownerType === 'booking') {
      const booking = await Booking.findOne({
        $or: [
          { booking_number: ownerId },
          { tracking_public_token: ownerId },
        ],
      })
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const filename = `${ownerType}-${ownerId}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Generate URL
    const url = `/uploads/${filename}`

    // Create document record
    const document = new Document({
      owner_type: ownerType as 'booking' | 'vehicle' | 'customer' | 'condition_report',
      owner_id: ownerId,
      type: documentType as 'photo' | 'rego' | 'id',
      file_url: url,
      uploaded_by: uploadedBy as 'customer' | 'admin' | 'driver',
      condition_report_id: conditionReportId || null,
    })

    await document.save()

    return NextResponse.json({
      success: true,
      document: {
        id: document._id,
        url: document.file_url,
        type: document.type,
      },
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

