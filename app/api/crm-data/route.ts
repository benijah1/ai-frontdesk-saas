import { type NextRequest, NextResponse } from "next/server"

// This API route would handle CRM data operations
// In a real implementation, this would connect to your database

interface ContactData {
  name: string
  email: string
  phone: string
  city: string
  source: "chat" | "voice" | "video"
  service: string
  conversationData: any
  timestamp: string
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  city: string
  source: "chat" | "voice" | "video"
  service: string
  status: "new" | "contacted" | "quoted" | "scheduled" | "completed"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastContact: string
  estimatedValue: number
  notes: string
  tags: string[]
  conversations: any[]
}

// Simple in-memory storage for demo - use a real database in production
const contacts: Contact[] = []

export async function POST(request: NextRequest) {
  try {
    const data: ContactData = await request.json()

    // Deduplication logic - check if contact already exists
    const existingContactIndex = contacts.findIndex(
      (contact) =>
        contact.email === data.email ||
        contact.phone === data.phone ||
        (contact.name.toLowerCase() === data.name.toLowerCase() && contact.city === data.city),
    )

    if (existingContactIndex !== -1) {
      // Add new conversation to existing contact
      contacts[existingContactIndex].conversations.push({
        id: Date.now().toString(),
        type: data.source,
        timestamp: data.timestamp,
        summary: generateSummary(data.conversationData),
        transcript: data.conversationData,
      })
      contacts[existingContactIndex].lastContact = data.timestamp
    } else {
      // Create new contact
      const newContact: Contact = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        source: data.source,
        service: data.service,
        status: "new",
        priority: determinePriority(data.conversationData),
        createdAt: data.timestamp,
        lastContact: data.timestamp,
        estimatedValue: estimateValue(data.service, data.conversationData),
        notes: generateNotes(data.conversationData),
        tags: generateInitialTags(data.service, data.conversationData), // Added initial tags generation
        conversations: [
          {
            id: Date.now().toString(),
            type: data.source,
            timestamp: data.timestamp,
            summary: generateSummary(data.conversationData),
            transcript: data.conversationData,
          },
        ],
      }
      contacts.push(newContact)
    }

    return NextResponse.json({ success: true, contactsCount: contacts.length })
  } catch (error) {
    console.error("CRM data processing error:", error)
    return NextResponse.json({ error: "Failed to process contact data" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ contacts })
}

export async function PUT(request: NextRequest) {
  try {
    const updatedContact: Contact = await request.json()
    const contactIndex = contacts.findIndex((c) => c.id === updatedContact.id)

    if (contactIndex !== -1) {
      contacts[contactIndex] = updatedContact
      return NextResponse.json({ success: true, contact: updatedContact })
    } else {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Contact update error:", error)
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

// Helper functions
function generateSummary(conversationData: any): string {
  // In a real implementation, use AI to generate meaningful summaries
  return "Customer inquiry processed - needs follow-up"
}

function determinePriority(conversationData: any): "low" | "medium" | "high" {
  // Logic to determine priority based on conversation content
  const content = JSON.stringify(conversationData).toLowerCase()
  if (content.includes("emergency") || content.includes("urgent")) return "high"
  if (content.includes("soon") || content.includes("asap")) return "medium"
  return "low"
}

function estimateValue(service: string, conversationData: any): number {
  // Basic estimation logic
  const serviceValues = {
    bathroom: 12000,
    plumbing: 500,
    hvac: 3000,
  }

  const baseValue = serviceValues[service.toLowerCase() as keyof typeof serviceValues] || 1000

  // Adjust based on conversation content
  const content = JSON.stringify(conversationData).toLowerCase()
  if (content.includes("luxury") || content.includes("high-end")) return baseValue * 2
  if (content.includes("budget") || content.includes("affordable")) return baseValue * 0.7

  return baseValue
}

function generateNotes(conversationData: any): string {
  // Extract key information for notes
  return "Initial contact - needs detailed follow-up"
}

function generateInitialTags(service: string, conversationData: any): string[] {
  const tags: string[] = []
  const content = JSON.stringify(conversationData).toLowerCase()

  // Add service-based tag
  if (service.toLowerCase().includes("bathroom")) tags.push("bathroom")
  if (service.toLowerCase().includes("plumbing")) tags.push("plumbing")
  if (service.toLowerCase().includes("hvac")) tags.push("hvac")

  // Add priority-based tags
  if (content.includes("emergency") || content.includes("urgent")) tags.push("emergency")
  if (content.includes("luxury") || content.includes("high-end")) tags.push("luxury", "high-value")
  if (content.includes("budget") || content.includes("affordable")) tags.push("budget-conscious")

  return tags
}
