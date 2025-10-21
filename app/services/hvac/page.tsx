"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Thermometer,
  Star,
  CheckCircle,
  MessageCircle,
  Phone,
  Calendar,
  Clock,
  Shield,
  Zap,
  Snowflake,
  Flame,
} from "lucide-react"
import { SupportInterface } from "@/components/support-interface"

interface HVACPageProps {
  onBack: () => void
}

export default function HVACPage({ onBack }: HVACPageProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  const valueProps = [
    {
      title: "Energy Efficiency Experts",
      description: "Save up to 30% on energy bills with our high-efficiency HVAC systems and smart thermostats.",
      icon: Zap,
    },
    {
      title: "Licensed HVAC Technicians",
      description: "EPA-certified professionals with 20+ years experience in residential heating and cooling systems.",
      icon: Shield,
    },
    {
      title: "Year-Round Comfort",
      description: "Complete heating, cooling, and air quality solutions for every season and weather condition.",
      icon: Thermometer,
    },
  ]

  const testimonials = [
    {
      name: "David & Sarah Chen",
      rating: 5,
      text: "Our old AC died in July during a heat wave. They installed a new energy-efficient system the next day and our bills dropped 40%!",
      project: "Central AC Replacement",
      beforeImage: "/old-inefficient-ac-unit-before-replacement.png",
      afterImage: "/new-energy-efficient-hvac-system-installed.png",
    },
    {
      name: "Mark Rodriguez",
      rating: 5,
      text: "The AI chat diagnosed my heating issue perfectly. Saved me a service call fee and they brought exactly the right part.",
      project: "Furnace Repair & Maintenance",
      beforeImage: "/dirty-old-furnace-filter-before-service.png",
      afterImage: "/clean-serviced-furnace-after-maintenance.png",
    },
    {
      name: "Jennifer Walsh",
      rating: 5,
      text: "Professional installation, clean work area, and the 5-year warranty gives me total peace of mind. Highly recommend!",
      project: "Ductless Mini-Split Installation",
      beforeImage: "/room-with-old-window-ac-unit.png",
      afterImage: "/modern-ductless-mini-split-system-installed.png",
    },
  ]

  const services = [
    "Central air conditioning installation and repair",
    "Furnace installation, repair, and maintenance",
    "Heat pump systems and hybrid heating",
    "Ductless mini-split systems",
    "Air duct cleaning and sealing",
    "Indoor air quality solutions",
    "Smart thermostat installation",
    "Energy efficiency audits and upgrades",
  ]

  const seasonalServices = [
    "Pre-summer AC tune-ups and inspections",
    "Winter heating system maintenance",
    "Emergency heating and cooling repairs",
    "Seasonal filter replacements",
    "Humidity control systems",
    "Air purification and filtration",
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-50 to-red-50 border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/hvac-technician-installing-modern-air-conditioning.png"
            alt="HVAC technician at work"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="hover:bg-white/20 text-black">
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
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 p-3 rounded-xl shadow-lg">
                  <Thermometer className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-black">HVAC Services</h1>
                  <p className="text-lg text-gray-600">Heating, Cooling & Air Quality Solutions</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 Rating</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1 border-gray-300 text-gray-700">
                  <Snowflake className="h-4 w-4 text-blue-500" />
                  <span>Cooling</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1 border-gray-300 text-gray-700">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span>Heating</span>
                </Badge>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  5-Year Warranty
                </Badge>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed">
                Stay comfortable year-round with our expert HVAC services. From energy-efficient installations to
                emergency repairs, we keep your home at the perfect temperature while saving you money.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
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
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call 951-525-1848
                </Button>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>License #948319 | fixithomeservices472@gmail.com</p>
                <p>Hours: Mon-Fri 7am-5pm | Sat 10am-2pm | Sun Closed</p>
              </div>
            </div>

            <div className="relative">
              <img
                src="/hvac-technician-installing-modern-air-conditioning.png"
                alt="HVAC technician installing system"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Seasonal Banner */}
      <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white py-3">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Thermometer className="h-5 w-5" />
            <span className="font-semibold">SEASONAL SPECIAL:</span>
            <span>Free energy audit with any system installation - Save up to $200!</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* What Makes Us Different */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Why Choose Fix It! for Your HVAC Needs?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience year-round comfort with energy-efficient solutions from certified HVAC professionals.
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

        {/* Seasonal Services */}
        <section className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex space-x-1">
                <Snowflake className="h-8 w-8 text-blue-600" />
                <Flame className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-black">Year-Round HVAC Care</h2>
            </div>
            <p className="text-lg text-gray-600">
              Preventive maintenance and seasonal services to keep your system running efficiently all year.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-700">Seasonal Services Include:</h3>
              <div className="space-y-2">
                {seasonalServices.map((service, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-black">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-semibold mb-4 text-red-700">Maintenance Benefits:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-red-600" />
                  <span className="text-black">Up to 30% energy savings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="text-black">Extended equipment lifespan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className="text-black">Fewer emergency breakdowns</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700" size="lg">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </div>
        </section>

        {/* Complete Services */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Complete HVAC Solutions</h2>
            <p className="text-lg text-gray-600">
              From installation to maintenance, we handle all your heating, cooling, and air quality needs.
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
            <h2 className="text-3xl font-bold text-black mb-4">Comfort Transformations & Happy Customers</h2>
            <p className="text-lg text-gray-600">
              See how we've improved home comfort and energy efficiency for families across the area.
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
                            alt="Before installation"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">AFTER</p>
                          <img
                            src={testimonial.afterImage || "/placeholder.svg"}
                            alt="After installation"
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
          <h2 className="text-3xl font-bold mb-4">Ready for Year-Round Comfort?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get expert advice and personalized quotes through our message or video chat support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button
              size="lg"
              variant="secondary"
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
