"use client"

import { useState } from "react"
import { LeadSearchForm } from "@/components/leads/lead-search-form"
import { LeadCard, type Lead } from "@/components/leads/lead-card"
import { createClient } from "@/lib/supabase/client"
import { searchNearbyBusinesses, type PlaceResult } from "@/lib/google-places"
import { toast } from "react-hot-toast"

export default function DiscoverPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string>()

  const transformPlaceToLead = (place: PlaceResult): Lead => ({
    id: place.place_id,
    name: place.name,
    formatted_address: place.formatted_address,
    rating: place.rating,
    totalRatings: place.user_ratings_total,
    hasWebsite: !!place.website,
    photoCount: 0,
    phone: place.formatted_phone_number
  })

  const handleSearch = (results: PlaceResult[], token?: string) => {
    const transformedLeads = results.map(transformPlaceToLead)
    setLeads(transformedLeads)
    setNextPageToken(token)
    setError(null)
  }

  const handleLoadMore = async () => {
    if (!nextPageToken || loading) return

    setLoading(true)
    try {
      const results = await searchNearbyBusinesses({
        location: "", // We don't need these for pagination
        radius: 0,   // as they're handled by the pageToken
        type: "",
        pageToken: nextPageToken,
      })

      const transformedLeads = results.results.map(transformPlaceToLead)
      setLeads(current => [...current, ...transformedLeads])
      setNextPageToken(results.nextPageToken)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load more leads"
      console.error(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLead = async (lead: Lead) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("leads")
        .insert([
          {
            place_id: lead.id,
            name: lead.name,
            formatted_address: lead.formatted_address,
            phone: lead.phone,
            rating: lead.rating,
            total_ratings: lead.totalRatings,
            has_website: lead.hasWebsite,
            photo_count: lead.photoCount,
            status: "new",
            flags: [], // Initialize with empty flags array
            user_id: (await supabase.auth.getUser()).data.user?.id // Add the user_id
          }
        ])

      if (error) throw error

      toast.success("Lead saved successfully!")
    } catch (err) {
      console.error("Error saving lead:", err)
      toast.error("Failed to save lead. Please try again.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Discover New Leads</h1>
      
      <LeadSearchForm onSearch={handleSearch} isLoading={loading} />
      
      {error && (
        <div className="text-red-500 mt-4">{error}</div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onSave={handleSaveLead}
          />
        ))}
      </div>
      
      {nextPageToken && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  )
} 