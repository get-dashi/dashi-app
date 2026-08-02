'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileValues } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ChevronLeft } from 'lucide-react'

export default function AccountSettingsPage() {
  const { profile, refreshProfile, signOut } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      bio:  profile?.bio ?? '',
      city: profile?.city ?? 'austin',
    },
  })

  const onSave = async (data: ProfileValues) => {
    const { error } = await supabase.from('profiles').update(data).eq('id', profile?.id)
    if (error) { showToast('Failed to save', 'error'); return }
    await refreshProfile()
    showToast('Profile updated', 'success')
  }

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) { showToast('Failed to delete account', 'error'); return }
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-b border-white/6">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/7 flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-base font-extrabold">Account Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar">
        {/* Profile section */}
        <form onSubmit={handleSubmit(onSave)} className="mt-5 flex flex-col gap-4">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-wider">Profile</h2>

          <Input
            label="Display Name"
            placeholder="Your name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Bio"
            placeholder="A little about you..."
            error={errors.bio?.message}
            {...register('bio')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">City</label>
            <select
              {...register('city')}
              className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
            >
              <option value="austin">Austin, TX</option>
              <option value="monterrey">Monterrey, MX</option>
            </select>
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full">Save Changes</Button>
        </form>

        {/* Notifications */}
        <div className="mt-8">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-wider mb-4">Notifications</h2>
          <div className="bg-[#161618] rounded-2xl border border-white/6 overflow-hidden">
            {['Happy Hour Alerts', 'New Matches', 'Group Updates'].map((item, i) => (
              <div key={item} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                <span className="text-sm font-semibold">{item}</span>
                <div className="w-10 h-6 rounded-full bg-purple-500/30 flex items-center justify-end pr-1 cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-purple-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="mt-8">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-wider mb-4">Security</h2>
          <div className="bg-[#161618] rounded-2xl border border-white/6 overflow-hidden">
            <button
              onClick={() => { router.push('/forgot-password') }}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold hover:bg-white/3 transition-colors text-left"
            >
              Change Password
              <ChevronLeft size={14} className="text-white/25 rotate-180" />
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-8">
          <h2 className="text-xs font-black text-red-400/70 uppercase tracking-wider mb-4">Danger Zone</h2>
          <div className="bg-[#161618] rounded-2xl border border-red-500/15 overflow-hidden">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/8 transition-colors text-left disabled:opacity-50"
            >
              {confirmDelete ? 'Tap again to confirm deletion' : 'Delete Account'}
              {deleting && <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />}
            </button>
          </div>
          {confirmDelete && (
            <p className="text-xs text-red-400/70 mt-2 px-1">This is permanent. All your data will be erased.</p>
          )}
        </div>
      </div>
    </div>
  )
}
