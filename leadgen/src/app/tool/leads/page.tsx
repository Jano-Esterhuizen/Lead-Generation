"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { generateEmail } from "@/lib/openai"
import { toast } from "react-hot-toast"
import { Plus, ListPlus, Trash2, FolderOpen, Mail, Wand2, Save } from "lucide-react"
import type { SavedLead, LeadList } from "@/lib/database"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<SavedLead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [lists, setLists] = useState<LeadList[]>([])
  const [loading, setLoading] = useState(true)
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [selectedListForEmail, setSelectedListForEmail] = useState<LeadList | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [serviceOffering, setServiceOffering] = useState("")
  const [emailTone, setEmailTone] = useState<"professional" | "friendly" | "casual">("professional")
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isTemplateSaveOpen, setIsTemplateSaveOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")

  useEffect(() => {
    loadLeads()
    loadLists()
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedList) {
      loadLeadsForList(selectedList)
    } else {
      loadLeads()
    }
  }, [selectedList])

  const loadLeadsForList = async (listId: string) => {
    try {
      const supabase = createClient()
      interface ListItem {
        lead_id: string;
        leads: SavedLead;
      }
      
      const { data, error } = await supabase
        .from("list_items")
        .select(`
          lead_id,
          leads (*)
        `)
        .eq("list_id", listId) as { data: ListItem[] | null; error: any }

      if (error) throw error
      
      // Extract the leads from the joined query
      const listLeads = data?.map(item => item.leads) || []
      setLeads(listLeads)
    } catch (err) {
      console.error("Error loading list leads:", err)
      toast.error("Failed to load leads for this list")
    }
  }

  const loadLeads = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      console.error("Error loading leads:", err)
      toast.error("Failed to load leads")
    } finally {
      setLoading(false)
    }
  }

  const loadLists = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("lead_lists")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLists(data || [])
    } catch (err) {
      console.error("Error loading lists:", err)
      toast.error("Failed to load lists")
    }
  }

  const loadTemplates = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (err) {
      console.error("Error loading templates:", err)
      toast.error("Failed to load email templates")
    }
  }

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)))
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name")
      return
    }

    try {
      const supabase = createClient()
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) {
        toast.error("You must be logged in to create a list")
        return
      }

      const { data: list, error: listError } = await supabase
        .from("lead_lists")
        .insert([
          {
            name: newListName.trim(),
            description: newListDescription.trim() || null,
            user_id: user.id
          },
        ])
        .select()
        .single()

      if (listError) throw listError

      // Add selected leads to the new list
      const listItems = Array.from(selectedLeads).map(leadId => ({
        list_id: list.id,
        lead_id: leadId,
        status: "new",
      }))

      const { error: itemsError } = await supabase
        .from("list_items")
        .insert(listItems)

      if (itemsError) throw itemsError

      toast.success("List created successfully!")
      setNewListName("")
      setNewListDescription("")
      setIsCreateListOpen(false)
      loadLists()
    } catch (err) {
      console.error("Error creating list:", err)
      toast.error("Failed to create list")
    }
  }

  const handleAddToList = async (listId: string) => {
    try {
      const supabase = createClient()
      const listItems = Array.from(selectedLeads).map(leadId => ({
        list_id: listId,
        lead_id: leadId,
        status: "new",
      }))

      const { error } = await supabase
        .from("list_items")
        .insert(listItems)

      if (error) throw error

      toast.success("Leads added to list!")
      setSelectedLeads(new Set())
    } catch (err) {
      console.error("Error adding to list:", err)
      toast.error("Failed to add leads to list")
    }
  }

  const handleDeleteLeads = async () => {
    if (!selectedLeads.size) return

    try {
      const supabase = createClient()
      const leadsToDelete = Array.from(selectedLeads)

      // First, delete all list_items entries for these leads
      const { error: listItemsError } = await supabase
        .from("list_items")
        .delete()
        .in("lead_id", leadsToDelete)

      if (listItemsError) throw listItemsError

      // Then delete the leads themselves
      const { error: leadsError } = await supabase
        .from("leads")
        .delete()
        .in("id", leadsToDelete)

      if (leadsError) throw leadsError

      toast.success("Leads deleted successfully!")
      setSelectedLeads(new Set())
      
      // Refresh the leads list
      if (selectedList) {
        loadLeadsForList(selectedList)
      } else {
        loadLeads()
      }
    } catch (err) {
      console.error("Error deleting leads:", err)
      toast.error("Failed to delete leads")
    }
  }

  const handleOpenEmail = (list: LeadList) => {
    setSelectedListForEmail(list)
    setIsEmailOpen(true)
    // Reset states
    setEmailSubject("")
    setEmailBody("")
    setServiceOffering("")
    setEmailTone("professional")
    setIsGenerating(false)
  }

  const handleGenerateEmail = async () => {
    if (!selectedListForEmail) return
    if (!serviceOffering) {
      toast.error("Please enter your service offering")
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateEmail({
        businessName: selectedListForEmail.name,
        businessType: "local business", // You might want to add a business type field to your leads
        businessAddress: "their location", // You might want to use the actual address
        serviceOffering,
        tone: emailTone,
        painPoints: [] // You could add this as a field for leads
      })

      setEmailSubject(result.subject)
      setEmailBody(result.body)
      toast.success("Email generated successfully!")
    } catch (err) {
      console.error("Error generating email:", err)
      toast.error("Failed to generate email")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendEmails = async () => {
    if (!selectedListForEmail) return
    
    try {
      // TODO: Implement email sending
      toast.error("Email sending coming soon!")
    } catch (err) {
      console.error("Error sending emails:", err)
      toast.error("Failed to send emails")
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setEmailSubject(template.subject)
      setEmailBody(template.body)
      setSelectedTemplate(templateId)
    }
  }

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("Please enter a template name")
      return
    }

    try {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        toast.error("You must be logged in to save templates")
        return
      }

      const { error } = await supabase
        .from("email_templates")
        .insert([
          {
            name: newTemplateName.trim(),
            subject: emailSubject,
            body: emailBody,
            user_id: user.id
          },
        ])

      if (error) throw error

      toast.success("Template saved successfully!")
      setIsTemplateSaveOpen(false)
      setNewTemplateName("")
      loadTemplates()
    } catch (err) {
      console.error("Error saving template:", err)
      toast.error("Failed to save template")
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-72 bg-gray-50 border-r p-6 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Lists</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateListOpen(true)}
              className="hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedList(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedList
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Leads
            </button>
            
            {lists.length > 0 ? (
              <div className="mt-2 space-y-1">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className="flex items-center group"
                  >
                    <button
                      onClick={() => setSelectedList(list.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 group transition-colors ${
                        selectedList === list.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate flex-1">{list.name}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEmail(list)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    >
                      <Mail className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <FolderOpen className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">No lists created yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateListOpen(true)}
                  className="text-xs"
                >
                  Create your first list
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">
              {selectedList 
                ? lists.find(l => l.id === selectedList)?.name || "My Leads"
                : "All Leads"
              }
            </h1>
            <div className="flex gap-4">
              {selectedLeads.size > 0 && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <ListPlus className="w-4 h-4 mr-2" />
                        Add to List
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to List</DialogTitle>
                        <DialogDescription>
                          Choose a list to add the selected leads to
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {lists.map((list) => (
                          <Button
                            key={list.id}
                            variant="outline"
                            className="justify-start"
                            onClick={() => handleAddToList(list.id)}
                          >
                            {list.name}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" onClick={handleDeleteLeads}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectedLeads.size === leads.length && leads.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="selectAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={() => handleSelectLead(lead.id)}
                      />
                      <div>
                        <CardTitle className="text-lg">{lead.name}</CardTitle>
                        <CardDescription>{lead.formatted_address}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lead.phone && (
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span> {lead.phone}
                        </p>
                      )}
                      {lead.rating && (
                        <p className="text-sm">
                          <span className="font-medium">Rating:</span> {lead.rating}/5 ({lead.total_ratings} reviews)
                        </p>
                      )}
                      {lead.flags && lead.flags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {lead.flags.map((flag) => (
                            <span
                              key={flag}
                              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-gray-500">
                      Added {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email to all leads in {selectedListForEmail?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or create new" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid gap-2">
                <Label htmlFor="service">What service are you offering?</Label>
                <Input
                  id="service"
                  value={serviceOffering}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceOffering(e.target.value)}
                  placeholder="e.g., Web design and development services"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tone">Email Tone</Label>
                <Select value={emailTone} onValueChange={(value: "professional" | "friendly" | "casual") => setEmailTone(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={handleGenerateEmail}
                disabled={isGenerating}
                className="w-full"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Email Body</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTemplateSaveOpen(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </div>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value)}
                placeholder="Write your email content here..."
                className="h-64"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Available Variables:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>{`{{company_name}}`}</code> - The name of the company</li>
                <li><code>{`{{address}}`}</code> - Company's address</li>
                <li><code>{`{{phone}}`}</code> - Company's phone number (if available)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmails}>
              Send Emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={isTemplateSaveOpen} onOpenChange={setIsTemplateSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this email as a template for future use
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={newTemplateName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create List Dialog */}
      <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new list to organize your leads
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Enter list description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateListOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 