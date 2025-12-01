import { json } from '@sveltejs/kit';
import { WebServiceClient } from '@maxmind/geoip2-node';
import { MAXMIND_ACCOUNT_ID, MAXMIND_LICENSE_KEY } from '$env/static/private';
import { dev } from '$app/environment';

export async function GET({ cookies, getClientAddress }) {
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

	let locationData;

	// Use mock data in development mode
	if (dev) {
		locationData = {
			city: 'Orlando',
			state: 'FL',
			latitude: 28.5383,
			longitude: -81.3792,
			hasLocation: true
		};
		console.log('[Geolocation] Using mock location in dev mode');
	} else {
		// Production: Use MaxMind GeoIP2 for real geolocation
		try {
			const clientIp = getClientAddress();

			// Check if MaxMind credentials are configured
			if (!MAXMIND_ACCOUNT_ID || !MAXMIND_LICENSE_KEY) {
				throw new Error('MaxMind credentials not configured');
			}

			const client = new WebServiceClient(MAXMIND_ACCOUNT_ID, MAXMIND_LICENSE_KEY);
			const response = await client.city(clientIp);

			locationData = {
				city: response.city?.names?.en || null,
				state: response.subdivisions?.[0]?.isoCode || null,
				latitude: response.location?.latitude || null,
				longitude: response.location?.longitude || null,
				hasLocation: !!(response.city && response.subdivisions?.[0] && response.location)
			};

			console.log(`[Geolocation] Detected location: ${locationData.city}, ${locationData.state} for IP ${clientIp}`);
		} catch (error) {
			console.error('[Geolocation] MaxMind lookup failed:', error.message);

			// Fallback to default location if geolocation fails
			locationData = {
				city: 'New York',
				state: 'NY',
				latitude: 40.7128,
				longitude: -74.0060,
				hasLocation: false
			};
		}
	}

	// Store in cookie with production-ready security settings
	cookies.set('user_location', JSON.stringify(locationData), {
		path: '/',
		httpOnly: false, // Client needs to read this for map rendering
		sameSite: 'lax',
		secure: !dev, // HTTPS-only in production
		maxAge: 60 * 60 * 24 // 24 hours
	});

	return json(locationData);
}
