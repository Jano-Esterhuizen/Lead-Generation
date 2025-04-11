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
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-14 items-center border-b border-gray-800 px-4">
        <Link href="/tool/discover" className="text-xl font-bold text-white">
          LeadGen
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-gray-300"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Sign Out
        </button>
      </div>
    </div>
  )
} 