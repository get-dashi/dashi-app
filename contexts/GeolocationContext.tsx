'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useGeolocation, GeoState } from '@/hooks/useGeolocation'

const GeolocationContext = createContext<GeoState>({
  lat: null, lng: null, error: null, loading: false,
})

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const geo = useGeolocation()
  return (
    <GeolocationContext.Provider value={geo}>
      {children}
    </GeolocationContext.Provider>
  )
}

export const useGeo = () => useContext(GeolocationContext)
