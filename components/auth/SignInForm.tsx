'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { signInSchema, type SignInValues } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function SignInForm() {
  const [error, setError] = useState('')
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInValues) => {
    setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        // Friendly error messages
        const msg = authError.message.toLowerCase()
        if (msg.includes('invalid') || msg.includes('credentials')) {
          setError('Wrong email or password. Try again.')
        } else if (msg.includes('email not confirmed')) {
          setError('Please check your email and confirm your account first.')
        } else {
          setError(authError.message)
        }
        return
      }

      if (!authData.session) {
        setError('Sign in failed — please try again.')
        return
      }

      // Hard redirect: ensures middleware picks up fresh session cookies
      window.location.href = '/'
    } catch {
      setError('Connection error — please check your internet and try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full mt-1" size="lg">
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="flex items-center justify-between text-xs text-white/40 mt-1">
        <Link href="/forgot-password" className="hover:text-white/70 transition-colors">
          Forgot password?
        </Link>
        <Link href="/signup" className="hover:text-white/70 transition-colors">
          Create account
        </Link>
      </div>
    </form>
  )
}
