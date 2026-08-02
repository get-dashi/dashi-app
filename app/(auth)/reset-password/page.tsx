'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordValues) => {
    const { error: authError } = await supabase.auth.updateUser({ password: data.password })
    if (authError) { setError(authError.message); return }
    router.push('/?reset=success')
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center px-6 bg-[#0d0d0f]">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <h1 className="text-xl font-black tracking-[-0.04em] mb-1">New Password</h1>
          <p className="text-sm text-[#8e8e93]">Choose a strong password.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input label="New Password" type="password" placeholder="Min 8 characters" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm Password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          {error && <p className="text-xs text-red-400 font-semibold text-center">{error}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full mt-1" size="lg">Update Password</Button>
        </form>
      </div>
    </div>
  )
}
