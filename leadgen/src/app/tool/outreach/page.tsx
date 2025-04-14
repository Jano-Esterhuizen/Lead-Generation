"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Mail, BarChart2, Clock, CheckCircle2, XCircle, AlertCircle, Wand2, Save } from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface Campaign {
  id: string
  name: string
  status: string
  total_emails: number
  sent_emails: number
  failed_emails: number
  created_at: string
  completed_at: string | null
}

interface LeadList {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

export default function OutreachPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [lists, setLists] = useState<LeadList[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedList, setSelectedList] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [campaignName, setCampaignName] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [serviceOffering, setServiceOffering] = useState("")
  const [emailTone, setEmailTone] = useState<"professional" | "friendly" | "casual">("professional")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTemplateSaveOpen, setIsTemplateSaveOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [selectedOutreachMethod, setSelectedOutreachMethod] = useState<"email" | "call">("email")
  const [callScript, setCallScript] = useState("")
  const [callNotes, setCallNotes] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadCampaigns()
    loadLists()
    loadTemplates()
  }, [])

  const loadCampaigns = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error("Error loading campaigns:", err)
      toast.error("Failed to load campaigns")
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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setEmailSubject(template.subject)
      setEmailBody(template.body)
    }
  }

  const handleGenerateEmail = async () => {
    if (!serviceOffering) {
      toast.error("Please enter your service offering")
      return
    }

    setIsGenerating(true)
    try {
      const { subject, body } = await generateEmail({
        businessName: "{{company_name}}",
        businessType: "business",
        businessAddress: "{{address}}",
        serviceOffering,
        tone: emailTone
      })
      setEmailSubject(subject)
      setEmailBody(body)
      toast.success("Email generated successfully!")
    } catch (err) {
      console.error("Error generating email:", err)
      toast.error("Failed to generate email")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!newTemplateName || !emailSubject || !emailBody) {
      toast.error("Please fill in all template details")
      return
    }

    try {
      const supabase = createClient()
      const { data: user } = await supabase.auth.getUser()
      
      if (!user.user) {
        toast.error("You must be logged in to save templates")
        return
      }

      const { error } = await supabase
        .from("email_templates")
        .insert([
          {
            name: newTemplateName,
            subject: emailSubject,
            body: emailBody,
            user_id: user.user.id
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

  const handleCreateCampaign = async () => {
    if (!campaignName || !selectedList) {
      toast.error("Please fill in campaign name and select a list")
      return
    }

    if (selectedOutreachMethod === 'email' && (!emailSubject || !emailBody)) {
      toast.error("Please fill in email subject and body")
      return
    }

    if (selectedOutreachMethod === 'call' && !callScript) {
      toast.error("Please fill in the call script")
      return
    }

    try {
      const supabase = createClient()
      const { data: user } = await supabase.auth.getUser()
      
      if (!user.user) {
        toast.error("You must be logged in to create campaigns")
        return
      }

      // Check Gmail connection for email campaigns
      if (selectedOutreachMethod === 'email') {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('gmail_access_token')
          .eq('user_id', user.user.id)
          .single()

        if (!settings?.gmail_access_token) {
          // Redirect to Gmail auth
          const response = await fetch('/api/auth/gmail')
          const { url } = await response.json()
          window.location.href = url
          return
        }
      }

      // Create the campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert([
          {
            name: campaignName,
            list_id: selectedList,
            type: selectedOutreachMethod,
            subject: selectedOutreachMethod === 'email' ? emailSubject : null,
            body: selectedOutreachMethod === 'email' ? emailBody : null,
            call_script: selectedOutreachMethod === 'call' ? callScript : null,
            call_notes: selectedOutreachMethod === 'call' ? callNotes : null,
            status: "pending",
            user_id: user.user.id
          },
        ])
        .select()
        .single()

      if (campaignError) throw campaignError

      // Start sending emails if it's an email campaign
      if (selectedOutreachMethod === 'email') {
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: campaign.id })
        })
      }

      toast.success("Campaign created successfully!")
      setIsCreateCampaignOpen(false)
      resetForm()
      loadCampaigns()
    } catch (err) {
      console.error("Error creating campaign:", err)
      toast.error("Failed to create campaign")
    }
  }

  // Handle Gmail OAuth callback
  useEffect(() => {
    const handleGmailCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')
      
      if (code) {
        try {
          // Remove code from URL first to prevent double processing
          window.history.replaceState({}, '', window.location.pathname)
          
          const response = await fetch(`/api/auth/gmail?code=${code}`)
          const data = await response.json()
          
          if (data.success) {
            toast.success("Gmail connected successfully!")
          } else {
            throw new Error(data.error)
          }
        } catch (error) {
          console.error('Error connecting Gmail:', error)
          toast.error("Failed to connect Gmail")
        }
      }
    }

    handleGmailCallback()
  }, [])

  const resetForm = () => {
    setCampaignName("")
    setSelectedList("")
    setSelectedOutreachMethod("email")
    setEmailSubject("")
    setEmailBody("")
    setSelectedTemplate("")
    setCallScript("")
    setCallNotes("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "sent":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/tool/outreach/${campaignId}`)
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="campaigns" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up your email campaign by selecting a lead list and creating your email template.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="list">Select Lead List</Label>
                  <Select value={selectedList} onValueChange={setSelectedList}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a list" />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="outreach-method">Outreach Method</Label>
                  <Select 
                    value={selectedOutreachMethod} 
                    onValueChange={(value: "email" | "call") => setSelectedOutreachMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outreach method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="call">Cold Calling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedOutreachMethod === 'email' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <div className="grid gap-2">
                      <Label htmlFor="template">Email Template</Label>
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
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subject">Email Subject</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsTemplateSaveOpen(true)}
                            disabled={!emailSubject || !emailBody}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEmailSubject("")
                              setEmailBody("")
                              setSelectedTemplate("")
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <Input
                        id="subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Enter email subject"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="body">Email Body</Label>
                      <Textarea
                        id="body"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Enter email body"
                        rows={8}
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="service">AI Email Generation</Label>
                        <div className="flex gap-2">
                          <Input
                            id="service"
                            value={serviceOffering}
                            onChange={(e) => setServiceOffering(e.target.value)}
                            placeholder="Describe your service offering"
                          />
                          <Select value={emailTone} onValueChange={(value: "professional" | "friendly" | "casual") => setEmailTone(value)}>
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            onClick={handleGenerateEmail}
                            disabled={isGenerating || !serviceOffering}
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOutreachMethod === 'call' && (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <div className="grid gap-2">
                      <Label htmlFor="call-script">Call Script</Label>
                      <Textarea
                        id="call-script"
                        value={callScript}
                        onChange={(e) => setCallScript(e.target.value)}
                        placeholder="Enter your cold calling script"
                        rows={8}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="call-notes">Additional Notes</Label>
                      <Textarea
                        id="call-notes"
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        placeholder="Enter any additional notes or talking points"
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>Create Campaign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isTemplateSaveOpen} onOpenChange={setIsTemplateSaveOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Email Template</DialogTitle>
                <DialogDescription>
                  Save this email for future use in your campaigns.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTemplateSaveOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>Save Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Campaigns
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Emails Sent
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((acc, campaign) => acc + campaign.sent_emails, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Failed Emails
                </CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((acc, campaign) => acc + campaign.failed_emails, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>
                Overview of your email campaigns and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow 
                      key={campaign.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleCampaignClick(campaign.id)}
                    >
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${(campaign.sent_emails / campaign.total_emails) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {campaign.sent_emails}/{campaign.total_emails}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(campaign.created_at)}</TableCell>
                      <TableCell>
                        {campaign.completed_at ? formatDate(campaign.completed_at) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Analytics</CardTitle>
              <CardDescription>
                Detailed statistics and performance metrics for your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Analytics dashboard coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 