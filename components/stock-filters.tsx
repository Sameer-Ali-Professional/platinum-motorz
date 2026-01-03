"use client"

import { useState, useMemo } from "react"
import { Combobox } from "@/components/ui/combobox"
import { CAR_BRANDS, CAR_MODELS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from "@/lib/car-data"

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

  // Make options - use comprehensive list
  const makeOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Makes" }]
    // Add all brands from comprehensive list
    CAR_BRANDS.forEach((brand) => {
      options.push({ value: brand, label: brand })
    })
    return options
  }, [])

  // Model options - filtered by selected make
  const modelOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Models" }]
    
    if (filters.make === "all") {
      // Show all models from all brands
      const allModels = new Set<string>()
      Object.values(CAR_MODELS).forEach((models) => {
        models.forEach((model) => allModels.add(model))
      })
      Array.from(allModels)
        .sort()
        .forEach((model) => {
          options.push({ value: model, label: model })
        })
    } else {
      // Show models for selected make
      const makeModels = CAR_MODELS[filters.make] || []
      makeModels.forEach((model) => {
        options.push({ value: model, label: model })
      })
      
      // Also include models from actual car data for this make (case-insensitive)
      const actualModels = new Set(
        cars
          .filter((car) => car.make.toLowerCase() === filters.make.toLowerCase())
          .map((car) => car.model)
          .filter(Boolean)
      )
      actualModels.forEach((model) => {
        if (!makeModels.includes(model)) {
          options.push({ value: model, label: model })
        }
      })
    }
    
    return options
  }, [filters.make, cars])

  // Fuel type options
  const fuelTypeOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Fuel Types" }]
    FUEL_TYPES.forEach((fuelType) => {
      options.push({ value: fuelType, label: fuelType })
    })
    // Also add any unique fuel types from actual car data
    const actualFuelTypes = new Set(cars.map((car) => car.fuel_type).filter(Boolean))
    actualFuelTypes.forEach((fuelType) => {
      if (!FUEL_TYPES.includes(fuelType as any)) {
        options.push({ value: fuelType!, label: fuelType! })
      }
    })
    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [cars])

  // Transmission options
  const transmissionOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Transmissions" }]
    TRANSMISSIONS.forEach((transmission) => {
      options.push({ value: transmission, label: transmission })
    })
    // Also add any unique transmissions from actual car data
    const actualTransmissions = new Set(cars.map((car) => car.transmission).filter(Boolean))
    actualTransmissions.forEach((transmission) => {
      if (!TRANSMISSIONS.includes(transmission as any)) {
        options.push({ value: transmission!, label: transmission! })
      }
    })
    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [cars])

  // Body type options
  const bodyTypeOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Body Types" }]
    BODY_TYPES.forEach((bodyType) => {
      options.push({ value: bodyType, label: bodyType })
    })
    // Also add any unique body types from actual car data
    const actualBodyTypes = new Set(cars.map((car) => car.body_type).filter(Boolean))
    actualBodyTypes.forEach((bodyType) => {
      if (!BODY_TYPES.includes(bodyType as any)) {
        options.push({ value: bodyType!, label: bodyType! })
      }
    })
    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [cars])

  // Year options
  const yearOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Years" }]
    const currentYear = new Date().getFullYear()
    
    // Generate year ranges from 2025 down to 2000
    for (let year = currentYear; year >= 2000; year -= 5) {
      const rangeStart = Math.max(year - 4, 2000)
      const rangeEnd = Math.min(year, currentYear)
      if (rangeStart <= rangeEnd) {
        options.push({
          value: `${rangeStart}-${rangeEnd}`,
          label: `${rangeStart} - ${rangeEnd}`,
        })
      }
    }
    
    return options
  }, [])

  // Price range options
  const priceRangeOptions = [
    { value: "all", label: "All Prices" },
    { value: "0-25000", label: "Under £25,000" },
    { value: "25000-50000", label: "£25,000 - £50,000" },
    { value: "50000-75000", label: "£50,000 - £75,000" },
    { value: "75000-100000", label: "£75,000 - £100,000" },
    { value: "100000-150000", label: "£100,000 - £150,000" },
    { value: "150000-200000", label: "£150,000 - £200,000" },
    { value: "200000+", label: "£200,000+" },
  ]

  // Mileage options
  const mileageOptions = [
    { value: "all", label: "All Mileage" },
    { value: "0-10000", label: "Under 10,000 miles" },
    { value: "10000-30000", label: "10,000 - 30,000 miles" },
    { value: "30000-50000", label: "30,000 - 50,000 miles" },
    { value: "50000-75000", label: "50,000 - 75,000 miles" },
    { value: "75000-100000", label: "75,000 - 100,000 miles" },
    { value: "100000-150000", label: "100,000 - 150,000 miles" },
    { value: "150000+", label: "150,000+ miles" },
  ]

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    // Reset model when make changes
    if (key === "make") {
      newFilters.model = "all"
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-12">
      <h2 className="text-xl font-semibold text-foreground mb-6">Filter Vehicles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Make Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Make</label>
          <Combobox
            options={makeOptions}
            value={filters.make}
            onValueChange={(value) => handleFilterChange("make", value)}
            placeholder="All Makes"
            searchPlaceholder="Search makes..."
            emptyMessage="No makes found."
          />
        </div>

        {/* Model Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Model</label>
          <Combobox
            options={modelOptions}
            value={filters.model}
            onValueChange={(value) => handleFilterChange("model", value)}
            placeholder="All Models"
            searchPlaceholder="Search models..."
            emptyMessage="No models found."
          />
        </div>

        {/* Fuel Type Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Fuel Type</label>
          <Combobox
            options={fuelTypeOptions}
            value={filters.fuelType}
            onValueChange={(value) => handleFilterChange("fuelType", value)}
            placeholder="All Fuel Types"
            searchPlaceholder="Search fuel types..."
            emptyMessage="No fuel types found."
          />
        </div>

        {/* Transmission Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Transmission</label>
          <Combobox
            options={transmissionOptions}
            value={filters.transmission}
            onValueChange={(value) => handleFilterChange("transmission", value)}
            placeholder="All Transmissions"
            searchPlaceholder="Search transmissions..."
            emptyMessage="No transmissions found."
          />
        </div>

        {/* Body Type Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Body Type</label>
          <Combobox
            options={bodyTypeOptions}
            value={filters.bodyType}
            onValueChange={(value) => handleFilterChange("bodyType", value)}
            placeholder="All Body Types"
            searchPlaceholder="Search body types..."
            emptyMessage="No body types found."
          />
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Year</label>
          <Combobox
            options={yearOptions}
            value={filters.year}
            onValueChange={(value) => handleFilterChange("year", value)}
            placeholder="All Years"
            searchPlaceholder="Search years..."
            emptyMessage="No years found."
          />
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Price Range</label>
          <Combobox
            options={priceRangeOptions}
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange("priceRange", value)}
            placeholder="All Prices"
            searchPlaceholder="Search price ranges..."
            emptyMessage="No price ranges found."
          />
        </div>

        {/* Mileage Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Mileage</label>
          <Combobox
            options={mileageOptions}
            value={filters.mileage}
            onValueChange={(value) => handleFilterChange("mileage", value)}
            placeholder="All Mileage"
            searchPlaceholder="Search mileage ranges..."
            emptyMessage="No mileage ranges found."
          />
        </div>
      </div>
    </div>
  )
}
