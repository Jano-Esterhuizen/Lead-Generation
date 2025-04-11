import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="font-bold text-xl">LeadGen</div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center space-y-8 py-24 md:py-32">
          <h1 className="text-center text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Find Local Businesses That Need Your Services
          </h1>
          <p className="max-w-[700px] text-center text-gray-500 md:text-xl dark:text-gray-400">
            Discover untapped opportunities and connect with businesses looking for web development, design, and digital marketing services.
          </p>
          <Link
            href="/tool/discover"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8 py-3 text-lg font-medium"
          >
            Start Finding Leads
          </Link>
        </section>
        <section className="border-t bg-gray-50 dark:bg-gray-900">
          <div className="container py-16 space-y-12">
            <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">1. Discover</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Find businesses with incomplete online presence using our smart filters
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">2. Connect</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Generate personalized outreach emails using AI technology
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">3. Convert</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Track your campaigns and turn opportunities into clients
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-gray-500">© 2024 LeadGen. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
