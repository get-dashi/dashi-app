'use client'

import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  {
    id: 'explore',
    label: 'Explore',
    href: '/v2',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="nav-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <polygon
          points="3 11 22 2 13 21 11 13 3 11"
          stroke={active ? 'url(#nav-g)' : 'rgba(255,255,255,0.28)'}
          strokeWidth="1.8"
          fill={active ? 'url(#nav-g)' : 'none'}
          fillOpacity={active ? 0.25 : 0}
        />
      </svg>
    ),
  },
  {
    id: 'groups',
    label: 'Groups',
    href: '/v2/groups',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'url(#nav-g)' : 'rgba(255,255,255,0.28)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    href: '/v2/saved',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'url(#nav-g)' : 'none'} stroke={active ? 'url(#nav-g)' : 'rgba(255,255,255,0.28)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    id: 'guides',
    label: 'Guides',
    href: '/v2/guides',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'url(#nav-g)' : 'rgba(255,255,255,0.28)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    id: 'profile',
    label: 'Profile',
    href: '/v2/profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'url(#nav-g)' : 'rgba(255,255,255,0.28)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export function V2BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/v2') return pathname === '/v2'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="flex-shrink-0 flex items-stretch"
      style={{
        height: 66,
        background: 'rgba(9,9,11,0.96)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Single shared defs — rendered once */}
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <linearGradient id="nav-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      {tabs.map(tab => {
        const active = isActive(tab.href)
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-opacity active:opacity-70"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {tab.icon(active)}
            <span
              style={{
                fontSize: '0.48rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                ...(active
                  ? { background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
                  : { color: 'rgba(255,255,255,0.28)' }),
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
