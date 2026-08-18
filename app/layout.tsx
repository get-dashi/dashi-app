import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SplashSlideshow } from '@/components/layout/SplashSlideshow'
import { ToastProvider } from '@/contexts/ToastContext'
import { SavesProvider } from '@/contexts/SavesContext'
import { VisitsProvider } from '@/contexts/VisitsContext'
import { RankingsProvider } from '@/contexts/RankingsContext'
import { UserListsProvider } from '@/contexts/UserListsContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Dashi — Discover your city.',
  description: 'Swipe through the best bars and restaurants in Austin. AI-powered venue discovery.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0d0d0f] text-[#f5f5f7] font-sans antialiased overflow-hidden h-screen">
        <AuthProvider>
          <ToastProvider>
            <SavesProvider>
            <VisitsProvider>
            <RankingsProvider>
            <UserListsProvider>
              {/* Phone frame on desktop, full screen on mobile */}
              <div className="fixed inset-0 flex items-center justify-center"
                style={{
                  background: 'radial-gradient(ellipse at 40% 30%, rgba(124,58,237,.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,.08) 0%, transparent 50%), #050505'
                }}>
                <div
                  className="relative overflow-hidden bg-[#0d0d0f]"
                  style={{
                    width: 'min(390px, 100vw)',
                    height: 'min(844px, 100vh)',
                    borderRadius: 'clamp(0px, calc((100vw - 390px) * 999), 54px)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,.08), 0 40px 80px rgba(0,0,0,.8)',
                  }}
                >
                  <SplashSlideshow />
                  {children}
                </div>
              </div>
            </UserListsProvider>
            </RankingsProvider>
            </VisitsProvider>
            </SavesProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
