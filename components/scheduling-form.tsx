"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, Phone } from "lucide-react"

interface SchedulingFormProps {
  selectedService: string | null
  serviceDetails: any
  onClose: () => void
}

export function SchedulingForm({ selectedService, serviceDetails, onClose }: SchedulingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    appointmentType: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)

  const appointmentTypes = [
    { value: "consultation", label: "Free Consultation", duration: "30-45 minutes" },
    { value: "estimate", label: "On-site Estimate", duration: "45-60 minutes" },
    { value: "emergency", label: "Emergency Service", duration: "Immediate" },
    { value: "inspection", label: "Property Inspection", duration: "60-90 minutes" },
  ]

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate appointment scheduling
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would submit to your backend
    console.log("Appointment scheduled:", formData)

    setIsScheduled(true)
    setIsSubmitting(false)
  }

  const getNextAvailableDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (isScheduled) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Appointment Scheduled!</h3>
            <p className="text-muted-foreground mb-6">
              We've scheduled your{" "}
              {appointmentTypes.find((t) => t.value === formData.appointmentType)?.label.toLowerCase()} for{" "}
              {formData.preferredDate} at {formData.preferredTime}.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">What to expect:</h4>
              <ul className="text-sm text-left space-y-1">
                <li>• Confirmation call within 2 hours</li>
                <li>• Technician will arrive on time</li>
                <li>• Free detailed estimate provided</li>
                <li>• No obligation to proceed</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Call Us: (555) 123-4567
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Appointment</span>
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
                <Label htmlFor="appointmentType">Appointment Type *</Label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) => handleInputChange("appointmentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.duration}</div>
                        </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Preferred Date *</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                  min={getNextAvailableDate()}
                />
              </div>
              <div>
                <Label htmlFor="preferredTime">Preferred Time *</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) => handleInputChange("preferredTime", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any specific details about your project or special instructions..."
                rows={3}
              />
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                Appointment Details
              </h4>
              <div className="text-sm space-y-1">
                <p>• Free consultation and estimate</p>
                <p>• Licensed and insured technician</p>
                <p>• No obligation to proceed</p>
                <p>• Same-day emergency service available</p>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={
                !formData.name ||
                !formData.phone ||
                !formData.email ||
                !formData.address ||
                !formData.appointmentType ||
                !formData.preferredDate ||
                !formData.preferredTime ||
                isSubmitting
              }
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Appointment</span>
                </div>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              We'll call you within 2 hours to confirm your appointment details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
