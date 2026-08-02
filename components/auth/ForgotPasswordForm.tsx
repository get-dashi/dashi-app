'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ForgotPasswordForm() {
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordValues) => {
    setError('')
    const { error: authError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    if (authError) { setError(authError.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-white/70 mb-4">Check your inbox for a reset link.</p>
        <Link href="/login" className="text-purple-400 text-sm font-semibold hover:text-purple-300">Back to Sign In</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      {error && <p className="text-xs text-red-400 font-semibold text-center">{error}</p>}
      <Button type="submit" loading={isSubmitting} className="w-full mt-1" size="lg">Send Reset Link</Button>
      <Link href="/login" className="text-xs text-white/40 text-center hover:text-white/70 transition-colors">Back to Sign In</Link>
    </form>
  )
}
