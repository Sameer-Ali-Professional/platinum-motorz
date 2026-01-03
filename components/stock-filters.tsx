"use client"

import { useState, useEffect, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Car {
  make: string
  model: string
  fuel_type: string | null
  transmission: string | null
  body_type: string | null
  year: number
}

interface StockFiltersProps {
  onFilterChange: (filters: {
    make: string
    model: string
    priceRange: string
    mileage: string
    fuelType: string
    transmission: string
    bodyType: string
    year: string
  }) => void
  cars?: Car[]
}

export function StockFilters({ onFilterChange, cars = [] }: StockFiltersProps) {
  const [filters, setFilters] = useState({
    make: "all",
    model: "all",
    priceRange: "all",
    mileage: "all",
    fuelType: "all",
    transmission: "all",
    bodyType: "all",
    year: "all",
  })

  // Get unique values from cars data
  const uniqueMakes = useMemo(() => {
    const makes = new Set(cars.map((car) => car.make).filter(Boolean))
    return Array.from(makes).sort()
  }, [cars])

  const uniqueModels = useMemo(() => {
    if (filters.make === "all") {
      const models = new Set(cars.map((car) => car.model).filter(Boolean))
      return Array.from(models).sort()
    } else {
      const models = new Set(
        cars.filter((car) => car.make.toLowerCase() === filters.make.toLowerCase()).map((car) => car.model).filter(Boolean)
      )
      return Array.from(models).sort()
    }
  }, [cars, filters.make])

  const uniqueFuelTypes = useMemo(() => {
    const fuelTypes = new Set(cars.map((car) => car.fuel_type).filter(Boolean))
    return Array.from(fuelTypes).sort()
  }, [cars])

  const uniqueTransmissions = useMemo(() => {
    const transmissions = new Set(cars.map((car) => car.transmission).filter(Boolean))
    return Array.from(transmissions).sort()
  }, [cars])

  const uniqueBodyTypes = useMemo(() => {
    const bodyTypes = new Set(cars.map((car) => car.body_type).filter(Boolean))
    return Array.from(bodyTypes).sort()
  }, [cars])

  const yearRange = useMemo(() => {
    if (cars.length === 0) return { min: new Date().getFullYear(), max: new Date().getFullYear() }
    const years = cars.map((car) => car.year)
    return { min: Math.min(...years), max: Math.max(...years) }
  }, [cars])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    // Reset model when make changes
    if (key === "make") {
      newFilters.model = "all"
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Generate year options
  const yearOptions = useMemo(() => {
    const options = []
    const currentYear = new Date().getFullYear()
    const startYear = Math.max(yearRange.min, currentYear - 10)
    const endYear = Math.min(yearRange.max, currentYear + 1)

    // Add decade ranges
    for (let year = endYear; year >= startYear; year -= 5) {
      const rangeStart = Math.max(year - 4, startYear)
      const rangeEnd = Math.min(year, endYear)
      if (rangeStart <= rangeEnd) {
        options.push({ value: `${rangeStart}-${rangeEnd}`, label: `${rangeStart} - ${rangeEnd}` })
      }
    }

    // Add "All Years" at the top
    options.unshift({ value: "all", label: "All Years" })

    return options
  }, [yearRange])

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-12">
      <h2 className="text-xl font-semibold text-foreground mb-6">Filter Vehicles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Make Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Make</label>
          <Select value={filters.make} onValueChange={(value) => handleFilterChange("make", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Makes</SelectItem>
              {uniqueMakes.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Model</label>
          <Select value={filters.model} onValueChange={(value) => handleFilterChange("model", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Models</SelectItem>
              {uniqueModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Fuel Type</label>
          <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange("fuelType", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Fuel Types" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Fuel Types</SelectItem>
              {uniqueFuelTypes.map((fuelType) => (
                <SelectItem key={fuelType} value={fuelType || ""}>
                  {fuelType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Transmission</label>
          <Select value={filters.transmission} onValueChange={(value) => handleFilterChange("transmission", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Transmissions" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Transmissions</SelectItem>
              {uniqueTransmissions.map((transmission) => (
                <SelectItem key={transmission} value={transmission || ""}>
                  {transmission}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Body Type</label>
          <Select value={filters.bodyType} onValueChange={(value) => handleFilterChange("bodyType", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Body Types" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Body Types</SelectItem>
              {uniqueBodyTypes.map((bodyType) => (
                <SelectItem key={bodyType} value={bodyType || ""}>
                  {bodyType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Year</label>
          <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Price Range</label>
          <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-25000">Under £25,000</SelectItem>
              <SelectItem value="25000-50000">£25,000 - £50,000</SelectItem>
              <SelectItem value="50000-75000">£50,000 - £75,000</SelectItem>
              <SelectItem value="75000-100000">£75,000 - £100,000</SelectItem>
              <SelectItem value="100000-150000">£100,000 - £150,000</SelectItem>
              <SelectItem value="150000+">£150,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mileage Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Mileage</label>
          <Select value={filters.mileage} onValueChange={(value) => handleFilterChange("mileage", value)}>
            <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary transition-colors">
              <SelectValue placeholder="All Mileage" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Mileage</SelectItem>
              <SelectItem value="0-10000">Under 10,000 miles</SelectItem>
              <SelectItem value="10000-30000">10,000 - 30,000 miles</SelectItem>
              <SelectItem value="30000-50000">30,000 - 50,000 miles</SelectItem>
              <SelectItem value="50000-75000">50,000 - 75,000 miles</SelectItem>
              <SelectItem value="75000-100000">75,000 - 100,000 miles</SelectItem>
              <SelectItem value="100000+">100,000+ miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
