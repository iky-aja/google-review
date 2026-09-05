interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory tracker for credential login attempts
const rateLimitTracker = new Map<string, RateLimitRecord>();

/**
 * Checks and updates rate limit for a specific identifier (e.g., email address).
 * Defaults to max 5 attempts per 15-minute window.
 */
export function checkLoginRateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const normalizedKey = key.trim().toLowerCase();
  const record = rateLimitTracker.get(normalizedKey);

  // Reset or initialize window if expired or non-existent
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    rateLimitTracker.set(normalizedKey, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  // Limit exceeded
  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment attempt counter
  record.count += 1;
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
}
