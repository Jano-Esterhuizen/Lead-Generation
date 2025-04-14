"use client"

import Link from "next/link"
import { Search, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-1">
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">LeadGen</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/tool/discover"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign up free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find and connect with local businesses that need your services
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Discover untapped opportunities and grow your freelance business by connecting with local businesses looking for web development, design, and digital marketing services.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700"
              >
                Get started
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-full border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Learn more
              </Link>
            </div>
          </div>
        </section>
        <section className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  The modern platform for finding and connecting with local businesses
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Create targeted outreach campaigns and scale your client acquisition. Built for freelancers and agencies needing full control and automation — no cold calling, no manual research, no wasted time.
                </p>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    Explore platform
                    <Search className="ml-3 h-5 w-5" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
                  <div className="h-full w-full bg-gray-50 object-cover rounded-lg p-4">
                    <div className="space-y-4">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                      <div className="h-4 w-5/6 rounded bg-gray-200" />
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 h-72 w-72 rounded-xl bg-blue-50 -z-10" />
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="border-t bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              How it works
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Discover
                </h3>
                <p className="text-gray-600">
                  Find businesses with incomplete online presence using our smart filters
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Connect
                </h3>
                <p className="text-gray-600">
                  Generate personalized outreach emails using AI technology
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Convert
                </h3>
                <p className="text-gray-600">
                  Track your campaigns and turn opportunities into clients
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-600 p-1">
                <Search className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">LeadGen</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 LeadGen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
