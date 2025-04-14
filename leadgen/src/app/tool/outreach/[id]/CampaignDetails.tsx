"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface CampaignDetails {
  id: string
  name: string
  type: 'email' | 'call'
  status: string
  subject: string | null
  body: string | null
  call_script: string | null
  call_notes: string | null
  total_emails: number
  sent_emails: number
  failed_emails: number
  created_at: string
  completed_at: string | null
  list: {
    name: string
    description: string | null
  }
}

interface CampaignStatus {
  status: string
  sent_at: string | null
  error: string | null
}

interface LeadData {
  id: string
  company_name: string
  email: string | null
  phone: string | null
  campaign_status: CampaignStatus | null
}

interface LeadStatus {
  id: string
  company_name: string
  email: string | null
  phone: string | null
  status: string
  sent_at: string | null
  error: string | null
}

interface SupabaseLeadData {
  id: string
  company_name: string
  email: string | null
  phone: string | null
  campaign_status: {
    status: string
    sent_at: string | null
    error: string | null
  } | null
}

interface Props {
  campaign: CampaignDetails
  initialLeads: LeadStatus[]
}

export default function CampaignDetails({ campaign: initialCampaign, initialLeads }: Props) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<CampaignDetails>(initialCampaign)
  const [leads, setLeads] = useState<LeadStatus[]>(initialLeads)

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient()

    // Subscribe to campaign changes
    const campaignSubscription = supabase
      .channel('campaign_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_campaigns',
          filter: `id=eq.${campaign.id}`
        },
        (payload: any) => {
          if (payload.new) {
            setCampaign(current => ({ ...current, ...payload.new }))
          }
        }
      )
      .subscribe()

    // Subscribe to lead status changes
    const leadSubscription = supabase
      .channel('lead_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_leads',
          filter: `campaign_id=eq.${campaign.id}`
        },
        async (payload: any) => {
          // Refresh leads when status changes
          const { data } = await supabase
            .from("leads")
            .select(`
              id,
              company_name,
              email,
              phone,
              campaign_status:email_campaigns!leads_campaign_id_fkey (
                status,
                sent_at,
                error
              )
            `)
            .eq('campaign_id', campaign.id)
            .order('sent_at', { ascending: false })

          if (data) {
            const typedData = (data as unknown) as SupabaseLeadData[]
            setLeads(typedData.map(item => ({
              id: item.id,
              company_name: item.company_name,
              email: item.email,
              phone: item.phone,
              status: item.campaign_status?.status || 'pending',
              sent_at: item.campaign_status?.sent_at || null,
              error: item.campaign_status?.error || null
            })))
          }
        }
      )
      .subscribe()

    return () => {
      campaignSubscription.unsubscribe()
      leadSubscription.unsubscribe()
    }
  }, [campaign.id])

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back to Campaigns
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-gray-500">
            {campaign.type === 'email' ? <Mail className="inline h-4 w-4 mr-1" /> : <Phone className="inline h-4 w-4 mr-1" />}
            {campaign.list.name}
          </p>
        </div>
        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_emails}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.sent_emails}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.failed_emails}</div>
          </CardContent>
        </Card>
      </div>

      {campaign.type === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Subject</h3>
              <p className="text-gray-600">{campaign.subject}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Body</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{campaign.body}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {campaign.type === 'call' && (
        <Card>
          <CardHeader>
            <CardTitle>Call Script</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Script</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{campaign.call_script}</p>
            </div>
            {campaign.call_notes && (
              <div>
                <h3 className="font-medium mb-2">Additional Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{campaign.call_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
          <CardDescription>Status of each lead in the campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>{campaign.type === 'email' ? 'Email' : 'Phone'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent/Called At</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.company_name}</TableCell>
                  <TableCell>{campaign.type === 'email' ? lead.email : lead.phone}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>{lead.sent_at ? formatDate(lead.sent_at) : '-'}</TableCell>
                  <TableCell className="text-red-600">{lead.error || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 