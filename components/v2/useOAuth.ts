'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type OAuthProvider = 'google' | 'apple'

export function useOAuth() {
  const [loading, setLoading] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (provider: OAuthProvider) => {
    setError(null)
    setLoading(provider)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // After OAuth completes, Supabase redirects here to exchange the code
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: provider === 'google'
            ? { access_type: 'offline', prompt: 'select_account' }
            : undefined,
        },
      })
      if (error) setError(error.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }, [])

  return { signIn, loading, error }
}
