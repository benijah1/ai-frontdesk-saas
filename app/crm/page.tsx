"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  MessageSquare,
  Phone,
  Video,
  Calendar,
  MapPin,
  Star,
  Search,
  Download,
  Eye,
  Edit,
  Plus,
  X,
  Tag,
  UserPlus,
} from "lucide-react"

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
  conversations: Conversation[]
  notes: string
  estimatedValue: number
  tags: string[] // Added tags array to contact interface
}

interface Conversation {
  id: string
  type: "chat" | "voice" | "video"
  timestamp: string
  duration?: string
  summary: string
  transcript?: string
}

interface TagType {
  id: string
  name: string
  color: string
}

// Mock data - in real implementation, this would come from your database
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "555-0123",
    city: "Riverside, CA",
    source: "chat",
    service: "Bathroom Remodeling",
    status: "quoted",
    priority: "high",
    createdAt: "2025-01-15T10:30:00Z",
    lastContact: "2025-01-16T14:20:00Z",
    estimatedValue: 15000,
    notes: "Interested in luxury bathroom renovation. Budget flexible.",
    tags: ["high-value", "luxury"], // Added sample tags
    conversations: [
      {
        id: "c1",
        type: "chat",
        timestamp: "2025-01-15T10:30:00Z",
        summary: "Initial inquiry about bathroom remodeling. Wants modern design with walk-in shower.",
        transcript: "User asked about bathroom renovation options...",
      },
      {
        id: "c2",
        type: "video",
        timestamp: "2025-01-16T14:20:00Z",
        duration: "25 minutes",
        summary: "Detailed consultation about project scope and timeline. Provided quote.",
        transcript: "Video consultation transcript...",
      },
    ],
  },
  {
    id: "2",
    name: "Mike Rodriguez",
    email: "mike.r@email.com",
    phone: "555-0456",
    city: "Corona, CA",
    source: "voice",
    service: "Plumbing",
    status: "new",
    priority: "high",
    createdAt: "2025-01-16T09:15:00Z",
    lastContact: "2025-01-16T09:15:00Z",
    estimatedValue: 800,
    notes: "Emergency plumbing issue - kitchen sink backup.",
    tags: ["emergency", "plumbing"], // Added sample tags
    conversations: [
      {
        id: "c3",
        type: "voice",
        timestamp: "2025-01-16T09:15:00Z",
        duration: "8 minutes",
        summary: "Emergency plumbing call - kitchen sink backing up. Needs same-day service.",
        transcript: "Voice call transcript...",
      },
    ],
  },
]

const defaultTags: TagType[] = [
  { id: "1", name: "high-value", color: "bg-green-100 text-green-800" },
  { id: "2", name: "luxury", color: "bg-purple-100 text-purple-800" },
  { id: "3", name: "emergency", color: "bg-red-100 text-red-800" },
  { id: "4", name: "plumbing", color: "bg-blue-100 text-blue-800" },
  { id: "5", name: "hvac", color: "bg-orange-100 text-orange-800" },
  { id: "6", name: "bathroom", color: "bg-pink-100 text-pink-800" },
  { id: "7", name: "follow-up", color: "bg-yellow-100 text-yellow-800" },
  { id: "8", name: "quote-sent", color: "bg-indigo-100 text-indigo-800" },
]

