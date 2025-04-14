import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()

    // Simple regex to find email addresses
    // Note: This is a basic implementation. For production, you might want to use a more robust solution
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = html.match(emailRegex) || []

    // Filter out common false positives and select the most likely business email
    const validEmails = emails.filter(email => {
      const lower = email.toLowerCase()
      return !lower.includes('example.com') &&
             !lower.includes('yourdomain.com') &&
             !lower.includes('domain.com') &&
             !lower.includes('email.com')
    })

    // Prioritize business-like emails (info@, contact@, etc.)
    const priorityPrefixes = ['info', 'contact', 'sales', 'support', 'hello', 'business']
    const businessEmail = validEmails.find(email => 
      priorityPrefixes.some(prefix => email.toLowerCase().startsWith(prefix + '@'))
    ) || validEmails[0]

    return NextResponse.json({ email: businessEmail || null })
  } catch (error) {
    console.error('Error scraping email:', error)
    return NextResponse.json({ error: 'Failed to scrape email' }, { status: 500 })
  }
} 