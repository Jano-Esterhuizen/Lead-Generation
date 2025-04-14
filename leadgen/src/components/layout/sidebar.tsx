"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Search,
  ListChecks,
  Mail,
  BarChart2,
  Settings,
  LogOut
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  {
    name: "Discover Leads",
    href: "/tool/discover",
    icon: Search
  },
  {
    name: "My Leads",
    href: "/tool/leads",
    icon: ListChecks
  },
  {
    name: "Outreach",
    href: "/tool/outreach",
    icon: Mail
  },
  {
    name: "Dashboard",
    href: "/tool/dashboard",
    icon: BarChart2
  },
  {
    name: "Settings",
    href: "/tool/settings",
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col border-r bg-white">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-1">
            <Search className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">LeadGen</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="shrink-0 border-t p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Sign Out
        </button>
      </div>
    </div>
  )
} 