'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'

const PREFERENCES = [
  'Craft Cocktails', 'Live Music', 'Upscale Dining', 'Rooftop Bars',
  'Speakeasy', 'Date Night', 'Brewery', 'Happy Hour',
  'Dancing', 'BBQ', 'Tacos', 'Vegan', 'Jazz', 'Country', 'Hidden Gems',
]

const CITIES = [
  { id: 'austin',    label: 'Austin, TX',    sub: 'Live music capital of the world' },
  { id: 'monterrey', label: 'Monterrey, MX', sub: 'The industrial powerhouse of Mexico' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [prefs, setPrefs] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const { user, refreshProfile } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const progress = ((step + 1) / 3) * 100

  const togglePref = (p: string) =>
    setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const finish = async () => {
    if (!user) { router.push('/login'); return }
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ name: name || undefined, city: city || 'austin', preferences: prefs })
      .eq('id', user.id)
    setSaving(false)
    if (error) { showToast('Something went wrong', 'error'); return }
    await refreshProfile()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0f] px-6 py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Step {step + 1} of 3</span>
          <span className="text-xs font-bold text-white/40">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] mb-2">What should we call you?</h1>
            <p className="text-sm text-white/50 mb-6">Your name stays private — just for personalization.</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500/50 transition-all"
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] mb-2">Where do you go out?</h1>
            <p className="text-sm text-white/50 mb-6">We&apos;ll show you the best spots in your city.</p>
            <div className="flex flex-col gap-3">
              {CITIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCity(c.id)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    city === c.id
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-white/10 bg-white/4 hover:bg-white/6'
                  }`}
                >
                  <p className="font-bold text-sm mb-0.5">{c.label}</p>
                  <p className="text-xs text-white/40">{c.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] mb-2">What&apos;s your vibe?</h1>
            <p className="text-sm text-white/50 mb-6">Pick everything that sounds like a good night.</p>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map(p => (
                <button
                  key={p}
                  onClick={() => togglePref(p)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    prefs.includes(p)
                      ? 'text-purple-300'
                      : 'bg-white/6 border border-white/10 text-white/60'
                  }`}
                  style={prefs.includes(p) ? {
                    background: 'linear-gradient(#161618,#161618) padding-box, linear-gradient(135deg,#a855f7,#ec4899) border-box',
                    border: '1.5px solid transparent',
                  } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex gap-3 mt-6 flex-shrink-0">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1">
            Back
          </Button>
        )}
        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} className="flex-1" size="lg">
            {step === 0 && !name ? 'Skip' : 'Continue'}
          </Button>
        ) : (
          <Button onClick={finish} loading={saving} className="flex-1" size="lg">
            Start Exploring
          </Button>
        )}
      </div>
    </div>
  )
}
