import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access a protected route
  if (!session && request.nextUrl.pathname.startsWith('/tool')) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is trying to access auth routes
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/tool/discover', request.url))
  }

  return response
}

export const config = {
  matcher: ['/tool/:path*', '/login', '/signup'],
} 