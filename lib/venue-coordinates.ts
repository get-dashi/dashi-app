/**
 * Lat/lng coordinates for all Austin + other-city featured venues.
 * Keyed by venue id. Used for live Haversine distance calculation.
 */
export const VENUE_COORDS: Record<string, { lat: number; lng: number }> = {

  // ── Austin: Restaurants ───────────────────────────────────────────────────
  'feat-1':  { lat: 30.2684, lng: -97.7207 }, // Suerte — East Austin
  'feat-2':  { lat: 30.2695, lng: -97.7433 }, // Hestia — Downtown
  'feat-3':  { lat: 30.2638, lng: -97.7558 }, // Uchi Austin — South Lamar
  'feat-4':  { lat: 30.2631, lng: -97.7195 }, // Este — East Austin
  'feat-10': { lat: 30.2489, lng: -97.7485 }, // Ramen del Barrio — SoCo
  'feat-14': { lat: 30.2697, lng: -97.7523 }, // ABA — West 6th
  'feat-16': { lat: 30.2671, lng: -97.7447 }, // ATX Cocina — Downtown
  'feat-17': { lat: 30.2289, lng: -97.7629 }, // Taqueria 10/10 — South Austin
  'feat-18': { lat: 30.2986, lng: -97.7095 }, // Veracruz Tacos — Mueller
  'feat-21': { lat: 30.2240, lng: -97.7640 }, // Discada Tacos — South Austin
  'feat-25': { lat: 30.2508, lng: -97.7471 }, // All Day Pizza — SoCo
  'feat-26': { lat: 30.2512, lng: -97.7506 }, // Home Slice Pizza — SoCo
  'feat-29': { lat: 30.2591, lng: -97.7200 }, // La Barbecue — East Austin
  'feat-30': { lat: 30.2625, lng: -97.7195 }, // Santa Barbacha — East Austin
  'feat-31': { lat: 30.2697, lng: -97.7218 }, // Franklin Barbecue — East Austin
  'feat-33': { lat: 30.2671, lng: -97.7447 }, // Comedor — Downtown
  'feat-34': { lat: 30.2615, lng: -97.7190 }, // Tenten — East 6th
  'feat-35': { lat: 30.2625, lng: -97.7200 }, // Ember Kitchen — East Austin
  'feat-36': { lat: 30.2697, lng: -97.7447 }, // Juniper — Downtown
  'feat-37': { lat: 30.2691, lng: -97.7447 }, // Carve — Downtown
  'feat-38': { lat: 30.2697, lng: -97.7523 }, // BOA Steakhouse — West 6th
  'feat-52': { lat: 30.2247, lng: -97.7782 }, // Interstellar BBQ — South Austin
  'feat-58': { lat: 30.2618, lng: -97.7198 }, // Sammie's — East Austin
  'feat-61': { lat: 30.2631, lng: -97.7200 }, // Canje — East Austin
  'feat-62': { lat: 30.2616, lng: -97.7188 }, // La Holy — East 6th
  'feat-67': { lat: 30.2583, lng: -97.7551 }, // Eberly — South Lamar
  'feat-69': { lat: 30.3088, lng: -97.7533 }, // Fonda San Miguel — North Lamar
  'feat-80': { lat: 30.2645, lng: -97.7202 }, // Justine's Brasserie — East Austin
  'feat-82': { lat: 30.2698, lng: -97.7432 }, // Emmer & Rye — Downtown
  'feat-84': { lat: 30.2695, lng: -97.7452 }, // Italic — Downtown
  'feat-86': { lat: 30.3126, lng: -97.7209 }, // Contigo — North Loop
  'feat-87': { lat: 30.2631, lng: -97.7200 }, // Bufalina — East Austin
  'feat-90': { lat: 30.2631, lng: -97.7195 }, // Henbit — East Austin
  'feat-92': { lat: 30.2659, lng: -97.7447 }, // Wu Chow — Downtown
  'feat-93': { lat: 30.2586, lng: -97.7561 }, // Odd Duck — South Lamar
  'feat-94': { lat: 30.2531, lng: -97.7625 }, // Loro — South Lamar
  'feat-108': { lat: 30.2631, lng: -97.7200 }, // Launderette — East Austin
  'feat-109': { lat: 30.2583, lng: -97.7551 }, // Eberly (dup)
  'feat-110': { lat: 30.2671, lng: -97.7447 }, // Comedor (dup)
  'feat-111': { lat: 30.2739, lng: -97.7468 }, // Olamaie — Old Enfield
  'feat-113': { lat: 30.2612, lng: -97.7187 }, // Bar Peached — East 6th
  'feat-114': { lat: 30.2636, lng: -97.7195 }, // Sushi Junai — East Austin
  'feat-116': { lat: 30.2698, lng: -97.7432 }, // Emmer & Rye (dup)
  'feat-117': { lat: 30.2631, lng: -97.7200 }, // Canje (dup)
  'feat-119': { lat: 30.3088, lng: -97.7533 }, // Fonda San Miguel (dup)
  'feat-120': { lat: 30.2671, lng: -97.7452 }, // Fixe Southern House — Downtown
  'feat-122': { lat: 30.2491, lng: -97.7576 }, // Lenoir — South Lamar
  'feat-123': { lat: 30.3742, lng: -97.9155 }, // Oasis on Lake Travis
  'feat-124': { lat: 30.2512, lng: -97.7503 }, // El Alma — SoCo
  'feat-160': { lat: 30.2631, lng: -97.7200 }, // Fish Shop — East Austin
  'feat-163': { lat: 30.2625, lng: -97.7185 }, // San Gines — East 6th
  'feat-166': { lat: 30.2631, lng: -97.7195 }, // Eat Industry East — East Austin
  'feat-167': { lat: 30.2631, lng: -97.7186 }, // Sourduck Market — East Austin
  'feat-168': { lat: 30.2872, lng: -97.7168 }, // Quality Seafood — North Austin
  'feat-169': { lat: 30.2625, lng: -97.7200 }, // Casa Bianca ATX — East Austin

  // ── Austin: Bars ─────────────────────────────────────────────────────────
  'feat-5':  { lat: 30.2608, lng: -97.7186 }, // Whisler's — East 6th
  'feat-6':  { lat: 30.2610, lng: -97.7180 }, // Powder Room — East 6th
  'feat-7':  { lat: 30.2608, lng: -97.7182 }, // Mother Ruin — East 6th
  'feat-8':  { lat: 30.2605, lng: -97.7183 }, // Hotel Vegas — East 6th
  'feat-9':  { lat: 30.2618, lng: -97.7198 }, // Latchkey — East Austin
  'feat-11': { lat: 30.2673, lng: -97.7456 }, // Lucky Duck — Downtown
  'feat-12': { lat: 30.2447, lng: -97.7713 }, // In Cahoots — South Austin
  'feat-13': { lat: 30.2618, lng: -97.7198 }, // Fox Den — East Austin
  'feat-20': { lat: 30.2608, lng: -97.7178 }, // Chalmers — East 6th
  'feat-22': { lat: 30.2615, lng: -97.7185 }, // Twins Club — East 6th
  'feat-23': { lat: 30.2612, lng: -97.7186 }, // Devil May Care — East 6th
  'feat-24': { lat: 30.2608, lng: -97.7183 }, // Cock Fight — East 6th
  'feat-27': { lat: 30.2610, lng: -97.7182 }, // The Well — East 6th
  'feat-28': { lat: 30.2688, lng: -97.7467 }, // The Roosevelt Room — Downtown
  'feat-32': { lat: 30.2616, lng: -97.7189 }, // Nickel City — East 6th
  'feat-39': { lat: 30.2625, lng: -97.7195 }, // The Guest House — East Austin
  'feat-40': { lat: 30.2608, lng: -97.7183 }, // Codependent — East 6th
  'feat-41': { lat: 30.2695, lng: -97.7452 }, // The Kitchen — Downtown
  'feat-42': { lat: 30.2620, lng: -97.7190 }, // Here Not There — East 6th
  'feat-43': { lat: 30.2695, lng: -97.7452 }, // Garage — Downtown
  'feat-45': { lat: 30.2612, lng: -97.7186 }, // Small Victory — East 6th
  'feat-46': { lat: 30.2673, lng: -97.7456 }, // Lucky Duck Speakeasy — Downtown
  'feat-47': { lat: 30.2625, lng: -97.7195 }, // Milonga Room — East Austin
  'feat-48': { lat: 30.2625, lng: -97.7200 }, // Water Trade — East Austin
  'feat-49': { lat: 30.2691, lng: -97.7447 }, // P6 Rooftop — Downtown
  'feat-50': { lat: 30.2620, lng: -97.7188 }, // Half Step — East 6th
  'feat-51': { lat: 30.2659, lng: -97.7407 }, // Anthem — Red River
  'feat-53': { lat: 30.2612, lng: -97.7187 }, // White Horse — East 6th
  'feat-54': { lat: 30.2625, lng: -97.7195 }, // The Betty — East Austin
  'feat-55': { lat: 30.2620, lng: -97.7190 }, // Rustic Tap — East Austin
  'feat-57': { lat: 30.2691, lng: -97.7447 }, // Red Ash — Downtown
  'feat-59': { lat: 30.2620, lng: -97.7188 }, // The Flower Shop — East 6th
  'feat-60': { lat: 30.2608, lng: -97.7182 }, // Mother's Ruin — East 6th
  'feat-63': { lat: 30.2625, lng: -97.7195 }, // Mama's Dearest — East Austin
  'feat-64': { lat: 30.2625, lng: -97.7195 }, // De Nada — East Austin
  'feat-65': { lat: 30.2568, lng: -97.7144 }, // Central Machine Works — East Austin
  'feat-66': { lat: 30.2625, lng: -97.7200 }, // Cedar Tavern — East Austin
  'feat-68': { lat: 30.2697, lng: -97.7452 }, // Goldie's Sunken Bar — Downtown
  'feat-70': { lat: 30.2695, lng: -97.7452 }, // Armadillo Den — Downtown
  'feat-71': { lat: 30.2664, lng: -97.7452 }, // Elephant Room — Downtown
  'feat-72': { lat: 30.2659, lng: -97.7407 }, // Midnight Cowboy — 6th Street
  'feat-73': { lat: 30.2620, lng: -97.7190 }, // La Mezca — East 6th
  'feat-74': { lat: 30.2625, lng: -97.7195 }, // Parley — East Austin
  'feat-75': { lat: 30.2703, lng: -97.7482 }, // Peche — Downtown
  'feat-76': { lat: 30.2620, lng: -97.7188 }, // Death Rabbit — East 6th
  'feat-77': { lat: 30.2625, lng: -97.7195 }, // Kitty Cohen's — East Austin
  'feat-78': { lat: 30.2568, lng: -97.7181 }, // Lazarus Brewing — East Austin
  'feat-79': { lat: 30.2625, lng: -97.7200 }, // Violet Crown Social Club — East Austin
  'feat-81': { lat: 30.2625, lng: -97.7188 }, // Little Brother — East 6th
  'feat-85': { lat: 30.2625, lng: -97.7195 }, // The Darwin — East Austin
  'feat-91': { lat: 30.2470, lng: -97.7668 }, // Zilker Brewing — South Austin
  'feat-95': { lat: 30.2659, lng: -97.7407 }, // The Parish — Red River
  'feat-96': { lat: 30.2876, lng: -97.7403 }, // Hole in the Wall — Guadalupe
  'feat-97': { lat: 30.2608, lng: -97.7178 }, // Chalmers (dup)
  'feat-98': { lat: 30.2695, lng: -97.7452 }, // Armadillo Den (dup)
  'feat-100': { lat: 30.2512, lng: -97.7506 }, // Black Sheep Lodge — SoCo
  'feat-102': { lat: 30.2695, lng: -97.7452 }, // Victory Lap — Downtown
  'feat-103': { lat: 30.2625, lng: -97.7195 }, // Parlor & Yard — East Austin
  'feat-104': { lat: 30.2691, lng: -97.7452 }, // Lavaca Street Bar — Downtown
  'feat-106': { lat: 30.4024, lng: -97.7332 }, // Culinary Dropout — Domain
  'feat-107': { lat: 30.2399, lng: -97.7687 }, // Bouldin Acres — South Austin
  'feat-126': { lat: 30.2612, lng: -97.7187 }, // The White Horse (dup)
  'feat-127': { lat: 30.2662, lng: -97.7378 }, // Barbarella — Red River
  'feat-128': { lat: 30.2659, lng: -97.7407 }, // Midnight Cowboy (dup)
  'feat-129': { lat: 30.2625, lng: -97.7200 }, // The Stay — East Austin
  'feat-131': { lat: 30.2703, lng: -97.7600 }, // Mean-Eyed Cat — West 5th
  'feat-132': { lat: 30.2870, lng: -97.7614 }, // Gibson Street Bar — Old Enfield
  'feat-133': { lat: 30.2616, lng: -97.7189 }, // Nickel City (dup)
  'feat-141': { lat: 30.2662, lng: -97.7378 }, // Empire Control Room — Red River
  'feat-145': { lat: 30.2625, lng: -97.7195 }, // Vigilante — East Austin
  'feat-146': { lat: 30.4003, lng: -97.7320 }, // Cover 3 — Domain
  'feat-147': { lat: 30.2625, lng: -97.7195 }, // The League — East Austin
  'feat-161': { lat: 30.2620, lng: -97.7188 }, // Nunya Bar — East 6th
  'feat-162': { lat: 30.2625, lng: -97.7195 }, // Hanghart — East Austin
  'feat-165': { lat: 30.2568, lng: -97.7183 }, // Saturn ATX — East Austin
  'feat-171': { lat: 30.2625, lng: -97.7195 }, // Electric Gravy — East Austin
  'feat-172': { lat: 30.2620, lng: -97.7188 }, // Schoolhouse Pub — East 6th
  'feat-174': { lat: 30.2661, lng: -97.7413 }, // The Driskill Bar — Downtown
  'feat-175': { lat: 30.2476, lng: -97.7504 }, // The Continental Club — SoCo
  'feat-177': { lat: 30.2691, lng: -97.7447 }, // Edge Rooftop — Downtown
  'feat-178': { lat: 30.2476, lng: -97.7504 }, // The Highball — SoCo
  'feat-180': { lat: 30.2620, lng: -97.7188 }, // The Common Interest — East 6th
  'feat-181': { lat: 30.2615, lng: -97.7189 }, // Outer Heaven — East Austin
  'feat-182': { lat: 30.2662, lng: -97.7378 }, // Swan Dive — Red River
  'feat-183': { lat: 30.2640, lng: -97.7195 }, // Punch Bowl Social — East Austin
  'feat-184': { lat: 30.2615, lng: -97.7189 }, // Hi Tunes Karaoke — East Austin
  'feat-185': { lat: 30.2620, lng: -97.7190 }, // Knomad Bar — East 6th

  // ── Austin: Coffee ───────────────────────────────────────────────────────
  'feat-15':  { lat: 30.2611, lng: -97.7143 }, // Cosmic — East Austin
  'feat-19':  { lat: 30.2611, lng: -97.7143 }, // Desnudo Coffee — East Austin
  'feat-134': { lat: 30.2399, lng: -97.7687 }, // Radio Coffee & Beer — South Austin
  'feat-135': { lat: 30.2608, lng: -97.7183 }, // Flat Track Coffee — East Austin
  'feat-136': { lat: 30.2859, lng: -97.7603 }, // Patika — West Austin
  'feat-137': { lat: 30.2631, lng: -97.7200 }, // Once Over Coffee Bar — East Austin
  'feat-138': { lat: 30.2697, lng: -97.7491 }, // Medici Roasting — 2nd Street
  'feat-139': { lat: 30.2399, lng: -97.7547 }, // Cosmic Coffee — South Congress
  'feat-148': { lat: 30.2476, lng: -97.7504 }, // Proud Mary Coffee — South Congress
  'feat-149': { lat: 30.2697, lng: -97.7467 }, // Houndstooth Coffee — Downtown
  'feat-150': { lat: 30.2280, lng: -97.7799 }, // Figure 8 Coffee — South Austin
  'feat-151': { lat: 30.2631, lng: -97.7144 }, // Merit Coffee — East Austin
  'feat-152': { lat: 30.2840, lng: -97.7614 }, // Better Half — West Austin
  'feat-154': { lat: 30.2620, lng: -97.7188 }, // Fleet Coffee — East 6th
  'feat-156': { lat: 30.2399, lng: -97.7547 }, // Civil Goat Coffee — South Austin
  'feat-157': { lat: 30.2625, lng: -97.7195 }, // A Hole Coffee — East Austin
  'feat-158': { lat: 30.2631, lng: -97.7200 }, // Dear Diary Coffee — East Austin
  'feat-159': { lat: 30.2697, lng: -97.7491 }, // La La Land Kind Cafe — Downtown
}
