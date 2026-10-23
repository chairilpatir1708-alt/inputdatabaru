/**
 * Rate limiting utility for login attempts
 * Limits to 5 attempts per 15 minutes per IP address
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory storage for rate limiting
// Key: IP address, Value: attempt count and reset timestamp
const attempts = new Map<string, RateLimitEntry>()

// Configuration
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes in milliseconds

/**
 * Check if an IP address has exceeded the rate limit
 * Also cleans up expired entries
 * 
 * @param ip - IP address to check
 * @returns Object with allowed status and remaining attempts
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  
  // Clean up expired entries for all IPs
  for (const [key, entry] of attempts.entries()) {
    if (now > entry.resetAt) {
      attempts.delete(key)
    }
  }
  
  // Get current entry for this IP
  const entry = attempts.get(ip)
  
  // No entry or expired entry means allowed
  if (!entry || now > entry.resetAt) {
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS,
    }
  }
  
  // Check if limit exceeded
  const allowed = entry.count < MAX_ATTEMPTS
  const remaining = Math.max(0, MAX_ATTEMPTS - entry.count)
  
  return {
    allowed,
    remaining,
  }
}

/**
 * Increment the attempt counter for an IP address
 * Creates a new entry if one doesn't exist
 * 
 * @param ip - IP address to increment
 */
export function incrementAttempts(ip: string): void {
  const now = Date.now()
  const entry = attempts.get(ip)
  
  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })
    return
  }
  
  // Increment existing entry
  entry.count += 1
}

/**
 * Reset attempts for an IP address (called on successful login)
 * 
 * @param ip - IP address to reset
 */
export function resetAttempts(ip: string): void {
  attempts.delete(ip)
}
