import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get('placeId')

    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing placeId parameter' },
        { status: 400 }
      )
    }

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
    const apiUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    apiUrl.searchParams.append('place_id', placeId)
    apiUrl.searchParams.append('fields', 'name,formatted_address,rating,user_ratings_total,photos,website,url')
    apiUrl.searchParams.append('key', apiKey)

    console.log('Calling Google Places Details API with URL:', apiUrl.toString().replace(apiKey, 'REDACTED'))

    const response = await fetch(apiUrl.toString())
    const data = await response.json()

    console.log('Google Places Details API response status:', data.status)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in place details API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    )
  }
} 