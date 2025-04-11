import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6">
        {/* Profile settings form will be added here */}
        {/* Email integration settings will be added here */}
        {/* Billing settings will be added here */}
      </div>
    </div>
  )
} 