import { json } from '@sveltejs/kit';
import { WebServiceClient } from '@maxmind/geoip2-node';
import { MAXMIND_ACCOUNT_ID, MAXMIND_LICENSE_KEY } from '$env/static/private';

export async function GET({ request, cookies }) {
	// Check for existing cookie first
	const existingLocation = cookies.get('user_location');
	if (existingLocation) {
		try {
			const parsedLocation = JSON.parse(existingLocation);
			return json(parsedLocation);
		} catch (e) {
			// Invalid cookie, continue to fetch fresh data
			cookies.delete('user_location', { path: '/' });
		}
	}

	// Extract user IP from request headers
	const forwardedFor = request.headers.get('x-forwarded-for');
	const realIp = request.headers.get('x-real-ip');

	// Get the first IP from x-forwarded-for (in case of multiple proxies)
	let clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp;

	// For local development and ngrok with Sandbox, use a test US IP from MaxMind test data
	// Test IP: 216.160.83.56 is in the MaxMind Sandbox test data
	// Note: ngrok IPs (like 24.199.203.50) are not in Sandbox database, so we use test IP
	if (!clientIp ||
	    clientIp === '127.0.0.1' ||
	    clientIp === '::1' ||
	    clientIp.startsWith('192.168.') ||
	    clientIp.startsWith('24.199.')) { // ngrok IPs
		console.log('[Geolocation] Local/private/ngrok IP detected, using test IP for Sandbox');
		clientIp = '216.160.83.56'; // MaxMind Sandbox test IP
	}

	try {
		// Validate environment variables
		if (!MAXMIND_ACCOUNT_ID || !MAXMIND_LICENSE_KEY ||
		    MAXMIND_ACCOUNT_ID === 'your_account_id_here' ||
		    MAXMIND_LICENSE_KEY === 'your_license_key_here') {
			console.error('[Geolocation] MaxMind credentials not configured');
			return json({ hasLocation: false });
		}

		// Initialize MaxMind client with Sandbox host
		const client = new WebServiceClient(MAXMIND_ACCOUNT_ID, MAXMIND_LICENSE_KEY, {
			host: 'sandbox.maxmind.com'
		});

		console.log(`[Geolocation] Querying MaxMind Sandbox for IP: ${clientIp}`);

		// Query MaxMind GeoIP City API (Sandbox)
		const response = await client.city(clientIp);

		// Check if location is in the United States
		if (response.country.isoCode !== 'US') {
			console.log(`[Geolocation] Non-US location detected: ${response.country.isoCode}`);
			return json({ hasLocation: false });
		}

		// Extract city, state, and coordinates
		const city = response.city?.names?.en;
		const state = response.subdivisions?.[0]?.isoCode;
		const latitude = response.location?.latitude;
		const longitude = response.location?.longitude;

		if (!city || !state) {
			console.log('[Geolocation] Incomplete location data from MaxMind');
			return json({ hasLocation: false });
		}

		const locationData = {
			city,
			state,
			latitude: latitude || null,
			longitude: longitude || null,
			hasLocation: true
		};

		// Store in cookie (session-based, expires when browser closes)
		// Detect if connection is secure (HTTPS) - check the protocol header from proxies
		const protocol = request.headers.get('x-forwarded-proto') || 'http';
		const isSecure = protocol === 'https';

		cookies.set('user_location', JSON.stringify(locationData), {
			path: '/',
			httpOnly: false, // Allow JS access
			sameSite: 'lax', // 'lax' for better compatibility with ngrok and external domains
			secure: isSecure, // true for HTTPS (ngrok), false for HTTP (localhost)
			maxAge: 60 * 60 * 24 // 24 hours
		});

		console.log(`[Geolocation] Location detected: ${city}, ${state} (${latitude}, ${longitude})`);
		return json(locationData);

	} catch (error) {
		console.error('[Geolocation] Error:', error?.message || error);

		// Handle specific MaxMind errors
		if (error?.code === 'IP_ADDRESS_NOT_FOUND') {
			console.log('[Geolocation] IP not found in MaxMind database');
		} else if (error?.code === 'INSUFFICIENT_FUNDS') {
			console.error('[Geolocation] MaxMind account has insufficient funds');
		} else if (error?.code === 'AUTHORIZATION_INVALID') {
			console.error('[Geolocation] MaxMind authorization failed - check credentials');
		}

		return json({ hasLocation: false });
	}
}
