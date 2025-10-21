"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Droplets,
  Star,
  CheckCircle,
  MessageCircle,
  Phone,
  Calendar,
  Award,
  Shield,
  Clock,
} from "lucide-react"
import { SupportInterface } from "@/components/support-interface"

interface BathroomPageProps {
  onBack: () => void
}

export default function BathroomPage({ onBack }: BathroomPageProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  const valueProps = [
    {
      title: "Custom Design Expertise",
      description: "Our designers create personalized layouts that maximize your space and match your style perfectly.",
      icon: Award,
    },
    {
      title: "Premium Materials",
      description: "We source only the highest quality tiles, fixtures, and finishes from trusted suppliers.",
      icon: Shield,
    },
    {
      title: "Fast Turnaround",
      description: "Most bathroom remodels completed in 2-4 weeks with minimal disruption to your daily routine.",
      icon: Clock,
    },
  ]

  const testimonials = [
    {
      name: "Jennifer & Mark Thompson",
      rating: 5,
      text: "Our master bathroom went from outdated to absolutely stunning! The team was professional, clean, and finished ahead of schedule.",
      project: "Master Bathroom Renovation",
      beforeImage: "/projects/sdb-namur-avant.png",
      afterImage: "/modern-luxury-bathroom-after-renovation-marble-til.png",
    },
    {
      name: "David Chen",
      rating: 5,
      text: "The AI chat helped us plan everything perfectly. They understood exactly what we wanted and delivered beyond expectations.",
      project: "Guest Bathroom Remodel",
      beforeImage: "/small-cramped-bathroom-before-renovation.png",
      afterImage: "/spacious-modern-bathroom-with-glass-shower.png",
    },
    {
      name: "Maria Rodriguez",
      rating: 5,
      text: "Incredible attention to detail and the warranty gives us peace of mind. Best investment we've made in our home!",
      project: "Full Bathroom Renovation",
      beforeImage: "/dated-bathroom-with-old-fixtures-before.png",
      afterImage: "/contemporary-bathroom-with-modern-vanity-and-light.png",
    },
  ]

  const services = [
    "Custom bathroom design and 3D visualization",
    "Complete demolition and reconstruction",
    "Premium tile installation and waterproofing",
    "Custom vanity and storage solutions",
    "Modern plumbing and electrical updates",
    "Luxury shower and bathtub installation",
    "Heated floors and towel warmers",
    "Accessibility modifications and grab bars",
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-50 to-red-50 border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/modern-luxury-bathroom-renovation-with-marble-tile.png"
            alt="Luxury bathroom renovation"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="default" onClick={onBack} className="hover:bg-white/20 bg-foreground text-background">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/WhatsApp%20Image%202025-05-22%20at%2012_edited%281%29%281%29%281%29%281%29-zlj4KtlkpiSaXWLqG31IiPgg1MhIMs.jpg"
              alt="Fix It! Home Services"
              className="h-12 w-auto"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 justify-evenly text-center">
                <div className="bg-red-600 p-3 rounded-xl shadow-lg">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-black">Bathroom Remodeling</h1>
                  <p className="text-lg text-gray-600">Transform Your Space Into a Luxury Retreat</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-evenly text-center">
                <Badge variant="secondary" className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 Rating</span>
                </Badge>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  500+ Completed Projects
                </Badge>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  5-Year Warranty
                </Badge>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed text-center">
                From concept to completion, we create stunning bathrooms that combine luxury, functionality, and your
                personal style. Our expert team handles every detail with precision and care.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-evenly text-center">
                <Button variant="link"
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3"
                  onClick={() => setIsSupportOpen(true)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Speak With Us
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-3 border-2 border-black text-black hover:bg-black hover:text-white bg-transparent"
                  asChild
                >
                  <a href="tel:951-525-1848">
                    <Phone className="h-5 w-5 mr-2" />
                    Call 951-525-1848
                  </a>
                </Button>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p className="text-center text-foreground">
                  License #948319 |{" "}
                  <a href="mailto:fixithomeservices472@gmail.com" className="text-red-600 hover:underline">
                    fixithomeservices472@gmail.com
                  </a>
                </p>
                <p className="text-center text-foreground">Hours: Mon-Fri 7am-5pm | Sat 10am-2pm | Sun Closed</p>
              </div>
            </div>

            <div className="relative">
              <img
                src="/modern-luxury-bathroom-renovation-with-marble-tile.png"
                alt="Beautiful bathroom remodel"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* What Makes Us Different */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Why Choose Fix It! for Your Bathroom?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We don't just remodel bathrooms – we create personalized luxury experiences that add value to your home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => {
              const IconComponent = prop.icon
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow border-gray-200">
                  <CardContent className="space-y-4">
                    <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-black">{prop.title}</h3>
                    <p className="text-gray-600">{prop.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Services Included */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Complete Bathroom Renovation Services</h2>
            <p className="text-lg text-gray-600">
              Everything you need for your dream bathroom, handled by our expert team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-black">{service}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Before & After + Testimonials */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Real Results from Happy Customers</h2>
            <p className="text-lg text-gray-600">
              See the transformations and read what our customers say about their experience.
            </p>
          </div>

          <div className="space-y-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="overflow-hidden border-gray-200">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Before & After Images */}
                    <div className="space-y-4 p-6">
                      <h3 className="text-xl font-semibold text-black">{testimonial.project}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">BEFORE</p>
                          <img
                            src={testimonial.beforeImage || "/placeholder.svg"}
                            alt="Before renovation"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">AFTER</p>
                          <img
                            src={testimonial.afterImage || "/placeholder.svg"}
                            alt="After renovation"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-blue-50 p-6 flex flex-col justify-center">
                      <div className="flex mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <blockquote className="text-black italic mb-4">"{testimonial.text}"</blockquote>
                      <p className="font-semibold text-black">- {testimonial.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Bathroom?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get expert advice and personalized quotes through our message or video chat support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button
              size="lg"
              variant="link"
              className="text-lg px-8 py-3 bg-white text-red-600 hover:bg-gray-100"
              onClick={() => setIsSupportOpen(true)}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Speak With Us
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-600 bg-transparent"
              onClick={() => setIsSupportOpen(true)}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Consultation 
            </Button>
          </div>
        </section>
      </main>

      {isSupportOpen && <SupportInterface onClose={() => setIsSupportOpen(false)} />}
    </div>
  )
}
