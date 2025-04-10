'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { searchPlaces, PlaceResult } from '@/lib/google-places'
import { LeadCard } from './LeadCard'

// Form validation schema
const searchSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  radius: z.string().min(1, 'Please select a radius'),
  category: z.string().min(1, 'Business category is required'),
})

type SearchFormData = z.infer<typeof searchSchema>

const radiusOptions = [
  { value: '5', label: '5km' },
  { value: '10', label: '10km' },
  { value: '25', label: '25km' },
  { value: '50', label: '50km' },
]

export function LeadSearchForm() {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  })

  const onSubmit = async (data: SearchFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      const places = await searchPlaces(data.location, data.radius, data.category)
      setResults(places)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Location Input */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              {...register('location')}
              type="text"
              id="location"
              placeholder="Enter city or address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Radius Select */}
          <div>
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius
            </label>
            <select
              {...register('radius')}
              id="radius"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select radius</option>
              {radiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.radius && (
              <p className="mt-1 text-sm text-red-600">{errors.radius.message}</p>
            )}
          </div>

          {/* Business Category Input */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Business Category
            </label>
            <input
              {...register('category')}
              type="text"
              id="category"
              placeholder="e.g., Restaurant, Salon, Gym"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Searching...' : 'Search Leads'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Search className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((place) => (
              <LeadCard key={place.place_id} place={place} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 