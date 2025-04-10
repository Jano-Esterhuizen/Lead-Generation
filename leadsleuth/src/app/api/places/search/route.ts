import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get('location')
    const radius = searchParams.get('radius')
    const category = searchParams.get('category')

    if (!location || !radius || !category) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Convert radius from km to meters
    const radiusInMeters = parseInt(radius) * 1000

    // Get the API key
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.error('Google Places API key is missing')
      return NextResponse.json(
        { error: 'API key configuration error' },
        { status: 500 }
      )
    }

    // Construct the API URL
    const apiUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    apiUrl.searchParams.append('query', `${category} in ${location}`)
    apiUrl.searchParams.append('radius', radiusInMeters.toString())
    apiUrl.searchParams.append('key', apiKey)
    apiUrl.searchParams.append('type', 'establishment')

    console.log('Calling Google Places API with URL:', apiUrl.toString().replace(apiKey, 'REDACTED'))

    const response = await fetch(apiUrl.toString())
    const data = await response.json()

    console.log('Google Places API response:', JSON.stringify(data, null, 2))

    // If we get a REQUEST_DENIED error, return more detailed information
    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({
        status: data.status,
        error_message: data.error_message || 'Unknown error',
        html_attributions: data.html_attributions || [],
        results: [],
        debug_info: {
          apiKeyExists: !!apiKey,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 5) + '...',
          requestUrl: apiUrl.toString().replace(apiKey, 'REDACTED'),
        }
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in places search API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch places data' },
      { status: 500 }
    )
  }
} 