/**
 * Lightweight in-memory rate limiter for Vercel Serverless Functions.
 *
 * Each function invocation may run in a fresh execution context, so this is
 * "best-effort" per-instance — it won't catch distributed abuse, but it does
 * protect against burst usage from a single client within one warm instance.
 *
 * For production, replace with Upstash Redis + @upstash/ratelimit.
 */

/** @type {Map<string, { count: number; windowStart: number }>} */
const store = new Map();

/**
 * Check whether the caller identified by `key` has exceeded the quota.
 *
 * @param {string}  key           – identifier (IP address or user id)
 * @param {number}  maxRequests   – allowed requests per window
 * @param {number}  windowMs      – window duration in milliseconds
 * @returns {{ allowed: boolean; remaining: number; resetAt: number }}
 */
export function checkRateLimit(key, maxRequests = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetAt = entry.windowStart + windowMs;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt };
  }

  return { allowed: true, remaining, resetAt };
}

/**
 * Extract the best available IP from a Vercel request object.
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}
