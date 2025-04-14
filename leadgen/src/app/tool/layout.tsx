"use client"

import { Search, ListChecks, Mail, BarChart2, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"

const navigation = [
  {
    name: "Discover Leads",
    href: "/tool/discover",
    icon: <Search className="h-5 w-5 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
  },
  {
    name: "My Leads",
    href: "/tool/leads",
    icon: <ListChecks className="h-5 w-5 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
  },
  {
    name: "Outreach",
    href: "/tool/outreach",
    icon: <Mail className="h-5 w-5 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
  },
  {
    name: "Dashboard",
    href: "/tool/dashboard",
    icon: <BarChart2 className="h-5 w-5 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
  },
  {
    name: "Settings",
    href: "/tool/settings",
    icon: <Settings className="h-5 w-5 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
  }
]

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? (
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-600 p-1">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">LeadGen</span>
              </div>
            ) : (
              <div className="rounded-lg bg-blue-600 p-1">
                <Search className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="mt-8 flex flex-col gap-2">
              {navigation.map((item) => (
                <SidebarLink
                  key={item.name}
                  link={{
                    label: item.name,
                    href: item.href,
                    icon: item.icon
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Sign Out",
                href: "#",
                icon: <LogOut className="h-5 w-5 text-neutral-700 dark:text-neutral-200 flex-shrink-0" />
              }}
              className="text-red-600 hover:text-red-700"
              onClick={handleSignOut}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 