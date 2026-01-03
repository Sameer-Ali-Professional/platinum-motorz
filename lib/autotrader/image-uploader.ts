import type { SupabaseClient } from "@supabase/supabase-js"

export class ImageUploader {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async uploadImageFromUrl(imageUrl: string, carId: string, imageIndex: number): Promise<string> {
    try {
      // Fetch image from Autotrader
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const imageBuffer = await response.arrayBuffer()
      const imageBlob = new Blob([imageBuffer])

      // Determine file extension
      const urlPath = new URL(imageUrl).pathname
      const extension = urlPath.match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || "jpg"
      const fileName = `${carId}/${imageIndex}.${extension}`

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage.from("car-images").upload(fileName, imageBlob, {
        contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
        upsert: true,
      })

      if (error) {
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from("car-images").getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error(`Error uploading image ${imageUrl}:`, error)
      // Return original URL as fallback
      return imageUrl
    }
  }

  async uploadImages(images: string[], carId: string): Promise<string[]> {
    const uploadedUrls: string[] = []

    for (let i = 0; i < images.length; i++) {
      try {
        const publicUrl = await this.uploadImageFromUrl(images[i], carId, i)
        uploadedUrls.push(publicUrl)
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Failed to upload image ${i}:`, error)
        // Keep original URL if upload fails
        uploadedUrls.push(images[i])
      }
    }

    return uploadedUrls
  }
}

