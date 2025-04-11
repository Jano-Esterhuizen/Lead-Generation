import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Leads",
  description: "Manage your saved leads and opportunities",
}

export default function LeadsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Leads</h1>
      <div className="grid gap-6">
        {/* LeadListView will be added here */}
      </div>
    </div>
  )
} 