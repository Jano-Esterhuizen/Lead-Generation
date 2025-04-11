import { Metadata } from "next"

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
    <div className="flex min-h-screen">
      {/* Sidebar will be added here */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
} 