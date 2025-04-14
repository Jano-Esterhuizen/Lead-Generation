'use client';

import { LoadScript, LoadScriptProps } from '@react-google-maps/api';

const libraries: LoadScriptProps['libraries'] = ['places'];

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  types: string[];
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  formatted_phone_number?: string;
  email?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

export interface SearchNearbyParams {
  location: string;
  radius: number;
  type: string;
  pageToken?: string;
}

/**
 * TODO: Migration to new Places API
 * As of March 1st, 2025, google.maps.places.PlacesService is not recommended for new customers.
 * We should migrate to google.maps.places.Place when:
 * 1. TypeScript types are more stable
 * 2. The migration guide is more complete
 * 3. We have clarity on required fields and property access
 * 
 * Migration Guide: https://developers.google.com/maps/documentation/javascript/places-migration-overview
 */
export async function searchNearbyBusinesses({
  location,
  radius,
  type,
  pageToken,
}: SearchNearbyParams): Promise<{
  results: PlaceResult[];
  nextPageToken?: string;
}> {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    // First, geocode the location string to get coordinates
    const geocoder = new google.maps.Geocoder();
    const { results: geocodeResults } = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK' && results) {
          resolve({ results });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    if (!geocodeResults?.[0]?.geometry?.location) {
      throw new Error('Location not found');
    }

    const { lat, lng } = geocodeResults[0].geometry.location.toJSON();

    // Create Places service instance
    const placesService = new google.maps.places.PlacesService(document.createElement('div'));

    // Prepare the search request
    const searchRequest: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(lat, lng),
      radius: radius * 1609.34, // Convert miles to meters
      type: type.toLowerCase(),
      ...(pageToken && { pageToken })
    };

    // Perform the nearby search
    const searchResults = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
      placesService.nearbySearch(searchRequest, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Store the next page token for later use
          if (pagination) {
            pageToken = pagination.hasNextPage ? pagination.nextPage.toString() : undefined;
          }
          resolve(results);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });

    // Transform the results to match our PlaceResult interface
    const transformedResults = searchResults.map(place => ({
      place_id: place.place_id || '',
      name: place.name || '',
      formatted_address: place.vicinity || '',
      types: place.types || [],
      business_status: place.business_status,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      website: place.website,
      formatted_phone_number: place.formatted_phone_number,
      opening_hours: place.opening_hours ? {
        open_now: place.opening_hours.open_now,
      } : undefined,
    }));

    return {
      results: transformedResults,
      nextPageToken: pageToken,
    };
  } catch (error) {
    console.error('Error in searchNearbyBusinesses:', error);
    throw error;
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const placesService = new google.maps.places.PlacesService(document.createElement('div'));

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'website', 'formatted_phone_number', 'opening_hours', 'business_status', 'rating', 'user_ratings_total']
    };

    const placeDetails = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
      placesService.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });

    // Try to find email from website
    let email: string | undefined;
    if (placeDetails.website) {
      try {
        const response = await fetch(`/api/scrape-email?url=${encodeURIComponent(placeDetails.website)}`);
        const data = await response.json();
        email = data.email;
      } catch (error) {
        console.error('Error scraping email:', error);
      }
    }

    return {
      place_id: placeId,
      name: placeDetails.name || '',
      formatted_address: placeDetails.formatted_address || '',
      types: placeDetails.types || [],
      business_status: placeDetails.business_status,
      rating: placeDetails.rating,
      user_ratings_total: placeDetails.user_ratings_total,
      website: placeDetails.website,
      formatted_phone_number: placeDetails.formatted_phone_number,
      email,
      opening_hours: placeDetails.opening_hours ? {
        open_now: placeDetails.opening_hours.open_now,
        weekday_text: placeDetails.opening_hours.weekday_text,
      } : undefined,
    };
  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    return null;
  }
} 