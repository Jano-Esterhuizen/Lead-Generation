import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your outreach campaign performance",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6">
        {/* Campaign stats and charts will be added here */}
      </div>
    </div>
  )
} 