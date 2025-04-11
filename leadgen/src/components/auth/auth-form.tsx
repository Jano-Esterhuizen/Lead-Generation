"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be less than 64 characters'),
})

type FormData = z.infer<typeof formSchema>

interface AuthFormProps {
  type: 'login' | 'signup'
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } =
        type === 'login'
          ? await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            })
          : await supabase.auth.signUp({
              email: data.email,
              password: data.password,
            })

      if (error) {
        setError(error.message)
      } else {
        router.push('/tool/discover')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full rounded-md border p-2"
          placeholder="you@example.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-md border p-2"
          placeholder="••••••••"
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          'Loading...'
        ) : type === 'login' ? (
          'Sign In'
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
} 