import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Email service is not configured. Please set RESEND_API_KEY environment variable." },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, email, phone, message, subject, type, carDetails } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine email subject
    const emailSubject = subject || (type === "test-drive" ? "Test Drive Request" : "New Enquiry")

    // Build email content
    let emailContent = `
      <h2>${type === "test-drive" ? "Test Drive Request" : "New Enquiry"}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    `

    if (carDetails) {
      emailContent += `
        <p><strong>Car:</strong> ${carDetails.year} ${carDetails.make} ${carDetails.model}</p>
      `
    }

    if (message) {
      emailContent += `
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `
    }

    // Send email
    // Note: Resend test mode only allows sending to account owner's email
    // To send to platinummotorz1@outlook.com, verify a domain at resend.com/domains
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["platinummotorz1@outlook.com"],
      subject: emailSubject,
      html: emailContent,
      replyTo: email,
    })

    if (error) {
      console.error("Resend error:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: "Failed to send email", details: error.message || String(error) },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Email API error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    )
  }
}

