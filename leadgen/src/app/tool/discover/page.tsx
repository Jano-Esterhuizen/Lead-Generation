"use client"

import { useState } from "react"
import { LeadSearchForm } from "@/components/leads/lead-search-form"
import { LeadCard, type Lead } from "@/components/leads/lead-card"
import { createClient } from "@/lib/supabase/client"

export default function DiscoverPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (data: any) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual Google Places API call
      // For now, using mock data
      const mockLeads: Lead[] = [
        {
          id: "1",
          name: "Local Coffee Shop",
          address: "123 Main St, City, State",
          hasWebsite: false,
          photoCount: 1,
          rating: 4.2,
          totalRatings: 3,
          phone: "(555) 123-4567"
        },
        {
          id: "2",
          name: "Family Restaurant",
          address: "456 Oak Ave, City, State",
          hasWebsite: false,
          photoCount: 0,
          rating: undefined,
          totalRatings: 0,
          phone: "(555) 987-6543"
        },
        {
          id: "3",
          name: "Local Gym",
          address: "789 Fitness Blvd, City, State",
          hasWebsite: true,
          photoCount: 2,
          rating: 3.8,
          totalRatings: 4,
          phone: "(555) 555-5555"
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLeads(mockLeads)
    } catch (err) {
      setError("Failed to fetch leads. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLead = async (lead: Lead) => {
    try {
      const supabase = createClient()
      
      // Save lead to user's list
      const { error } = await supabase
        .from("leads")
        .insert([
          {
            business_name: lead.name,
            address: lead.address,
            phone: lead.phone,
            rating: lead.rating,
            total_ratings: lead.totalRatings,
            has_website: lead.hasWebsite,
            photo_count: lead.photoCount,
            status: "new"
          }
        ])

      if (error) throw error

      // Show success message (you might want to add a toast notification here)
      alert("Lead saved successfully!")
    } catch (err) {
      console.error("Error saving lead:", err)
      alert("Failed to save lead. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search for local businesses that need your services.
        </p>
      </div>

      <LeadSearchForm onSearch={handleSearch} />

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      ) : leads.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSave={handleSaveLead} />
          ))}
        </div>
      ) : null}
    </div>
  )
} 