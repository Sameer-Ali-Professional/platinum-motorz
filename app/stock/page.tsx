"use client"

import { useState, useEffect } from "react"
import { StockFilters } from "@/components/stock-filters"
import { CarCard } from "@/components/car-card"
import { Button } from "@/components/ui/button"

interface Car {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  price: number
  images: string[] | null
  fuel_type: string | null
  transmission: string | null
  body_type: string | null
}

export default function StockPage() {
  const [displayedCars, setDisplayedCars] = useState(6)
  const [allCars, setAllCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentFilters, setCurrentFilters] = useState({
    make: "all",
    model: "all",
    priceRange: "all",
    mileage: "all",
    fuelType: "all",
    transmission: "all",
    bodyType: "all",
    year: "all",
  })

  useEffect(() => {
    const fetchCars = () => {
      setIsLoading(true)
      fetch("/api/cars")
        .then((res) => res.json())
        .then((data) => {
          setAllCars(data)
          applyFilters(data, currentFilters)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching cars:", error)
          setIsLoading(false)
        })
    }

    fetchCars()

    const interval = setInterval(fetchCars, 30000)

    return () => clearInterval(interval)
  }, [])

  const applyFilters = (
    cars: Car[],
    filters: {
      make: string
      model: string
      priceRange: string
      mileage: string
      fuelType: string
      transmission: string
      bodyType: string
      year: string
    }
  ) => {
    let filtered = cars

    // Make filter - case-insensitive matching
    if (filters.make !== "all") {
      filtered = filtered.filter((car) => car.make.toLowerCase() === filters.make.toLowerCase())
    }

    // Model filter - case-insensitive matching
    if (filters.model !== "all") {
      filtered = filtered.filter((car) => car.model.toLowerCase() === filters.model.toLowerCase())
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-")
      const minPrice = Number.parseInt(min)
      const maxPrice = max.includes("+") ? Number.POSITIVE_INFINITY : Number.parseInt(max)

      filtered = filtered.filter((car) => car.price >= minPrice && car.price <= maxPrice)
    }

    // Mileage filter
    if (filters.mileage !== "all") {
      const [min, max] = filters.mileage.split("-")
      const minMileage = Number.parseInt(min)
      const maxMileage = max.includes("+") ? Number.POSITIVE_INFINITY : Number.parseInt(max)

      filtered = filtered.filter((car) => car.mileage >= minMileage && car.mileage <= maxMileage)
    }

    // Fuel type filter
    if (filters.fuelType !== "all") {
      filtered = filtered.filter(
        (car) => car.fuel_type && car.fuel_type.toLowerCase() === filters.fuelType.toLowerCase()
      )
    }

    // Transmission filter
    if (filters.transmission !== "all") {
      filtered = filtered.filter(
        (car) => car.transmission && car.transmission.toLowerCase() === filters.transmission.toLowerCase()
      )
    }

    // Body type filter
    if (filters.bodyType !== "all") {
      filtered = filtered.filter(
        (car) => car.body_type && car.body_type.toLowerCase() === filters.bodyType.toLowerCase()
      )
    }

    // Year filter
    if (filters.year !== "all") {
      const [min, max] = filters.year.split("-")
      const minYear = Number.parseInt(min)
      const maxYear = max.includes("+") ? Number.POSITIVE_INFINITY : Number.parseInt(max)

      filtered = filtered.filter((car) => car.year >= minYear && car.year <= maxYear)
    }

    setFilteredCars(filtered)
    setDisplayedCars(6)
  }

  const handleFilterChange = (filters: {
    make: string
    model: string
    priceRange: string
    mileage: string
    fuelType: string
    transmission: string
    bodyType: string
    year: string
  }) => {
    setCurrentFilters(filters)
    applyFilters(allCars, filters)
  }

  const handleLoadMore = () => {
    setDisplayedCars((prev) => Math.min(prev + 6, filteredCars.length))
  }

  const visibleCars = filteredCars.slice(0, displayedCars)
  const hasMore = displayedCars < filteredCars.length

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-32">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">
              Our Premium <span className="text-primary">Collection</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-muted"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 text-balance">
            Our Premium <span className="text-primary">Collection</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover our handpicked selection of luxury vehicles, each meticulously inspected and prepared to exceed
            your expectations.
          </p>
        </div>

        <StockFilters onFilterChange={handleFilterChange} cars={allCars} />

        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="text-primary font-semibold">{visibleCars.length}</span> of{" "}
            <span className="text-primary font-semibold">{filteredCars.length}</span> vehicles
          </p>
        </div>

        {filteredCars.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {visibleCars.map((car) => (
                <CarCard
                  key={car.id}
                  id={car.id}
                  make={car.make}
                  model={car.model}
                  year={car.year}
                  mileage={car.mileage}
                  price={car.price}
                  image={car.images?.[0] || "/luxury-car-sleek-design.png"}
                  fuelType={car.fuel_type || "Petrol"}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-accent font-semibold px-12 py-6 text-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
                >
                  Load More Vehicles
                </Button>
              </div>
            )}
          </>
        ) : allCars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">
              No vehicles available at the moment. Please check back soon.
            </p>
            <p className="text-sm text-muted-foreground">Contact us for upcoming stock and special orders.</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">
              No vehicles match your current filters. Please adjust your search criteria.
            </p>
            <Button
              onClick={() =>
                handleFilterChange({
                  make: "all",
                  model: "all",
                  priceRange: "all",
                  mileage: "all",
                  fuelType: "all",
                  transmission: "all",
                  bodyType: "all",
                  year: "all",
                })
              }
              className="bg-primary text-primary-foreground hover:bg-accent"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
