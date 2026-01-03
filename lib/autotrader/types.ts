export interface AutotraderCar {
  autotrader_id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuel_type?: string | null
  transmission?: string | null
  body_type?: string | null
  engine_size?: string | null
  color?: string | null
  doors?: number | null
  description?: string | null
  features?: string[] | null
  images: string[] // URLs in DOM order
  listing_url: string
}

