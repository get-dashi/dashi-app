import type { Venue } from './types'

export const AFFILIATE_TAGS = {
  opentable: 'dashi', // replace with real affiliate tag after applying
  resy: 'dashi',      // replace with real affiliate tag
}

export function getBookingUrl(venue: Venue, partySize = 2): string | null {
  const { bookingPlatform, bookingId, bookingPhone } = venue
  const date = new Date()
  date.setHours(20, 0, 0, 0) // default 8pm tonight
  const dateStr = date.toISOString().slice(0, 16)

  switch (bookingPlatform) {
    case 'opentable':
      if (!bookingId) return null
      return `https://www.opentable.com/r/${bookingId}?covers=${partySize}&dateTime=${dateStr}&ref=${AFFILIATE_TAGS.opentable}`

    case 'resy':
      if (!bookingId) return null
      return `https://resy.com/cities/${getResyCity(venue.city ?? 'austin')}/venues/${bookingId}?date=${dateStr.slice(0, 10)}&seats=${partySize}&affiliateId=${AFFILIATE_TAGS.resy}`

    case 'sevenrooms':
      if (!bookingId) return null
      return `https://www.sevenrooms.com/reservations/${bookingId}`

    case 'whatsapp': {
      if (!bookingPhone) return null
      const msg = encodeURIComponent(
        `Hola, me gustaría hacer una reservación en ${venue.name} para ${partySize} personas esta noche.`
      )
      return `https://wa.me/${bookingPhone.replace(/\D/g, '')}?text=${msg}`
    }

    case 'phone':
      if (!bookingPhone) return null
      return `tel:${bookingPhone}`

    default:
      return null
  }
}

function getResyCity(city: string): string {
  const map: Record<string, string> = {
    austin: 'aus',
    atlanta: 'atl',
    monterrey: 'mty',
  }
  return map[city] ?? 'aus'
}

export function getBookingLabel(platform: Venue['bookingPlatform']): string {
  switch (platform) {
    case 'opentable':  return 'Book on OpenTable'
    case 'resy':       return 'Book on Resy'
    case 'sevenrooms': return 'Reserve via SevenRooms'
    case 'whatsapp':   return 'Reserve on WhatsApp'
    case 'phone':      return 'Call to Reserve'
    default:           return 'Check Availability'
  }
}

export function getBookingColor(platform: Venue['bookingPlatform']): string {
  switch (platform) {
    case 'opentable':  return '#DA3743'  // OpenTable red
    case 'resy':       return '#E84B37'  // Resy red-orange
    case 'sevenrooms': return '#1a1a2e'  // SevenRooms dark
    case 'whatsapp':   return '#25D366'  // WhatsApp green
    case 'phone':      return '#a855f7'  // purple (Dashi)
    default:           return '#a855f7'
  }
}
