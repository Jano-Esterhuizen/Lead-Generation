import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    // Generate auth URL and redirect user to Google's consent screen
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose'
      ],
      prompt: 'consent',
      include_granted_scopes: true,
      response_type: 'code'
    })

    return NextResponse.json({ url: authUrl })
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Store tokens in database
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        gmail_access_token: tokens.access_token,
        gmail_refresh_token: tokens.refresh_token,
        gmail_token_expiry: tokens.expiry_date,
        updated_at: new Date().toISOString()
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gmail OAuth error:', error)
    return NextResponse.json({ error: 'Failed to authenticate with Gmail' }, { status: 500 })
  }
} 