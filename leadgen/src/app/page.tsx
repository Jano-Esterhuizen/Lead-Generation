import Link from "next/link"
import { Search } from "lucide-react"

export default function LandingPage() {
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
