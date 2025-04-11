"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search } from "lucide-react"

const searchSchema = z.object({
  location: z.string().min(1, "Location is required"),
  radius: z.coerce.number().min(1, "Radius must be at least 1 mile").max(100, "Radius must be less than 100 miles"),
  niche: z.string().min(1, "Niche is required"),
})

type SearchFormData = z.infer<typeof searchSchema>

const businessNiches = [
  "Restaurants",
  "Retail Stores",
  "Beauty & Wellness",
  "Professional Services",
  "Home Services",
  "Automotive",
  "Healthcare",
  "Fitness",
  "Real Estate",
  "Other"
] as const

export function LeadSearchForm({ onSearch }: { onSearch: (data: SearchFormData) => void }) {
  const [isSearching, setIsSearching] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      radius: 10,
    },
  })

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true)
    try {
      await onSearch(data)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="City, State or ZIP"
            {...register("location")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="radius" className="text-sm font-medium text-gray-700">
            Radius (miles)
          </label>
          <input
            id="radius"
            type="number"
            min="1"
            max="100"
            {...register("radius")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.radius && (
            <p className="text-sm text-red-500">{errors.radius.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="niche" className="text-sm font-medium text-gray-700">
            Business Niche
          </label>
          <select
            id="niche"
            {...register("niche")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a niche</option>
            {businessNiches.map((niche) => (
              <option key={niche} value={niche.toLowerCase()}>
                {niche}
              </option>
            ))}
          </select>
          {errors.niche && (
            <p className="text-sm text-red-500">{errors.niche.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSearching}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSearching ? (
            "Searching..."
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search Leads
            </>
          )}
        </button>
      </div>
    </form>
  )
} 