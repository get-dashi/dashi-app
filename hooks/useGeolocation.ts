'use client'
import { useState, useEffect } from 'react'

export type GeoState = {
  lat: number | null
  lng: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({ lat: null, lng: null, error: null, loading: true })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ lat: null, lng: null, error: 'not_supported', loading: false })
      return
    }

    // Check if we already have a cached position (session-scoped)
    try {
      const cached = sessionStorage.getItem('dashi_geo')
      if (cached) {
        const { lat, lng, ts } = JSON.parse(cached)
        if (Date.now() - ts < 5 * 60 * 1000) { // 5 min cache
          setState({ lat, lng, error: null, loading: false })
          return
        }
      }
    } catch { /* ignore */ }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        try { sessionStorage.setItem('dashi_geo', JSON.stringify({ lat, lng, ts: Date.now() })) } catch { /* ignore */ }
        setState({ lat, lng, error: null, loading: false })
      },
      err => {
        const msg = err.code === 1 ? 'denied' : 'unavailable'
        setState({ lat: null, lng: null, error: msg, loading: false })
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300_000 }
    )
  }, [])

  return state
}
