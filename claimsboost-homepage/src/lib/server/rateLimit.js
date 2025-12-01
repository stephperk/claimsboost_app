/**
 * Simple in-memory rate limiter for API endpoints
 *
 * Uses a sliding window algorithm to track requests per IP address.
 * For production at scale, consider Redis-based rate limiting.
 */

// Store for tracking requests: Map<ip, Array<timestamp>>
const requestLog = new Map();

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
	const now = Date.now();
	const fiveMinutesAgo = now - (5 * 60 * 1000);

	for (const [ip, timestamps] of requestLog.entries()) {
		// Remove timestamps older than 5 minutes
		const recentTimestamps = timestamps.filter(ts => ts > fiveMinutesAgo);

		if (recentTimestamps.length === 0) {
			requestLog.delete(ip);
		} else {
			requestLog.set(ip, recentTimestamps);
		}
	}
}, 5 * 60 * 1000); // Run every 5 minutes

/**
 * Rate limit configuration per endpoint
 */
const rateLimits = {
	// Expensive endpoints (costs money)
	'/api/geocode': { requests: 10, window: 60 * 1000 }, // 10 requests per minute
	'/api/law-firms/search-semantic': { requests: 20, window: 60 * 1000 }, // 20 per minute

	// Standard endpoints
	'/api/law-firms/search': { requests: 30, window: 60 * 1000 }, // 30 per minute
	'/api/law-firms/nearby': { requests: 30, window: 60 * 1000 }, // 30 per minute
	'/api/law-firms/by-slug': { requests: 60, window: 60 * 1000 }, // 60 per minute

	// Low-cost endpoints
	'/api/settlements/recent': { requests: 60, window: 60 * 1000 }, // 60 per minute
	'/api/settlements/by-firm': { requests: 60, window: 60 * 1000 }, // 60 per minute
	'/api/geolocation': { requests: 10, window: 60 * 1000 }, // 10 per minute (cached anyway)

	// Default for all other endpoints
	'default': { requests: 30, window: 60 * 1000 } // 30 per minute
};

/**
 * Check if a request should be rate limited
 *
 * @param {string} ip - Client IP address
 * @param {string} endpoint - API endpoint path
 * @returns {{ allowed: boolean, limit: number, remaining: number, resetTime: number }}
 */
export function checkRateLimit(ip, endpoint) {
	// Get rate limit config for this endpoint
	const config = rateLimits[endpoint] || rateLimits.default;
	const { requests: maxRequests, window } = config;

	const now = Date.now();
	const windowStart = now - window;

	// Get or create request log for this IP
	if (!requestLog.has(ip)) {
		requestLog.set(ip, []);
	}

	const timestamps = requestLog.get(ip);

	// Filter out requests outside the current window
	const recentRequests = timestamps.filter(ts => ts > windowStart);

	// Check if limit exceeded
	const allowed = recentRequests.length < maxRequests;
	const remaining = Math.max(0, maxRequests - recentRequests.length);
	const resetTime = recentRequests.length > 0
		? Math.ceil((recentRequests[0] + window) / 1000)
		: Math.ceil((now + window) / 1000);

	if (allowed) {
		// Add current request timestamp
		recentRequests.push(now);
		requestLog.set(ip, recentRequests);
	}

	return {
		allowed,
		limit: maxRequests,
		remaining: allowed ? remaining - 1 : 0,
		resetTime
	};
}

/**
 * Create a rate limit response with proper headers
 *
 * @param {number} limit - Maximum requests allowed
 * @param {number} remaining - Remaining requests
 * @param {number} resetTime - Unix timestamp when limit resets
 * @returns {Response}
 */
export function createRateLimitResponse(limit, remaining, resetTime) {
	return new Response(
		JSON.stringify({
			error: 'Rate limit exceeded',
			message: 'Too many requests. Please try again later.',
			limit,
			remaining: 0,
			resetTime
		}),
		{
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				'X-RateLimit-Limit': limit.toString(),
				'X-RateLimit-Remaining': '0',
				'X-RateLimit-Reset': resetTime.toString(),
				'Retry-After': (resetTime - Math.floor(Date.now() / 1000)).toString()
			}
		}
	);
}
