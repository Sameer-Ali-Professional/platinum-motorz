"use client"

import { useState, useEffect } from "react"
import { ImageCarousel } from "@/components/image-carousel"
import { EnquiryPopup } from "@/components/enquiry-popup"
import { Calendar, Gauge, Fuel, Cog, Zap, Shield, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface CarDetails {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  price: number
  fuel_type: string | null
  transmission: string | null
  body_type: string | null
  engine_size: string | null
  color: string | null
  doors: number | null
  description: string | null
  features: string[] | null
  images: string[] | null
}

export default function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [car, setCar] = useState<CarDetails | null>(null)
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [carId, setCarId] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => {
      setCarId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (!carId) return

    setIsLoading(true)
    fetch(`/api/cars/${carId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Car not found")
        return res.json()
      })
      .then((data) => {
        setCar(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching car data:", error)
        setIsLoading(false)
      })
  }, [carId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading vehicle details...</div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, we couldn't find the vehicle you're looking for.</p>
          <Link
            href="/stock"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent transition-colors"
          >
            View All Stock
          </Link>
        </div>
      </div>
    )
  }

  const carImages = car.images || ["/luxury-car-sleek-design.png"]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-24">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/stock" className="hover:text-primary transition-colors">
            Stock
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">
            {car.make} {car.model}
          </span>
        </div>

        {/* Image Carousel */}
        <div className="mb-12">
          <ImageCarousel images={carImages} alt={`${car.make} ${car.model}`} />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details & Features */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {car.make} {car.model}
              </h1>
              <p className="text-xl text-muted-foreground">{car.year} Model</p>
            </div>

            {/* Key Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Year</p>
                <p className="font-bold text-foreground">{car.year}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Gauge className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Mileage</p>
                <p className="font-bold text-foreground">{car.mileage.toLocaleString()} mi</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Fuel className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Fuel Type</p>
                <p className="font-bold text-foreground">{car.fuel_type || "Petrol"}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Cog className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Transmission</p>
                <p className="font-bold text-foreground">{car.transmission || "Automatic"}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {car.description ||
                  `Experience luxury and performance with this stunning ${car.year} ${car.make} ${car.model}. This premium vehicle combines cutting-edge technology with exceptional comfort and style.`}
              </p>
            </div>

            {/* Technical Specifications */}
            {(car.engine_size || car.color || car.doors) && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" />
                  Technical Specifications
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {car.engine_size && (
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Engine</span>
                      <span className="font-semibold text-foreground">{car.engine_size}</span>
                    </div>
                  )}
                  {car.transmission && (
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Transmission</span>
                      <span className="font-semibold text-foreground">{car.transmission}</span>
                    </div>
                  )}
                  {car.color && (
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Color</span>
                      <span className="font-semibold text-foreground">{car.color}</span>
                    </div>
                  )}
                  {car.doors && (
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Doors</span>
                      <span className="font-semibold text-foreground">{car.doors}</span>
                    </div>
                  )}
                  {car.body_type && (
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Body Type</span>
                      <span className="font-semibold text-foreground">{car.body_type}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  Premium Features
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {car.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-4xl font-bold text-primary mb-6">£{car.price.toLocaleString()}</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsTestDriveOpen(true)}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:bg-accent hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:scale-105"
                  >
                    Book Test Drive
                  </button>
                  <button
                    onClick={() => setIsEnquiryOpen(true)}
                    className="w-full bg-card border-2 border-primary text-primary py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:scale-105"
                  >
                    Make Enquiry
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Contact Us</h3>
                <div className="space-y-4">
                  <a
                    href="tel:+447918082186"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Call Us</p>
                      <p className="font-semibold">+44 7918 082186</p>
                    </div>
                  </a>
                  <a
                    href="mailto:platinummotorz1@outlook.com"
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email Us</p>
                      <p className="font-semibold text-sm">platinummotorz1@outlook.com</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                <h4 className="font-bold text-foreground mb-2">Trusted Service</h4>
                <p className="text-sm text-muted-foreground">
                  All vehicles come with comprehensive warranty and full service history
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EnquiryPopup
        isOpen={isTestDriveOpen}
        onClose={() => setIsTestDriveOpen(false)}
        type="test-drive"
        carDetails={{ make: car.make, model: car.model, year: car.year }}
      />
      <EnquiryPopup
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        type="enquiry"
        carDetails={{ make: car.make, model: car.model, year: car.year }}
      />
    </div>
  )
}
