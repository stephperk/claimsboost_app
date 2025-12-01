import { checkRateLimit, createRateLimitResponse } from '$lib/server/rateLimit';
import { dev } from '$app/environment';

/**
 * SvelteKit server hooks - runs on every request
 *
 * Implements rate limiting for API endpoints
 */
export async function handle({ event, resolve }) {
	const { url, getClientAddress } = event;

	// Only apply rate limiting to API endpoints
	if (url.pathname.startsWith('/api/')) {
		// Skip rate limiting in development mode
		if (!dev) {
			const ip = getClientAddress();
			const endpoint = url.pathname;

			// Check rate limit
			const { allowed, limit, remaining, resetTime } = checkRateLimit(ip, endpoint);

			if (!allowed) {
				console.warn(`[Rate Limit] Blocked request from ${ip} to ${endpoint}`);
				return createRateLimitResponse(limit, remaining, resetTime);
			}

			// Add rate limit headers to successful responses
			const response = await resolve(event);

			// Clone response to add headers
			const headers = new Headers(response.headers);
			headers.set('X-RateLimit-Limit', limit.toString());
			headers.set('X-RateLimit-Remaining', remaining.toString());
			headers.set('X-RateLimit-Reset', resetTime.toString());

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers
			});
		}
	}

	// For non-API routes or dev mode, proceed normally
	return resolve(event);
}
