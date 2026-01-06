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

    let emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; 
            line-height: 1.6; 
            color: #F2F0E6 !important; 
            background-color: #1A1A1A !important; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background-color: #1A1A1A !important; 
          }
          .header { 
            background: linear-gradient(135deg, #D4AF37 0%, #C0A030 100%) !important; 
            color: #000 !important; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: bold; 
            color: #000 !important; 
          }
          .content { 
            background-color: #1A1A1A !important; 
            padding: 30px; 
            color: #F2F0E6 !important; 
          }
          .car-listing { 
            background-color: #262626; 
            border: 1px solid rgba(212, 175, 55, 0.3); 
            border-radius: 8px; 
            padding: 24px; 
            margin: 20px 0; 
          }
          .car-info { 
            padding: 0; 
          }
          .car-title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #F2F0E6 !important; 
            margin: 0 0 16px 0; 
          }
          .car-price { 
            font-size: 32px; 
            font-weight: bold; 
            color: #D4AF37 !important; 
            margin: 16px 0; 
          }
          .car-specs { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 12px; 
            margin: 20px 0; 
          }
          .spec-item { 
            padding: 12px; 
            background-color: #1A1A1A; 
            border: 1px solid rgba(212, 175, 55, 0.2); 
            border-radius: 6px; 
          }
          .spec-label { 
            font-size: 11px; 
            color: #999; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin-bottom: 4px; 
          }
          .spec-value { 
            font-size: 16px; 
            font-weight: bold; 
            color: #F2F0E6 !important; 
          }
          .customer-info { 
            background-color: #262626; 
            border: 1px solid rgba(212, 175, 55, 0.3); 
            padding: 24px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .customer-info h2 { 
            color: #D4AF37; 
            font-size: 20px; 
            margin: 0 0 16px 0; 
          }
          .info-row { 
            margin: 12px 0; 
            padding: 8px 0; 
            border-bottom: 1px solid rgba(212, 175, 55, 0.1); 
          }
          .info-label { 
            font-weight: bold; 
            color: #D4AF37; 
            display: inline-block; 
            min-width: 80px; 
          }
          .info-value { 
            color: #F2F0E6 !important; 
          }
          .info-value a { 
            color: #D4AF37 !important; 
            text-decoration: none; 
          }
          .message-box { 
            background-color: #262626; 
            border-left: 4px solid #D4AF37; 
            padding: 16px; 
            margin: 20px 0; 
            border-radius: 4px; 
          }
          .message-box strong { 
            color: #D4AF37; 
          }
          .message-box p { 
            color: #F2F0E6 !important; 
            margin: 8px 0 0 0; 
          }
          .view-listing-btn { 
            display: inline-block; 
            background-color: #D4AF37; 
            color: #000; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            margin-top: 16px; 
            text-align: center; 
          }
          .footer { 
            text-align: center; 
            color: #999; 
            font-size: 12px; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid rgba(212, 175, 55, 0.2); 
          }
          .footer a { 
            color: #D4AF37; 
            text-decoration: none; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${type === "test-drive" ? "Test Drive Request" : "New Enquiry"}</h1>
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
      const carRegistration = fullCarDetails?.registration || null

      emailContent += `
            <div class="car-listing">
              <div class="car-info">
                <div class="car-title" style="color: #F2F0E6 !important;">${carYearValue} ${carMake} ${carModel}</div>
                ${carPrice ? `<div class="car-price" style="color: #D4AF37 !important;">${carPrice}</div>` : ""}
                ${carRegistration ? `<div style="margin: 10px 0; padding: 10px; background-color: #1A1A1A; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.3);"><span style="font-size: 12px; color: #999; text-transform: uppercase;">Registration:</span> <span style="font-size: 18px; font-weight: bold; color: #D4AF37 !important;">${carRegistration}</span></div>` : ""}
                <div class="car-specs">
                  ${carMileage ? `<div class="spec-item"><div class="spec-label">Mileage</div><div class="spec-value" style="color: #F2F0E6 !important;">${carMileage}</div></div>` : ""}
                  ${carYearValue !== "N/A" ? `<div class="spec-item"><div class="spec-label">Year</div><div class="spec-value" style="color: #F2F0E6 !important;">${carYearValue}</div></div>` : ""}
                  ${carFuel !== "N/A" ? `<div class="spec-item"><div class="spec-label">Fuel Type</div><div class="spec-value" style="color: #F2F0E6 !important;">${carFuel}</div></div>` : ""}
                  ${carTransmission !== "N/A" ? `<div class="spec-item"><div class="spec-label">Transmission</div><div class="spec-value" style="color: #F2F0E6 !important;">${carTransmission}</div></div>` : ""}
                  ${carBodyType !== "N/A" ? `<div class="spec-item"><div class="spec-label">Body Type</div><div class="spec-value" style="color: #F2F0E6 !important;">${carBodyType}</div></div>` : ""}
                </div>
                ${fullCarDetails?.id ? `<div style="text-align: center;"><a href="${baseUrl}/stock/${fullCarDetails.id}" class="view-listing-btn">View Full Listing</a></div>` : ""}
              </div>
            </div>
      `
    }

    // Add customer information
    emailContent += `
            <div class="customer-info">
              <h2>Customer Information</h2>
              <div class="info-row"><span class="info-label">Name:</span> <span class="info-value" style="color: #F2F0E6 !important;">${name}</span></div>
              <div class="info-row"><span class="info-label">Email:</span> <span class="info-value"><a href="mailto:${email}" style="color: #D4AF37 !important; text-decoration: none;">${email}</a></span></div>
              <div class="info-row"><span class="info-label">Phone:</span> <span class="info-value"><a href="tel:${phone}" style="color: #D4AF37 !important; text-decoration: none;">${phone}</a></span></div>
            </div>
    `

    // Add message if provided
    if (message) {
      emailContent += `
            <div class="message-box">
              <strong style="color: #D4AF37 !important;">Message:</strong><br>
              <p style="color: #F2F0E6 !important; margin: 8px 0 0 0;">${message.replace(/\n/g, "<br>")}</p>
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

