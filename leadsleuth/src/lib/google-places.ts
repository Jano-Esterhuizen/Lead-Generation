// Types for Google Places API responses
export interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  website?: string
  url?: string
}

export interface SearchResponse {
  results: PlaceResult[]
  status: string
  error_message?: string
  next_page_token?: string
}

// Function to search for places
export async function searchPlaces(
  location: string,
  radius: string,
  category: string
): Promise<PlaceResult[]> {
  try {
    // Use our Next.js API route instead of calling Google API directly
    const apiUrl = new URL('/api/places/search', window.location.origin)
    apiUrl.searchParams.append('location', location)
    apiUrl.searchParams.append('radius', radius)
    apiUrl.searchParams.append('category', category)

    const response = await fetch(apiUrl.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`)
    }

    return data.results
  } catch (error) {
    console.error('Error searching places:', error)
    throw error
  }
}

// Function to get place details
export async function getPlaceDetails(placeId: string): Promise<PlaceResult> {
  try {
    // Use our Next.js API route instead of calling Google API directly
    const apiUrl = new URL('/api/places/details', window.location.origin)
    apiUrl.searchParams.append('placeId', placeId)

    const response = await fetch(apiUrl.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`)
    }

    return data.result
  } catch (error) {
    console.error('Error getting place details:', error)
    throw error
  }
} 