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
    id: 'plans',
    label: 'Plans',
    href: '/adventures',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'url(#ng)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: 'you',
    label: 'You',
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
    // Plans tab covers both adventures and groups routes
    if (href === '/adventures') return pathname.startsWith('/adventures') || pathname.startsWith('/groups')
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
