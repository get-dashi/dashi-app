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
  category: 'bar' | 'restaurant' | 'cafe' | 'night_club' | 'sports' | 'activity'
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
  glutenFree?: boolean
  karaoke?: boolean
  recommendationCount?: number
  bookingPlatform?: 'opentable' | 'resy' | 'sevenrooms' | 'whatsapp' | 'phone' | null
  bookingId?: string
  bookingPhone?: string
  resortPassUrl?: string
  airbnbUrl?: string
  /** Curator’s first-person note — shown on card in place of template description */
  curatorNote?: string
  /** Live status chips — e.g. [‘OPEN TILL 11’, ‘30 MIN WAIT’, ‘BAND AT 9’] */
  liveStatus?: string[]
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

// ─── Dashi Adventures ────────────────────────────────────────────────────────

export interface Adventure {
  id: string
  user_id: string
  title: string
  city: string
  cover_img: string | null
  start_date: string
  end_date: string | null
  rating: number | null
  would_do_again: 'absolutely' | 'probably' | 'maybe' | 'no' | null
  notes: string | null
  is_featured: boolean
  created_at: string
  updated_at: string | null
  // joined from adventure_venues / adventure_members counts
  venue_count?: number
  member_count?: number
}

export interface AdventureVenue {
  id: string
  adventure_id: string
  user_id: string
  venue_id: string | null
  venue_name: string
  venue_type: string | null
  venue_img: string | null
  visited_at: string | null
  notes: string | null
  rating: number | null
  favorite_moment: string | null
  position: number
  created_at: string
}

export interface AdventureMember {
  id: string
  adventure_id: string
  user_id: string
  name: string | null
  avatar_url: string | null
  joined_at: string
}

export interface AdventureDetail extends Adventure {
  venues: AdventureVenue[]
  members: AdventureMember[]
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
  | 'karaoke'
