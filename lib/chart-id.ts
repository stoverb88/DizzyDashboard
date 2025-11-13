/**
 * Generate secure, collision-resistant chart IDs
 *
 * Format: 8 alphanumeric characters (uppercase)
 * Character set: A-Z, 2-9 (excluding 0, 1, O, I for readability)
 * Possible combinations: 32^8 = 1,099,511,627,776 (1+ trillion)
 *
 * Examples: A3X9K2M7, P5Q1R8S4, B6C7D8E9
 */

// Character set excluding confusing characters (0, 1, O, I)
// This improves readability and reduces transcription errors
const CHARS = '234567892ABCDEFGHJKLMNPQRSTUVWXYZ'
const CHART_ID_LENGTH = 8

/**
 * Generate a cryptographically random chart ID
 */
export function generateChartId(): string {
  // Use crypto.getRandomValues for better randomness than Math.random()
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(CHART_ID_LENGTH)
    crypto.getRandomValues(array)

    return Array.from(array)
      .map(byte => CHARS[byte % CHARS.length])
      .join('')
  }

  // Fallback for environments without crypto (shouldn't happen in modern browsers/Node)
  return Array.from({ length: CHART_ID_LENGTH }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

/**
 * Validate chart ID format
 *
 * @param chartId - The chart ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidChartId(chartId: string): boolean {
  if (!chartId || typeof chartId !== 'string') {
    return false
  }

  const normalized = chartId.toUpperCase().trim()

  // Check length
  if (normalized.length !== CHART_ID_LENGTH) {
    return false
  }

  // Check all characters are valid
  return Array.from(normalized).every(char => CHARS.includes(char))
}

/**
 * Format chart ID with optional hyphen grouping for display
 * Example: A3X9K2M7 -> A3X9-K2M7
 *
 * @param chartId - The chart ID to format
 * @param useHyphens - Whether to insert hyphens (default: false)
 * @returns Formatted chart ID
 */
export function formatChartId(chartId: string, useHyphens: boolean = false): string {
  const normalized = chartId.toUpperCase().trim()

  if (!useHyphens || normalized.length !== CHART_ID_LENGTH) {
    return normalized
  }

  // Split into groups of 4: A3X9-K2M7
  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`
}

/**
 * Normalize chart ID (remove hyphens, spaces, convert to uppercase)
 *
 * @param chartId - The chart ID to normalize
 * @returns Normalized chart ID
 */
export function normalizeChartId(chartId: string): string {
  if (!chartId || typeof chartId !== 'string') {
    return ''
  }

  return chartId
    .toUpperCase()
    .replace(/[-\s]/g, '') // Remove hyphens and spaces
    .trim()
}

/**
 * Calculate collision probability
 * With 1 trillion possible IDs and 72-hour retention:
 * - 1,000 notes/day = ~3,000 active notes = 0.0000027% collision chance
 * - 10,000 notes/day = ~30,000 active notes = 0.000027% collision chance
 * - 100,000 notes/day = ~300,000 active notes = 0.00027% collision chance
 */
export function getCollisionStats() {
  const totalCombinations = Math.pow(CHARS.length, CHART_ID_LENGTH)
  const retentionHours = 72

  return {
    totalCombinations,
    retentionHours,
    estimatedCollisionAt1kPerDay: (3000 / totalCombinations * 100).toFixed(10),
    estimatedCollisionAt10kPerDay: (30000 / totalCombinations * 100).toFixed(10),
    estimatedCollisionAt100kPerDay: (300000 / totalCombinations * 100).toFixed(10)
  }
}
