"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  X,
  Send,
  MessageCircle,
  User,
  Bot,
  Calendar,
  DollarSign,
  Minimize2,
  AlertCircle,
  Lightbulb,
} from "lucide-react"

interface AIServiceChatProps {
  service: string
  serviceName: string
  onClose: () => void
}

interface Message {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  actions?: Array<{
    label: string
    action: string
    variant?: "default" | "outline" | "secondary"
  }>
  isTyping?: boolean
  metadata?: {
    quoteGenerated?: boolean
    appointmentScheduled?: boolean
    diagnosticComplete?: boolean
  }
}

interface ProjectDetails {
  size?: string
  budget?: string
  timeline?: string
  goals?: string[]
  issues?: string[]
  preferences?: string[]
}

export function AIServiceChat({ service, serviceName, onClose }: AIServiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({})
  const [conversationStage, setConversationStage] = useState<
    "greeting" | "discovery" | "diagnosis" | "quoting" | "scheduling"
  >("greeting")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const initialMessage: Message = {
      id: "initial",
      type: "assistant",
      content: `👋 Hi there! I'm Alex, your dedicated ${serviceName} specialist at Fix It! Home Services.

I'm here to help you every step of the way - from understanding your needs to providing accurate quotes and scheduling your project. I can:

✅ **Diagnose issues** and recommend solutions
✅ **Generate detailed quotes** with transparent pricing  
✅ **Schedule consultations** that fit your timeline
✅ **Answer technical questions** about materials and processes

What brings you here today? Are you dealing with an issue that needs fixing, or planning a new project?`,
      timestamp: new Date(),
      actions: [
        { label: "I have an issue to fix", action: "issue", variant: "default" },
        { label: "Planning a new project", action: "project", variant: "outline" },
        { label: "Just browsing/questions", action: "questions", variant: "secondary" },
      ],
    }
    setMessages([initialMessage])
  }, [service, serviceName])

  const generateResponse = (
    userMessage: string,
    stage: string,
  ): { content: string; newStage: string; actions?: Array<{ label: string; action: string; variant?: string }> } => {
    const lowerMessage = userMessage.toLowerCase()

    if (stage === "greeting") {
      if (
        lowerMessage.includes("issue") ||
        lowerMessage.includes("problem") ||
        lowerMessage.includes("broken") ||
        lowerMessage.includes("leak") ||
        lowerMessage.includes("not working")
      ) {
        return {
          content: `I understand you're dealing with an issue. Let me help diagnose what's going on so we can get you the right solution quickly.

Can you describe what's happening? For example:
• **${service === "plumbing" ? "Is there a leak, clog, or something not working properly?" : service === "bathroom" ? "What part of your bathroom needs attention?" : "Is your heating/cooling system not working properly?"}**
• **When did you first notice the problem?**
• **Has it gotten worse recently?**

The more details you can share, the better I can help diagnose the issue and recommend the right fix.`,
          newStage: "diagnosis",
          actions: [
            { label: "It's an emergency", action: "emergency", variant: "default" },
            { label: "Describe the issue", action: "describe", variant: "outline" },
          ],
        }
      } else if (
        lowerMessage.includes("project") ||
        lowerMessage.includes("remodel") ||
        lowerMessage.includes("install") ||
        lowerMessage.includes("new")
      ) {
        return {
          content: `Exciting! I love helping with new projects. Let's explore what you have in mind.

To give you the most accurate recommendations and pricing, I'd like to understand:

🏠 **Your Space**: ${service === "bathroom" ? "What's the size of your bathroom?" : service === "plumbing" ? "Which areas of your home are involved?" : "What areas need heating/cooling work?"}

🎯 **Your Goals**: What's driving this project? (comfort, efficiency, style, functionality, etc.)

💰 **Your Budget**: Do you have a rough budget range in mind?

📅 **Timeline**: Any specific timing needs or preferences?

What aspect would you like to start with?`,
          newStage: "discovery",
          actions: [
            { label: "Tell me about costs", action: "costs", variant: "default" },
            { label: "Discuss timeline", action: "timeline", variant: "outline" },
            { label: "Share my goals", action: "goals", variant: "secondary" },
          ],
        }
      }
    }

    if (stage === "diagnosis") {
      if (
        lowerMessage.includes("emergency") ||
        lowerMessage.includes("urgent") ||
        lowerMessage.includes("flooding") ||
        lowerMessage.includes("no heat") ||
        lowerMessage.includes("no cooling")
      ) {
        return {
          content: `🚨 **This sounds like an emergency!** 

For immediate assistance, please call our 24/7 emergency line: **${service === "plumbing" ? "(555) 911-PIPE" : "(555) 123-HVAC"}**

Our emergency team can be at your location within 30 minutes with fully stocked vehicles.

In the meantime, here are some immediate steps:
${
  service === "plumbing"
    ? "• Turn off the main water supply if there's flooding\n• Move valuables away from water\n• Take photos for insurance if needed"
    : service === "hvac"
      ? "• Check your thermostat settings\n• Ensure circuit breakers haven't tripped\n• Check air filter (replace if very dirty)"
      : "• Ensure the area is safe\n• Turn off water supply if needed\n• Document the issue with photos"
}

Would you like me to help you schedule an emergency visit, or do you have the situation under control for now?`,
          newStage: "scheduling",
          actions: [
            { label: "Schedule Emergency Visit", action: "emergency_schedule", variant: "default" },
            { label: "Call Emergency Line", action: "emergency_call", variant: "outline" },
          ],
        }
      }

      return {
        content: `Based on what you've described, I'm getting a clearer picture of the situation. Let me ask a few diagnostic questions to pinpoint the exact issue:

${
  service === "plumbing"
    ? "🔍 **Plumbing Diagnosis:**\n• Is the issue with hot water, cold water, or both?\n• Are multiple fixtures affected or just one?\n• Do you hear any unusual sounds (gurgling, banging, hissing)?\n• Have you noticed any changes in water pressure?"
    : service === "bathroom"
      ? "🔍 **Bathroom Assessment:**\n• Which fixtures or areas are involved?\n• Is this affecting daily use of the bathroom?\n• Are there any water damage concerns?\n• What's your priority - functionality or aesthetics?"
      : "🔍 **HVAC Diagnosis:**\n• Is the issue with heating, cooling, or both?\n• Are some rooms comfortable while others aren't?\n• When was your system last serviced?\n• Have you noticed any unusual sounds or smells?"
}

Once I understand the specifics, I can provide you with:
✅ **Likely causes** and solutions
✅ **Accurate cost estimates** 
✅ **Timeline** for repairs
✅ **Prevention tips** for the future`,
        newStage: "quoting",
        actions: [
          { label: "Get cost estimate", action: "estimate", variant: "default" },
          { label: "Schedule inspection", action: "inspect", variant: "outline" },
        ],
      }
    }

    if (stage === "discovery") {
      const responses = {
        costs: `💰 **${serviceName} Investment Guide**

Here's what you can typically expect for ${service} projects:

${
  service === "bathroom"
    ? "**Bathroom Remodeling Costs:**\n• Refresh (fixtures, vanity, paint): $3,000 - $8,000\n• Mid-range remodel: $8,000 - $18,000\n• High-end renovation: $18,000 - $35,000+\n\n**What affects cost:**\n• Size of bathroom\n• Quality of materials\n• Plumbing/electrical changes\n• Custom vs. standard fixtures"
    : service === "plumbing"
      ? "**Plumbing Service Costs:**\n• Basic repairs: $150 - $500\n• Fixture installation: $300 - $1,200\n• Water heater replacement: $1,200 - $3,500\n• Repiping projects: $3,000 - $8,000+\n\n**What affects cost:**\n• Complexity of work\n• Accessibility of pipes\n• Quality of fixtures\n• Permit requirements"
      : "**HVAC Investment Costs:**\n• System tune-up: $150 - $300\n• Duct cleaning: $300 - $500\n• New system installation: $3,000 - $12,000\n• High-efficiency upgrades: $5,000 - $15,000+\n\n**What affects cost:**\n• Home size and layout\n• Efficiency ratings\n• Ductwork condition\n• Smart features"
}

These are rough ranges - your actual cost will depend on your specific needs and choices. Would you like me to create a personalized estimate based on your project details?`,
        timeline: `📅 **${serviceName} Timeline Guide**

${
  service === "bathroom"
    ? "**Bathroom Project Timelines:**\n• Cosmetic updates: 3-5 days\n• Standard remodel: 2-3 weeks\n• Full renovation: 3-4 weeks\n• Custom/luxury projects: 4-6 weeks\n\n**Timeline factors:**\n• Permit approval (if needed)\n• Material delivery\n• Plumbing/electrical changes\n• Tile work and custom elements"
    : service === "plumbing"
      ? "**Plumbing Project Timelines:**\n• Emergency repairs: Same day\n• Standard repairs: 2-4 hours\n• Fixture installation: Half day\n• Water heater replacement: 1 day\n• Repiping projects: 2-5 days\n\n**Timeline factors:**\n• Parts availability\n• Access to work areas\n• Permit requirements\n• Complexity of installation"
      : "**HVAC Project Timelines:**\n• Maintenance/tune-up: 2-3 hours\n• Repairs: Same day (usually)\n• System replacement: 1-3 days\n• New installation: 2-4 days\n• Ductwork modifications: 3-5 days\n\n**Timeline factors:**\n• Equipment availability\n• Ductwork condition\n• Electrical requirements\n• Permit processing"
}

We always provide detailed timelines during consultation and keep you updated throughout. When would be ideal timing for your project?`,
        goals: `🎯 **Let's Define Your Project Goals**

Understanding your priorities helps me recommend the perfect solution. Common goals for ${service} projects include:

${
  service === "bathroom"
    ? "**Bathroom Goals:**\n✨ **Style & Aesthetics** - Modern, traditional, spa-like feel\n🛠️ **Functionality** - Better storage, accessibility, layout\n💧 **Efficiency** - Water-saving fixtures, better lighting\n🏠 **Home Value** - ROI-focused improvements\n👨‍👩‍👧‍👦 **Family Needs** - Kid-friendly, aging in place, guest bath"
    : service === "plumbing"
      ? "**Plumbing Goals:**\n🔧 **Reliability** - End recurring issues, prevent problems\n💧 **Efficiency** - Reduce water waste, lower bills\n🏠 **Home Value** - Modern fixtures, updated systems\n⚡ **Performance** - Better pressure, faster hot water\n🛡️ **Peace of Mind** - Warranty coverage, professional work"
      : "**HVAC Goals:**\n🌡️ **Comfort** - Consistent temperatures, better air quality\n💰 **Efficiency** - Lower energy bills, eco-friendly\n🔧 **Reliability** - Fewer breakdowns, longer system life\n🏠 **Home Value** - Modern, efficient systems\n🌿 **Health** - Better air filtration, humidity control"
}

Which of these resonates most with what you're trying to achieve? Or do you have other specific goals in mind?`,
      }

      return {
        content:
          responses[
            lowerMessage.includes("cost") ? "costs" : lowerMessage.includes("timeline") ? "timeline" : "goals"
          ] || responses.goals,
        newStage: "quoting",
        actions: [
          { label: "Create my quote", action: "quote", variant: "default" },
          { label: "Schedule consultation", action: "schedule", variant: "outline" },
          { label: "More questions", action: "questions", variant: "secondary" },
        ],
      }
    }

    if (
      stage === "quoting" &&
      (lowerMessage.includes("quote") || lowerMessage.includes("estimate") || lowerMessage.includes("cost"))
    ) {
      return {
        content: `📋 **Generating Your Personalized Quote**

Based on our conversation, I'm creating a detailed estimate for your ${service} project. Here's what I'm including:

**Project Summary:**
• Service: ${serviceName}
• Scope: ${lowerMessage.includes("emergency") ? "Emergency repair service" : "Standard project consultation and work"}

**Estimated Investment:**
${
  service === "bathroom"
    ? "• Labor & Installation: $2,500 - $8,000\n• Materials & Fixtures: $1,500 - $12,000\n• Permits & Inspections: $200 - $500\n• **Total Range: $4,200 - $20,500**"
    : service === "plumbing"
      ? "• Diagnostic & Labor: $150 - $800\n• Parts & Materials: $50 - $2,000\n• Emergency Service (if applicable): $100 - $200\n• **Total Range: $200 - $3,000**"
      : "• Labor & Installation: $800 - $3,000\n• Equipment & Materials: $1,500 - $8,000\n• Permits & Inspections: $100 - $300\n• **Total Range: $2,400 - $11,300**"
}

**What's Included:**
✅ Free consultation and assessment
✅ Detailed written estimate
✅ ${service === "bathroom" ? "5-year" : service === "plumbing" ? "2-year" : "10-year equipment, 2-year installation"} warranty
✅ Licensed, insured professionals
✅ Clean-up and debris removal

**Next Steps:**
1. Schedule your free consultation
2. Receive detailed written quote
3. Review options and timeline
4. Begin your project!

Ready to schedule your consultation?`,
        newStage: "scheduling",
        actions: [
          { label: "Schedule Consultation", action: "schedule", variant: "default" },
          { label: "Email Quote Details", action: "email", variant: "outline" },
          { label: "Call to Discuss", action: "call", variant: "secondary" },
        ],
      }
    }

    if (stage === "scheduling" || lowerMessage.includes("schedule") || lowerMessage.includes("appointment")) {
      return {
        content: `📅 **Let's Schedule Your Consultation**

I can help you book the perfect time for your ${service} consultation. We offer flexible scheduling to work with your busy life:

**Available Options:**
🏠 **In-Home Consultation** (Recommended)
• Detailed assessment of your space
• Accurate measurements and recommendations
• Written quote provided on-site
• Duration: 45-60 minutes

💻 **Virtual Consultation** 
• Great for initial planning and questions
• Review photos and discuss options
• Follow-up in-home visit if needed
• Duration: 20-30 minutes

⚡ **Emergency Service** (if urgent)
• Same-day or next-day availability
• Immediate problem resolution
• 24/7 availability for emergencies

**This Week's Availability:**
• **Tomorrow**: 9 AM, 1 PM, 4 PM
• **Thursday**: 10 AM, 2 PM, 5 PM  
• **Friday**: 8 AM, 11 AM, 3 PM
• **Weekend**: Saturday 9 AM - 4 PM

What type of consultation works best for you, and do any of these times fit your schedule?`,
        newStage: "scheduling",
        actions: [
          { label: "Book In-Home Visit", action: "book_home", variant: "default" },
          { label: "Schedule Virtual Call", action: "book_virtual", variant: "outline" },
          { label: "Request Emergency", action: "book_emergency", variant: "secondary" },
        ],
      }
    }

    return {
      content: `I'm here to help with your ${service} project! Based on what you've shared, I can provide more specific guidance.

**I can help you with:**
🔍 **Diagnosis** - Identify issues and root causes
💰 **Accurate Quotes** - Transparent, detailed pricing
📅 **Scheduling** - Flexible consultation times
🛠️ **Technical Advice** - Materials, processes, best practices
📞 **Direct Connection** - To our expert technicians

What would be most helpful for you right now? I'm here to make this as easy as possible for you.`,
      newStage: stage,
      actions: [
        { label: "Get detailed quote", action: "quote", variant: "default" },
        { label: "Schedule consultation", action: "schedule", variant: "outline" },
        { label: "Ask technical questions", action: "technical", variant: "secondary" },
      ],
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    setTimeout(
      () => {
        const response = generateResponse(currentInput, conversationStage)

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: response.content,
          timestamp: new Date(),
          actions: response.actions,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setConversationStage(response.newStage as any)
        setIsLoading(false)
      },
      1500 + Math.random() * 1000,
    )
  }

  const handleActionClick = (action: string) => {
    const actionInputs = {
      issue: "I'm having an issue that needs to be fixed",
      project: "I'm planning a new project and need guidance",
      questions: "I have some questions about your services",
      emergency: "This is an emergency situation that needs immediate attention",
      describe: "Let me describe the issue I'm experiencing",
      costs: "I'd like to understand the costs involved",
      timeline: "What timeline should I expect for this project?",
      goals: "Let me share what I'm hoping to achieve",
      quote: "I'd like to get a detailed quote for my project",
      estimate: "Can you provide a cost estimate?",
      schedule: "I'd like to schedule a consultation",
      inspect: "I'd like to schedule an inspection",
      book_home: "I'd like to book an in-home consultation",
      book_virtual: "I'd like to schedule a virtual consultation",
      book_emergency: "I need emergency service",
      email: "Please email me the quote details",
      call: "I'd like to discuss this over the phone",
      technical: "I have some technical questions",
    }

    setInput(actionInputs[action as keyof typeof actionInputs] || `I'd like to ${action}`)
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsMinimized(false)} className="bg-primary hover:bg-primary/90 shadow-lg" size="lg">
          <MessageCircle className="h-5 w-5 mr-2" />
          {serviceName} Chat
          <Badge variant="secondary" className="ml-2">
            {messages.length - 1}
          </Badge>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Alex - {serviceName} Specialist</span>
              <Badge variant="secondary" className="text-xs">
                {conversationStage === "greeting" && "Getting Started"}
                {conversationStage === "discovery" && "Planning"}
                {conversationStage === "diagnosis" && "Diagnosing"}
                {conversationStage === "quoting" && "Quoting"}
                {conversationStage === "scheduling" && "Scheduling"}
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.type === "assistant" && (
                      <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    {message.type === "user" && (
                      <div className="bg-primary-foreground/20 p-2 rounded-full flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.actions && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant={(action.variant as any) || "outline"}
                              size="sm"
                              onClick={() => handleActionClick(action.action)}
                              className="text-xs h-8"
                            >
                              {action.action === "quote" && <DollarSign className="h-3 w-3 mr-1" />}
                              {action.action === "schedule" && <Calendar className="h-3 w-3 mr-1" />}
                              {action.action.includes("emergency") && <AlertCircle className="h-3 w-3 mr-1" />}
                              {action.action === "technical" && <Lightbulb className="h-3 w-3 mr-1" />}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg p-4 max-w-[85%] border border-border">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Alex is thinking</span>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex-shrink-0 border-t border-border p-4 bg-background">
            <div className="flex space-x-3">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask Alex about your ${service} project...`}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <p className="text-xs text-muted-foreground mt-1">Press Enter to send, Shift+Enter for new line</p>
              </div>
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="lg" className="h-[44px] px-4">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
