import { LeadSearchForm } from '@/components/LeadSearchForm'

export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Discover Leads</h1>
        <p className="text-gray-600 mb-8">
          Find local businesses that need your digital services. Search by location, radius, and business category.
        </p>
        <LeadSearchForm />
      </div>
    </div>
  )
} 