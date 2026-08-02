'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  {
    id: 'explore',
    label: 'Explore',
    href: '/',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'url(#ng)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    href: '/search',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'url(#ng)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    id: 'itinerary',
    label: 'Lists',
    href: '/itinerary',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'url(#ng)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    id: 'groups',
    label: 'Groups',
    href: '/groups',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'url(#ng)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'url(#ng)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const getActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="h-[62px] flex items-stretch flex-shrink-0 bg-[#0d0d0f] border-t border-white/7">
      {/* Gradient defs for active icons */}
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {tabs.map(tab => {
        const active = getActive(tab.href)
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-[3px] bg-none border-none cursor-pointer transition-opacity',
              (tab as { center?: boolean }).center && 'relative'
            )}
          >
            {tab.icon(active)}
            <span
              className={cn(
                'text-[0.48rem] font-bold tracking-[0.05em] uppercase transition-colors',
                active
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent'
                  : 'text-white/28'
              )}
              style={active ? { WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
