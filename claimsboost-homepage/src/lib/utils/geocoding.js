import { browser } from '$app/environment';

/**
 * Geocode a location string (city, state or ZIP code) to coordinates
 * Uses Google Maps Geocoding API
 *
 * @param {string} locationText - The location to geocode (e.g., "Houston, TX" or "77001")
 * @returns {Promise<Object|null>} Location object with coordinates, or null if failed
 */
export async function geocodeLocation(locationText) {
	if (!browser) return null;
	if (!locationText || typeof locationText !== 'string') return null;

	// Clean up the input
	const cleanedText = locationText.trim();
	if (!cleanedText) return null;

	try {
		// Check if Google Maps is loaded
		if (!window.google?.maps) {
			console.error('Google Maps not loaded');
			return null;
		}

		// Import the geocoding library if not already imported
		let Geocoder;
		try {
			const geocodingLib = await window.google.maps.importLibrary("geocoding");
			Geocoder = geocodingLib.Geocoder;
		} catch (err) {
			console.error('Failed to import geocoding library:', err);
			return null;
		}

		// Create geocoder instance
		const geocoder = new Geocoder();

		// Perform geocoding request
		const request = {
			address: cleanedText,
			region: 'us', // Restrict to US
			componentRestrictions: {
				country: 'US' // Only search in USA
			}
		};

		const response = await geocoder.geocode(request);

		// Check if we got results
		if (!response.results || response.results.length === 0) {
			console.log('No geocoding results found for:', cleanedText);
			return null;
		}

		// Get the first (best) result
		const result = response.results[0];
		const location = result.geometry.location;

		// Extract address components
		const components = result.address_components || [];

		// Try to find city name - Google returns different components for different locations
		// Priority: locality (city) > county > postal_town (prefer broader areas over neighborhoods)
		const city = components.find(c =>
			c.types.includes('locality')
		)?.long_name ||
		components.find(c =>
			c.types.includes('administrative_area_level_2')
		)?.long_name ||
		components.find(c =>
			c.types.includes('postal_town')
		)?.long_name ||
		components.find(c =>
			c.types.includes('administrative_area_level_3')
		)?.long_name;

		const state = components.find(c =>
			c.types.includes('administrative_area_level_1')
		)?.short_name;

		const zipCode = components.find(c =>
			c.types.includes('postal_code')
		)?.long_name;

		// Return normalized location object
		return {
			city: city || null,
			state: state || null,
			zipCode: zipCode || null,
			latitude: location.lat(),
			longitude: location.lng(),
			formatted: result.formatted_address
		};

	} catch (error) {
		console.error('Geocoding error:', error);
		return null;
	}
}
