'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { signUpSchema, type SignUpValues } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function SignUpForm() {
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpValues) => {
    setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        },
      })

      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setError('An account with this email already exists. Sign in instead.')
        } else if (msg.includes('password')) {
          setError('Password must be at least 8 characters.')
        } else {
          setError(authError.message)
        }
        return
      }

      // If session exists immediately → email confirmation is disabled → go straight to onboarding
      if (authData.session) {
        window.location.href = '/onboarding'
        return
      }

      // Email confirmation is enabled → show verification screen
      setNeedsVerification(true)
    } catch {
      setError('Connection error — please try again.')
    }
  }

  if (needsVerification) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 className="text-base font-extrabold mb-2">Check your email</h3>
        <p className="text-sm text-white/50 mb-6">
          We sent a confirmation link to activate your account.
        </p>
        <Link
          href="/login"
          className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Input
        label="Name"
        placeholder="Your name"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Min 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full mt-1" size="lg">
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-xs text-white/40 text-center mt-1">
        Already have an account?{' '}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
          Sign in
        </Link>
      </p>
    </form>
  )
}
