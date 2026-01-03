import type { Browser, Page } from "puppeteer-core"
import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

export interface AutotraderListing {
  autotrader_id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuel_type?: string
  transmission?: string
  body_type?: string
  engine_size?: string
  color?: string
  doors?: number
  description?: string
  features?: string[]
  images: string[] // URLs in DOM order
  listing_url: string
}

export class AutotraderScraper {
  private browser: Browser | null = null
  private readonly dealerUrl: string

  constructor(dealerUrl: string) {
    this.dealerUrl = dealerUrl
  }

  async initialize() {
    try {
      // Check if we're in a serverless environment (Vercel)
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

      console.log(`Initializing browser in ${isServerless ? "serverless" : "local"} environment...`)

      if (isServerless) {
        // Use serverless-compatible Chromium
        chromium.setGraphicsMode(false) // Disable GPU for serverless
        chromium.setHeadlessMode(true)
        
        const executablePath = await chromium.executablePath()
        console.log(`Using Chromium executable: ${executablePath ? "found" : "not found"}`)
        
        this.browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: executablePath,
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        })
        
        console.log("Browser launched successfully in serverless mode")
      } else {
        // Use regular Chromium for local/dev
        // Try to use system Chrome/Chromium
        this.browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath: process.env.CHROME_PATH || undefined,
        })
        
        console.log("Browser launched successfully in local mode")
      }
    } catch (error) {
      const errorDetails = error instanceof Error ? error.message : "Unknown error"
      const errorStack = error instanceof Error ? error.stack : undefined
      console.error("Browser initialization error:", errorDetails)
      console.error("Error stack:", errorStack)
      
      throw new Error(
        `Failed to launch browser: ${errorDetails}. Puppeteer may not be installed or available in this environment.`
      )
    }
  }

  async scrapeAllListings(): Promise<AutotraderListing[]> {
    if (!this.browser) {
      await this.initialize()
    }

    const page = await this.browser!.newPage()
    const listings: AutotraderListing[] = []

    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 })
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      )

      // Navigate to dealer page
      console.log(`Navigating to ${this.dealerUrl}...`)
      await page.goto(this.dealerUrl, { waitUntil: "domcontentloaded", timeout: 60000 })

      // Accept cookies if present
      try {
        const acceptCookiesButton = await page.$('button#onetrust-accept-btn-handler')
        if (acceptCookiesButton) {
          console.log("Accepting cookies...")
          await acceptCookiesButton.click()
          await page.waitForTimeout(2000) // Wait for cookie banner to disappear
        }
      } catch (error) {
        // Cookie banner might not be present
        console.log("No cookie banner found or already accepted")
      }

      // Wait for listings to load
      await page.waitForTimeout(3000)

      // Handle pagination - scrape all pages
      let hasNextPage = true
      let pageNum = 1

      while (hasNextPage) {
        console.log(`Scraping page ${pageNum}...`)

        // Wait for listings to be visible
        try {
          await page.waitForSelector('li[data-testid="listing-card"]', { timeout: 10000 })
        } catch (error) {
          console.log("Waiting for listings to load...")
          await page.waitForTimeout(2000)
        }

        // Try multiple selector strategies
        let listingElements: any[] = []

        // Strategy 1: Modern Autotrader selectors
        try {
          listingElements = await page.$$('li[data-testid="listing-card"]')
          if (listingElements.length === 0) {
            // Strategy 2: Alternative selectors
            listingElements = await page.$$('[data-testid="search-listing"], [data-testid="advert-card"]')
          }
          if (listingElements.length === 0) {
            // Strategy 3: Class-based selectors
            listingElements = await page.$$(
              '.search-listing, .at-listing-card, [class*="listing-card"], [class*="advert-card"]'
            )
          }
          if (listingElements.length === 0) {
            // Strategy 4: Generic listing containers
            listingElements = await page.$$('article, [role="article"], .listing, [class*="listing"]')
          }
        } catch (error) {
          console.warn("Error finding listing elements:", error)
        }

        console.log(`Found ${listingElements.length} listing elements on page ${pageNum}`)

        // Extract data from each listing on this page
        for (let i = 0; i < listingElements.length; i++) {
          try {
            const listing = await this.extractListingData(page, listingElements[i], i)
            if (listing) {
              listings.push(listing)
            }
          } catch (error) {
            console.error(`Error extracting listing ${i} on page ${pageNum}:`, error)
            continue
          }
        }

        // Check for next page button
        try {
          const nextButton = await page.$('a[data-testid="pagination-next-button"], a[aria-label*="Next"], a[aria-label*="next"]')
          if (nextButton) {
            const isDisabled = await nextButton.evaluate((el) => {
              return el.getAttribute("aria-disabled") === "true" || el.classList.contains("disabled")
            })

            if (!isDisabled) {
              console.log(`Navigating to page ${pageNum + 1}...`)
              await Promise.all([
                page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }),
                nextButton.click(),
              ])
              await page.waitForTimeout(2000) // Wait for page to load
              pageNum++
            } else {
              hasNextPage = false
            }
          } else {
            hasNextPage = false
          }
        } catch (error) {
          console.log("No next page button found or error navigating:", error)
          hasNextPage = false
        }
      }

      console.log(`Total listings scraped: ${listings.length}`)

      // If no listings found, try fallback approach
      if (listings.length === 0) {
        console.log("Trying fallback scrape method...")
        const fallbackListings = await this.fallbackScrape(page)
        listings.push(...fallbackListings)
      }

      // If still no listings, try extracting from individual car detail links
      if (listings.length === 0) {
        console.log("Trying to extract from car detail links...")
        const detailListings = await this.scrapeFromDetailLinks(page)
        listings.push(...detailListings)
      }
    } catch (error) {
      console.error("Scraping error:", error)
      throw error
    } finally {
      await page.close()
    }

    return listings
  }

  private async scrapeFromDetailLinks(page: Page): Promise<AutotraderListing[]> {
    const listings: AutotraderListing[] = []

    try {
      // Find all links to car detail pages
      const carLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/car-details/"]'))
        return links
          .map((link) => ({
            href: link.getAttribute("href") || "",
            text: link.textContent?.trim() || "",
          }))
          .filter((link) => link.href.includes("/car-details/"))
          .slice(0, 20) // Limit to first 20 to avoid timeout
      })

      for (const link of carLinks) {
        try {
          const match = link.href.match(/\/car-details\/([^\/\?]+)/)
          if (!match) continue

          const autotraderId = match[1]
          const fullUrl = link.href.startsWith("http") ? link.href : `https://www.autotrader.co.uk${link.href}`

          // Extract basic info from link text
          const titleMatch = link.text.match(/(\d{4})\s+(.+?)\s+(.+)/)
          if (titleMatch) {
            listings.push({
              autotrader_id: autotraderId,
              make: titleMatch[2].trim(),
              model: titleMatch[3].trim(),
              year: parseInt(titleMatch[1]),
              price: 0,
              mileage: 0,
              images: [],
              listing_url: fullUrl,
            })
          }
        } catch (error) {
          console.error("Error processing detail link:", error)
          continue
        }
      }
    } catch (error) {
      console.error("Error in fallback detail link scrape:", error)
    }

    return listings
  }

  private async extractListingData(page: Page, element: any, index: number): Promise<AutotraderListing | null> {
    try {
      // Extract basic info
      const title = await element.evaluate((el: Element) => {
        const titleEl = el.querySelector('h3[data-testid="listing-card-title"]')
        return titleEl?.textContent?.trim() || ""
      })

      if (!title) return null

      // Parse make, model, year from title (e.g., "2022 Mercedes-Benz S-Class")
      const titleMatch = title.match(/(\d{4})\s+(.+?)\s+(.+)/)
      if (!titleMatch) return null

      const year = parseInt(titleMatch[1])
      const make = titleMatch[2].trim()
      const model = titleMatch[3].trim()

      // Extract price
      const priceText = await element.evaluate((el: Element) => {
        const priceEl = el.querySelector('div[data-testid="listing-card-price"]')
        return priceEl?.textContent?.trim() || ""
      })

      const price = this.parsePrice(priceText)

      // Extract mileage
      const mileageText = await element.evaluate((el: Element) => {
        const mileageEl = el.querySelector('ul[data-testid="vehicle-features"] li:nth-child(1)')
        return mileageEl?.textContent?.trim() || ""
      })

      const mileage = this.parseMileage(mileageText)

      // Extract fuel type and transmission
      const fuelType = await element.evaluate((el: Element) => {
        const fuelEl = el.querySelector('ul[data-testid="vehicle-features"] li:nth-child(2)')
        return fuelEl?.textContent?.trim() || ""
      })

      const transmission = await element.evaluate((el: Element) => {
        const transEl = el.querySelector('ul[data-testid="vehicle-features"] li:nth-child(3)')
        return transEl?.textContent?.trim() || ""
      })

      // Extract autotrader ID from element ID or link
      const autotraderId = await element.evaluate((el: Element) => {
        // Try to get from element ID
        const id = el.getAttribute("id")
        if (id && id.includes("listing-")) {
          return id.replace("listing-", "")
        }

        // Try to get from link
        const link = el.querySelector('a[data-testid="listing-card-link"]')
        if (link) {
          const href = link.getAttribute("href") || ""
          const match = href.match(/\/car-details\/([^\/\?]+)/)
          if (match) return match[1]
        }

        return null
      })

      if (!autotraderId) return null

      // Extract listing URL
      const listingUrl = await element.evaluate((el: Element) => {
        const link = el.querySelector('a[data-testid="listing-card-link"]')
        if (link) {
          const href = link.getAttribute("href") || ""
          return href.startsWith("http") ? href : `https://www.autotrader.co.uk${href}`
        }
        return null
      })

      // Extract images in DOM order (preserve order from page)
      const images = await element.evaluate((el: Element) => {
        const imgElements = Array.from(el.querySelectorAll('img[data-testid="listing-card-image"]'))
        const imageUrls: string[] = []

        imgElements.forEach((img) => {
          // Try multiple attributes for image source
          const src =
            img.getAttribute("data-src") ||
            img.getAttribute("data-lazy-src") ||
            img.getAttribute("src") ||
            ""

          if (src && !src.includes("placeholder") && !src.includes("logo") && !src.includes("icon")) {
            let fullUrl = src
            if (!src.startsWith("http")) {
              fullUrl = src.startsWith("//") ? `https:${src}` : `https://www.autotrader.co.uk${src}`
            }

            // Clean up URL (remove query params that might be for sizing)
            const cleanUrl = fullUrl.split("?")[0]

            if (!imageUrls.includes(cleanUrl) && cleanUrl.includes("autotrader")) {
              imageUrls.push(cleanUrl)
            }
          }
        })

        return imageUrls
      })

      // Extract description
      const description = await element.evaluate((el: Element) => {
        const descEl = el.querySelector('p[data-testid="listing-card-description"]')
        return descEl?.textContent?.trim() || ""
      })

      return {
        autotrader_id: autotraderId,
        make,
        model,
        year,
        price,
        mileage,
        fuel_type: fuelType || undefined,
        transmission: transmission || undefined,
        images: images.length > 0 ? images : [],
        listing_url: listingUrl || `https://www.autotrader.co.uk/car-details/${autotraderId}`,
        description: description || undefined,
      }
    } catch (error) {
      console.error("Error extracting listing data:", error)
      return null
    }
  }

  private async fallbackScrape(page: Page): Promise<AutotraderListing[]> {
    // Fallback: Try to extract from page structure
    const listings: AutotraderListing[] = []

    try {
      // Get all links to car details
      const carLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/car-details"]'))
        return links.map((link) => ({
          href: link.getAttribute("href") || "",
          text: link.textContent?.trim() || "",
        }))
      })

      for (const link of carLinks) {
        const match = link.href.match(/\/car-details\/([^\/]+)/)
        if (match) {
          const autotraderId = match[1]
          const titleMatch = link.text.match(/(\d{4})\s+(.+?)\s+(.+)/)

          if (titleMatch) {
            listings.push({
              autotrader_id: autotraderId,
              make: titleMatch[2].trim(),
              model: titleMatch[3].trim(),
              year: parseInt(titleMatch[1]),
              price: 0, // Will need to fetch from detail page
              mileage: 0,
              images: [],
              listing_url: link.href.startsWith("http") ? link.href : `https://www.autotrader.co.uk${link.href}`,
            })
          }
        }
      }
    } catch (error) {
      console.error("Fallback scrape error:", error)
    }

    return listings
  }

  private parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[£,\s]/g, "")
    return parseInt(cleaned) || 0
  }

  private parseMileage(mileageText: string): number {
    const cleaned = mileageText.replace(/[,\s]/g, "").replace(/miles?/i, "")
    return parseInt(cleaned) || 0
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}
