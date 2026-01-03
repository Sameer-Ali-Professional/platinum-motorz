import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { PageTransition } from "@/components/page-transition"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Platinum Motorz - Premium Luxury Car Dealership in Oldham",
  description:
    "Experience luxury on every drive with Platinum Motorz. Discover premium vehicles with quality, affordable finance, and trusted service in Oldham, England.",
  keywords: "luxury cars, premium vehicles, car dealership Oldham, Mercedes, BMW, Audi, Porsche, car finance",
  authors: [{ name: "Platinum Motorz" }],
  creator: "Platinum Motorz",
  publisher: "Platinum Motorz",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://platinummotorz.com"),
  openGraph: {
    title: "Platinum Motorz - Premium Luxury Car Dealership",
    description: "Experience luxury on every drive with Platinum Motorz in Oldham",
    type: "website",
    locale: "en_GB",
    siteName: "Platinum Motorz",
    images: ["/images/image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB">
      <body className="font-sans antialiased">
        <Navbar />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  )
}
