"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Wrench,
  Star,
  CheckCircle,
  MessageCircle,
  Phone,
  Calendar,
  Clock,
  Shield,
  Zap,
  AlertTriangle,
} from "lucide-react"
import { SupportInterface } from "@/components/support-interface"

interface PlumbingPageProps {
  onBack: () => void
}

export default function PlumbingPage({ onBack }: PlumbingPageProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  const valueProps = [
    {
      title: "24/7 Emergency Response",
      description: "Burst pipes, major leaks, and plumbing emergencies handled immediately, day or night.",
      icon: Zap,
    },
    {
      title: "Licensed Master Plumbers",
      description: "Our certified professionals have 15+ years experience with all residential plumbing systems.",
      icon: Shield,
    },
    {
      title: "Same-Day Service",
      description: "Most plumbing repairs completed the same day with our fully-stocked service vehicles.",
      icon: Clock,
    },
  ]

  const testimonials = [
    {
      name: "Robert & Linda Martinez",
      rating: 5,
      text: "Called at 11 PM with a burst pipe flooding our basement. They arrived within 30 minutes and had it fixed by midnight. Absolute lifesavers!",
      project: "Emergency Pipe Repair",
      beforeImage: "/flooded-basement-burst-pipe-emergency.png",
      afterImage: "/clean-dry-basement-after-pipe-repair.png",
    },
    {
      name: "Jessica Wong",
      rating: 5,
      text: "The AI chat helped me diagnose the issue before they arrived. Saved time and money by knowing exactly what parts to bring.",
      project: "Water Heater Replacement",
      beforeImage: "/old-leaking-water-heater-before-replacement.png",
      afterImage: "/new-efficient-water-heater-installation.png",
    },
    {
      name: "Michael Thompson",
      rating: 5,
      text: "Transparent pricing, no surprises. They explained everything and the 2-year warranty gives me complete peace of mind.",
      project: "Kitchen Sink & Garbage Disposal",
      beforeImage: "/clogged-kitchen-sink-before-repair.png",
      afterImage: "/modern-kitchen-sink-with-new-disposal.png",
    },
  ]

  const services = [
    "Emergency leak detection and repair",
    "Drain cleaning and sewer line services",
    "Water heater installation and repair",
    "Pipe replacement and repiping",
    "Fixture installation (sinks, toilets, faucets)",
    "Garbage disposal installation and repair",
    "Sump pump installation and maintenance",
    "Water pressure and flow optimization",
  ]

  const emergencyServices = [
    "Burst pipe emergency repair",
    "Severe drain clogs and backups",
    "Water heater failures",
    "Toilet overflows and blockages",
    "Gas line leak detection",
    "Sewer line emergencies",
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-50 to-red-50 border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/professional-plumber-fixing-pipes-emergency-servic.png"
            alt="Professional plumber at work"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={onBack} className="hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>

            <div className="flex items-center space-x-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/WhatsApp%20Image%202025-05-22%20at%2012_edited%281%29%281%29%281%29%281%29-zlj4KtlkpiSaXWLqG31IiPgg1MhIMs.jpg"
                alt="Fix It! Home Services"
                className="h-12 w-12 rounded-lg"
              />
              <div className="text-right text-sm">
                <div className="font-semibold text-black">License# 948319</div>
                <div className="text-gray-600">951-525-1848</div>
                <div className="text-gray-600">Mon-Fri 7am-5pm</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center">
              <div className="flex items-center space-x-3 justify-evenly">
                <div className="bg-red-600 p-3 rounded-xl shadow-lg">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-black">Plumbing Services</h1>
                  <p className="text-lg text-gray-600">Fast, Reliable Solutions When You Need Them</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-evenly">
                <Badge variant="secondary" className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 Rating</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1 border-red-500 text-red-600">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>24/7 Emergency</span>
                </Badge>
                <Badge variant="outline" className="border-black text-black">
                  2-Year Warranty
                </Badge>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed text-center">
                From emergency repairs to planned installations, our licensed master plumbers deliver fast, reliable
                service with transparent pricing and guaranteed results.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 text-center items-center justify-evenly">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3 text-center"
                  onClick={() => setIsSupportOpen(true)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Speak With Us
                </Button>
                
              </div>
            </div>

            <div className="relative">
              <img
                src="/professional-plumber-fixing-pipes-emergency-servic.png"
                alt="Professional plumber working"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Alert Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">PLUMBING EMERGENCY?</span>
            <span>Call 951-525-1848 for immediate 24/7 response</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* What Makes Us Different */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Why Choose Fix It! for Your Plumbing Needs?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              When plumbing problems strike, you need fast, reliable service from professionals you can trust.
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

        {/* Emergency Services */}
        <section className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h2 className="text-3xl font-bold text-black">24/7 Emergency Plumbing</h2>
            </div>
            <p className="text-lg text-gray-600">
              Plumbing emergencies don't wait for business hours. We're available around the clock.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-700">Emergency Services Include:</h3>
              <div className="space-y-2">
                {emergencyServices.map((service, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-black">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-red-200">
              <h3 className="text-xl font-semibold mb-4 text-red-700">Emergency Response Promise:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className="text-black">30-minute response time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-red-600" />
                  <span className="text-black">Live person answers 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="text-black">Fully stocked emergency vehicles</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700" size="lg">
                <Phone className="h-5 w-5 mr-2" />
                Call Emergency Line
              </Button>
            </div>
          </div>
        </section>

        {/* Complete Services */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Complete Plumbing Services</h2>
            <p className="text-lg text-gray-600">
              From routine maintenance to major installations, we handle all your plumbing needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-black">{service}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Before & After + Testimonials */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Real Results from Satisfied Customers</h2>
            <p className="text-lg text-gray-600">
              See how we've solved plumbing challenges and read what our customers say about our service.
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
                            alt="Before repair"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">AFTER</p>
                          <img
                            src={testimonial.afterImage || "/placeholder.svg"}
                            alt="After repair"
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
          <h2 className="text-3xl font-bold mb-4">Need Plumbing Help Right Now?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our support team can help diagnose your issue and connect you with the right solution instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" onClick={() => setIsSupportOpen(true)}>
              <MessageCircle className="h-5 w-5 mr-2" />
              Speak With Us
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-600 bg-transparent"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Service
            </Button>
          </div>
        </section>
      </main>

      {isSupportOpen && <SupportInterface onClose={() => setIsSupportOpen(false)} />}
    </div>
  )
}
