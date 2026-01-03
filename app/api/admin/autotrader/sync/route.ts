import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AutotraderScraper } from "@/lib/autotrader/scraper"
import { ImageUploader } from "@/lib/autotrader/image-uploader"

const AUTOTRADER_DEALER_URL = "https://www.autotrader.co.uk/dealers/lancashire/oldham/platinum-motorz-10047725"

export async function POST() {
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const scraper = new AutotraderScraper(AUTOTRADER_DEALER_URL)
  const imageUploader = new ImageUploader(supabase)

  try {
    // Initialize scraper
    await scraper.initialize()

    // Scrape all listings from Autotrader
    console.log("Scraping Autotrader listings...")
    const listings = await scraper.scrapeAllListings()
    console.log(`Found ${listings.length} listings`)

    if (listings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No listings found on Autotrader page",
          count: 0,
        },
        { status: 404 }
      )
    }

    // Process each listing
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    }

    for (const listing of listings) {
      try {
        // Upload images to Supabase Storage (preserves order)
        let imageUrls = listing.images

        if (listing.images.length > 0) {
          console.log(`Uploading ${listing.images.length} images for ${listing.make} ${listing.model}...`)
          imageUrls = await imageUploader.uploadImages(listing.images, listing.autotrader_id)
        }

        // Prepare car data for upsert
        const carData = {
          autotrader_id: listing.autotrader_id,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          price: listing.price,
          mileage: listing.mileage,
          fuel_type: listing.fuel_type || null,
          transmission: listing.transmission || null,
          body_type: listing.body_type || null,
          engine_size: listing.engine_size || null,
          color: listing.color || null,
          doors: listing.doors || null,
          description: listing.description || null,
          features: listing.features || null,
          images: imageUrls, // Array preserves DOM order
          is_available: true,
          sync_source: "autotrader",
          last_synced_at: new Date().toISOString(),
        }

        // Check if car exists
        const { data: existingCar } = await supabase
          .from("cars")
          .select("id")
          .eq("autotrader_id", listing.autotrader_id)
          .single()

        // Upsert car
        const { error: upsertError } = await supabase.from("cars").upsert(carData, {
          onConflict: "autotrader_id",
          ignoreDuplicates: false,
        })

        if (upsertError) {
          throw upsertError
        }

        if (existingCar) {
          results.updated++
        } else {
          results.created++
        }

        console.log(`✓ Processed: ${listing.make} ${listing.model} (${listing.autotrader_id})`)
      } catch (error) {
        const errorMsg = `Failed to process ${listing.make} ${listing.model}: ${error instanceof Error ? error.message : "Unknown error"}`
        results.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    // Close scraper
    await scraper.close()

    // Mark cars not found in this sync as unavailable (optional - comment out if not desired)
    // const { data: allAutotraderCars } = await supabase
    //   .from("cars")
    //   .select("autotrader_id")
    //   .eq("sync_source", "autotrader")
    //   .eq("is_available", true)

    // const syncedIds = listings.map((l) => l.autotrader_id)
    // const missingIds = allAutotraderCars
    //   ?.filter((c) => c.autotrader_id && !syncedIds.includes(c.autotrader_id))
    //   .map((c) => c.autotrader_id)

    // if (missingIds && missingIds.length > 0) {
    //   await supabase
    //     .from("cars")
    //     .update({ is_available: false })
    //     .in("autotrader_id", missingIds)
    // }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${listings.length} cars from Autotrader`,
      created: results.created,
      updated: results.updated,
      total: listings.length,
      errors: results.errors.length > 0 ? results.errors : undefined,
    })
  } catch (error) {
    try {
      await scraper.close()
    } catch {
      // Ignore close errors
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Autotrader sync error:", error)
    console.error("Error stack:", errorStack)
    
    // Provide more specific error messages
    let userMessage = "Failed to sync Autotrader feed"
    if (errorMessage.includes("puppeteer") || errorMessage.includes("chromium") || errorMessage.includes("browser")) {
      userMessage = "Browser not available. Puppeteer may not be properly configured for serverless environment."
    } else if (errorMessage.includes("timeout") || errorMessage.includes("TIMEOUT")) {
      userMessage = "Request timed out. The sync process may take longer than the serverless function timeout. Consider using a background job or increasing function timeout."
    } else if (errorMessage.includes("ENOENT") || errorMessage.includes("not found")) {
      userMessage = "Browser dependencies not found. Please ensure Puppeteer and Chromium are properly installed."
    } else if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("network")) {
      userMessage = "Network error. Unable to connect to Autotrader. Please try again later."
    }
    
    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === "development" ? errorMessage : errorMessage.substring(0, 200), // Show first 200 chars in production
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    )
  }
}
