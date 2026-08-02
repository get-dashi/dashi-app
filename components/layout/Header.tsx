'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileMenu } from '@/components/profile/ProfileMenu'
import { useSaves } from '@/contexts/SavesContext'
import { BookmarkIcon } from 'lucide-react'
import { CityPickerModal } from '@/components/layout/CityPickerModal'

const CITY_NAMES: Record<string, string> = {
  austin:    'Austin, TX',
  nyc:       'New York, NY',
  monterrey: 'Monterrey, MX',
  atlanta:   'Atlanta, GA',
  dallas:    'Dallas, TX',
  miami:     'Miami, FL',
  cdmx:      'Ciudad de México',
  chicago:   'Chicago, IL',
  la:        'Los Angeles, CA',
  houston:   'Houston, TX',
}

interface HeaderProps {
  onSavesClick?: () => void
  showCitySelector?: boolean
  city?: string
  onCityChange?: (city: string) => void
}

export function Header({ onSavesClick, showCitySelector, city, onCityChange }: HeaderProps) {
  const { user } = useAuth()
  const { savesCount } = useSaves()
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <header className="px-6 pt-3 pb-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-[-0.04em]">
            Da<span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>shi</span>
          </span>
          {showCitySelector && onCityChange && (
            <>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1.5 transition-all hover:bg-white/12"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="2.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5" fill="rgba(168,85,247,0.9)" stroke="none"/>
                </svg>
                <span className="text-white text-[0.72rem] font-semibold">
                  {CITY_NAMES[city ?? 'austin'] ?? 'Austin, TX'}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <CityPickerModal
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                currentCity={city ?? 'austin'}
                onCityChange={(c) => {
                  onCityChange(c)
                  setPickerOpen(false)
                }}
              />
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {onSavesClick && (
            <button
              onClick={onSavesClick}
              className="relative w-9 h-9 rounded-full bg-white/7 border-none flex items-center justify-center cursor-pointer"
            >
              <BookmarkIcon size={16} className="stroke-white" />
              {savesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[14px] h-[14px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-[0.45rem] font-black flex items-center justify-center border-2 border-[#0d0d0f]">
                  {savesCount}
                </span>
              )}
            </button>
          )}
          {user ? (
            <ProfileMenu />
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
