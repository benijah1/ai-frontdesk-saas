"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User, Calendar, DollarSign, Phone } from "lucide-react"
import { QuoteForm } from "./quote-form"
import { SchedulingForm } from "./scheduling-form"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatProps {
  selectedService: string | null
  serviceDetails: any
  onClose: () => void
}

export function AIChat({ selectedService, serviceDetails, onClose }: AIChatProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showSchedulingForm, setShowSchedulingForm] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your Fix It! Home Services AI assistant. I see you're interested in ${serviceDetails?.title || "our services"}. I'm here to help you get a quote, schedule an appointment, or answer any questions about your project. What would you like to know?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("quote") || lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return `I'd be happy to help you get a quote for ${serviceDetails?.title || "your project"}! Based on your service selection, our typical price range is ${serviceDetails?.details?.priceRange || "$500-$2,000"}. For a more accurate estimate, I can help you fill out a detailed quote form that considers your specific needs, timeline, and any additional services. Would you like me to open the quote form for you?`
    }

    if (lowerMessage.includes("schedule") || lowerMessage.includes("appointment") || lowerMessage.includes("visit")) {
      return `I can help you schedule an appointment! We offer free consultations and on-site estimates. Our typical timeline for ${serviceDetails?.title || "this service"} is ${serviceDetails?.details?.timeline || "1-2 weeks"}. We have availability as early as tomorrow for consultations. Would you like me to open our scheduling form to book your appointment?`
    }

    if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent")) {
      return `We understand emergencies can't wait! Fix It! Home Services offers 24/7 emergency service for urgent ${serviceDetails?.title || "home service"} needs. Our emergency response team can typically be at your location within 2-4 hours. For immediate emergency service, please call us directly at (555) 123-4567. Would you like me to help you schedule an emergency visit?`
    }

    if (lowerMessage.includes("warranty") || lowerMessage.includes("guarantee")) {
      return `Great question! We stand behind our work with comprehensive warranties. For ${serviceDetails?.title || "this service"}, we offer ${serviceDetails?.details?.warranty || "a 2-year warranty on parts and labor"}. All our technicians are licensed and insured, and we guarantee customer satisfaction. Is there a specific aspect of our warranty coverage you'd like to know more about?`
    }

    if (lowerMessage.includes("time") || lowerMessage.includes("long") || lowerMessage.includes("duration")) {
      return `The timeline for ${serviceDetails?.title || "your project"} typically ranges from ${serviceDetails?.details?.timeline || "same day to 1 week"}, depending on the scope and complexity. During our free consultation, we'll provide you with a detailed timeline specific to your project. Factors that can affect timing include permits, material availability, and project complexity. Would you like to schedule a consultation to get a more precise timeline?`
    }

    if (lowerMessage.includes("include") || lowerMessage.includes("service") || lowerMessage.includes("what")) {
      const services = serviceDetails?.details?.services || [
        "Professional consultation",
        "Quality materials",
        "Expert installation",
        "Cleanup service",
        "Warranty coverage",
      ]
      return `Our ${serviceDetails?.title || "service"} includes: ${services.slice(0, 3).join(", ")}, and more! We provide a comprehensive service that covers everything from initial consultation to final cleanup. Each project is customized to your specific needs and preferences. Would you like me to provide a detailed quote that breaks down exactly what's included for your project?`
    }

    // Default response
    return `Thank you for your question about ${serviceDetails?.title || "our services"}! I'm here to help with information about pricing, scheduling, warranties, and service details. Our team of licensed professionals is ready to assist you with your home service needs. What specific aspect of your project would you like to discuss? I can help you get a quote, schedule an appointment, or answer any other questions you might have.`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI processing time
    setTimeout(
      async () => {
        const aiResponse = await generateAIResponse(userMessage.content)
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      },
      1000 + Math.random() * 2000,
    ) // 1-3 second delay for realism
  }

  const quickSuggestions = [
    "Get a quote for my project",
    "Schedule a consultation",
    "What's included in the service?",
    "How long will it take?",
    "Do you offer warranties?",
    "Emergency service availability",
  ]

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="bg-primary text-primary-foreground p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Bot className="h-5 w-5" />
                <span>Fix It! AI Assistant</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {selectedService && (
              <Badge variant="secondary" className="w-fit">
                {serviceDetails?.title}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === "assistant" && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.role === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="space-y-2">
                          <p className="text-sm leading-relaxed">{message.content}</p>

                          {message.role === "assistant" && message.content.toLowerCase().includes("quote") && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-transparent"
                                onClick={() => setShowQuoteForm(true)}
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Get Detailed Quote
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-transparent"
                                onClick={() => setShowSchedulingForm(true)}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                Schedule Visit
                              </Button>
                            </div>
                          )}

                          {message.role === "assistant" && message.content.toLowerCase().includes("schedule") && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-transparent"
                                onClick={() => setShowSchedulingForm(true)}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                Tomorrow 9AM
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-transparent"
                                onClick={() => setShowSchedulingForm(true)}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                This Week
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                <Phone className="h-3 w-3 mr-1" />
                                Call to Schedule
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about pricing, scheduling, or your project..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Available 24/7 • Response time: Under 30 seconds
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showQuoteForm && (
        <QuoteForm
          selectedService={selectedService}
          serviceDetails={serviceDetails}
          onClose={() => setShowQuoteForm(false)}
        />
      )}

      {showSchedulingForm && (
        <SchedulingForm
          selectedService={selectedService}
          serviceDetails={serviceDetails}
          onClose={() => setShowSchedulingForm(false)}
        />
      )}
    </>
  )
}
