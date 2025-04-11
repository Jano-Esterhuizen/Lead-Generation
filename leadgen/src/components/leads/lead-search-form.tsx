"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { searchNearbyBusinesses, type PlaceResult } from "@/lib/google-places"

const searchSchema = z.object({
  location: z.string().min(1, "Location is required"),
  radius: z.coerce.number().min(1, "Radius must be at least 1 mile").max(100, "Radius must be less than 100 miles"),
  niche: z.string().min(1, "Niche is required"),
})

type SearchFormData = z.infer<typeof searchSchema>

const businessNiches = [
  "Restaurant",
  "Store",
  "Beauty_Salon",
  "Hair_Care",
  "Doctor",
  "Dentist",
  "Gym",
  "Real_Estate_Agency",
  "Car_Dealer",
  "Car_Repair",
] as const

interface LeadSearchFormProps {
  onSearch: (results: PlaceResult[], nextPageToken?: string) => void;
  isLoading?: boolean;
}

export function LeadSearchForm({ onSearch, isLoading }: LeadSearchFormProps) {
  const [searchError, setSearchError] = useState<string>("")

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
    try {
      setSearchError("")
      const results = await searchNearbyBusinesses({
        location: data.location,
        radius: data.radius,
        type: data.niche,
      })
      onSearch(results.results, results.nextPageToken)
      toast.success(`Found ${results.results.length} businesses`)
    } catch (error) {
      console.error("Search error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to search businesses"
      setSearchError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6">
      {searchError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{searchError}</p>
        </div>
      )}
      
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
            Business Type
          </label>
          <select
            id="niche"
            {...register("niche")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a type</option>
            {businessNiches.map((niche) => (
              <option key={niche} value={niche.toLowerCase()}>
                {niche.replace(/_/g, " ")}
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
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
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