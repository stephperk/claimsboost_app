import { json } from '@sveltejs/kit';
import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';

/**
 * Geocoding API endpoint
 * Accepts ZIP codes or city names and returns location data
 * Uses Google Geocoding API
 */
export async function POST({ request }) {
	try {
		const { input } = await request.json();

		if (!input || typeof input !== 'string') {
			return json(
				{ error: 'Invalid input. Please provide a ZIP code or city name.' },
				{ status: 400 }
			);
		}

		const trimmedInput = input.trim();

		if (!trimmedInput) {
			return json(
				{ error: 'Input cannot be empty.' },
				{ status: 400 }
			);
		}

		// Check if API key is configured
		if (!PUBLIC_GOOGLE_MAPS_API_KEY) {
			console.error('[Geocode API] PUBLIC_GOOGLE_MAPS_API_KEY not configured');
			return json(
				{ error: 'Geocoding service not configured' },
				{ status: 500 }
			);
		}

		// Detect input type
		const isZipCode = /^\d{5}$/.test(trimmedInput);

		// Build Google Geocoding API request
		const params = new URLSearchParams({
			address: trimmedInput,
			key: PUBLIC_GOOGLE_MAPS_API_KEY,
			components: 'country:US' // Restrict to US only
		});

		const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;

		const response = await fetch(geocodeUrl);
		const data = await response.json();

		if (data.status !== 'OK') {
			console.error('[Geocode API] Google API error:', data.status, data.error_message);

			if (data.status === 'ZERO_RESULTS') {
				return json(
					{ error: 'No locations found for this input. Please try a different search.' },
					{ status: 404 }
				);
			}

			return json(
				{ error: 'Failed to geocode location. Please try again.' },
				{ status: 500 }
			);
		}

		// Parse results
		const results = data.results.map(result => {
			const components = result.address_components;

			// Extract city, state, ZIP
			const city = components.find(c =>
				c.types.includes('locality') ||
				c.types.includes('sublocality')
			)?.long_name;

			const state = components.find(c =>
				c.types.includes('administrative_area_level_1')
			)?.short_name;

			const zipCode = components.find(c =>
				c.types.includes('postal_code')
			)?.long_name;

			const latitude = result.geometry.location.lat;
			const longitude = result.geometry.location.lng;

			return {
				city,
				state,
				zipCode,
				latitude,
				longitude,
				formatted: result.formatted_address,
				placeId: result.place_id
			};
		});

		// Filter out results without city or state
		const validResults = results.filter(r => r.city && r.state);

		if (validResults.length === 0) {
			return json(
				{ error: 'Could not find a valid US city for this input.' },
				{ status: 404 }
			);
		}

		return json({
			results: validResults,
			inputType: isZipCode ? 'zip' : 'city'
		});

	} catch (error) {
		console.error('[Geocode API] Error:', error);
		return json(
			{ error: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
}
