import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Dashi — Discover your city.'

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
        background: '#09090B',
      }}
    >
      {/* Austin skyline background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1200&q=85"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          filter: 'brightness(0.45) saturate(0.8)',
        }}
      />

      {/* Purple gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(124,58,237,0.55) 0%, rgba(236,72,153,0.35) 60%, transparent 100%)',
          display: 'flex',
        }}
      />

      {/* Bottom dark fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 220,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          display: 'flex',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px 72px',
        }}
      >
        {/* Dashi wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 22,
          }}
        >
          {/* Logo mark — stylised D with gradient */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(124,58,237,0.6)',
            }}
          >
            <span
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              D
            </span>
          </div>

          <span
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            Dashi
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.75)',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            marginBottom: 28,
            maxWidth: 640,
          }}
        >
          Discover Austin's best bars, restaurants,
          and nightlife — curated just for you.
        </div>

        {/* Pills row */}
        <div style={{ display: 'flex', gap: 12 }}>
          {['🌮 Tacos', '🍸 Cocktails', '🎵 Live Music', '⭐ Michelin'].map(label => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 100,
                padding: '8px 20px',
                fontSize: 18,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Austin, TX badge — top right */}
      <div
        style={{
          position: 'absolute',
          top: 52,
          right: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 100,
          padding: '10px 22px',
        }}
      >
        <span style={{ fontSize: 20 }}>📍</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
          Austin, TX
        </span>
      </div>
    </div>,
    { ...size }
  )
}
