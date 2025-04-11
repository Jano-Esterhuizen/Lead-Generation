"use client"

import { Globe, Star, Image as ImageIcon, AlertCircle } from "lucide-react"

export interface Lead {
  id: string
  name: string
  address: string
  rating?: number
  totalRatings?: number
  hasWebsite: boolean
  photoCount: number
  phone?: string
}

interface LeadCardProps {
  lead: Lead
  onSave?: (lead: Lead) => void
}

export function LeadCard({ lead, onSave }: LeadCardProps) {
  const opportunityFlags = [
    {
      active: !lead.hasWebsite,
      icon: Globe,
      label: "No Website",
      description: "Business lacks an online presence"
    },
    {
      active: !lead.rating || lead.totalRatings! < 5,
      icon: Star,
      label: "Few Reviews",
      description: lead.totalRatings 
        ? `Only ${lead.totalRatings} reviews`
        : "No reviews yet"
    },
    {
      active: lead.photoCount < 3,
      icon: ImageIcon,
      label: "Few Photos",
      description: lead.photoCount === 0 
        ? "No photos uploaded"
        : `Only ${lead.photoCount} photos`
    }
  ]

  const activeFlags = opportunityFlags.filter(flag => flag.active)

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{lead.address}</p>
          </div>
          {lead.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {lead.rating.toFixed(1)}
              </span>
              {lead.totalRatings && (
                <span className="text-sm text-gray-500">
                  ({lead.totalRatings})
                </span>
              )}
            </div>
          )}
        </div>

        {activeFlags.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Opportunity Flags</span>
            </div>
            <div className="mt-2 grid gap-2">
              {activeFlags.map((flag) => (
                <div
                  key={flag.label}
                  className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700"
                >
                  <flag.icon className="h-4 w-4" />
                  <span className="font-medium">{flag.label}</span>
                  <span className="text-amber-600">-</span>
                  <span>{flag.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lead.phone && (
          <p className="mt-4 text-sm text-gray-500">
            Phone: {lead.phone}
          </p>
        )}

        {onSave && (
          <div className="mt-6">
            <button
              onClick={() => onSave(lead)}
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Lead
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 