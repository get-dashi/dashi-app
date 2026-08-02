'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface CityData {
  name: string
  label: string
  photo: string
  michelin: number
  restaurants: number
  bars: number
  activities: number
  experiences: number
}

const LIVE_CITIES = new Set(['austin', 'monterrey', 'honolulu', 'kauai'])

const CITY_DATA: Record<string, CityData> = {
  austin:    { name: 'Austin, TX',       label: 'ATX',  photo: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80', michelin: 18, restaurants: 60, bars: 30, activities: 6,  experiences: 96  },
  nyc:       { name: 'New York, NY',     label: 'NYC',  photo: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80', michelin: 22, restaurants: 30, bars: 10, activities: 5,  experiences: 45  },
  monterrey: { name: 'Monterrey, MX',    label: 'MTY',  photo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/View_of_Monterrey_%282015%29.jpg', michelin: 7,  restaurants: 50, bars: 18, activities: 5,  experiences: 73  },
  atlanta:   { name: 'Atlanta, GA',      label: 'ATL',  photo: 'https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=800&q=80', michelin: 8,  restaurants: 28, bars: 10, activities: 2,  experiences: 40  },
  dallas:    { name: 'Dallas, TX',       label: 'DAL',  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/View_of_Dallas_from_Reunion_Tower_August_2015_05.jpg/1280px-View_of_Dallas_from_Reunion_Tower_August_2015_05.jpg', michelin: 7,  restaurants: 14, bars: 4,  activities: 2,  experiences: 20  },
  miami:     { name: 'Miami, FL',        label: 'MIA',  photo: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80', michelin: 9,  restaurants: 14, bars: 4,  activities: 2,  experiences: 20  },
  cdmx:      { name: 'Ciudad de México', label: 'CDMX', photo: 'https://images.unsplash.com/photo-1518659526054-190340b32735?w=800&q=80', michelin: 10, restaurants: 14, bars: 4,  activities: 2,  experiences: 20  },
  chicago:   { name: 'Chicago, IL',      label: 'CHI',  photo: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', michelin: 13, restaurants: 14, bars: 4,  activities: 2,  experiences: 20  },
  la:        { name: 'Los Angeles, CA',  label: 'LA',   photo: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80', michelin: 14, restaurants: 14, bars: 4,  activities: 2,  experiences: 20  },
  houston:   { name: 'Houston, TX',      label: 'HOU',  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Texas_medical_center.jpg/1280px-Texas_medical_center.jpg', michelin: 0,  restaurants: 13, bars: 3,  activities: 2,  experiences: 18  },
  honolulu:  { name: 'Honolulu, HI',    label: 'HNL',  photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', michelin: 3,  restaurants: 10, bars: 5,  activities: 3,  experiences: 15  },
  kauai:     { name: "Kaua'i, HI",      label: 'KAI',  photo: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&q=80', michelin: 0,  restaurants: 7,  bars: 3,  activities: 4,  experiences: 10  },
}

interface CityPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentCity: string
  onCityChange: (city: string) => void
}

function SnowflakeIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="M17 7l-5-5-5 5"/>
      <path d="M17 17l-5 5-5-5"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M7 7l-5 5 5 5"/>
      <path d="M17 7l5 5-5 5"/>
    </svg>
  )
}

function UtensilsIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  )
}

function WineIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8"/>
      <path d="M7 10h10"/>
      <path d="M12 15v7"/>
      <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>
    </svg>
  )
}

function ZapIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/>
      <path d="M12 19l-7-7 7-7"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function MapPinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

interface CityDetailPanelProps {
  cityKey: string
  city: CityData
  isLive: boolean
  onBack: () => void
  onExplore: () => void
}

function CityDetailPanel({ cityKey, city, isLive, onBack, onExplore }: CityDetailPanelProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-[#0d0d0f] overflow-y-auto">
      {/* Photo header */}
      <div className="h-56 relative">
        <img
          src={city.photo}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-black/30" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/40 rounded-full p-2 text-white backdrop-blur-sm"
        >
          <BackArrowIcon />
        </button>

        {/* City name + badge */}
        <div className="absolute bottom-4 left-4">
          {isLive ? (
            <span className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[0.55rem] font-bold px-2 py-0.5 rounded-full mb-1.5">
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center bg-black/40 backdrop-blur-sm text-white/60 text-[0.55rem] font-bold px-2 py-0.5 rounded-full mb-1.5 border border-white/20">
              Coming Soon
            </span>
          )}
          <div className="text-2xl font-bold text-white leading-tight">{city.name}</div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        <p className="text-white/60 text-sm mb-6 mt-2">
          {city.experiences.toLocaleString()} Experiences
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Michelin */}
          <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <span className="text-purple-400">
              <SnowflakeIcon size={18} />
            </span>
            <span className="text-white font-bold text-lg leading-none">{city.michelin}</span>
            <span className="text-white/50 text-[0.6rem] text-center leading-tight">Michelin</span>
          </div>
          {/* Restaurants */}
          <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <span className="text-white/60">
              <UtensilsIcon size={18} />
            </span>
            <span className="text-white font-bold text-lg leading-none">{city.restaurants}</span>
            <span className="text-white/50 text-[0.6rem] text-center leading-tight">Restaurants</span>
          </div>
          {/* Bars */}
          <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <span className="text-white/60">
              <WineIcon size={18} />
            </span>
            <span className="text-white font-bold text-lg leading-none">{city.bars}</span>
            <span className="text-white/50 text-[0.6rem] text-center leading-tight">Bars</span>
          </div>
          {/* Activities */}
          <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <span className="text-white/60">
              <ZapIcon size={18} />
            </span>
            <span className="text-white font-bold text-lg leading-none">{city.activities}</span>
            <span className="text-white/50 text-[0.6rem] text-center leading-tight">Activities</span>
          </div>
        </div>

        {/* Explore button */}
        {isLive ? (
          <button
            onClick={onExplore}
            className="mt-6 w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-base"
          >
            Explore {city.name}
          </button>
        ) : (
          <div className="mt-6 w-full h-14 bg-white/6 border border-white/10 text-white/40 font-bold rounded-2xl text-base flex items-center justify-center">
            🚧 Coming Soon
          </div>
        )}
      </div>
    </div>
  )
}

export function CityPickerModal({ isOpen, onClose, currentCity, onCityChange }: CityPickerModalProps) {
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      // Small delay so the translate transition is visible
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      setSearch('')
      setSelectedCity(null)
    }
  }, [isOpen])

  const filteredCities = Object.entries(CITY_DATA).filter(([, data]) =>
    data.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleExplore = (cityKey: string) => {
    onCityChange(cityKey)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50"
          onClick={onClose}
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
        />
      )}

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#111113] rounded-t-2xl overflow-y-auto"
        style={{
          maxHeight: '85vh',
          transform: isOpen && visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h2 className="text-white font-bold text-lg">Explore Cities</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-white/6 border border-white/8 rounded-xl px-3 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search cities"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm placeholder-white/30 outline-none flex-1"
            />
          </div>
        </div>

        {/* YOUR CITIES label */}
        <div className="px-4 pb-2">
          <span className="text-white/40 text-[0.65rem] font-bold tracking-widest uppercase">
            Your Cities
          </span>
        </div>

        {/* City grid */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {filteredCities.map(([key, data]) => (
            <button
              key={key}
              onClick={() => {
                if (LIVE_CITIES.has(key)) {
                  setSelectedCity(key)
                } else {
                  showToast(`Coming soon to ${data.name}!`, 'info')
                }
              }}
              className={`relative rounded-xl overflow-hidden aspect-[4/3] text-left ${!LIVE_CITIES.has(key) ? 'opacity-60' : ''}`}
            >
              <img
                src={data.photo}
                alt={data.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

              {/* LIVE / Coming Soon badge */}
              <div className="absolute top-2 right-2">
                {LIVE_CITIES.has(key) ? (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                ) : (
                  <span className="bg-black/50 backdrop-blur-sm text-white/70 text-[0.6rem] font-bold px-2 py-0.5 rounded-full border border-white/20">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Active city indicator */}
              {currentCity === key && (
                <div className="absolute top-2 left-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full border border-white/30">
                    Active
                  </span>
                </div>
              )}

              {/* Bottom content */}
              <div className="absolute bottom-2 left-2">
                <div className="text-sm font-bold text-white leading-tight">{data.name}</div>
                <div className="text-[0.6rem] text-white/60 mt-0.5">
                  {data.experiences.toLocaleString()} Experiences
                </div>
                {data.michelin > 0 && (
                  <div className="flex items-center gap-1 mt-0.5 text-purple-400">
                    <SnowflakeIcon size={9} />
                    <span className="text-[0.6rem]">{data.michelin} Michelin</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Traveling row */}
        <div className="px-4 pb-8 pt-2 border-t border-white/6">
          <button
            onClick={() => showToast('More cities coming soon!', 'info')}
            className="w-full flex items-center gap-3 py-4 text-white/60 hover:text-white/80 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-white/6 flex items-center justify-center flex-shrink-0">
              <MapPinIcon size={14} />
            </div>
            <span className="text-sm">I&apos;m traveling somewhere not listed</span>
          </button>
        </div>
      </div>

      {/* City detail overlay */}
      {selectedCity && CITY_DATA[selectedCity] && (
        <CityDetailPanel
          cityKey={selectedCity}
          city={CITY_DATA[selectedCity]}
          isLive={LIVE_CITIES.has(selectedCity)}
          onBack={() => setSelectedCity(null)}
          onExplore={() => handleExplore(selectedCity)}
        />
      )}
    </>
  )
}
