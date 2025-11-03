import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
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

	// Mock Florida location data for development
	// Using Orlando, FL coordinates (high concentration of law firms in database)
	const locationData = {
		city: 'Orlando',
		state: 'FL',
		latitude: 28.5383,
		longitude: -81.3792,
		hasLocation: true
	};

	// Store in cookie
	cookies.set('user_location', JSON.stringify(locationData), {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		secure: false,
		maxAge: 60 * 60 * 24 // 24 hours
	});

	console.log(`[Geolocation] Mock location: ${locationData.city}, ${locationData.state} (${locationData.latitude}, ${locationData.longitude})`);
	return json(locationData);
}
