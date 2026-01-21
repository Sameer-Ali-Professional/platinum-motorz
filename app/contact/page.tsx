import { ContactForm } from "@/components/contact-form"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Platinum Motorz | Get In Touch",
  description:
    "Contact Platinum Motorz in Oldham for luxury car enquiries. Visit our showroom at Nile Mill A, Cotswold Avenue, Chadderton, OL9 8PJ. Call +44 7918 082186 or email us today.",
  keywords: "contact Platinum Motorz, car dealership Oldham, luxury cars enquiry, test drive booking",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 leading-relaxed text-pretty">
            We're here to help with all your automotive needs
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-6">Send Us a Message</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Fill out the form below and one of our luxury vehicle specialists will get back to you within 24 hours.
              </p>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Visit Our Showroom</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Experience our collection of premium vehicles in person at our showroom.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  asChild
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-6 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.02]"
                >
                  <a href="tel:+447918082186" className="flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" />
                    Call Now
                  </a>
                </Button>
                <Button
                  asChild
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-6 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] border-2 border-gray-700 hover:border-primary"
                >
                  <a href="mailto:platinummotorz1@outlook.com" className="flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Us
                  </a>
                </Button>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-xl hover:border-primary transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Address</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Nile Mill A, Cotswold Avenue
                      <br />
                      Chadderton, Oldham
                      <br />
                      OL9 8PJ, England
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-xl hover:border-primary transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <a href="tel:+447918082186" className="text-gray-400 hover:text-primary transition-colors">
                      +44 7918 082186
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-xl hover:border-primary transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:platinummotorz1@outlook.com"
                      className="text-gray-400 hover:text-primary transition-colors break-all"
                    >
                      platinummotorz1@outlook.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-xl hover:border-primary transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="w-full">
                    <h3 className="text-white font-semibold mb-3">Opening Hours</h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Monday - Friday</span>
                        <span className="text-gray-400">9:00 AM - 5:30 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Saturday</span>
                        <span className="text-gray-400">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Sunday</span>
                        <span className="text-gray-400">11:00 AM - 4:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="w-full h-80 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 rounded-xl overflow-hidden hover:border-primary transition-all duration-300">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2371.8!2d-2.1389!3d53.5447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487bb3e0e0e0e0e0%3A0x0!2sOL9%208PJ!5e0!3m2!1sen!2suk!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Platinum Motorz Location Map - Nile Mill A, Cotswold Avenue, Chadderton, Oldham"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
