'use client'

import { usePathname } from 'next/navigation'
import { V2BottomNav } from './BottomNav'

export function V2AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNav = pathname === '/login' || pathname === '/signup' || pathname === '/lists/add-venue'

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
      {!hideNav && <V2BottomNav />}
    </div>
  )
}
