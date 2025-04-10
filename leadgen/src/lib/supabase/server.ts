import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return undefined // Cookie handling moved to middleware
        },
        set(name: string, value: string, options: any) {
          // Cookie handling moved to middleware
        },
        remove(name: string, options: any) {
          // Cookie handling moved to middleware
        },
      },
    }
  )
} 