'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Settings, User } from 'lucide-react'

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { profile, signOut } = useAuth()
  const router = useRouter()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-black text-white cursor-pointer"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-48 bg-[#1c1c1e] border border-white/10 rounded-2xl overflow-hidden shadow-xl z-50">
          <div className="px-4 py-3 border-b border-white/6">
            <p className="text-sm font-bold truncate">{profile?.name ?? 'User'}</p>
            <p className="text-xs text-white/40 truncate">{profile?.city ?? 'Austin'}</p>
          </div>
          {[
            { label: 'Profile', icon: User, href: '/profile' },
            { label: 'Settings', icon: Settings, href: '/settings/account' },
          ].map(item => (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
          <div className="border-t border-white/6">
            <button
              onClick={async () => { await signOut(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
