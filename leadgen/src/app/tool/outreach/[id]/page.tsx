import { Suspense } from "react"
import CampaignDetails from "./CampaignDetails"
import { createClient } from "@/lib/supabase/server"
import { cookies } from 'next/headers'

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

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient()
  
  // Await params before using
  const campaignId = (await params).id
  
  // Load initial data
  const { data: campaignData, error: campaignError } = await supabase
    .from("email_campaigns")
    .select(`
      *,
      list:list_id (
        name,
        description
      )
    `)
    .eq('id', campaignId)
    .single()

  const { data: leadData, error: leadError } = await supabase
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
    .eq('campaign_id', campaignId)
    .order('sent_at', { ascending: false })

  if (campaignError) {
    return <div>Failed to load campaign</div>
  }

  const leads = ((leadData || []) as unknown as SupabaseLeadData[]).map(item => ({
    id: item.id,
    company_name: item.company_name,
    email: item.email,
    phone: item.phone,
    status: item.campaign_status?.status || 'pending',
    sent_at: item.campaign_status?.sent_at || null,
    error: item.campaign_status?.error || null
  }))

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignDetails 
        campaign={campaignData}
        initialLeads={leads}
      />
    </Suspense>
  )
} 