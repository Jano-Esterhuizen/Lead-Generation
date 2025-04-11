import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Outreach",
  description: "Generate and send personalized outreach emails",
}

export default function OutreachPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Outreach</h1>
      <div className="grid gap-6">
        {/* EmailGeneratorForm will be added here */}
        {/* EmailPreview will be added here */}
      </div>
    </div>
  )
} 