/** Haversine distance between two lat/lng points. Returns miles. */
export function haversineMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Format miles → "0.3 mi" or "1.2 mi" */
export function formatMiles(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi'
  return `${miles.toFixed(1)} mi`
}
