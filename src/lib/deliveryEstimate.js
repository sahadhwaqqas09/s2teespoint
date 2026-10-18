/**
 * lib/deliveryEstimate.js
 *
 * Simple zone-based delivery charge estimator.
 * No external API. No membership required.
 * Based on standard courier zones from Ayanavaram, Chennai - 600023.
 *
 * Zones (from S2 Teespoint origin):
 *   Zone A — Chennai local     → ₹40,  1-2 days
 *   Zone B — Tamil Nadu        → ₹60,  2-4 days
 *   Zone C — South India       → ₹80,  3-5 days
 *   Zone D — Metro cities      → ₹90,  4-6 days
 *   Zone E — Rest of India     → ₹110, 5-7 days
 *   Zone F — Northeast / J&K   → ₹150, 7-10 days
 */

// All valid 6-digit Indian pincodes start with digits 1–8
const VALID_PINCODE_RE = /^[1-8]\d{5}$/

// Tamil Nadu pincode prefixes (3-digit)
const TN_PREFIXES = new Set([
  '600','601','602','603','604','605','606','607','608','609',
  '610','611','612','613','614','615','616','617','618','619',
  '620','621','622','623','624','625','626','627','628','629',
  '630','631','632','633','634','635','636','637','638','639',
  '641','642','643','644','645','646','647','648','649',
])

// South India 2-digit prefixes (Kerala, Karnataka, AP, Telangana, Goa)
const SOUTH_PREFIXES_2 = new Set(['67','68','69','57','58','59','50','51','52','53','40'])

// Northeast & J&K 2-digit prefixes
const NORTHEAST_PREFIXES = new Set(['79','78','77','76','74','19'])

// Major metro 2-digit prefixes (Delhi, Mumbai, Kolkata, Hyderabad, Pune, Ahmedabad, Bangalore)
const METRO_PREFIXES_2 = new Set([
  '11','10',  // Delhi NCR
  '40','41',  // Mumbai / Pune
  '70','71',  // Kolkata
  '50',       // Hyderabad
  '38','39',  // Ahmedabad
  '56','56',  // Bengaluru (same as South, covered)
])

export function estimateDelivery(pincode) {
  const p = String(pincode).trim()

  if (!VALID_PINCODE_RE.test(p)) {
    return { valid: false, serviceable: false }
  }

  const pre3 = p.slice(0, 3)
  const pre2 = p.slice(0, 2)

  // Zone A — Chennai local
  if (pre3 === '600') {
    return { valid: true, serviceable: true, charge: 40, days: '1-2', zone: 'Chennai Local' }
  }

  // Zone B — Tamil Nadu (excluding Chennai 600xxx already caught above)
  if (TN_PREFIXES.has(pre3)) {
    return { valid: true, serviceable: true, charge: 60, days: '2-4', zone: 'Tamil Nadu' }
  }

  // Zone F — Northeast India & J&K (check before metro to avoid overlap)
  if (NORTHEAST_PREFIXES.has(pre2)) {
    return { valid: true, serviceable: true, charge: 150, days: '7-10', zone: 'Northeast / J&K' }
  }

  // Zone D — Metro cities
  if (METRO_PREFIXES_2.has(pre2)) {
    return { valid: true, serviceable: true, charge: 90, days: '4-6', zone: 'Metro City' }
  }

  // Zone C — South India (Kerala, Karnataka, AP, Telangana, Goa)
  if (SOUTH_PREFIXES_2.has(pre2)) {
    return { valid: true, serviceable: true, charge: 80, days: '3-5', zone: 'South India' }
  }

  // Zone E — Rest of India (all remaining valid pincodes)
  return { valid: true, serviceable: true, charge: 110, days: '5-7', zone: 'Rest of India' }
}