export default function CRMDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSource, setFilterSource] = useState<string>("all")
  const [filterTag, setFilterTag] = useState<string>("all") // Added tag filter
  const [availableTags, setAvailableTags] = useState<TagType[]>(defaultTags)
  const [editingContact, setEditingContact] = useState<Contact | null>(null) // Added editing state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false) // Added edit dialog state
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false) // Added tag dialog state
  const [newTagName, setNewTagName] = useState("") // Added new tag name state
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    city: "",
    service: "",
    status: "new",
    priority: "medium",
    notes: "",
    estimatedValue: 0,
    tags: [],
  })

  const handleLogin = () => {
    // Simple password check - in production, use proper authentication
    if (password === "fixitcrm2025") {
      setIsAuthenticated(true)
    } else {
      alert("Invalid password")
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact({ ...contact })
    setIsEditDialogOpen(true)
  }

  const handleSaveContact = () => {
    if (editingContact) {
      setContacts(contacts.map((c) => (c.id === editingContact.id ? editingContact : c)))
      setIsEditDialogOpen(false)
      setEditingContact(null)
    }
  }

  const handleCreateContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone || "",
        city: newContact.city || "",
        source: "chat", // Default source for manually added contacts
        service: newContact.service || "",
        status: (newContact.status as Contact["status"]) || "new",
        priority: (newContact.priority as Contact["priority"]) || "medium",
        createdAt: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        conversations: [],
        notes: newContact.notes || "",
        estimatedValue: newContact.estimatedValue || 0,
        tags: newContact.tags || [],
      }
      setContacts([...contacts, contact])
      setNewContact({
        name: "",
        email: "",
        phone: "",
        city: "",
        service: "",
        status: "new",
        priority: "medium",
        notes: "",
        estimatedValue: 0,
        tags: [],
      })
      setIsAddContactDialogOpen(false)
    }
  }

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const newTag: TagType = {
        id: Date.now().toString(),
        name: newTagName.toLowerCase().replace(/\s+/g, "-"),
        color: "bg-gray-100 text-gray-800",
      }
      setAvailableTags([...availableTags, newTag])
      setNewTagName("")
      setIsTagDialogOpen(false)
    }
  }

  const toggleContactTag = (contactId: string, tagName: string) => {
    setContacts(
      contacts.map((contact) => {
        if (contact.id === contactId) {
          const hasTag = contact.tags.includes(tagName)
          return {
            ...contact,
            tags: hasTag ? contact.tags.filter((t) => t !== tagName) : [...contact.tags, tagName],
          }
        }
        return contact
      }),
    )
  }

  const toggleEditingContactTag = (tagName: string) => {
    if (editingContact) {
      const hasTag = editingContact.tags.includes(tagName)
      setEditingContact({
        ...editingContact,
        tags: hasTag ? editingContact.tags.filter((t) => t !== tagName) : [...editingContact.tags, tagName],
      })
    }
  }

  const toggleNewContactTag = (tagName: string) => {
    const hasTag = newContact.tags?.includes(tagName)
    setNewContact({
      ...newContact,
      tags: hasTag ? newContact.tags?.filter((t) => t !== tagName) : [...(newContact.tags || []), tagName],
    })
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.service.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || contact.status === filterStatus
    const matchesSource = filterSource === "all" || contact.source === filterSource
    const matchesTag = filterTag === "all" || contact.tags.includes(filterTag)

    return matchesSearch && matchesStatus && matchesSource && matchesTag
  })

  const getTagColor = (tagName: string) => {
    const tag = availableTags.find((t) => t.name === tagName)
    return tag ? tag.color : "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "quoted":
        return "bg-purple-100 text-purple-800"
      case "scheduled":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "chat":
        return <MessageSquare className="h-4 w-4" />
      case "voice":
        return <Phone className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const downloadCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "City",
      "Service",
      "Source",
      "Status",
      "Priority",
      "Tags",
      "Estimated Value",
      "Created Date",
      "Last Contact",
      "Notes",
      "Total Conversations",
    ]

    const csvData = contacts.map((contact) => [
      contact.name,
      contact.email,
      contact.phone,
      contact.city,
      contact.service,
      contact.source,
      contact.status,
      contact.priority,
      contact.tags.join("; "),
      contact.estimatedValue,
      new Date(contact.createdAt).toLocaleDateString(),
      new Date(contact.lastContact).toLocaleDateString(),
      contact.notes.replace(/"/g, '""'), // Escape quotes in notes
      contact.conversations.length,
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row
          .map((field) =>
            typeof field === "string" && (field.includes(",") || field.includes('"') || field.includes("\n"))
              ? `"${field}"`
              : field,
          )
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `crm-contacts-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">CRM Dashboard Access</CardTitle>
            <p className="text-muted-foreground">Enter password to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Access CRM
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Fix It! CRM Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage customer relationships and leads</p>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-name">Name *</Label>
                        <Input
                          id="new-name"
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-email">Email *</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-phone">Phone</Label>
                        <Input
                          id="new-phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-city">City</Label>
                        <Input
                          id="new-city"
                          value={newContact.city}
                          onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-service">Service</Label>
                        <Input
                          id="new-service"
                          value={newContact.service}
                          onChange={(e) => setNewContact({ ...newContact, service: e.target.value })}
                          placeholder="Enter service type"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-estimatedValue">Estimated Value</Label>
                        <Input
                          id="new-estimatedValue"
                          type="number"
                          value={newContact.estimatedValue}
                          onChange={(e) =>
                            setNewContact({ ...newContact, estimatedValue: Number.parseInt(e.target.value) || 0 })
                          }
                          placeholder="Enter estimated value"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-status">Status</Label>
                        <Select
                          value={newContact.status}
                          onValueChange={(value: any) => setNewContact({ ...newContact, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="new-priority">Priority</Label>
                        <Select
                          value={newContact.priority}
                          onValueChange={(value: any) => setNewContact({ ...newContact, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-notes">Notes</Label>
                      <Textarea
                        id="new-notes"
                        value={newContact.notes}
                        onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                        rows={3}
                        placeholder="Enter any additional notes"
                      />
                    </div>
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableTags.map((tag) => (
                          <Badge
                            key={tag.id}
                            className={`cursor-pointer ${
                              newContact.tags?.includes(tag.name)
                                ? tag.color
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() => toggleNewContactTag(tag.name)}
                          >
                            {tag.name}
                            {newContact.tags?.includes(tag.name) ? (
                              <X className="h-3 w-3 ml-1" />
                            ) : (
                              <Plus className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddContactDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateContact} disabled={!newContact.name || !newContact.email}>
                        Create Contact
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto bg-transparent">
                    <Tag className="h-4 w-4 mr-2" />
                    Manage Tags
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Tags</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="New tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                      />
                      <Button onClick={handleCreateTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Available Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <Badge key={tag.id} className={tag.color}>
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={downloadCSV} className="w-full md:w-auto bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
              <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="w-full md:w-auto">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Contacts</p>
                  <p className="text-lg md:text-2xl font-bold">{contacts.length}</p>
                </div>
                <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">New Leads</p>
                  <p className="text-lg md:text-2xl font-bold">{contacts.filter((c) => c.status === "new").length}</p>
                </div>
                <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Active Quotes</p>
                  <p className="text-lg md:text-2xl font-bold">
                    {contacts.filter((c) => c.status === "quoted").length}
                  </p>
                </div>
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Pipeline Value</p>
                  <p className="text-lg md:text-2xl font-bold">
                    ${contacts.reduce((sum, c) => sum + c.estimatedValue, 0).toLocaleString()}
                  </p>
                </div>
                <Download className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 py-2 text-sm border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-2 py-2 text-sm border rounded-md"
                >
                  <option value="all">All Sources</option>
                  <option value="chat">Chat</option>
                  <option value="voice">Voice</option>
                  <option value="video">Video</option>
                </select>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="px-2 py-2 text-sm border rounded-md col-span-2 md:col-span-1"
                >
                  <option value="all">All Tags</option>
                  {availableTags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Contacts</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 md:p-4">Contact</th>
                    <th className="text-left p-2 md:p-4 hidden md:table-cell">Service</th>
                    <th className="text-left p-2 md:p-4 hidden md:table-cell">Source</th>
                    <th className="text-left p-2 md:p-4 hidden md:table-cell">Status</th>
                    <th className="text-left p-2 md:p-4 hidden md:table-cell">Priority</th>
                    <th className="text-left p-2 md:p-4 hidden md:table-cell">Tags</th>
                    <th className="text-left p-2 md:p-4 hidden md:table-cell">Value</th>
                    <th className="text-left p-2 md:p-4 hidden md:table-cell">Last Contact</th>
                    <th className="text-left p-2 md:p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 md:p-4">
                        <div>
                          <div className="font-medium text-sm md:text-base">{contact.name}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">{contact.email}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">{contact.phone}</div>
                          <div className="text-xs md:text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {contact.city}
                          </div>
                          <div className="md:hidden mt-2 space-y-1">
                            <div className="text-xs text-muted-foreground">{contact.service}</div>
                            <div className="flex items-center space-x-2">
                              {getSourceIcon(contact.source)}
                              <Badge
                                className={getStatusColor(contact.status)}
                                style={{ fontSize: "10px", padding: "2px 6px" }}
                              >
                                {contact.status}
                              </Badge>
                              <Badge
                                className={getPriorityColor(contact.priority)}
                                style={{ fontSize: "10px", padding: "2px 6px" }}
                              >
                                {contact.priority}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${contact.estimatedValue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 md:p-4 hidden md:table-cell">{contact.service}</td>
                      <td className="p-2 md:p-4 hidden md:table-cell">
                        <div className="flex items-center space-x-2">
                          {getSourceIcon(contact.source)}
                          <span className="capitalize">{contact.source}</span>
                        </div>
                      </td>
                      <td className="p-2 md:p-4 hidden md:table-cell">
                        <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                      </td>
                      <td className="p-2 md:p-4 hidden md:table-cell">
                        <Badge className={getPriorityColor(contact.priority)}>{contact.priority}</Badge>
                      </td>
                      <td className="p-2 md:p-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tagName) => (
                            <Badge
                              key={tagName}
                              className={`${getTagColor(tagName)} cursor-pointer`}
                              onClick={() => toggleContactTag(contact.id, tagName)}
                            >
                              {tagName}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Tags to {contact.name}</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-wrap gap-2">
                                {availableTags
                                  .filter((tag) => !contact.tags.includes(tag.name))
                                  .map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      className={`${tag.color} cursor-pointer`}
                                      onClick={() => toggleContactTag(contact.id, tag.name)}
                                    >
                                      {tag.name}
                                      <Plus className="h-3 w-3 ml-1" />
                                    </Badge>
                                  ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                      <td className="p-2 md:p-4 hidden md:table-cell">${contact.estimatedValue.toLocaleString()}</td>
                      <td className="p-2 md:p-4 hidden md:table-cell">
                        {new Date(contact.lastContact).toLocaleDateString()}
                      </td>
                      <td className="p-2 md:p-4">
                        <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedContact(contact)}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="md:hidden ml-1">View</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditContact(contact)}
                            className="text-xs"
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="md:hidden ml-1">Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
            </DialogHeader>
            {editingContact && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editingContact.name}
                      onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={editingContact.email}
                      onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editingContact.phone}
                      onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editingContact.city}
                      onChange={(e) => setEditingContact({ ...editingContact, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Service</Label>
                    <Input
                      id="service"
                      value={editingContact.service}
                      onChange={(e) => setEditingContact({ ...editingContact, service: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedValue">Estimated Value</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={editingContact.estimatedValue}
                      onChange={(e) =>
                        setEditingContact({ ...editingContact, estimatedValue: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingContact.status}
                      onValueChange={(value: any) => setEditingContact({ ...editingContact, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={editingContact.priority}
                      onValueChange={(value: any) => setEditingContact({ ...editingContact, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editingContact.notes}
                    onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className={`cursor-pointer ${
                          editingContact.tags.includes(tag.name)
                            ? tag.color
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => toggleEditingContactTag(tag.name)}
                      >
                        {tag.name}
                        {editingContact.tags.includes(tag.name) ? (
                          <X className="h-3 w-3 ml-1" />
                        ) : (
                          <Plus className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveContact}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedContact.name}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedContact(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="conversations">Conversations</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Contact Information</h4>
                        <p>
                          <strong>Email:</strong> {selectedContact.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {selectedContact.phone}
                        </p>
                        <p>
                          <strong>City:</strong> {selectedContact.city}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Project Details</h4>
                        <p>
                          <strong>Service:</strong> {selectedContact.service}
                        </p>
                        <p>
                          <strong>Status:</strong> {selectedContact.status}
                        </p>
                        <p>
                          <strong>Priority:</strong> {selectedContact.priority}
                        </p>
                        <p>
                          <strong>Estimated Value:</strong> ${selectedContact.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedContact.tags.map((tagName) => (
                          <Badge key={tagName} className={getTagColor(tagName)}>
                            {tagName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="conversations" className="space-y-4">
                    {selectedContact.conversations.map((conv) => (
                      <Card key={conv.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getSourceIcon(conv.type)}
                              <span className="font-medium capitalize">{conv.type}</span>
                              {conv.duration && (
                                <span className="text-sm text-muted-foreground">({conv.duration})</span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(conv.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{conv.summary}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Notes</h4>
                      <p className="text-sm">{selectedContact.notes}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
