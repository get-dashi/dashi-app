export interface Profile {
  id: string
  name: string | null
  city: string | null
  avatar_url: string | null
  bio: string | null
  preferences: string[]
  saves_count: number
  nights_out: number
  created_at: string
  updated_at: string | null
}

export interface Venue {
  id: string
  name: string
  type: string
  dist: string
  rating: string
  category: 'bar' | 'restaurant' | 'cafe' | 'night_club' | 'sports'
  priceLevel: number
  img: string
  tags: string[]
  promo: boolean
  promoCode?: string
  promoDetail?: string
  hot: number
  featured?: boolean
  happyHour?: string
  description?: string
  vicinity?: string
  lat?: number
  lng?: number
  city?: string
  comoComi?: boolean
  recommendationCount?: number
  bookingPlatform?: 'opentable' | 'resy' | 'sevenrooms' | 'whatsapp' | 'phone' | null
  bookingId?: string
  bookingPhone?: string
  resortPassUrl?: string
  airbnbUrl?: string
}

export interface Save {
  id: string
  user_id: string
  venue_id: string
  venue_data: Venue
  created_at: string
}

export interface Swipe {
  id: string
  user_id: string
  venue_id: string
  direction: 'like' | 'pass'
  created_at: string
}

export interface Group {
  id: string
  name: string
  code: string
  creator_id: string
  members: GroupMember[]
  created_at: string
}

export interface GroupMember {
  user_id: string
  name: string
  avatar_url: string | null
  joined_at: string
}

export type MoodFilter =
  | 'all'
  | 'date'
  | 'happy'
  | 'music'
  | 'dance'
  | 'sports'
  | 'brunch'
  | 'roof'
