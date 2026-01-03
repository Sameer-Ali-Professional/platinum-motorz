"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { X, Upload, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react"
import Image from "next/image"

interface Car {
  id?: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuel_type: string | null
  transmission: string | null
  body_type: string | null
  engine_size: string | null
  color: string | null
  doors: number | null
  description: string | null
  features: string[] | null
  images: string[] | null
  autotrader_id: string | null
  is_available: boolean
}

interface CarEditDialogProps {
  car: Car | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function CarEditDialog({ car, open, onOpenChange, onSave }: CarEditDialogProps) {
  const [formData, setFormData] = useState<Car>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel_type: null,
    transmission: null,
    body_type: null,
    engine_size: null,
    color: null,
    doors: null,
    description: null,
    features: null,
    images: null,
    autotrader_id: null,
    is_available: true,
  })
  const [images, setImages] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (car) {
      setFormData(car)
      setImages(car.images || [])
      setFeatures(car.features || [])
    } else {
      // Reset for new car
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        price: 0,
        mileage: 0,
        fuel_type: null,
        transmission: null,
        body_type: null,
        engine_size: null,
        color: null,
        doors: null,
        description: null,
        features: null,
        images: null,
        autotrader_id: null,
        is_available: true,
      })
      setImages([])
      setFeatures([])
    }
  }, [car, open])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        // For new cars, use a temp folder. We'll move them after car is created
        const filePath = car?.id ? `${car.id}/${fileName}` : `temp/${Date.now()}-${fileName}`

        const { data, error } = await supabase.storage.from("car-images").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) throw error

        const {
          data: { publicUrl },
        } = supabase.storage.from("car-images").getPublicUrl(data.path)

        return publicUrl
      })

      const newImageUrls = await Promise.all(uploadPromises)
      setImages([...images, ...newImageUrls])
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:")
    if (url && url.trim()) {
      setImages([...images, url.trim()])
    }
  }

  const handleImageDelete = (index: number) => {
    if (confirm("Delete this image?")) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const handleImageReorder = (index: number, direction: "up" | "down") => {
    const newImages = [...images]
    if (direction === "up" && index > 0) {
      ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    } else if (direction === "down" && index < newImages.length - 1) {
      ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    }
    setImages(newImages)
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      // Check authentication first
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("You must be logged in to save cars. Please refresh and try again.")
      }

      const carData = {
        ...formData,
        images: images.length > 0 ? images : null,
        features: features.length > 0 ? features : null,
        price: parseFloat(formData.price.toString()),
        mileage: parseInt(formData.mileage.toString()),
        year: parseInt(formData.year.toString()),
        doors: formData.doors ? parseInt(formData.doors.toString()) : null,
      }

      if (car?.id) {
        // Update existing car
        const { data, error } = await supabase.from("cars").update(carData).eq("id", car.id).select()
        if (error) {
          console.error("Supabase error:", error)
          throw new Error(error.message || "Failed to update car")
        }
      } else {
        // Create new car
        const { data, error } = await supabase.from("cars").insert(carData).select()
        if (error) {
          console.error("Supabase error:", error)
          throw new Error(error.message || "Failed to create car")
        }
      }

      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving car:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save car. Please try again."
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-[#D4AF37]/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37]">
            {car ? "Edit Car" : "Add New Car"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {car ? "Update car details and images" : "Add a new car to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
              className="bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (£) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage *</Label>
            <Input
              id="mileage"
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
              className="bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel_type">Fuel Type</Label>
            <Input
              id="fuel_type"
              value={formData.fuel_type || ""}
              onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value || null })}
              className="bg-black/40 border-gray-700 text-white"
              placeholder="e.g., Petrol, Diesel, Hybrid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Input
              id="transmission"
              value={formData.transmission || ""}
              onChange={(e) => setFormData({ ...formData, transmission: e.target.value || null })}
              className="bg-black/40 border-gray-700 text-white"
              placeholder="e.g., Automatic, Manual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_type">Body Type</Label>
            <Input
              id="body_type"
              value={formData.body_type || ""}
              onChange={(e) => setFormData({ ...formData, body_type: e.target.value || null })}
              className="bg-black/40 border-gray-700 text-white"
              placeholder="e.g., Saloon, SUV, Hatchback"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="engine_size">Engine Size</Label>
            <Input
              id="engine_size"
              value={formData.engine_size || ""}
              onChange={(e) => setFormData({ ...formData, engine_size: e.target.value || null })}
              className="bg-black/40 border-gray-700 text-white"
              placeholder="e.g., 2.0L, 3.0L"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color || ""}
              onChange={(e) => setFormData({ ...formData, color: e.target.value || null })}
              className="bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doors">Doors</Label>
            <Input
              id="doors"
              type="number"
              value={formData.doors || ""}
              onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) || null })}
              className="bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              className="bg-black/40 border-gray-700 text-white min-h-[100px]"
              placeholder="Car description..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Features</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                className="bg-black/40 border-gray-700 text-white"
                placeholder="Add a feature..."
              />
              <Button type="button" onClick={handleAddFeature} size="sm" className="bg-[#D4AF37] text-black">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#D4AF37]/20 text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>{feature}</span>
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="hover:text-red-400"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-2 md:col-span-2">
            <Label>Images</Label>
            <div className="flex gap-2 mb-4">
              <label>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#D4AF37]/20 text-white hover:bg-[#D4AF37]/10 bg-transparent cursor-pointer"
                  disabled={isUploading}
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload Images"}
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={handleImageUrlAdd}
                className="border-[#D4AF37]/20 text-white hover:bg-[#D4AF37]/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add URL
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-700">
                    <Image src={imageUrl} alt={`Image ${index + 1}`} fill className="object-cover" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleImageDelete(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleImageReorder(index, "up")}
                      disabled={index === 0}
                      className="h-6 w-6 p-0 bg-black/80"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleImageReorder(index, "down")}
                      disabled={index === images.length - 1}
                      className="h-6 w-6 p-0 bg-black/80"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_available" className="cursor-pointer">
                Available for sale
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.make || !formData.model}
            className="bg-gradient-to-r from-[#D4AF37] to-[#C0A030] text-black font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/50"
          >
            {isSaving ? "Saving..." : car ? "Save Changes" : "Add Car"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

