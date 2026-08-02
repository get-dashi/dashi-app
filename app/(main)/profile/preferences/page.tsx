'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const ALL_PREFERENCES = [
  'Craft Cocktails', 'Live Music', 'Upscale Dining', 'Rooftop Bars',
  'Speakeasy', 'East Austin', 'Date Night', 'Brewery', 'Happy Hour',
  'Dancing', 'Sports Bar', 'Brunch', 'BBQ', 'Tacos', 'Vegan',
  'Wine Bar', 'Jazz', 'Country', 'Late Night', 'Hidden Gems',
]

export default function PreferencesPage() {
  const { profile, refreshProfile } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const [selected, setSelected] = useState<string[]>(profile?.preferences ?? [])
  const [saving, setSaving] = useState(false)

  const toggle = (p: string) => {
    setSelected(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const save = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ preferences: selected })
      .eq('id', profile?.id)
    setSaving(false)
    if (error) { showToast('Failed to save', 'error'); return }
    await refreshProfile()
    showToast('Preferences saved', 'success')
    router.back()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0d0d0f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-b border-white/6">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/7 flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-base font-extrabold">Your Vibe</h1>
      </div>

      <p className="px-5 py-3 text-xs text-white/50 flex-shrink-0">
        Select what you&apos;re into — we&apos;ll personalize your feed.
      </p>

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div className="flex flex-wrap gap-2">
          {ALL_PREFERENCES.map(p => (
            <button
              key={p}
              onClick={() => toggle(p)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selected.includes(p)
                  ? 'text-purple-300'
                  : 'bg-white/6 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
              style={selected.includes(p) ? {
                background: 'linear-gradient(#161618,#161618) padding-box, linear-gradient(135deg,#a855f7,#ec4899) border-box',
                border: '1.5px solid transparent',
              } : {}}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 flex-shrink-0 border-t border-white/6">
        <Button onClick={save} loading={saving} className="w-full" size="lg">
          Save Preferences ({selected.length})
        </Button>
      </div>
    </div>
  )
}
