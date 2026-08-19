/**
 * Lat/lng coordinates for Austin featured venues.
 * Keyed by venue id. Used to calculate live distance from user location.
 */
export const VENUE_COORDS: Record<string, { lat: number; lng: number }> = {
  // ── Restaurants ───────────────────────────────────
  'feat-1':  { lat: 30.2684, lng: -97.7207 }, // Suerte
  'feat-2':  { lat: 30.2695, lng: -97.7433 }, // Hestia
  'feat-3':  { lat: 30.2638, lng: -97.7558 }, // Uchi Austin
  'feat-4':  { lat: 30.2631, lng: -97.7195 }, // Este
  'feat-10': { lat: 30.2553, lng: -97.7478 }, // Ramen del Barrio
  'feat-14': { lat: 30.2697, lng: -97.7523 }, // ABA
  'feat-16': { lat: 30.2671, lng: -97.7447 }, // ATX Cocina
  'feat-17': { lat: 30.2289, lng: -97.7629 }, // Taqueria 10/10
  'feat-18': { lat: 30.2605, lng: -97.7106 }, // Veracruz Tacos
  'feat-25': { lat: 30.2525, lng: -97.7471 }, // All Day Pizza
  'feat-26': { lat: 30.2512, lng: -97.7506 }, // Home Slice Pizza
  // Franklin BBQ
  'feat-33': { lat: 30.2671, lng: -97.7447 }, // Comedor
  'feat-36': { lat: 30.2697, lng: -97.7447 }, // Juniper
  'feat-82': { lat: 30.2698, lng: -97.7432 }, // Emmer & Rye
  'feat-93': { lat: 30.2586, lng: -97.7561 }, // Odd Duck
  // ── Bars ─────────────────────────────────────────
  'feat-5':  { lat: 30.2608, lng: -97.7186 }, // Whisler's
  'feat-6':  { lat: 30.2610, lng: -97.7180 }, // Powder Room
  'feat-7':  { lat: 30.2608, lng: -97.7182 }, // Mother Ruin
  'feat-8':  { lat: 30.2605, lng: -97.7183 }, // Hotel Vegas
  'feat-9':  { lat: 30.2618, lng: -97.7198 }, // Latchkey
  'feat-11': { lat: 30.2673, lng: -97.7456 }, // Lucky Duck
  'feat-12': { lat: 30.2447, lng: -97.7713 }, // In Cahoots
  'feat-20': { lat: 30.2618, lng: -97.7198 }, // Chalmers
  'feat-23': { lat: 30.2608, lng: -97.7186 }, // Devil May Care
  'feat-27': { lat: 30.2618, lng: -97.7198 }, // The Well
  'feat-28': { lat: 30.2688, lng: -97.7467 }, // The Roosevelt Room
  // ── Olamaie, Barley Swine ─────────────────────────
  'feat-38': { lat: 30.2739, lng: -97.7468 }, // Olamaie
  'feat-40': { lat: 30.2555, lng: -97.7952 }, // Barley Swine
  // ── Coffee ───────────────────────────────────────
  'feat-19': { lat: 30.2611, lng: -97.7143 }, // Desnudo Coffee
}
