import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover Leads",
  description: "Find local businesses that need your services",
}

export default function DiscoverPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Discover Leads</h1>
      <div className="grid gap-6">
        {/* LeadSearchForm will be added here */}
        {/* LeadResults will be added here */}
      </div>
    </div>
  )
} 