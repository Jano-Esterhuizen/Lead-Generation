'use client'

import { PlaceResult } from '@/lib/google-places'
import { Globe, Star, Image, AlertCircle } from 'lucide-react'

interface LeadCardProps {
  place: PlaceResult
}

export function LeadCard({ place }: LeadCardProps) {
  // Calculate opportunity flags
  const hasNoWebsite = !place.website
  const hasFewReviews = !place.rating || (place.user_ratings_total ?? 0) < 10
  const hasNoPhotos = !place.photos || place.photos.length === 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Business Name and Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
        <p className="text-sm text-gray-600">{place.formatted_address}</p>
      </div>

      {/* Opportunity Flags */}
      <div className="flex flex-wrap gap-2">
        {hasNoWebsite && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Globe className="w-3 h-3 mr-1" />
            No Website
          </span>
        )}
        {hasFewReviews && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Star className="w-3 h-3 mr-1" />
            Few Reviews
          </span>
        )}
        {hasNoPhotos && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Image className="w-3 h-3 mr-1" />
            No Photos
          </span>
        )}
      </div>

      {/* Rating and Review Count */}
      {place.rating && (
        <div className="flex items-center text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-400 mr-1" />
          <span>{place.rating.toFixed(1)}</span>
          <span className="mx-1">•</span>
          <span>{place.user_ratings_total ?? 0} reviews</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Globe className="w-4 h-4 mr-1" />
          View on Google
        </a>
        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Visit Website
          </a>
        )}
      </div>
    </div>
  )
} 