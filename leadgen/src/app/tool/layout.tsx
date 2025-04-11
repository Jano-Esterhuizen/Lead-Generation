import { Metadata } from "next"
import { Sidebar } from "@/components/layout/sidebar"

export const metadata: Metadata = {
  title: {
    default: "LeadGen",
    template: "%s | LeadGen"
  },
  description: "Find and connect with local businesses that need your services",
}

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto py-8">
          {children}
        </div>
      </main>
    </div>
  )
} 