import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { getPlaceDetails } from '@/lib/google-places'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

interface EmailError {
  message: string
}

export async function POST(request: Request) {
  try {
    const { campaignId } = await request.json()

    // Get campaign details
    const supabase = createClient()
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, lead_lists(*)')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get leads in the list
    const { data: listItems, error: listError } = await supabase
      .from('list_items')
      .select('*, leads(*)')
      .eq('list_id', campaign.list_id)
      .eq('email_status', 'pending')

    if (listError) {
      return NextResponse.json({ error: 'Failed to get leads' }, { status: 500 })
    }

    // Get user's Gmail tokens
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', campaign.user_id)
      .single()

    if (settingsError || !settings?.gmail_access_token) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 401 })
    }

    // Set up Gmail API
    oauth2Client.setCredentials({
      access_token: settings.gmail_access_token,
      refresh_token: settings.gmail_refresh_token,
      expiry_date: settings.gmail_token_expiry
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Get user's email address
    const { data: profile } = await gmail.users.getProfile({ userId: 'me' })
    const fromEmail = profile.emailAddress

    if (!fromEmail) {
      return NextResponse.json({ error: 'Could not get user email' }, { status: 500 })
    }

    // Process each lead
    for (const item of listItems || []) {
      try {
        // Get business details including email
        const placeDetails = await getPlaceDetails(item.leads.place_id)
        
        if (!placeDetails?.email) {
          // Update list item status if no email found
          await supabase
            .from('list_items')
            .update({
              email_status: 'failed',
              email_error: 'No email address found',
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id)
          continue
        }

        // Prepare email content
        const emailContent = campaign.body
          .replace(/{{company_name}}/g, item.leads.name)
          .replace(/{{address}}/g, item.leads.formatted_address)

        // Create email message with proper headers
        const message = [
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          'Content-Transfer-Encoding: base64',
          `To: ${placeDetails.email}`,
          `From: ${fromEmail}`,
          `Subject: ${campaign.subject}`,
          '',
          Buffer.from(emailContent).toString('base64')
        ].join('\r\n')

        // Send email with proper base64url encoding
        await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: Buffer.from(message).toString('base64url')
          }
        })

        // Update list item status
        await supabase
          .from('list_items')
          .update({
            email_status: 'sent',
            email_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

      } catch (error) {
        console.error('Error processing lead:', error)
        
        // Update list item with error
        await supabase
          .from('list_items')
          .update({
            email_status: 'failed',
            email_error: (error as EmailError).message || 'Unknown error occurred',
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending campaign emails:', error)
    return NextResponse.json({ 
      error: (error as EmailError).message || 'Failed to send emails' 
    }, { status: 500 })
  }
} 