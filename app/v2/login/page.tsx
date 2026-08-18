'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOAuth } from '@/components/v2/useOAuth'

// Austin skyline at golden hour — Lady Bird Lake aerial view
const BG_IMAGE =
  'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=900&q=85&fit=crop'

type Screen = 'splash' | 'signin' | 'signup'

export default function V2LoginPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('splash')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { signIn, loading: oauthLoading, error: oauthError } = useOAuth()

  const handleEmailAuth = async () => {
    if (!email || !password) return
    setAuthError(null)
    setAuthLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const fn = isSignup
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password })
      const { error } = await fn
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('invalid') || msg.includes('credentials')) setAuthError('Wrong email or password.')
        else if (msg.includes('already registered')) setAuthError('Account exists — sign in instead.')
        else setAuthError(error.message)
      } else {
        router.push('/v2')
      }
    } catch {
      setAuthError('Something went wrong. Try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  if (screen === 'splash') {
    return (
      <div className="relative flex flex-col h-full overflow-hidden select-none">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BG_IMAGE}
          alt="Austin skyline"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: 'center 40%' }}
        />

        {/* Warm golden-hour tint + darkening gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(120,60,10,0.18)', mixBlendMode: 'multiply' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.88) 100%)',
          }}
        />

        {/* Center logo block */}
        <div
          className="absolute flex flex-col items-center"
          style={{ top: '38%', left: 0, right: 0, transform: 'translateY(-50%)' }}
        >
          {/* DASHI wordmark */}
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              letterSpacing: '0.55em',
              textTransform: 'uppercase',
              color: '#ffffff',
              lineHeight: 1,
              textShadow: '0 2px 40px rgba(0,0,0,0.5)',
              paddingLeft: '0.55em', // offset for letter-spacing
            }}
          >
            DASHI
          </h1>

          {/* Tagline */}
          <p
            style={{
              marginTop: 12,
              fontSize: '0.62rem',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
              textShadow: '0 1px 12px rgba(0,0,0,0.6)',
            }}
          >
            Discover. Plan. Experience.
          </p>
        </div>

        {/* Bottom CTA block */}
        <div
          className="absolute left-0 right-0 flex flex-col items-center"
          style={{ bottom: 44, paddingLeft: 28, paddingRight: 28, gap: 0 }}
        >
          {/* Primary CTA — warm cream pill */}
          <button
            onClick={() => setScreen('signup')}
            className="w-full transition-all active:scale-[0.97]"
            style={{
              height: 58,
              borderRadius: 100,
              background: '#EDE0C4',
              color: '#1a1209',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.01em',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            Let&apos;s get started
          </button>

          {/* Secondary link */}
          <button
            onClick={() => setScreen('signin')}
            style={{
              marginTop: 20,
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Log in
          </button>
        </div>
      </div>
    )
  }

  // ── Sign In / Sign Up form screen ──────────────────────────────────────────
  const isSignup = screen === 'signup'
  const anyError = authError || oauthError

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Blurred background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BG_IMAGE}
        alt="Austin skyline"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ objectPosition: 'center 40%', filter: 'blur(18px) brightness(0.4)', transform: 'scale(1.1)' }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />

      {/* Back button */}
      <button
        onClick={() => setScreen('splash')}
        className="absolute flex items-center gap-2 z-10"
        style={{
          top: 20, left: 20,
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          borderRadius: 100,
          padding: '8px 14px 8px 10px',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      {/* Form sheet */}
      <div className="absolute left-0 right-0 bottom-0 z-10 flex flex-col rounded-t-[32px] px-6 pt-7 pb-8"
        style={{ background: '#09090B', minHeight: '62%' }}
      >
        {/* Mini wordmark */}
        <div className="flex flex-col items-center mb-6">
          <p style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>
            DASHI
          </p>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: isSignup ? '#fff' : 'rgba(255,255,255,0.85)' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 mb-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-[14px] px-4 py-3.5 outline-none"
              style={{
                background: '#151518',
                border: '1px solid #25252B',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-[14px] px-4 py-3.5 outline-none"
            style={{
              background: '#151518',
              border: '1px solid #25252B',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-[14px] px-4 py-3.5 outline-none"
            style={{
              background: '#151518',
              border: '1px solid #25252B',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          />
        </div>

        {/* Auth error */}
        {anyError && (
          <div style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: '0.75rem', color: '#FF375F', marginBottom: 12 }}>
            {anyError}
          </div>
        )}

        {/* Primary action */}
        <button
          onClick={handleEmailAuth}
          disabled={authLoading || !email || !password}
          className="w-full rounded-[14px] transition-all active:scale-[0.98]"
          style={{
            height: 54,
            background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 800,
            border: 'none',
            cursor: authLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
            marginBottom: 16,
            opacity: authLoading ? 0.7 : 1,
          }}
        >
          {authLoading ? 'Please wait…' : isSignup ? 'Create Account' : 'Sign In'}
        </button>

        {/* OAuth error */}
        {oauthError && (
          <div style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: '0.75rem', color: '#FF375F', marginBottom: 12 }}>
            {oauthError}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div style={{ flex: 1, height: 1, background: '#25252B' }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#25252B' }} />
        </div>

        {/* Google OAuth */}
        <button
          onClick={() => signIn('google')}
          disabled={oauthLoading !== null}
          className="w-full rounded-[14px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          style={{
            height: 50,
            background: '#151518',
            border: '1px solid #25252B',
            color: oauthLoading === 'google' ? 'rgba(255,255,255,0.4)' : '#fff',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: oauthLoading ? 'not-allowed' : 'pointer',
            marginBottom: 10,
            opacity: oauthLoading === 'apple' ? 0.5 : 1,
          }}
        >
          {oauthLoading === 'google' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="rgba(255,255,255,0.7)"/>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {/* Apple OAuth */}
        <button
          onClick={() => signIn('apple')}
          disabled={oauthLoading !== null}
          className="w-full rounded-[14px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          style={{
            height: 50,
            background: '#fff',
            border: 'none',
            color: '#000',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: oauthLoading ? 'not-allowed' : 'pointer',
            marginBottom: 20,
            opacity: oauthLoading === 'google' ? 0.5 : 1,
          }}
        >
          {oauthLoading === 'apple' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="rgba(0,0,0,0.7)"/>
            </svg>
          ) : (
            /* Apple logo SVG */
            <svg width="18" height="18" viewBox="0 0 814 1000" fill="#000">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 370.3 44 229.9 44 200.9c0-148.4 130.3-200.9 134.2-202.2 42.1 0 86.1 28.2 121.8 73.4 35.7 45.3 56.6 95 68.9 137.8h7.1c21.3-63.2 91-97.7 154.5-97.7 21.4 0 43 5.7 61.6 16.4z"/>
            </svg>
          )}
          {oauthLoading === 'apple' ? 'Redirecting…' : 'Sign in with Apple'}
        </button>

        {/* Toggle */}
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setScreen(isSignup ? 'signin' : 'signup')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(168,85,247,0.9)', fontWeight: 700, fontSize: '0.78rem' }}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
