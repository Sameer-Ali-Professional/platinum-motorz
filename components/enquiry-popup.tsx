"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnquiryPopupProps {
  isOpen: boolean
  onClose: () => void
  type: "test-drive" | "enquiry"
  carDetails?: {
    make: string
    model: string
    year: number
    id?: string
  }
}

export function EnquiryPopup({ isOpen, onClose, type, carDetails }: EnquiryPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const subject =
        type === "test-drive"
          ? `Test Drive Request - ${carDetails?.make} ${carDetails?.model}`
          : `Enquiry - ${carDetails?.make} ${carDetails?.model}`

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          subject,
          type,
          carId: carDetails?.id || null,
          carDetails: carDetails
            ? {
                year: carDetails.year,
                make: carDetails.make,
                model: carDetails.model,
              }
            : null,
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({ name: "", email: "", phone: "", message: "" })
        setTimeout(() => {
          onClose()
          setSubmitStatus("idle")
        }, 2000)
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border-2 border-primary rounded-xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(212,175,55,0.3)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          {type === "test-drive" ? "Book a Test Drive" : "Make an Enquiry"}
        </h2>
        {carDetails && (
          <p className="text-muted-foreground mb-6">
            {carDetails.year} {carDetails.make} {carDetails.model}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="popup-name" className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              id="popup-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 hover:border-primary/50"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="popup-email" className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <input
              id="popup-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 hover:border-primary/50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="popup-phone" className="block text-sm font-medium text-foreground mb-2">
              Phone *
            </label>
            <input
              id="popup-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 hover:border-primary/50"
              placeholder="+44 7700 900000"
            />
          </div>

          <div>
            <label htmlFor="popup-message" className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              id="popup-message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 hover:border-primary/50 resize-none"
              placeholder="Any additional information..."
            />
          </div>

          {submitStatus === "success" && (
            <div className="text-primary text-sm font-medium">Thank you! We'll be in touch soon.</div>
          )}

          {submitStatus === "error" && (
            <div className="text-destructive text-sm font-medium">
              Something went wrong. Please try again or call us directly.
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-accent font-bold py-6 text-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  )
}
