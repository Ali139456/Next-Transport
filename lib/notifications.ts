import nodemailer from 'nodemailer'

// Email notification system
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `NextTransport <${process.env.SMTP_USER}>`,
      ...options,
    })
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendSMS(to: string, message: string) {
  // Integration with Twilio or similar SMS service
  // This is a placeholder - implement with actual SMS service
  try {
    // Example with Twilio (uncomment and configure):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = require('twilio')(accountSid, authToken)

    const message = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    })

    return message
    */
    console.log(`SMS to ${to}: ${message}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending SMS:', error)
    throw error
  }
}

// Email templates
export function getBookingConfirmationEmail(bookingId: string, customerName: string, totalPrice: number) {
  return {
    subject: `Booking Confirmation - ${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .booking-id { font-size: 24px; font-weight: bold; color: #0ea5e9; }
            .button { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Your booking has been confirmed!</p>
              <p class="booking-id">Booking ID: ${bookingId}</p>
              <p>Total Amount: $${totalPrice.toFixed(2)}</p>
              <p>You can track your booking using the link below:</p>
              <a href="${process.env.NEXTAUTH_URL}/tracking/${bookingId}" class="button">Track Your Booking</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function getStatusUpdateEmail(bookingId: string, status: string, message: string) {
  return {
    subject: `Booking Update - ${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Status Update</h1>
            </div>
            <div class="content">
              <p>Your booking ${bookingId} status has been updated:</p>
              <p><strong>Status:</strong> ${status}</p>
              <p>${message}</p>
              <a href="${process.env.NEXTAUTH_URL}/tracking/${bookingId}">Track Your Booking</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

