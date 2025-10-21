"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Droplets, Thermometer, Star, Shield, Clock, Phone, Users, Award, Zap } from "lucide-react"
import SupportInterface from "@/components/support-interface"

// Loading Screen Component
function LoadingScreen({ onContinue }: { onContinue: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const steps = [
      { duration: 800, step: 0 }, // Logo
      { duration: 600, step: 1 }, // Company name
      { duration: 700, step: 2 }, // Contact info
      { duration: 800, step: 3 }, // Reviews/ratings
      { duration: 900, step: 4 }, // Feature cards
    ]

    let totalTime = 0
    steps.forEach(({ duration, step }, index) => {
      setTimeout(() => {
        setCurrentStep(step + 1)
      }, totalTime)
      totalTime += duration
    })
  }, [])

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
        {/* Logo Animation */}
        <div
          className={`transition-all duration-500 ${currentStep >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <div className="bg-gray-100 p-3 rounded-xl shadow-lg mx-auto w-fit">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/WhatsApp%20Image%202025-05-22%20at%2012_edited%281%29%281%29%281%29%281%29-zlj4KtlkpiSaXWLqG31IiPgg1MhIMs.jpg"
              alt="Fix It! Home Services Logo"
              className="rounded-lg h-28 w-28"
            />
          </div>
        </div>

        {/* Company Name Animation */}
        <div
          className={`transition-all duration-500 delay-200 ${currentStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h2 className="text-2xl font-bold text-foreground">Fix It! Home Services</h2>
          <p className="text-muted-foreground">Your Home's Best Friend</p>
        </div>

        {/* Contact Info Animation */}
        <div
          className={`transition-all duration-500 delay-300 ${currentStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              License# 948319 • <span className="text-primary">951-525-1848</span>
            </p>
            <p>Mon-Fri 7am-5pm • Sat 10am-2pm</p>
          </div>
        </div>

        {/* Reviews/Ratings Animation */}
        <div
          className={`transition-all duration-500 delay-500 ${currentStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <Badge variant="secondary" className="flex items-center space-x-1 px-3 py-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">4.9/5</span>
              <span>from 500+ reviews</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1 px-3 py-1">
              <Users className="h-4 w-4 text-primary" />
              <span>12 customers helped today</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1 px-3 py-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Same-day service available</span>
            </Badge>
          </div>
        </div>

        {/* Feature Cards Animation */}
        <div
          className={`transition-all duration-700 delay-700 ${currentStep >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="text-center p-3 bg-secondary/10 border-secondary/20">
              <Shield className="h-6 w-6 text-secondary mx-auto mb-1" />
              <h3 className="font-semibold text-secondary text-sm">Licensed & Insured</h3>
              <p className="text-xs text-muted-foreground">Fully bonded professionals</p>
            </Card>
            <Card className="text-center p-3 bg-primary/10 border-primary/20">
              <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
              <h3 className="font-semibold text-primary text-sm">Fast Response</h3>
              <p className="text-xs text-muted-foreground">Same-day service available</p>
            </Card>
            <Card className="text-center p-3 bg-secondary/10 border-secondary/20">
              <Award className="h-6 w-6 text-secondary mx-auto mb-1" />
              <h3 className="font-semibold text-secondary text-sm">Award Winning</h3>
              <p className="text-xs text-muted-foreground">Best contractor 2024</p>
            </Card>
            <Card className="text-center p-3 bg-primary/10 border-primary/20">
              <Phone className="h-6 w-6 text-primary mx-auto mb-1" />
              <h3 className="font-semibold text-primary text-sm">24/7 Emergency</h3>
              <p className="text-xs text-muted-foreground">Always here when needed</p>
            </Card>
          </div>
        </div>

        <div
          className={`transition-all duration-500 delay-1000 ${currentStep >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Button variant="destructive" onClick={onContinue} className="mt-6 px-8 py-3 text-lg font-semibold">
            Get Support 
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Mini-Site Component
export default function FixItHomeMiniSite() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedServicePage, setSelectedServicePage] = useState<string | null>(null)
  const [ServicePageComponent, setServicePageComponent] = useState<React.ComponentType<any> | null>(null)
  const [showSupport, setShowSupport] = useState(false)

  const handleContinue = () => {
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedServicePage) {
      const loadServicePage = async () => {
        try {
          let module
          if (selectedServicePage === "bathroom") {
            module = await import("./services/bathroom/page")
          } else if (selectedServicePage === "plumbing") {
            module = await import("./services/plumbing/page")
          } else if (selectedServicePage === "hvac") {
            module = await import("./services/hvac/page")
          }

          if (module) {
            setServicePageComponent(() => module.default)
          }
        } catch (error) {
          console.error("Failed to load service page:", error)
          setSelectedServicePage(null)
        }
      }

      loadServicePage()
    } else {
      setServicePageComponent(null)
    }
  }, [selectedServicePage])

  const services = [
    {
      id: "bathroom",
      title: "Bathroom Remodeling",
      description: "Transform your bathroom into a spa-like retreat",
      icon: Droplets,
      color: "bg-secondary/10 text-secondary border-secondary/20",
      heroImage: "/modern-luxury-bathroom-renovation-with-marble-tile.png",
      features: ["Custom Design", "Quality Materials", "Licensed Contractors"],
    },
    {
      id: "plumbing",
      title: "Plumbing Services",
      description: "Fast, reliable plumbing solutions when you need them",
      icon: Wrench,
      color: "bg-primary/10 text-primary border-primary/20",
      heroImage: "/professional-plumber-fixing-pipes-emergency-servic.png",
      features: ["24/7 Emergency", "Licensed Plumbers", "Guaranteed Work"],
    },
    {
      id: "hvac",
      title: "Heating & AC (HVAC)",
      description: "Keep your home comfortable year-round",
      icon: Thermometer,
      color: "bg-secondary/10 text-secondary border-secondary/20",
      heroImage: "/hvac-technician-installing-modern-air-conditioning.png",
      features: ["Energy Efficient", "Certified Technicians", "Warranty Included"],
    },
  ]

  if (isLoading) {
    return <LoadingScreen onContinue={handleContinue} />
  }

  if (selectedServicePage && ServicePageComponent) {
    return <ServicePageComponent onBack={() => setSelectedServicePage(null)} />
  }

  if (selectedServicePage && !ServicePageComponent) {
    return <LoadingScreen onContinue={handleContinue} />
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Service</h2>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8">
              <p className="text-sm font-medium text-primary">
                👆 Click on any service below to explore solutions, get quotes, and connect with our experts
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card
                  key={service.id}
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-card/80 border-2 hover:border-primary/30 group"
                  onClick={() => setSelectedServicePage(service.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={service.heroImage || "/placeholder.svg"}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=200&width=300&text=" + encodeURIComponent(service.title)
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-4 right-4 p-3 rounded-lg bg-gray-100 backdrop-blur-sm shadow-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold opacity-90">
                        Click to Explore →
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">{service.description}</p>

                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {service.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs group-hover:border-primary/50">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-2 rounded-lg shadow-md">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/WhatsApp%20Image%202025-05-22%20at%2012_edited%281%29%281%29%281%29%281%29-zlj4KtlkpiSaXWLqG31IiPgg1MhIMs.jpg"
                  alt="Fix It! Home Services Logo"
                  className="rounded-md w-20 h-20"
                />
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg">
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-2">
                "Fix It! transformed our bathroom in just 3 weeks. The AI chat helped us plan everything perfectly!"
              </p>
              <p className="text-sm font-semibold">- Sarah M., Happy Customer</p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-semibold">© 2025 Fix It! Home Services</p>
              <p>Licensed, Bonded & Insured • Available 24/7 for Emergencies</p>
              <p>
                License# 948319 •{" "}
                <a href="mailto:fixithomeservices472@gmail.com" className="text-primary hover:underline">
                  fixithomeservices472@gmail.com
                </a>{" "}
                •{" "}
                <a href="tel:951-525-1848" className="text-primary hover:underline">
                  951-525-1848
                </a>
              </p>
              <p className="mt-2">
                <a href="/crm" className="text-xs text-muted-foreground hover:text-primary underline">
                  Staff Portal
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {showSupport && <SupportInterface onClose={() => setShowSupport(false)} />}
    </div>
  )
}
