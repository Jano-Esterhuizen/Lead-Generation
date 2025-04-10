import { NextResponse } from 'next/server'

export async function GET() {
  // Check if the API key is available
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  
  return NextResponse.json({
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 5) + '...' : 'not found',
    // Don't return the full key for security reasons
  })
} 