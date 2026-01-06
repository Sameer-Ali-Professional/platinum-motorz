import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    const { name, email, phone, message, subject, type, carDetails, carId } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch full car details if carId is provided
    let fullCarDetails = null
    if (carId) {
      try {
        const supabase = await createClient()
        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select("*")
          .eq("id", carId)
          .single()

        if (!carError && carData) {
          fullCarDetails = carData
        }
      } catch (error) {
        console.error("Error fetching car details:", error)
        // Continue without full car details
      }
    }

    // Determine email subject
    const emailSubject = subject || (type === "test-drive" ? "Test Drive Request" : "New Enquiry")

    // Build email content with car listing
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.platinummotorz.co.uk"
    const carImageUrl = fullCarDetails?.images?.[0] 
      ? `${baseUrl}${fullCarDetails.images[0].startsWith('/') ? '' : '/'}${fullCarDetails.images[0]}`
      : `${baseUrl}/luxury-car-sleek-design.png`

    let emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #C0A030 100%); color: #000; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .car-listing { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .car-image { width: 100%; max-width: 500px; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
          .car-title { font-size: 22px; font-weight: bold; color: #D4AF37; margin: 10px 0; }
          .car-price { font-size: 28px; font-weight: bold; color: #000; margin: 15px 0; }
          .car-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .detail-item { padding: 10px; background: #f5f5f5; border-radius: 4px; }
          .detail-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .detail-value { font-size: 16px; font-weight: bold; color: #000; }
          .customer-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { margin: 10px 0; }
          .info-label { font-weight: bold; color: #666; }
          .message-box { background: #fff; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${type === "test-drive" ? "🚗 Test Drive Request" : "📧 New Enquiry"}</h1>
          </div>
          <div class="content">
    `

    // Add car listing if available
    if (fullCarDetails || carDetails) {
      const car = fullCarDetails || carDetails
      const carYear = fullCarDetails?.year || carDetails?.year
      const carMake = fullCarDetails?.make || carDetails?.make
      const carModel = fullCarDetails?.model || carDetails?.model
      const carPrice = fullCarDetails?.price ? `£${fullCarDetails.price.toLocaleString()}` : ""
      const carMileage = fullCarDetails?.mileage ? `${fullCarDetails.mileage.toLocaleString()} miles` : ""
      const carFuel = fullCarDetails?.fuel_type || "N/A"
      const carTransmission = fullCarDetails?.transmission || "N/A"
      const carBodyType = fullCarDetails?.body_type || "N/A"
      const carYearValue = fullCarDetails?.year || carDetails?.year || "N/A"

      emailContent += `
            <div class="car-listing">
              <img src="${carImageUrl}" alt="${carMake} ${carModel}" class="car-image" />
              <div class="car-title">${carYearValue} ${carMake} ${carModel}</div>
              ${carPrice ? `<div class="car-price">${carPrice}</div>` : ""}
              <div class="car-details">
                ${carMileage ? `<div class="detail-item"><div class="detail-label">Mileage</div><div class="detail-value">${carMileage}</div></div>` : ""}
                ${carYearValue !== "N/A" ? `<div class="detail-item"><div class="detail-label">Year</div><div class="detail-value">${carYearValue}</div></div>` : ""}
                ${carFuel !== "N/A" ? `<div class="detail-item"><div class="detail-label">Fuel Type</div><div class="detail-value">${carFuel}</div></div>` : ""}
                ${carTransmission !== "N/A" ? `<div class="detail-item"><div class="detail-label">Transmission</div><div class="detail-value">${carTransmission}</div></div>` : ""}
                ${carBodyType !== "N/A" ? `<div class="detail-item"><div class="detail-label">Body Type</div><div class="detail-value">${carBodyType}</div></div>` : ""}
              </div>
              ${fullCarDetails?.id ? `<p style="text-align: center; margin-top: 20px;"><a href="${baseUrl}/stock/${fullCarDetails.id}" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Full Listing</a></p>` : ""}
            </div>
      `
    }

    // Add customer information
    emailContent += `
            <div class="customer-info">
              <h2 style="margin-top: 0; color: #D4AF37;">Customer Information</h2>
              <div class="info-row"><span class="info-label">Name:</span> ${name}</div>
              <div class="info-row"><span class="info-label">Email:</span> <a href="mailto:${email}">${email}</a></div>
              <div class="info-row"><span class="info-label">Phone:</span> <a href="tel:${phone}">${phone}</a></div>
            </div>
    `

    // Add message if provided
    if (message) {
      emailContent += `
            <div class="message-box">
              <strong>Message:</strong><br>
              ${message.replace(/\n/g, "<br>")}
            </div>
      `
    }

    emailContent += `
            <div class="footer">
              <p>This email was sent from Platinum Motorz website</p>
              <p><a href="${baseUrl}">Visit Website</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["sameeraliprofessional1@gmail.com"],
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

