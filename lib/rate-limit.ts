import { kv } from '@vercel/kv'

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  blocked?: boolean
}

/**
 * Rate limiter using Vercel KV with exponential backoff
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limit - Maximum number of attempts in the window
 * @param windowSeconds - Time window in seconds
 * @returns RateLimitResult with success status and remaining attempts
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`
  const blockKey = `rate_limit:block:${identifier}`

  try {
    // Check if IP is blocked (too many failed attempts)
    const isBlocked = await kv.get(blockKey)
    if (isBlocked) {
      const ttl = await kv.ttl(blockKey)
      return {
        success: false,
        remaining: 0,
        resetAt: Date.now() + (ttl * 1000),
        blocked: true
      }
    }

    // Get current attempt count
    const current = await kv.get<number>(key) || 0
    const resetAt = Date.now() + (windowSeconds * 1000)

    // Check if limit exceeded
    if (current >= limit) {
      return {
        success: false,
        remaining: 0,
        resetAt
      }
    }

    // Increment counter with expiration
    const newCount = current + 1
    await kv.setex(key, windowSeconds, newCount)

    return {
      success: true,
      remaining: limit - newCount,
      resetAt
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow request if rate limiting system is down
    return {
      success: true,
      remaining: limit,
      resetAt: Date.now() + (windowSeconds * 1000)
    }
  }
}

/**
 * Track failed note retrieval attempts and block after threshold
 *
 * @param identifier - Unique identifier (IP address)
 * @param threshold - Number of failures before blocking (default: 100)
 * @param blockDurationSeconds - How long to block (default: 24 hours)
 */
export async function trackFailedAttempt(
  identifier: string,
  threshold: number = 100,
  blockDurationSeconds: number = 86400 // 24 hours
): Promise<void> {
  const failKey = `rate_limit:fails:${identifier}`
  const blockKey = `rate_limit:block:${identifier}`

  try {
    // Increment failure count (24 hour window)
    const failures = (await kv.get<number>(failKey) || 0) + 1
    await kv.setex(failKey, 86400, failures)

    // Block if threshold exceeded
    if (failures >= threshold) {
      await kv.setex(blockKey, blockDurationSeconds, true)
      console.warn(`IP ${identifier} blocked after ${failures} failed attempts`)
    }
  } catch (error) {
    console.error('Failed attempt tracking error:', error)
  }
}

/**
 * Reset failure counter (called on successful retrieval)
 */
export async function resetFailedAttempts(identifier: string): Promise<void> {
  const failKey = `rate_limit:fails:${identifier}`
  try {
    await kv.del(failKey)
  } catch (error) {
    console.error('Reset failed attempts error:', error)
  }
}

/**
 * Get client IP from request headers
 * Supports Vercel's forwarded headers
 */
export function getClientIp(request: Request): string {
  // Check Vercel-specific headers first
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0].trim()
  }

  // Fallback headers
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Last resort - use a generic identifier
  // In production on Vercel, you should always have x-forwarded-for
  return 'unknown'
}
