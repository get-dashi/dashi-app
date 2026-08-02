'use client'

import { useEffect, useRef } from 'react'
import { CITIES_CONFIG } from '@/lib/venues'

export interface MapVenue {
  name: string
  type: string
  lat: number
  lng: number
  hot: number
  category: string
}

export interface HeatPoint {
  lat: number
  lng: number
  weight: number
  name?: string
}

interface LeafletMapProps {
  venues: MapVenue[]
  heatPoints?: HeatPoint[]
  city?: string
  activeLayer?: 'popularity' | 'dashi'
}

const CATEGORY_COLORS: Record<string, string> = {
  bar: '#ec4899',
  restaurant: '#f97316',
  cafe: '#3b82f6',
  night_club: '#a855f7',
  sports: '#22c55e',
}

const HEAT_GRADIENT = { 0.4: '#a855f7', 0.65: '#ec4899', 1: '#ff6b6b' }

// Inject CDN script and return a promise that resolves when done
function injectHeatScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { resolve(); return }
    // already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).simpleheat) { resolve(); return }
    const existing = document.getElementById('leaflet-heat-cdn')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.id = 'leaflet-heat-cdn'
    script.src = 'https://leaflet.github.io/Leaflet.heat/dist/leaflet-heat.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('leaflet.heat CDN failed'))
    document.head.appendChild(script)
  })
}

export default function LeafletMap({ venues, heatPoints, city, activeLayer }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatLayerRef = useRef<any>(null)
  const initialized = useRef(false)
  const venueMarkersRef = useRef<unknown[]>([])

  const cityConfig = city ? CITIES_CONFIG[city] : CITIES_CONFIG['austin']
  const center: [number, number] = cityConfig
    ? [cityConfig.lat, cityConfig.lng]
    : [30.2672, -97.7431]

  // Init map once
  useEffect(() => {
    if (initialized.current || !containerRef.current) return
    initialized.current = true

    async function initMap() {
      const L = (await import('leaflet')).default

      // Fix default icon paths
      // @ts-expect-error leaflet private api
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!containerRef.current) return
      const map = L.map(containerRef.current, {
        center,
        zoom: cityConfig?.zoom ?? 14,
        zoomControl: false,
        attributionControl: true,
      })
      mapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // User location pin
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 3px rgba(59,130,246,.35),0 0 12px #3b82f6;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
      L.marker(center, { icon: userIcon }).addTo(map)

      // Venue markers
      venueMarkersRef.current = venues.map(v => {
        const color = CATEGORY_COLORS[v.category] ?? '#ec4899'
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:36px;height:36px;border-radius:50%;border:2px solid ${color};box-shadow:0 0 12px ${color},0 0 24px ${color}40;background:${color}22;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        return L.marker([v.lat, v.lng], { icon })
          .bindPopup(`<strong>${v.name}</strong><br/>${v.type}`)
          .addTo(map)
      })

      // Load leaflet.heat — try npm module first, fall back to CDN
      try {
        // The npm module assumes L is a global; expose it before importing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).L = L
        // Try static import path
        await import('leaflet.heat').catch(async () => {
          // CDN fallback
          await injectHeatScript()
        })
      } catch {
        await injectHeatScript()
      }
    }

    initMap().catch(console.error)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        initialized.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update heat layer whenever heatPoints or activeLayer changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove old heat layer
    if (heatLayerRef.current) {
      heatLayerRef.current.remove()
      heatLayerRef.current = null
    }

    if (!heatPoints || heatPoints.length === 0) return

    // L.heatLayer is monkey-patched by leaflet.heat at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = map._leaflet_id !== undefined ? (window as any).L : null
    if (!L) return

    const points = heatPoints.map(p => [p.lat, p.lng, p.weight] as [number, number, number])

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
      const layer = (L as any).heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 16,
        gradient: HEAT_GRADIENT,
        minOpacity: 0.3,
      })
      layer.addTo(map)
      heatLayerRef.current = layer
    } catch (e) {
      console.error('[LeafletMap] heatLayer error:', e)
    }
  }, [heatPoints, activeLayer])

  // Re-center when city changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !cityConfig) return
    map.setView([cityConfig.lat, cityConfig.lng], cityConfig.zoom)
  }, [city, cityConfig])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
    </>
  )
}
