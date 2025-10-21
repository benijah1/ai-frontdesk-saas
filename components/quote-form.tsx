"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Shield, CheckCircle, Calculator, FileText, Phone } from "lucide-react"

interface QuoteFormProps {
  selectedService: string | null
  serviceDetails: any
  onClose: () => void
}

export function QuoteForm({ selectedService, serviceDetails, onClose }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    projectDescription: "",
    urgency: "",
    budget: "",
    additionalServices: [] as string[],
    preferredContact: "phone",
  })

  const [quote, setQuote] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const urgencyOptions = [
    { value: "emergency", label: "Emergency (Same Day)", multiplier: 1.5 },
    { value: "urgent", label: "Urgent (Within 48 hours)", multiplier: 1.2 },
    { value: "normal", label: "Normal (Within 1 week)", multiplier: 1.0 },
    { value: "flexible", label: "Flexible (Within 2-4 weeks)", multiplier: 0.9 },
  ]

  const additionalServiceOptions = {
    bathroom: ["Electrical work", "Permit handling", "Demolition", "Cleanup service"],
    plumbing: ["Emergency service", "Permit handling", "Cleanup service", "Follow-up maintenance"],
    hvac: ["Duct cleaning", "Air quality testing", "Smart thermostat", "Maintenance plan"],
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdditionalServiceChange = (service: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: checked
        ? [...prev.additionalServices, service]
        : prev.additionalServices.filter((s) => s !== service),
    }))
  }

  const generateQuote = async () => {
    setIsGenerating(true)

    // Simulate quote generation with realistic pricing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const basePrice = {
      bathroom: { min: 8000, max: 25000 },
      plumbing: { min: 150, max: 3500 },
      hvac: { min: 200, max: 8000 },
    }[selectedService as string] || { min: 500, max: 2000 }

    const urgencyMultiplier = urgencyOptions.find((opt) => opt.value === formData.urgency)?.multiplier || 1.0
    const additionalServicesCost = formData.additionalServices.length * 200

    const estimatedCost = Math.round(((basePrice.min + basePrice.max) / 2) * urgencyMultiplier + additionalServicesCost)

    const generatedQuote = {
      service: serviceDetails?.title || "Service",
      basePrice: `$${basePrice.min.toLocaleString()} - $${basePrice.max.toLocaleString()}`,
      estimatedTotal: `$${estimatedCost.toLocaleString()}`,
      timeline:
        formData.urgency === "emergency"
          ? "Same day"
          : formData.urgency === "urgent"
            ? "1-2 days"
            : formData.urgency === "normal"
              ? "3-7 days"
              : "1-4 weeks",
      breakdown: [
        { item: "Base service", cost: `$${Math.round((basePrice.min + basePrice.max) / 2).toLocaleString()}` },
        ...(urgencyMultiplier > 1
          ? [
              {
                item: "Urgency fee",
                cost: `$${Math.round(((basePrice.min + basePrice.max) / 2) * (urgencyMultiplier - 1)).toLocaleString()}`,
              },
            ]
          : []),
        ...(formData.additionalServices.length > 0
          ? [{ item: "Additional services", cost: `$${additionalServicesCost.toLocaleString()}` }]
          : []),
      ],
      warranty: serviceDetails?.details?.warranty || "2-year warranty",
      nextSteps: [
        "Schedule free on-site consultation",
        "Finalize project details and timeline",
        "Sign contract and begin work",
        "Quality inspection and warranty activation",
      ],
    }

    setQuote(generatedQuote)
    setIsGenerating(false)
  }

  const submitQuote = async () => {
    // In a real app, this would submit to your backend
    console.log("Quote submitted:", { formData, quote })
    alert("Quote request submitted! We'll contact you within 2 hours.")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Get Your Quote</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              ×
            </Button>
          </div>
          {selectedService && (
            <Badge variant="secondary" className="w-fit">
              {serviceDetails?.title}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!quote ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="urgency">Project Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                  placeholder="Please describe your project in detail..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="budget">Estimated Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1k">Under $1,000</SelectItem>
                    <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                    <SelectItem value="15k-30k">$15,000 - $30,000</SelectItem>
                    <SelectItem value="over-30k">Over $30,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedService &&
                additionalServiceOptions[selectedService as keyof typeof additionalServiceOptions] && (
                  <div>
                    <Label>Additional Services</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {additionalServiceOptions[selectedService as keyof typeof additionalServiceOptions].map(
                        (service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={service}
                              checked={formData.additionalServices.includes(service)}
                              onCheckedChange={(checked) => handleAdditionalServiceChange(service, checked as boolean)}
                            />
                            <Label htmlFor={service} className="text-sm">
                              {service}
                            </Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <div>
                <Label>Preferred Contact Method</Label>
                <div className="flex space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phone-contact"
                      checked={formData.preferredContact === "phone"}
                      onCheckedChange={() => handleInputChange("preferredContact", "phone")}
                    />
                    <Label htmlFor="phone-contact" className="text-sm">
                      Phone
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-contact"
                      checked={formData.preferredContact === "email"}
                      onCheckedChange={() => handleInputChange("preferredContact", "email")}
                    />
                    <Label htmlFor="email-contact" className="text-sm">
                      Email
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateQuote}
                className="w-full"
                disabled={
                  !formData.name ||
                  !formData.phone ||
                  !formData.email ||
                  !formData.address ||
                  !formData.projectDescription ||
                  isGenerating
                }
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Quote...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4" />
                    <span>Generate Quote</span>
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Your Quote is Ready!</h3>
                <p className="text-muted-foreground">Here's your personalized estimate for {quote.service}</p>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold">Estimated Total</h4>
                    <div className="text-3xl font-bold text-primary">{quote.estimatedTotal}</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {quote.breakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.item}</span>
                        <span>{item.cost}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold">Timeline</p>
                        <p className="text-muted-foreground">{quote.timeline}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold">Warranty</p>
                        <p className="text-muted-foreground">{quote.warranty}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h4 className="font-semibold mb-3">Next Steps:</h4>
                <div className="space-y-2">
                  {quote.nextSteps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={submitQuote} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Accept Quote & Schedule
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Call to Discuss
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                This quote is valid for 30 days. Final pricing may vary based on site inspection.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
