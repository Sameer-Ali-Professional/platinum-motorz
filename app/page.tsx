import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ReviewsDisplay } from "@/components/reviews-display"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Platinum Motorz - Premium Luxury Car Dealership in Oldham",
  description:
    "Discover premium luxury vehicles at Platinum Motorz in Oldham. Quality cars, affordable finance options, and trusted service. Browse our exclusive collection of Mercedes, BMW, Audi, Porsche, and more.",
  keywords: "luxury cars Oldham, premium car dealership, Mercedes Oldham, BMW Oldham, Audi Oldham, car finance Oldham",
  openGraph: {
    title: "Platinum Motorz - Premium Luxury Car Dealership",
    description: "Experience luxury on every drive with Platinum Motorz in Oldham",
    type: "website",
  },
}

export default async function Home({
  searchParams,
}: {
  searchParams: { code?: string; next?: string }
}) {
  // Handle OAuth callback if code is present (fallback for Supabase redirects to root)
  if (searchParams.code) {
    redirect(`/auth/callback?code=${searchParams.code}&next=${searchParams.next || "/admin"}`)
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
            <p className="text-gray-400 text-lg">Trusted by luxury car buyers across Greater Manchester</p>
          </div>
          <ReviewsDisplay />
          <div className="text-center mt-12">
            <Link href="/reviews">
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#C0A030] text-black font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all duration-300 px-8 py-6 text-lg">
                View All Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
